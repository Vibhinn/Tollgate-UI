# How to use Tollgate

Tollgate is a self-hosted LLM gateway. Your apps ask for a **policy** (`"fast"`, `"cheap"` or `"smart"`) instead of a model name, and Tollgate picks the best model across OpenAI, Anthropic, Google Gemini and your own self-hosted models, based on live latency, price and the prompt itself.

Tollgate speaks the **OpenAI Chat Completions API**. Any app that uses the OpenAI SDK switches to Tollgate by changing two values: `base_url` and `api_key`.

---

## 1. Requirements

- **Redis** and **Qdrant**, reachable from the gateway. Local, Docker or managed (ElastiCache, Redis Cloud, Qdrant Cloud) all work.
- **At least one model provider:** an OpenAI, Anthropic or Gemini API key, or a self-hosted OpenAI-compatible endpoint (Ollama, llama.cpp, vLLM, …).
- **About 1 GB of disk** and the RAM to hold it, for the local model that powers `"smart"` routing.
- **For a local install only:** Python 3.12 or newer, `git`, `cmake` and a C/C++ compiler. The setup wizard compiles the classifier server from source.

---

## 2. Install

### Option A: Docker (recommended)

```bash
# 1. Start the container. It waits until it finds a configuration.
docker compose -f docker/docker-compose.yml up -d

# 2. Run the setup wizard inside it
docker exec -it tollgate tollgate init

# 3. Restart. The gateway comes up on port 13000
docker restart tollgate
```

The image doesn't include Redis or Qdrant. Point the wizard at instances that the container can reach.

### Option B: Local install

```bash
git clone https://github.com/Vibhinn/Tollgate
cd Tollgate
python3 -m venv venv && source venv/bin/activate
pip install -e .          # installs the `tollgate` command
tollgate init             # interactive setup wizard
tollgate start            # serves on 0.0.0.0:13000
```

---

## 3. The setup wizard

`tollgate init` walks you through everything once:

| Step | What happens |
|---|---|
| Routing model | Downloads the classifier model behind `"smart"` (about 1 GB, once) |
| Routing server | Builds the local server that runs it, optimised for your CPU |
| Services | Host, port, password and TLS for Redis and Qdrant. On localhost it offers to start them for you |
| Admin credentials | A username and password. You need them to create or revoke tokens and to change settings |
| Providers | Choose providers and paste their API keys, add self-hosted endpoints, pick a default model |
| Rate limiting | Requests per second for each token holder, and how large a burst to allow |
| Backpressure | The most requests the gateway handles at once before asking clients to retry (default 50) |
| Finalize | Writes `config.yaml` and the encryption key `.tollgate.key` |

API keys and the admin username are stored encrypted; the admin password is stored as a hash.

> **Keep `.tollgate.key` safe.** It decrypts the API keys in `config.yaml`. If you lose it, run `tollgate init` again.

To view or change one setting later:

```bash
tollgate config            # show the current configuration
tollgate config --change   # change a single setting, then restart the gateway
```

---

## 4. Create access tokens

Tokens are created by whoever runs the gateway. Each token belongs to a **team** and a **name**, where the name is a person or an app. Creating and revoking tokens asks for the admin credentials.

```bash
tollgate token create --team payments --name alice
tollgate token create --team payments --name invoice-bot --ttl never
# → tg_...   shown once. Tollgate stores only a hash of it, so copy it now.
```

In Docker, put `docker exec -it tollgate` in front of every `tollgate` command.

| Command | What it does |
|---|---|
| `tollgate token create --team T --name N [--ttl 90d]` | Creates a token. `--ttl` takes e.g. `30d`, `12h` or `never`; the default is `90d` |
| `tollgate token list [--team T]` | Lists tokens: ID, team, name, created, expires. Never shows the token itself |
| `tollgate token revoke <ID or token>` | Revokes one token, by the ID from `list` or by the full token |
| `tollgate token revoke --team T --name N` | Revokes every token of that person or app |

Team and name use lowercase letters, digits and `-`.

**Good to know:**
- Tokens with the same team and name share one rate limit and one cache. Give each app or environment its own name, e.g. `invoice-bot` and `invoice-bot-staging`.
- **To rotate a token:** create a new one for the same team and name, switch your app over, then revoke the old one.

---

## 5. Make your first request

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:13000/v1", api_key="tg_your_token")

completion = client.chat.completions.create(
    model="cheap",
    messages=[{"role": "user", "content": "Summarize this contract in three bullet points."}],
)

