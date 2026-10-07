# Get Started with Tollgate

Tollgate is a self-hosted LLM gateway. You run it next to your app, give it your provider API keys, and send every chat request to one endpoint. Ask for a policy (`"cheap"`, `"fast"`, `"smart"`) or a specific model, and Tollgate routes the request, caches responses, and falls back to another model when a provider fails.

This guide takes you from nothing to a working request. Pick one install path, then continue from [Make your first request](#make-your-first-request).

- [What you need](#what-you-need)
- [Choose an install path](#choose-an-install-path)
- [Path 1: Docker, everything included](#path-1-docker-everything-included) (recommended)
- [Path 2: Docker, using your own Redis and Qdrant](#path-2-docker-using-your-own-redis-and-qdrant)
- [Path 3: From source (git clone)](#path-3-from-source-git-clone)
- [The setup wizard](#the-setup-wizard)
- [Make your first request](#make-your-first-request)
- [Using self-hosted models (Ollama, vLLM, llama.cpp)](#using-self-hosted-models-ollama-vllm-llamacpp)
- [Day-to-day operations](#day-to-day-operations)
- [Troubleshooting](#troubleshooting)
- [Before you expose Tollgate to a network](#before-you-expose-tollgate-to-a-network)

---

## What you need

| Requirement | Why | Notes |
|---|---|---|
| **At least one model source** | Something to route to | An OpenAI, Anthropic or Google Gemini API key, **or** a self-hosted OpenAI-compatible endpoint (Ollama, vLLM, llama.cpp server, LM Studio, ...) |
| **Redis 7+** | Access tokens, exact cache, job queue, model rankings | Local, Docker, or managed (AWS ElastiCache, Redis Cloud) |
| **Qdrant** | Semantic cache, classifier cache | Local, Docker, or Qdrant Cloud. Tollgate talks to it over gRPC, so ports **6333 and 6334** must both be reachable |
| **~2 GB free disk, ~2 GB free RAM** | The `"smart"` routing classifier (a 1.5B model, ~1 GB) | Downloaded once during setup |

Path-specific tools:

- **Docker paths:** Docker Engine or Docker Desktop with Compose v2 (`docker compose`).
- **From source:** Python 3.12 or newer (3.14 recommended, it's what the Docker image and test suite use), `git`, `cmake`, and a C/C++ compiler. The wizard compiles the classifier server (`llama-server`) from source.
  - macOS: `xcode-select --install` and `brew install cmake`
  - Debian/Ubuntu: `sudo apt install build-essential cmake git`

Tollgate listens on port **13000**.

---

## Choose an install path

| You want to... | Use |
|---|---|
| Try Tollgate quickly with nothing else installed | **Path 1**: Docker, everything included |
| Run Tollgate in Docker against Redis/Qdrant you already have (or managed services) | **Path 2** |
| Develop on Tollgate, or run it without Docker | **Path 3**: from source |

All three paths finish the same way: run the setup wizard, then start the gateway.

---

## Path 1: Docker, everything included

Runs Tollgate, Redis and Qdrant together on one Docker network. You don't need anything else installed besides Docker.

**1. Create a folder and a compose file**

```bash
mkdir tollgate && cd tollgate
```

Save this as `docker-compose.yml`:

```yaml
services:
  tollgate:
    image: ghcr.io/vibhinn/tollgate:latest
    container_name: tollgate
    restart: unless-stopped
    ports:
      - "13000:13000"
    volumes:
      - tollgate_data:/data
    stdin_open: true
    tty: true
    depends_on:
      - redis
      - qdrant

  redis:
    image: redis:7-alpine
    container_name: tollgate-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    container_name: tollgate-qdrant
    restart: unless-stopped
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  tollgate_data:
  redis_data:
  qdrant_data:
```

Redis and Qdrant aren't published to your host here; only Tollgate can reach them. That's intentional.

**2. Start everything**

```bash
docker compose up -d
```

On the first start the Tollgate container has no configuration yet, so it waits. `docker logs tollgate` shows:

```
No config.yaml found in this container's /data volume.
Run the setup wizard first:
  docker exec -it tollgate tollgate init
```

**3. Run the setup wizard inside the container**

```bash
docker exec -it tollgate tollgate init
```

When the wizard asks for service hosts, use the **service names**, not `localhost`:

| Wizard question | Answer |
|---|---|
| Redis host | `redis` |
| Redis port | `6379` |
| Redis password / TLS | press Enter (none) / `n` |
| Qdrant host | `qdrant` |
| Qdrant port | `6333` |
| Qdrant API key / HTTPS | press Enter (none) / `n` |

See [The setup wizard](#the-setup-wizard) for the other steps. The first run downloads the classifier model and compiles `llama-server`, which takes several minutes.

**4. Restart Tollgate so it picks up the configuration**

```bash
docker restart tollgate
docker logs -f tollgate     # wait for "Application startup complete", then Ctrl+C
```

Continue to [Make your first request](#make-your-first-request).

---

## Path 2: Docker, using your own Redis and Qdrant

Use this if Redis and Qdrant already run somewhere: on your machine, on another server, or as managed services.

**1. Start the Tollgate container**

With Compose, using the file from this repository:

```bash
curl -O https://raw.githubusercontent.com/Vibhinn/Tollgate/develop/docker/docker-compose.yml
docker compose up -d
```

Or with plain Docker:

```bash
docker pull ghcr.io/vibhinn/tollgate:latest
docker run -d --name tollgate -p 13000:13000 -v tollgate_data:/data -it \
  --restart unless-stopped ghcr.io/vibhinn/tollgate:latest
```

The image supports `linux/amd64` and `linux/arm64` (including Apple Silicon).

**2. Run the setup wizard**

```bash
docker exec -it tollgate tollgate init
```

> **Important: `localhost` inside the container is not your machine.** If Redis or Qdrant run on your host, enter:
>
> - **Docker Desktop (macOS, Windows):** host `host.docker.internal`
> - **Linux:** start the container with `--add-host=host.docker.internal:host-gateway` (or add `extra_hosts: ["host.docker.internal:host-gateway"]` to the compose service), then use `host.docker.internal`
> - **Remote or managed services:** their real hostname, plus password/API key and TLS/HTTPS as required
>
> The wizard checks whether each service is reachable and warns if it isn't. A warning for a remote host can just mean a firewall rule; double-check host, port and credentials.

Don't have Redis and Qdrant yet? Use [Path 1](#path-1-docker-everything-included) instead, which runs them for you.

**3. Restart Tollgate**

```bash
docker restart tollgate
docker logs -f tollgate
```

Continue to [Make your first request](#make-your-first-request).

---

## Path 3: From source (git clone)

**1. Get the code and install it into a virtual environment**

```bash
git clone https://github.com/Vibhinn/Tollgate.git
cd Tollgate
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e .                   # installs the `tollgate` command
```

**2. Start Redis and Qdrant** (skip this if you already have them, or use managed services)

```bash
docker run -d --name tollgate-redis --restart unless-stopped -p 127.0.0.1:6379:6379 redis:7-alpine redis-server --appendonly yes
docker run -d --name tollgate-qdrant --restart unless-stopped -p 127.0.0.1:6333:6333 -p 127.0.0.1:6334:6334 qdrant/qdrant
```

These bind to `127.0.0.1`, so only your machine can reach them.

**3. Run the setup wizard**

```bash
tollgate init
```

Run it from the `Tollgate` folder. The wizard writes `config.yaml` and `.tollgate.key` into the **current directory**, and `tollgate start` reads them from there. For local Redis and Qdrant, accept the defaults (`localhost`, `6379`, `6333`). If either isn't running, the wizard tries to start it for you: Redis via `redis-server`, Qdrant via Docker.

**4. Start the gateway**

```bash
tollgate start                     # serves on http://0.0.0.0:13000
```

Startup takes a few seconds up to ~30 seconds: Tollgate starts the classifier, prepares Qdrant collections, and sends a 1-token probe to each configured model to seed its latency rankings.

Continue to [Make your first request](#make-your-first-request).

---

## The setup wizard

`tollgate init` walks through 8 steps:

| Step | What it asks / does |
|---|---|
| 1. Routing intelligence model | Downloads `qwen2.5-1.5b-instruct-q4_k_m.gguf` (~1 GB, once) |
| 2. Routing intelligence server | Clones llama.cpp at a pinned version and builds `llama-server` for your CPU (a few minutes) |
| 3. Infrastructure services | Redis and Qdrant: host, port, password/API key, TLS/HTTPS |
| 4. Admin credentials | An admin username and password. You need these to mint admin tokens and to re-run the wizard later. **Write them down.** |
| 5. LLM providers | Pick OpenAI / Anthropic / Gemini and paste API keys, optionally add self-hosted endpoints, choose a default model |
| 6. Rate limiting | Sustained requests per second per user, and a burst multiplier (seconds of burst capacity, default 5) |
| 7. Backpressure | Maximum requests in flight before Tollgate returns `503` (default 50) |
| 8. Finalize | Writes `config.yaml` and `.tollgate.key` |

API keys and passwords are encrypted in `config.yaml` with the key in `.tollgate.key`.

> **Back up `.tollgate.key`.** Without it, Tollgate can't decrypt your API keys and you'll have to run the wizard again. In Docker, both files live in the `tollgate_data` volume.

---

## Make your first request

The examples use `localhost:13000`. Replace it with your server's address if Tollgate runs elsewhere.

**1. Check that it's running**

Open <http://localhost:13000/docs>. You should see the interactive API docs.

**2. Create an access token**

```bash
curl -X POST http://localhost:13000/api/v1/chat/generate \
  -H "Content-Type: application/json" \
  -d '{"token_requirement": "chat"}'
```

```json
{"token": "tg_..."}
```

| Field | Required | Default | Notes |
|---|---|---|---|
| `token_requirement` | yes | | `"chat"` (also accepts `"image"` and `"audio"`, reserved for upcoming endpoints) |
| `role` | no | `"user"` | `"user"` or `"admin"` |
| `password` | only for `admin` | | The admin password from the wizard |
| `lifetime` | no | `1296000` (15 days) | Token lifetime in seconds |

**3. Send a chat request using a policy**

```bash
curl -X POST http://localhost:13000/api/v1/chat/completions \
  -H "Authorization: Bearer tg_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "cheap",
    "messages": [{"role": "user", "content": "Explain what an API gateway does in two sentences."}],
    "max_tokens": 200
  }'
```

```json
{"role": "assistant", "message": "An API gateway is ..."}
```

**4. Or name a specific model**

```bash
  -d '{"model": "claude-sonnet-4-6", "messages": [...], "max_tokens": 200}'
```

### Choosing a model

| `model` value | What Tollgate does |
|---|---|
| `"cheap"` | Lowest-priced model among your configured, currently healthy providers |
| `"fast"` | Lowest recent latency, measured from your own traffic |
| `"smart"` | Classifies the prompt (simple / code / reasoning / creative) and picks a model suited to it |
| A model name | Routes straight to that model: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`, `o1`, `o3-mini`, `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `gemini-3.5-flash`, `gemini-3.5-flash-lite` |
| A self-hosted name | The name you gave a self-hosted model in the wizard |

If a provider fails (rate limit, outage, bad key, no credits), Tollgate temporarily takes that model out of rotation, and policy requests (`cheap`/`fast`/`smart`) fall back to the next best model.

### Request fields

| Field | Required | Default | Notes |
|---|---|---|---|
| `model` | yes | | A policy, model name, or self-hosted name (see above) |
| `messages` | yes | | `[{"role": "user", "content": "..."}]`. Currently only the **last** message is sent to the model |
| `max_tokens` | yes | | Maximum response length |
| `cache_type` | no | none | `"exact"` or `"semantic"` (lowercase). Saves this response so future matching requests are served from cache |
| `cache_match_score` | no | `0.9` | How similar (0–1) a request must be to count as a semantic cache hit |
| `temperature` | no | `0.7` | Accepted, not yet forwarded to providers |

Optional header: `X-Cache-TTL: <seconds>` sets how long an `exact` cache entry lives (default 3600).

### Caching

```bash
curl -X POST http://localhost:13000/api/v1/chat/completions \
  -H "Authorization: Bearer tg_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Cache-TTL: 86400" \
  -d '{
    "model": "cheap",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "max_tokens": 50,
    "cache_type": "semantic"
  }'
```

The response is saved in the background. Later requests that match (`exact`: same text; `semantic`: similar meaning, e.g. "France's capital city?") come back from the cache in milliseconds, without calling a provider. Cached responses have `"role": "model"`.

### From code (Python)

```python
import requests

BASE = "http://localhost:13000/api/v1"

token = requests.post(f"{BASE}/chat/generate", json={"token_requirement": "chat"}).json()["token"]

response = requests.post(
    f"{BASE}/chat/completions",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "model": "fast",
        "messages": [{"role": "user", "content": "Write a haiku about caching."}],
        "max_tokens": 100,
    },
)
response.raise_for_status()
print(response.json()["message"])
```

The response format is not OpenAI-compatible yet, so the OpenAI SDK can't use Tollgate as its `base_url`. Call it over HTTP as shown.

### Status codes

| Code | Meaning | What to do |
|---|---|---|
| `401` | Missing or invalid token, or wrong admin password | Send `Authorization: Bearer tg_...` with a valid token |
| `403` | The provider denied access to that model | Check your provider account's model access |
| `404` | Unknown model, provider not configured, or no healthy model left for the policy | Check the model name; if providers are failing, wait 30s–10min for them to come back |
| `422` | Invalid request body | Check required fields and lowercase `cache_type` |
| `429` | Rate limited by Tollgate or the provider | Wait for the `Retry-After` header's value |
| `500` | Provider outage or API error | Retry later or choose another model |
| `503` | Gateway overloaded (too many requests in flight) | Retry after `Retry-After`, or raise the backpressure limit |

---

## Using self-hosted models (Ollama, vLLM, llama.cpp)

Any server with an OpenAI-compatible `/v1/chat/completions` endpoint works. In the wizard's provider step (or later with `tollgate config --change`), add a self-hosted model:

| Wizard question | Example (Ollama) |
|---|---|
| Name for this model | `local-llama` (this is what you'll put in `"model"`) |
| Endpoint URL | `http://localhost:11434/v1` |
| Model name | `llama3.2` (the name your server knows it by) |
| API key | press Enter if none |

Then request it by name: `"model": "local-llama"`.

> **Running Tollgate in Docker?** `localhost` won't reach a model server on your host. Use `http://host.docker.internal:11434/v1` (see the note in [Path 2](#path-2-docker-using-your-own-redis-and-qdrant) for Linux).

Self-hosted models aren't in the price table, so `"cheap"` never picks them; `"fast"` can.

---

## Day-to-day operations

| Task | From source | Docker |
|---|---|---|
| Start | `tollgate start` | `docker start tollgate` (or `docker compose up -d`) |
| Stop | `Ctrl+C` | `docker stop tollgate` |
| Logs | in the terminal | `docker logs -f tollgate` |
| Show configuration | `tollgate config` | `docker exec -it tollgate tollgate config` |
| Change one setting | `tollgate config --change`, then restart | `docker exec -it tollgate tollgate config --change`, then `docker restart tollgate` |
| Start over | `tollgate init` (asks for admin credentials, then `RESET`) | `docker exec -it tollgate tollgate init`, then restart |

**Updating**

```bash
# From source
git pull
pip install -e .
# then restart: tollgate start

# Docker Compose
docker compose pull
docker compose up -d

# Plain docker run
docker pull ghcr.io/vibhinn/tollgate:latest
docker rm -f tollgate
docker run -d --name tollgate -p 13000:13000 -v tollgate_data:/data -it \
  --restart unless-stopped ghcr.io/vibhinn/tollgate:latest
```

Your configuration and the downloaded classifier stay in place: in the project folder from source, in the `tollgate_data` volume with Docker.

**Environment variables (optional)**

| Variable | Default | Purpose |
|---|---|---|
| `TOLLGATE_DATA_DIR` | `src/app/intelligence/` (`/data/intelligence` in Docker) | Where the classifier model and `llama-server` are stored |
| `TOLLGATE_APP_DIR` | `.` (`/app` in Docker) | Where `tollgate start` finds the app |
| `TOLLGATE_CLASSIFIER_CONCURRENCY` | `1` | How many `"smart"` classifications run at once. Raise only on machines with spare CPU cores |

**Uninstalling**

```bash
# Docker: remove containers and all data (configuration, cache, tokens)
docker compose down -v

# From source: delete the project folder, and remove Redis/Qdrant if you started them as above
docker rm -f tollgate-redis tollgate-qdrant
```

---

## Troubleshooting

**The container keeps printing "No config.yaml found"**
The wizard hasn't run yet (or ran in a different container). Run `docker exec -it tollgate tollgate init`, then `docker restart tollgate`.

**Tollgate can't connect to Redis or Qdrant (Docker)**
You probably entered `localhost`. Inside a container that means the container itself. Use the service names (`redis`, `qdrant`) for Path 1, or `host.docker.internal` for services on your host (Path 2). Fix it with `tollgate config --change`.

**Semantic cache errors with a remote or cloud Qdrant**
Tollgate uses Qdrant's gRPC port **6334** as well as 6333. Make sure your firewall or security group allows both.

**`WARNING: routing intelligence server failed to start`**
The classifier didn't start, so `"smart"` routes every request as "simple" until it's fixed. Usually the model download or `llama-server` build didn't finish: re-run `tollgate init`. Running two Tollgate instances on one machine also causes this (the classifier uses port 8091).

**The wizard fails while building `llama-server`**
Install the build tools (`cmake`, a C/C++ compiler, `git`; see [What you need](#what-you-need)) and re-run `tollgate init`.

**`404` for `"cheap"`, `"fast"` or `"smart"`**
Every model that fits the policy is temporarily out of rotation, usually after provider rate limits (out for 30s) or a bad key / no credits (out for 10 min). Check your provider dashboards and keys. `"fast"` also needs at least one successful request to have latency data; the startup probe normally provides it.

**`422` on a request that looks right**
Check that `max_tokens` is present, the model name is spelled exactly as listed, and `cache_type` is lowercase (`"semantic"`, not `"SEMANTIC"`).

**`tollgate start` says `No config.yaml found`**
Run it from the folder where you ran `tollgate init`.

**Port 13000 is already in use**
Something else is listening on 13000. Stop it, or with Docker map another host port: `-p 8080:13000`.

**A small provider charge every time Tollgate starts**
Expected: on startup Tollgate sends a 1-token request to each configured model to measure latency.

---

## Before you expose Tollgate to a network

Tollgate is built to run inside your own infrastructure, next to your apps:

- **Anyone who can reach the gateway can create a user token** through `/api/v1/chat/generate`, and use your provider keys through it. Keep port 13000 on a private network, or put Tollgate behind a reverse proxy or firewall that only your apps can reach.
- **Keep Redis and Qdrant private.** Never publish their ports to the internet; Redis holds Tollgate's access tokens.
- **Treat `config.yaml` and `.tollgate.key` as secrets.** Together they decrypt your API keys.
- **One instance per deployment for now.** Rate limits are tracked in memory per process, so several instances behind a load balancer each enforce their own limit.
