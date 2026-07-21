# Ambiguity Compiler MCP Server

The MCP server is the authoritative local workflow service for Ambiguity Compiler. The web dashboard and MCP clients read and write the same JSON-backed records, so a browser refresh does not create a competing source of truth.

## Supported platforms

- Windows PowerShell, macOS, and Linux
- Bun 1.3+ for the local TypeScript entrypoint
- Node.js 22+ for the repository test scripts
- MCP clients that support standard `stdio` or Streamable HTTP transports

## Configuration

Copy the root `.env.example` and configure server-only values. Do not place credentials in `VITE_*` variables.

| Mode | Required values |
| --- | --- |
| OpenAI Responses API | `AMBIGUITY_COMPILER_MODEL_PROVIDER=openai`, `OPENAI_API_KEY`, optional `OPENAI_MODEL` |
| OpenRouter compatibility adapter | `AMBIGUITY_COMPILER_MODEL_PROVIDER=openrouter`, `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL` |

The OpenAI client uses the official SDK with strict JSON Schema output. OpenRouter remains available because this project was initially configured to use it; it also requires a model that supports strict JSON Schema output.

To ensure a separately started dashboard and MCP process share records, set the same absolute `AMBIGUITY_COMPILER_DATA_FILE` path in both environments. Without it, both default to `mcp-server/.data/compilations.json` when started from the documented project directories.

## Start

### Stdio (Codex/local client default)

```powershell
Set-Location mcp-server
bun run start
```

Use your MCP client's command configuration to start `bun run start` from this directory. The server writes protocol traffic only to stdout; diagnostics go to stderr.

### Streamable HTTP (local integration testing)

```powershell
Set-Location mcp-server
$env:MCP_TRANSPORT = "http"
$env:MCP_PORT = "3333"
bun run start
```

- MCP endpoint: `http://127.0.0.1:3333/mcp`
- Health endpoint: `http://127.0.0.1:3333/health`

The HTTP listener binds only to loopback. It uses the official MCP SDK’s Streamable HTTP transport in JSON response mode. Remote deployment, authentication, multi-node coordination, and a managed database are not part of this prototype.

## Tool surface

| Tool | Mutates data | Guardrails |
| --- | --- | --- |
| `ambiguity.compile` | Yes | input/excerpt limits, secret scan, idempotency key |
| `ambiguity.get` | No | workspace scope |
| `ambiguity.render` | No | workspace scope |
| `ambiguity.provide_context` | Yes | expected version, secret scan |
| `ambiguity.select` | Yes | literal `confirmation: true`, expected version |
| `ambiguity.generate_tests` | No | expected version and locked contract hash |
| `ambiguity.record_verification` | Yes | expected version, contract hash, sanitized excerpt |
| `ambiguity.get_receipt` | No | workspace scope |
| `ambiguity.list` | No | workspace scope |
| `ambiguity.health` | No | does not expose secrets |

The server also exposes `ambiguity://health` and `ambiguity://compilations/{id}/receipt` MCP resources.

## Data and privacy

- The service receives only requirement text and caller-approved excerpts.
- It does not inspect a target repository, environment file, or credential store.
- Likely secrets in excerpts, clarification answers, and verification excerpts are rejected before persistence or model invocation.
- Records are local JSON data with atomic file replacement, not a production database. Concurrent multi-process writes and retention policies are not implemented.
- The exact monthly-export fixture can use a clearly labelled deterministic fallback when no configured model key is available; ordinary requirements fail closed without a provider credential.

## MCP Apps UI

This repository does **not** claim to ship an embedded MCP Apps UI. Use the web dashboard or structured MCP tool/resource responses. An embedded Apps UI requires a registered application identity and deployment configuration, which are not present in this workspace.
