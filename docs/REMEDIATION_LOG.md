# Remediation Log

## Scope

This log records implementation performed after the baseline audit. The baseline files remain unchanged:

- `docs/CODE_AUDIT_REPORT.md`
- `docs/PRD_TRACEABILITY_MATRIX.md`
- `docs/AUDIT_EVIDENCE.json`

## Completed

| Area | Change | Evidence |
| --- | --- | --- |
| Authoritative state | Removed browser `localStorage` fallback and routed dashboard reads/writes through persisted server functions. | `src/hooks/use-compilation.ts`, `src/lib/ac/server-functions.ts` |
| Shared storage | Web and MCP flows hydrate/persist the same JSON record file; persistence now serializes every workspace. | `mcp-server/src/persistence.ts` |
| Optimistic concurrency | Mutations require an expected record version and reject stale updates. | `mcp-server/src/core.ts`, `mcp-server/src/core.test.ts` |
| Human approval | Contract selection requires schema-level literal `confirmation: true`; the web UI sends it explicitly. | `mcp-server/src/core.ts`, `src/routes/app.compilations.$id.compare.tsx` |
| Contract integrity | Selection creates a SHA-256 contract hash; test generation and verification must reference it. | `mcp-server/src/core.ts` |
| Idempotency and scope | Compile and verification accept idempotency keys; records are workspace-scoped. | `mcp-server/src/core.ts`, `mcp-server/src/index.ts` |
| Model integration | Added official OpenAI SDK Responses API structured-output client and retained an explicit OpenRouter compatibility adapter. | `mcp-server/src/core.ts`, `.env.example` |
| Secret handling | Strengthened likely-secret screening for context, clarifications, and verification excerpts. | `mcp-server/src/core.ts`, `mcp-server/src/core.test.ts` |
| Standard MCP | Replaced bespoke stdin JSON loop with official MCP SDK tools/resources, stdio transport, and optional Streamable HTTP transport. | `mcp-server/src/index.ts` |
| Fixture correction | Replaced the impossible New York “March local / February UTC” example with a valid Asia/Kolkata boundary. | `src/lib/ac/seed.ts` |
| Documentation | Corrected persistence/provider claims and added operational MCP/plugin guides. | `README.md`, `mcp-server/README.md`, `codex-plugin/README.md` |

## Deferred by evidence

- An embedded MCP Apps UI is not configured because no registered application identity or deployment configuration is present. Product documentation now states this explicitly rather than claiming support.
- Local JSON persistence is appropriate for the prototype but does not provide database-backed retention, authentication, deletion workflows, or multi-process write coordination.
- No live provider compilation was run in verification; this avoids exposing or consuming the configured API credential. Deterministic golden-fixture behavior is labelled in receipts as fixture mode.

## Baseline environment note

`git -C "D:\Gihtub Main\Ambiguity compiler" status --short` exited with code 128 because the supplied workspace has no usable Git metadata. No clean-tree claim or commit-based evidence is made.
