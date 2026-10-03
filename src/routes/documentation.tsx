import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/documentation")({
  head: () => ({ meta: [{ title: "Documentation — Tollgate" }, { name: "description", content: "Install, configure, and use Tollgate, the self-hosted LLM gateway." }] }),
  component: Documentation,
});

const sections = [
  ["overview", "Overview"], ["requirements", "What you need"], ["paths", "Choose an install path"],
  ["docker-bundle", "Docker, everything included"], ["docker-services", "Docker with your services"],
  ["source", "Install from source"], ["wizard", "The setup wizard"], ["request", "Make your first request"],
  ["self-hosted", "Self-hosted models"], ["operations", "Day-to-day operations"],
  ["troubleshooting", "Troubleshooting"], ["security", "Before exposing Tollgate"],
];

function Code({ children }: { children: string }) {
  const isYaml = /^services:\s*$/m.test(children);
  const isPython = /^import requests/m.test(children);
  const lines = children.split("\n");
  const commandWords = /^(docker|compose|pull|run|exec|start|stop|restart|logs|up|down|curl|git|clone|cd|python3|source|pip|install|tollgate|init|config|rm|host)$/;

  return <pre className={`docs-code ${isYaml ? "docs-code-yaml" : "docs-code-shell"}`}><code>{lines.map((line, index) => {
    let rendered;
    if (isYaml) {
      const match = line.match(/^(\s*)([\w.-]+)(:)(.*)$/);
      if (match) {
        const [, indent, key, colon, value] = match;
        rendered = <>{indent}<span className="docs-token-key">{key}</span>{colon}<span className="docs-token-value">{value}</span></>;
      } else if (/^\s*#/.test(line)) {
        rendered = <span className="docs-token-comment">{line}</span>;
      } else {
        rendered = line;
      }
    } else if (/^\s*#/.test(line)) {
      rendered = <span className="docs-token-comment">{line}</span>;
    } else {
      const tokens = line.split(/(\"[^\"]*\"|'[^']*'|--[\w-]+|-[a-zA-Z]+|https?:\/\/[^\s]+|ghcr\.io\/[^\s]+|[\w.-]+)/g);
      rendered = tokens.map((token, tokenIndex) => {
        if (/^(\"|').*(\"|')$/.test(token)) return <span className="docs-token-string" key={tokenIndex}>{token}</span>;
        if (/^--?[a-zA-Z]/.test(token)) return <span className="docs-token-flag" key={tokenIndex}>{token}</span>;
        if (/^(https?:\/\/|ghcr\.io\/)/.test(token)) return <span className="docs-token-value" key={tokenIndex}>{token}</span>;
        if (commandWords.test(token)) return <span className={isPython ? "docs-token-key" : "docs-token-command"} key={tokenIndex}>{token}</span>;
        return token;
      });
    }
    return <span key={index}>{rendered}{index < lines.length - 1 ? "\n" : null}</span>;
  })}</code></pre>;
}
function Heading({ n, children }: { n: string; children: string }) { return <div className="docs-section-heading"><span>{n} / GUIDE</span><h2>{children}</h2></div>; }
function Documentation() {
  return <main className="site-shell docs-shell">
    <header className="site-nav"><a href="/#top" className="nav-wordmark"><span className="nav-symbol">╫</span> TOLLGATE<span className="nav-period">.</span></a><nav aria-label="Main navigation"><a href="/#benchmark">Benchmark</a><a href="/#how-it-works">How it works</a><a href="/#install">Install</a></nav><a href="/#top" className="nav-action"><ArrowLeft size={15} /> BACK TO SITE</a></header>
    <div className="docs-layout">
      <aside className="docs-sidebar" aria-label="Documentation sections"><div className="docs-sidebar-label">GUIDE CONTENTS</div><nav>{sections.map(([id, title], i) => <a key={id} href={`#${id}`}><span>{String(i).padStart(2, "0")}</span>{title}</a>)}</nav></aside>
      <article className="docs-article">
        <header className="docs-heading" id="overview"><div className="eyebrow">TOLLGATE / DOCUMENTATION</div><h1>GET STARTED<br/><span className="outline-title">WITH TOLLGATE.</span></h1><p>Tollgate is a self-hosted LLM gateway. Run it beside your app, connect your model providers, and send chat requests through one endpoint. Tollgate routes by policy, caches responses, and falls back when a provider fails.</p><div className="docs-callout"><strong>In this guide</strong><span>Choose an install path, configure Tollgate, then send your first request.</span></div></header>
        <section className="docs-section" id="requirements"><Heading n="01">What you need</Heading><p>All paths need at least one model source, Redis, Qdrant, and about 2 GB of free RAM and disk for the local routing classifier.</p><div className="docs-table-wrap"><table><thead><tr><th>Requirement</th><th>Purpose and notes</th></tr></thead><tbody><tr><td>Model source</td><td>OpenAI, Anthropic, Gemini, or an OpenAI-compatible self-hosted endpoint.</td></tr><tr><td>Redis 7+</td><td>Access tokens, exact cache, job queue, model rankings. Local, Docker, or managed.</td></tr><tr><td>Qdrant</td><td>Semantic cache and classifier cache. Ports 6333 and 6334 must be reachable.</td></tr><tr><td>~2 GB RAM and disk</td><td>The “smart” classifier is downloaded once during setup.</td></tr></tbody></table></div><p>Docker paths require Docker Engine or Docker Desktop with Compose v2. From source, use Python 3.12+, Git, CMake, and a C/C++ compiler. Tollgate listens on port <code>13000</code>.</p></section>
        <section className="docs-section" id="paths"><Heading n="02">Choose an install path</Heading><div className="docs-choice-grid"><a href="#docker-bundle"><span>01 / RECOMMENDED</span><strong>Docker, everything included</strong><small>Run Tollgate with Redis and Qdrant in Compose.</small></a><a href="#docker-services"><span>02 / DOCKER</span><strong>Use your own services</strong><small>Connect to Redis and Qdrant you already operate.</small></a><a href="#source"><span>03 / SOURCE</span><strong>Develop or run locally</strong><small>Install from a cloned repository.</small></a></div><p>Each path ends with the setup wizard and starting the gateway.</p></section>
        <section className="docs-section" id="docker-bundle"><Heading n="03">Docker, everything included</Heading><p>This runs Tollgate, Redis, and Qdrant on a private Docker network. Docker is the only prerequisite.</p><h3>Create <code>docker-compose.yml</code></h3><Code>{`services:
  tollgate:
    image: ghcr.io/vibhinn/tollgate:latest
    container_name: tollgate
    restart: unless-stopped
    ports: ["13000:13000"]
    volumes: [tollgate_data:/data]
    stdin_open: true
    tty: true
    depends_on: [redis, qdrant]
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes: [redis_data:/data]
  qdrant:
    image: qdrant/qdrant:latest
    volumes: [qdrant_data:/qdrant/storage]
volumes:
  tollgate_data:
  redis_data:
  qdrant_data:`}</Code><p>Redis and Qdrant are not exposed on host ports; only Tollgate can reach them.</p><h3>Start and configure</h3><Code>{`docker compose up -d
docker exec -it tollgate tollgate init`}</Code><p>In the wizard, use service names <code>redis</code> and <code>qdrant</code> as hosts; use ports 6379 and 6333. First setup downloads the classifier and builds <code>llama-server</code>, which takes several minutes.</p><h3>Restart after setup</h3><Code>{`docker restart tollgate
docker logs -f tollgate`}</Code><p>Wait for “Application startup complete,” then press Ctrl+C to exit the log view.</p></section>
        <section className="docs-section" id="docker-services"><Heading n="04">Docker with your services</Heading><p>Use this path when Redis and Qdrant already run locally, remotely, or as managed services.</p><h3>Pull and start the image</h3><Code>{`docker pull ghcr.io/vibhinn/tollgate:latest
docker run -d --name tollgate -p 13000:13000 \\
  -v tollgate_data:/data -it --restart unless-stopped \\
  ghcr.io/vibhinn/tollgate:latest
docker exec -it tollgate tollgate init`}</Code><p>The image supports <code>linux/amd64</code> and <code>linux/arm64</code>, including Apple Silicon.</p><div className="docs-callout"><strong>Container networking</strong><span>Inside Docker, <code>localhost</code> means the Tollgate container. For host services, use <code>host.docker.internal</code>. On Linux, add <code>--add-host=host.docker.internal:host-gateway</code>. For remote services, use their real hostname and credentials.</span></div><p>Restart and inspect logs after setup: <code>docker restart tollgate</code>, then <code>docker logs -f tollgate</code>.</p></section>
        <section className="docs-section" id="source"><Heading n="05">Install from source</Heading><p>Use Python 3.12 or later, Git, CMake, and a C/C++ compiler.</p><Code>{`git clone https://github.com/Vibhinn/Tollgate.git
cd Tollgate
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install -e .`}</Code><p>Start Redis and Qdrant if you do not already have them:</p><Code>{`docker run -d --name tollgate-redis -p 127.0.0.1:6379:6379 \\
  redis:7-alpine redis-server --appendonly yes
docker run -d --name tollgate-qdrant -p 127.0.0.1:6333:6333 \\
  -p 127.0.0.1:6334:6334 qdrant/qdrant`}</Code><p>Run the wizard from the Tollgate folder; it writes configuration there. Then start the gateway:</p><Code>{`tollgate init
tollgate start                     # http://0.0.0.0:13000`}</Code><p>Startup takes up to about 30 seconds while Tollgate prepares the classifier, Qdrant, and provider latency rankings.</p></section>
        <section className="docs-section" id="wizard"><Heading n="06">The setup wizard</Heading><p><code>tollgate init</code> configures the routing classifier and server, Redis and Qdrant, admin credentials, providers and default model, rate limits, and backpressure. It then writes <code>config.yaml</code> and <code>.tollgate.key</code>.</p><ol className="docs-steps"><li>Downloads <code>qwen2.5-1.5b-instruct-q4_k_m.gguf</code> (~1 GB, once).</li><li>Builds llama.cpp’s <code>llama-server</code> for your CPU.</li><li>Collects Redis and Qdrant connection details and credentials.</li><li>Sets admin username and password. Save them to mint admin tokens and rerun setup.</li><li>Configures providers (OpenAI, Anthropic, Gemini, or self-hosted) and a default model.</li><li>Sets request rate limits and burst capacity (default 5 seconds).</li><li>Sets max in-flight requests before returning <code>503</code> (default 50).</li></ol><div className="docs-callout"><strong>Back up <code>.tollgate.key</code></strong><span>It decrypts API keys and passwords stored in <code>config.yaml</code>. Without it, you must run setup again. In Docker, both files are in the <code>tollgate_data</code> volume.</span></div></section>
        <section className="docs-section" id="request"><Heading n="07">Make your first request</Heading><p>Examples use <code>localhost:13000</code>; substitute your server address when needed. Visit <code>http://localhost:13000/docs</code> to check the API.</p><h3>Create an access token</h3><Code>{`curl -X POST http://localhost:13000/api/v1/chat/generate \\
  -H "Content-Type: application/json" \\
  -d '{"token_requirement":"chat"}'`}</Code><p>The response contains a <code>tg_...</code> token. For admin tokens, include the admin role and wizard password. Tokens default to 15 days.</p><h3>Send a chat request</h3><Code>{`curl -X POST http://localhost:13000/api/v1/chat/completions \\
  -H "Authorization: Bearer tg_YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"cheap","messages":[{"role":"user","content":"Explain an API gateway."}],"max_tokens":200}'`}</Code><h3>Choose a model</h3><div className="docs-table-wrap"><table><thead><tr><th>model</th><th>Behavior</th></tr></thead><tbody><tr><td><code>cheap</code></td><td>Lowest-priced configured, healthy provider.</td></tr><tr><td><code>fast</code></td><td>Lowest recent latency measured from your own traffic.</td></tr><tr><td><code>smart</code></td><td>Classifies the prompt and selects a model suited to it.</td></tr><tr><td>Model name</td><td>Routes directly, e.g. <code>gpt-4o</code> or <code>claude-sonnet-4-6</code>.</td></tr><tr><td>Self-hosted name</td><td>Uses the model name configured in the wizard.</td></tr></tbody></table></div><p>Provider failures temporarily remove a model from rotation; policy requests fall back to another healthy model.</p><h3>Request fields</h3><div className="docs-table-wrap"><table><thead><tr><th>Field</th><th>Required</th><th>Default / notes</th></tr></thead><tbody><tr><td><code>model</code></td><td>Yes</td><td>Policy, model, or self-hosted name.</td></tr><tr><td><code>messages</code></td><td>Yes</td><td>Currently only the last message is sent.</td></tr><tr><td><code>max_tokens</code></td><td>Yes</td><td>Maximum response length.</td></tr><tr><td><code>cache_type</code></td><td>No</td><td>None; or <code>exact</code>/<code>semantic</code>.</td></tr><tr><td><code>cache_match_score</code></td><td>No</td><td><code>0.9</code>, semantic similarity from 0–1.</td></tr><tr><td><code>temperature</code></td><td>No</td><td><code>0.7</code>; accepted, not yet forwarded.</td></tr></tbody></table></div><p><code>X-Cache-TTL: &lt;seconds&gt;</code> sets exact-cache lifetime (default 3600 seconds).</p><h3>Cache a response</h3><p>Set <code>cache_type</code> to <code>exact</code> or <code>semantic</code>. Exact caching matches identical text; semantic caching matches similar meaning. Cached responses avoid a provider call and can return in milliseconds.</p><h3>Call from Python</h3><Code>{`import requests

base = "http://localhost:13000/api/v1"
token = requests.post(f"{base}/chat/generate", json={"token_requirement":"chat"}).json()["token"]
response = requests.post(
    f"{base}/chat/completions",
    headers={"Authorization": f"Bearer {token}"},
    json={"model":"fast","messages":[{"role":"user","content":"Write a haiku about caching."}],"max_tokens":100},
)
response.raise_for_status()
print(response.json()["message"])`}</Code><p>The response format is not OpenAI-compatible yet; use HTTP directly rather than the OpenAI SDK’s <code>base_url</code>.</p><h3>Common status codes</h3><div className="docs-table-wrap"><table><thead><tr><th>Code</th><th>Meaning / action</th></tr></thead><tbody><tr><td>401</td><td>Missing or invalid token/password; send a valid bearer token.</td></tr><tr><td>403</td><td>Provider denied access; check model permissions.</td></tr><tr><td>404</td><td>Unknown model/provider or no healthy model for policy.</td></tr><tr><td>422</td><td>Invalid body; check required fields and lowercase cache type.</td></tr><tr><td>429</td><td>Rate limited; follow <code>Retry-After</code>.</td></tr><tr><td>500</td><td>Provider/API error; retry or choose another model.</td></tr><tr><td>503</td><td>Backpressure; retry after <code>Retry-After</code> or raise the limit.</td></tr></tbody></table></div></section>
        <section className="docs-section" id="self-hosted"><Heading n="08">Self-hosted models</Heading><p>Any server with an OpenAI-compatible <code>/v1/chat/completions</code> endpoint works, including Ollama, vLLM, llama.cpp, and LM Studio. Add it in the wizard or with <code>tollgate config --change</code>.</p><div className="docs-table-wrap"><table><thead><tr><th>Wizard field</th><th>Ollama example</th></tr></thead><tbody><tr><td>Name</td><td><code>local-llama</code> (use in requests)</td></tr><tr><td>Endpoint</td><td><code>http://localhost:11434/v1</code></td></tr><tr><td>Model</td><td><code>llama3.2</code></td></tr><tr><td>API key</td><td>Leave blank if none is required.</td></tr></tbody></table></div><p>For Docker, use <code>host.docker.internal</code> to reach a model on your host. Self-hosted models are not in the price table, so “cheap” does not select them; “fast” can.</p></section>
        <section className="docs-section" id="operations"><Heading n="09">Day-to-day operations</Heading><div className="docs-table-wrap"><table><thead><tr><th>Task</th><th>From source</th><th>Docker</th></tr></thead><tbody><tr><td>Start</td><td><code>tollgate start</code></td><td><code>docker start tollgate</code> / Compose up</td></tr><tr><td>Stop</td><td>Ctrl+C</td><td><code>docker stop tollgate</code></td></tr><tr><td>Logs</td><td>Terminal</td><td><code>docker logs -f tollgate</code></td></tr><tr><td>Show config</td><td><code>tollgate config</code></td><td><code>docker exec -it tollgate tollgate config</code></td></tr><tr><td>Change config</td><td><code>tollgate config --change</code>, restart</td><td>Same command with <code>docker exec</code>, then restart</td></tr></tbody></table></div><h3>Update Docker</h3><Code>{`docker compose pull
docker compose up -d`}</Code><p>Configuration and classifier data remain in the project folder or Docker volume.</p><h3>Optional environment variables</h3><ul className="docs-security-list"><li><code>TOLLGATE_DATA_DIR</code> — classifier storage location.</li><li><code>TOLLGATE_APP_DIR</code> — where <code>tollgate start</code> finds the app.</li><li><code>TOLLGATE_CLASSIFIER_CONCURRENCY</code> — smart classifications at once (default 1).</li></ul><h3>Uninstall</h3><Code>{`docker compose down -v  # removes containers and all data`}</Code></section>
        <section className="docs-section" id="troubleshooting"><Heading n="10">Troubleshooting</Heading><div className="docs-faq"><details><summary>Container says “No config.yaml found”</summary><p>Run <code>docker exec -it tollgate tollgate init</code>, then restart. Confirm the wizard and gateway share the same data volume.</p></details><details><summary>Cannot connect to Redis or Qdrant</summary><p>Inside Docker, <code>localhost</code> means the container. Use Compose service names, <code>host.docker.internal</code>, or the service hostname.</p></details><details><summary>Qdrant semantic cache errors</summary><p>Allow gRPC port <code>6334</code> as well as <code>6333</code>.</p></details><details><summary>Routing server failed to start</summary><p>Rerun <code>tollgate init</code> if the model download or build did not finish. Two instances can conflict on classifier port <code>8091</code>.</p></details><details><summary>“cheap,” “fast,” or “smart” returns 404</summary><p>Eligible models may be out of rotation after rate limits, invalid keys, or no credits. “Fast” also needs at least one successful request for latency data.</p></details><details><summary>Request returns 422</summary><p>Include <code>max_tokens</code>, check model spelling, and use lowercase cache types.</p></details><details><summary>Port 13000 is occupied</summary><p>Stop the process, or map another host port, such as <code>-p 8080:13000</code>.</p></details><details><summary>Small provider charge at startup</summary><p>Expected: Tollgate sends a one-token request to each configured model to measure latency.</p></details></div></section>
        <section className="docs-section" id="security"><Heading n="11">Before exposing Tollgate</Heading><ul className="docs-security-list"><li>Anyone who can reach the gateway can create a user token through <code>/api/v1/chat/generate</code>. Keep port 13000 private or use a firewall/reverse proxy.</li><li>Keep Redis and Qdrant private; Redis stores access tokens.</li><li>Treat <code>config.yaml</code> and <code>.tollgate.key</code> as secrets because together they protect provider credentials.</li><li>Use one instance per deployment for now. Rate limits are per process, so instances behind a load balancer each enforce their own.</li></ul><a className="docs-back-link" href="/#top">Back to Tollgate <ArrowUpRight size={16}/></a></section>
      </article>
    </div>
    <footer className="site-footer docs-footer"><div className="section-wrap"><a href="/#top" className="footer-logo">TOLLGATE<span>.</span></a><div><span>OPEN SOURCE. SELF-HOSTED. BUILT FOR THE WAY YOU SHIP.</span><a href="#overview">BACK TO TOP ↑</a></div></div></footer>
  </main>;
}