print(completion.choices[0].message.content)
print(completion.model)   # the model that actually answered, e.g. "gpt-4o-mini"
```

### JavaScript / TypeScript (OpenAI SDK)

```ts
import OpenAI from "openai";

const client = new OpenAI({ baseURL: "http://localhost:13000/v1", apiKey: "tg_your_token" });

const completion = await client.chat.completions.create({
  model: "fast",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(completion.choices[0].message.content);
```

### LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(base_url="http://localhost:13000/v1", api_key="tg_your_token", model="smart")
print(llm.invoke("Explain recursion to a ten-year-old.").content)
```

### curl

```bash
curl http://localhost:13000/v1/chat/completions \
  -H "Authorization: Bearer tg_your_token" \
  -H "Content-Type: application/json" \
  -d '{"model": "cheap", "messages": [{"role": "user", "content": "Hello!"}]}'
```

---

## 6. Choosing a model

Use a **policy** and let Tollgate choose:

| Policy | Picks |
|---|---|
| `"fast"` | The model with the lowest latency, measured from your own traffic |
| `"cheap"` | The model with the lowest list price |
| `"smart"` | Reads the prompt with a local model, sorts it into simple, code, reasoning or creative, and picks the first healthy model from a preference list for that kind of task (e.g. a top-tier model for reasoning, a small one for simple questions) |

Or **pin a model** by name, e.g. `"gpt-4o"`, `"claude-sonnet-4-6"`, `"gemini-3.5-flash"`, or the alias of one of your self-hosted models.

To see what you can use, list the models. You get the three policies plus every model whose provider is configured:

```python
for model in client.models.list():
    print(model.id, model.owned_by)
```

**When a model fails** (rate limited, out of credit, provider outage), Tollgate takes it out of rotation for a while: 30 seconds for rate limits and outages, 10 minutes for key, permission or credit problems.
- With a **policy**, your request is retried once on the next best model.
- With a **pinned model**, you get the error back, because Tollgate never swaps a model you named.

---

## 7. Request reference

### Supported fields

| Field | Notes |
|---|---|
| `model` | A policy or a model name (see above). Required |
| `messages` | Roles `system`, `developer`, `user` and `assistant`. `content` is a string or a list of `{"type": "text", "text": ...}` parts. Required |
| `max_completion_tokens` or `max_tokens` | Optional. When neither is set, the provider's default applies; Anthropic requires a value, so Tollgate sends 4096 |
| `temperature` | 0 to 2. Leave it out for reasoning models, which only accept their default |
| `top_p` | 0 to 1 |
| `stop` | A string, or a list of up to 4 strings |

Other OpenAI fields, such as `user`, `seed`, `metadata` or a message's `name`, are accepted and ignored.

### Not supported yet

These are **rejected with a 400** instead of being silently ignored, so you never get a different answer than you asked for:

- `stream: true`
- `n` greater than 1
- `tools`, `tool_choice`, `functions`
- `response_format` other than `{"type": "text"}`
- image or audio content
- messages with the `tool` role

### Tollgate's own options

| Option | Where | Default | Notes |
|---|---|---|---|
| `cache_type` | request body | none | `"exact"` or `"semantic"`. Stores the answer so later requests can be served from the cache |
| `cache_match_score` | request body | `0.9` | How similar a prompt must be (0 to 1) to count as a semantic cache hit |
| `X-Cache-TTL` | request header | `3600` | How long, in seconds, an exact-cache entry lives. Must be a positive whole number |

With the OpenAI SDK, body options go in `extra_body` and headers in `extra_headers`:

```python
client.chat.completions.create(
    model="cheap",
    messages=[{"role": "user", "content": "What is our refund policy?"}],
    extra_body={"cache_type": "semantic", "cache_match_score": 0.85},
    extra_headers={"X-Cache-TTL": "86400"},
)
```

---

## 8. Responses

Every response is a standard OpenAI `chat.completion`:

```json
{
  "id": "chatcmpl-6f1c…",
  "object": "chat.completion",
  "created": 1760000000,
  "model": "claude-haiku-4-5",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "…"},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 18, "completion_tokens": 42, "total_tokens": 60}
}
```

- **`model`** is the model that answered, so you can see what `"cheap"` or `"smart"` picked.
- **`finish_reason`** is `stop` (a complete answer), `length` (cut off at the token limit) or `content_filter` (blocked by the provider). It's the same for every provider.

### Response headers

| Header | Meaning |
|---|---|
| `X-Tollgate-Cache` | `hit` if the answer came from the cache, `miss` if a model produced it |
| `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | Your rate limit, the requests you have left, and when it refills (Unix time) |

A cache hit has `usage` at zero, and its `model` is the one you asked for.

---

## 9. Caching

Caching is opt-in, per request, with `cache_type`.

| Type | Serves a cached answer when… |
|---|---|
| `"exact"` | The request is identical: same messages, model and settings |
| `"semantic"` | The last user message means roughly the same thing (similarity at least `cache_match_score`), and everything else in the conversation is identical |

**What makes a cache entry match:**
- Entries are **separate for every team and name**, so one token holder never receives another's cached answers.
- An entry is tied to the whole conversation, the model, and every setting: `temperature`, `max_tokens`, `top_p` and `stop`. Changing any of them is a new entry.

**What gets cached and how long it lasts:**
- Only complete answers are cached. Answers cut off at the token limit or blocked by the provider are never stored.
- Writing to the cache happens in the background, so it never slows down your response. If the cache is unavailable, you still get your answer, just uncached.
- Exact entries expire after `X-Cache-TTL` seconds. Semantic entries currently don't expire.

---

## 10. Errors

Errors use OpenAI's format, so the OpenAI SDKs raise their usual exceptions and retry where it makes sense:

```json
{"error": {"message": "…", "type": "invalid_request_error", "param": "temperature", "code": null}}
```

| Status | `code` | Meaning | What to do |
|---|---|---|---|
| 400 | — | Invalid request (`param` names the field), an unsupported feature, or the provider rejected the request (e.g. too long) | Fix the request |
| 401 | `invalid_api_key` | Missing, invalid, expired or revoked token | Ask the gateway admin for a token |
| 404 | `model_not_found` | Unknown model, its provider isn't configured, or no healthy model is left for the policy | Check `/v1/models`, or retry later |
| 429 | `rate_limit_exceeded` | You hit your Tollgate rate limit | Wait for `Retry-After` |
| 429 | `upstream_rate_limited` | The provider rate-limited Tollgate | Retry later, or use a policy |
| 502 | `upstream_auth_failed`, `upstream_permission_denied`, `upstream_credit_exhausted` | The gateway's provider key is invalid, lacks access, or is out of credit. Your token is fine | The admin fixes the key with `tollgate config --change` |
| 502 | `upstream_server_error`, `upstream_connection_error` | The provider is down or unreachable | Retry, or use a policy |
| 503 | `overloaded` | Too many requests in flight at once | Wait for `Retry-After` |
| 500 | `internal_error` | A bug in the gateway | Report it; details are in the gateway's logs |

The OpenAI SDKs retry 429 and 5xx responses automatically, by default twice.

---

## 11. Self-hosted models

Any server with an OpenAI-compatible API works (Ollama, llama.cpp, vLLM, LM Studio, …).
1. Add it during `tollgate init`, or later with `tollgate config --change`. Give it an alias, the endpoint URL, and the model name the server expects.
2. Request it by its alias:

```python
client.chat.completions.create(model="my-llama", messages=[...])
```

Of the policies, only `"fast"` can pick a self-hosted model. `"smart"` chooses from fixed lists of OpenAI, Anthropic and Gemini models, and `"cheap"` needs a list price, which self-hosted models don't have.

---

## 12. Running the gateway

| Task | Command |
|---|---|
| Start | `tollgate start` (local) or `docker restart tollgate` |
| Show settings | `tollgate config` |
| Change a setting | `tollgate config --change`, then restart |
| Manage tokens | `tollgate token create / list / revoke` |
| API reference in the browser | `http://localhost:13000/docs` |

**At startup**, Tollgate:
- starts the local classifier for `"smart"`;
- sends a one-token request to every configured model, to measure latency before real traffic arrives. That's a small but real charge from each provider on every restart.

### Troubleshooting

**"couldn't bind HTTP server socket … port 8091" at startup.** A classifier from an earlier run is still holding its port, and `"smart"` falls back to the simplest tier. Stop it, then restart the gateway:
```bash
lsof -i :8091     # find the process ID
kill <pid>
```

**`"smart"` sends everything to the same kind of model.** The classifier didn't start, so every prompt is treated as simple. Check the startup log for a warning about the routing intelligence server.

**`404 model_not_found` for a policy under heavy load.** Every configured model is temporarily out of rotation after provider errors. Add another provider, or wait 30 seconds.

---

## 13. Current limitations

- **Chat Completions only.** No streaming, tool calling, JSON mode, image input or embeddings yet; requests that use them get a 400.
- **One process.** Rate limits are kept in memory, per gateway process. Running two gateways behind a load balancer doubles the effective limit.
- **Semantic cache entries never expire.**
- **`"cheap"` uses list prices,** not what you actually spent.
