# Ambiguity Compiler Code-Level Audit

**Audit date:** 2026-07-22  
**Scope:** `AMBIGUITY_COMPILER_PRD.md`, root `README.md`, runtime source, tests, validation scripts, plugin files, and Devpost materials.  
**Audit mode:** Read-only. No application, configuration, fixture, dependency, lockfile, or existing documentation changes were made.

## Executive verdict

**Verdict: NO-GO for the PRD-defined Build Week submission.**

The repository contains a credible local prototype: a responsive web UI, a JSON-line stdio tool server, deterministic fallback contracts, a basic Codex skill, and one real timezone-boundary Vitest fixture. However, the PRD's core cross-surface promise is incomplete. The web app imports MCP core functions directly rather than using the running MCP server, the MCP server has no MCP Apps resource/UI or HTTP transport, plugin materialization is instructional rather than implemented, and version/hash guards are absent on write paths.

The first broken link in the required golden journey is **web/dashboard to authoritative MCP backend**. `src/lib/ac/server-functions.ts` imports `mcp-server/src/core.ts` directly, while the actual stdio MCP server has its own process-local store and persistence path. Browser `localStorage` then wins over server records. This makes dashboard, MCP, and plugin histories able to diverge silently.

### Completion estimates

These are weighted estimates from the 46 rows in `PRD_TRACEABILITY_MATRIX.md`, not a claim of product certainty. P0/P1 requirements receive weight 3, P2 weight 2, P3 weight 1. `IMPLEMENTED=1`, `PARTIAL=0.5`, `PRD_DEVIATION=0.25`, and `MISSING`, `BROKEN`, and `UNREACHABLE=0`; `UNVERIFIED` is reported separately.

| Measure | Estimate | Basis |
| --- | ---: | --- |
| Overall PRD completion | **43%** | Web prototype and basic tool lifecycle exist; integration, protocol, security, and test requirements are largely partial or absent. |
| Core MVP completion | **47%** | Compiling fallback data, comparison UI, selection dialog, basic test contracts, and receipt views exist; authoritative state, versioning, and materialization do not. |
| Judge readiness | **28%** | Seeded demo and fixture exist, but the local server was unavailable on port 3001, demo data contains an invalid timezone example, no embedded MCP UI exists, and the host path is absent. |
| Submission readiness | **18%** | README, license, sample fixture, and draft copy exist; no hosted URL, video, repository URL, feedback ID, or submission proof is present. The PRD deadline was 2026-07-22 05:30 IST. |

### Status and severity counts

Across the matrix: **IMPLEMENTED 1**, **PARTIAL 24**, **MISSING 10**, **BROKEN 8**, **PRD_DEVIATION 2**, **UNVERIFIED 1**.  
Severity distribution: **P0 4**, **P1 29**, **P2 13**, **P3 0**.

## Audit scope and environment

| Item | Result |
| --- | --- |
| Repository root requested by PRD | `D:\Gihtub Main\Ambiguity compiler\AMBIGUITY_COMPILER_PRD.md` |
| Application audited | `D:\Gihtub Main\Ambiguity compiler\clarity-engine-main` |
| Git status / commit | Unavailable: `git -C D:\Gihtub Main\Ambiguity compiler status --short` and `rev-parse HEAD` reported “not a git repository.” |
| Applicable instructions | `AGENTS.md` under `clarity-engine-main`; it prohibits rewriting published Git history. No history operation was attempted. |
| Package manager | Bun; `bun.lock` and `bunfig.toml` are present. |
| Runtime versions | Node `v22.14.0`, Bun `1.3.4`, npm `10.9.2`. |
| Live provider audit | Unverified. The audit did not read `.env`, expose credentials, or make a model call. |
| Local web probe | All requested routes returned connection-refused because no listener was active at `127.0.0.1:3001` during audit. |

## Repository map

| Area | Evidence | Audit conclusion |
| --- | --- | --- |
| Web application | `src/routes/`, `src/components/ac/`, `src/lib/ac/` | TanStack Start dashboard, demo, history, comparison, tests, and receipt routes exist. |
| MCP server | `mcp-server/src/index.ts`, `core.ts`, `persistence.ts` | Custom JSON-line stdio implementation with nine registered tools and a JSON file store. |
| MCP Apps UI | No resource bundle, `.app.json`, MCP UI package, or resource registration found | Missing. The web React UI is not an MCP Apps UI. |
| Codex plugin | `codex-plugin/.codex-plugin/plugin.json`, `skills/ambiguity-compiler/SKILL.md` | Manifest and one short skill exist. No `.mcp.json`, `.app.json`, materializer, sanitizer, receipt script, references, or assets. |
| Shared contracts | `mcp-server/src/core.ts`, `src/lib/ac/types.ts` | Duplicated and inconsistent rather than shared: hashes, versions, statuses, and persistence differ. |
| Model integration | `mcp-server/src/core.ts:300-334` | Direct `fetch` to OpenRouter chat completions, not OpenAI Responses API or official SDK. |
| Persistence | `mcp-server/src/persistence.ts`, `src/lib/ac/browser-store.ts` | Separate JSON file, in-memory map, browser localStorage, and generated artifact; no authoritative shared state. |
| Golden fixture | `fixtures/monthly-export/`, `scripts/run-golden-fixture.mjs` | Real Vitest fixture exists; runner mutates the fixture file during execution. |
| Deployment | `vite.config.ts` | Cloudflare-targeted build configuration only; no deployed URL or health endpoint implementation. |
| Devpost materials | `docs/DEVPOST_SUBMISSION.md` | Prepared copy and checklist; required external submission artifacts are unchecked. |

## Core-flow verdict

| Transition | Verdict | Evidence |
| --- | --- | --- |
| Requirement intake → approved excerpts | Partial | Web form permits manual excerpts and removal (`src/routes/app.compilations.new.tsx:118-185`); no plugin collector, total limit, or excluded-path enforcement. |
| Approved excerpts → remote compilation | Partial | `compileRequirement` sends supplied input to OpenRouter (`mcp-server/src/core.ts:94-120`, `300-334`); live call was not verified without a credential. |
| Compilation → alternatives/scenarios | Partial | Zod + semantic checks exist (`mcp-server/src/core.ts:65-71`, `336-374`); output schema supports only `compiled`/`needs_context` and does not fully validate scenario payloads or unsupported facts. |
| Needs context → new immutable version | Broken | `provideContextAnswers` mutates the same map record and increments its version (`mcp-server/src/core.ts:141-186`); the web UI only displays questions and has no answer action (`src/routes/app.compilations.$id.tsx:90-106`). |
| Alternative → explicit selection | Broken | MCP tool requires `confirmation: true` (`mcp-server/src/index.ts:65-73`, `163-170`), but web server function omits confirmation and core defaults it to true (`server-functions.ts:35-37`, `core.ts:123-138`). No expected version is accepted. |
| Selection → test contracts | Partial | Tool generates specifications (`core.ts:189-218`), but neither MCP nor plugin materializes a test patch. Web bridge synthesizes code independently (`server-functions.ts:96-115`). |
| Local test → sanitized verification | Broken | Web test page fetches one hard-coded static monthly-export artifact and only enables recording for Contract A/AC1 (`app.compilations.$id.tests.tsx:21-76`); MCP verification accepts neither contract hash nor version (`core.ts:233-240`). |
| Verification → decision receipt | Partial | Receipt data exists (`core.ts:273-297`) and web copy controls exist (`receipt.tsx:25-45`), but MCP returns no Markdown/JSON receipt fields or receipt hash, and the web receipt is incomplete. |
| Receipt → history retrieval | Broken | Browser records take precedence over server records (`use-compilation.ts:19-28`); MCP and dashboard do not share a store. |

## What is fully implemented

- The nine named MCP-equivalent tools are registered and returned by a successful runtime `tools/list` probe: `mcp-server/src/index.ts:24-115`, `:195-199`.
- The core test suite covers seeded fallback compilation, secret-pattern rejection, explicit `confirmation: false` rejection when calling core directly, and a needs-context recompilation: `mcp-server/src/core.test.ts:20-97`.
- A manifest and basic Codex skill validate via `npm run validate:plugin`: `codex-plugin/.codex-plugin/plugin.json`, `codex-plugin/skills/ambiguity-compiler/SKILL.md`.

## What is partially implemented

- Requirement form, manual excerpt preview/removal, comparison cards, matrix, dialog, test display, receipt view, history filtering, static seeded demo, local MCP persistence, schema validation, and a before/after fixture all exist.
- The model request asks OpenRouter for strict JSON schema output, but runtime enforcement beyond provider behavior relies on parsing the returned text and incomplete semantic checks.
- The README has setup, platform, security, model, test, plugin, and fixture information, but several claims are contradicted by the runtime or are not independently verifiable.

## What is missing

- MCP Apps resource registration, host bridge, compact/expanded embedded UI, and text fallback resource metadata.
- Streamable HTTP MCP transport, `/health`, `/ready`, request correlation IDs, authentication/workspace scope, and rate limits.
- Plugin `.mcp.json`, `.app.json`, local context collector/sanitizer, test materializer, receipt writer, asset package, and reproducible plugin installation command.
- Version/hash/idempotency guards, immutable historical versions, retention/deletion, database/workspace isolation, test command discovery, log redaction workflow, AI evaluation set, Playwright E2E, accessibility tests, and deployed judge URL.

## What is broken

- **Authoritative state:** web server functions use a direct imported core store while the MCP server persists a different process store. Browser localStorage can then mask both (`src/lib/ac/server-functions.ts:5-14`, `src/hooks/use-compilation.ts:19-28`).
- **Selection guard:** UI confirmation is bypassed at the application-service boundary because `selectContract` defaults confirmation to true and `selectCompilationContract` supplies none (`core.ts:123-138`, `server-functions.ts:35-37`).
- **Verification guard:** record verification does not require selected contract hash or compilation version (`core.ts:233-240`, `index.ts:85-98`).
- **Needs-context web journey:** questions render without inputs, submit button, or server action (`src/routes/app.compilations.$id.tsx:90-106`).
- **Seeded timezone scenario:** the seeded demo calls `2025-02-28T23:30:00Z` “March 1” in `America/New_York`; it is still February in New York (`src/lib/ac/seed.ts:123-130`). The live core fallback uses the corrected Asia/Kolkata example (`mcp-server/src/core.ts:410-417`).

## README claims versus code

| Claim area | Classification | Evidence and gap |
| --- | --- | --- |
| Nine MCP tools | Partially verified | Runtime `tools/list` returned all nine. Tool schemas omit required version/hash/idempotency fields and render attaches no UI resource. |
| OpenRouter GPT-5.6 strict structured output | Partially verified | Request specifies `openai/gpt-5.6-sol` and `response_format.json_schema.strict=true` (`core.ts:300-333`), but no live call proves resolved model or provider enforcement. |
| Human confirmation gate | Contradicted at web boundary | UI dialog requires a checkbox (`ContractConfirmationDialog.tsx:84-108`), but web bridge calls core without `confirmation` and core defaults to `true`. |
| MCP persistence | Partially verified | JSON persistence exists for stdio process (`persistence.ts:5-23`); receipt still calls it memory-only (`core.ts:292-296`) and web does not use that store. |
| Browser-local dashboard history | Verified but incomplete | `browser-store.ts:3-28` uses localStorage; it takes priority over server data and can diverge. |
| Context sanitizer and limits | Partially verified | Per-excerpt count and length exist (`core.ts:4-16`) with one regex secret check (`core.ts:91-98`); no total 30k budget, path exclusion, or fail-closed robust scanner. |
| Codex materializes tests and saves receipts | Documentation only | Skill instructs this (`SKILL.md:16-18`) but no plugin script or runtime implementation exists. |
| Golden fixture proves fail then pass | Static implementation present; unverified this audit | Runner copies buggy/fixed source (`scripts/run-golden-fixture.mjs:13-26`), but was not run because audit constraints prohibit modifying fixtures. |
| Hosted no-key judge demo | Not verifiable | `/demo` source exists but all local route probes were connection-refused and no hosted URL is in repository materials. |

## MCP server findings

- The server supports stdio JSON line requests, `initialize`, `tools/list`, and `tools/call` (`mcp-server/src/index.ts:136-245`). It is not implemented with an MCP SDK, Streamable HTTP, auth, resources, or endpoint health checks.
- Data and rendering functions are separate, but `ambiguity.render` returns only JSON/text `structuredContent`; it does not attach an MCP Apps resource (`core.ts:220-231`, `index.ts:195-199`).
- Tool annotations are mechanically generated. They correctly mark only get/render/receipt/list read-only, but they cannot express confirmation, version, idempotency, or UI metadata (`index.ts:117-133`).
- `ambiguity.generate_tests` is marked write-like but does not write state; no contract hash input is required. `ambiguity.get_receipt` is read-only, while the PRD expects receipt finalization semantics.
- Process-wide map keys are opaque but have no workspace ownership or auth. File persistence uses temp-write/rename, but no lock, concurrent writer protection, retention, or deletion (`persistence.ts:19-23`).
- The successful runtime `tools/list` probe confirms registration only; it does not prove hosted transport, provider invocation, or cross-process record consistency.

## GPT-5.6 and provider findings

- **Provider/endpoint:** OpenRouter `https://openrouter.ai/api/v1/chat/completions` through raw `fetch` (`core.ts:300-325`).
- **Default model:** `openai/gpt-5.6-sol` via `OPENROUTER_MODEL` (`core.ts:292`, `312`).
- **PRD deviation:** no OpenAI Responses API and no official OpenAI SDK are used. The repository cannot prove that OpenRouter resolved the requested alias to GPT-5.6.
- **Structured output:** JSON Schema request uses `strict: true`; returned text is parsed then validated with Zod (`core.ts:317-333`). Strict adherence is requested, not independently guaranteed by an audited live response.
- **Reliability:** no timeout/AbortSignal, retry, one semantic repair call, resolved snapshot recording, token usage, latency telemetry, or refusal/out-of-scope statuses. Error messages include provider response text (`core.ts:324-325`).
- **Semantic validation:** interpretation count, identifiers, criterion-set distinction, evidence anchor path/anchor membership, and pairwise outcome divergence are checked (`core.ts:336-374`). It does not verify evidence quotes, category relevance, executable code in prose, unsupported facts beyond anchor matching, scenario completeness, or all PRD statuses.

## Context and secret-safety findings

- Web users can manually preview and remove excerpts (`app.compilations.new.tsx:118-151`). Limits are 12 excerpts and 4,000 characters each in the server schema (`core.ts:4-16`).
- There is no 30,000-character aggregate cap, plugin repository scanner, `.env`/binary/dependency/generated-file exclusion mechanism, context digest, source-file anchor validation, or prompt-injection isolation beyond the system prompt.
- Secret protection is one regex that checks only supplied text (`core.ts:91-98`). It can miss bare tokens and many credential formats; it does not fail closed for unknown sensitive material. The core test only proves one synthetic `API_KEY=` string is rejected (`core.test.ts:52-67`).
- No raw excerpts are logged by the audited code, but provider error text is surfaced and no explicit redaction layer protects every error/log path.

## State-machine and selection findings

- Core `ModelOutput` supports only `compiled` and `needs_context` (`core.ts:65-71`), while the PRD requires `out_of_scope`, `refused`, and `analysis_failed` too.
- The map record is mutated in place for context answers and selection; no immutable historical version is retained (`core.ts:141-186`, `123-138`).
- `toCompilation` discards actual `record.version` by returning `version: 1`, calculates a different hash shape, and maps selected records directly to `tests_generated` (`server-functions.ts:61-95`).
- Generation and verification lack expected contract hash/version inputs. Duplicate requests are not idempotent and no client request ID is accepted.

## Codex plugin findings

- `plugin.json` and `SKILL.md` exist and the custom validator passes.
- The skill describes the correct high-level order but does not tell Codex to read applicable `AGENTS.md`, show exact context before transmission, enforce context limits, discover targeted test commands, show a diff, ask before installs/broad tests, or write local Markdown/JSON receipt files.
- Required PRD package elements are absent: `.mcp.json`, `.app.json`, reference material, context sanitizer, bundle validator, Vitest materializer, receipt script, and assets. `codex-plugin/README.md` is not an exact installation procedure.

## MCP Apps UI findings

**Missing (P0).** No registered resource, `ui://` URI, MIME/profile metadata, bridge integration, `tools/call` action channel, or MCP Apps bundle exists. `ambiguity.render` supplies JSON only. The responsive web comparison UI is not embedded in an MCP host and cannot satisfy the PRD's embedded UI requirement.

## Web UI findings

- Landing, `/demo`, dashboard, new compilation, detail, compare, tests, receipt, history, install, and privacy source routes exist.
- PRD-declared `/how-it-works`, `/docs/testing`, and `/app/settings` routes are absent from the generated route tree. The route probe could not verify any page because no local server was listening.
- The demo honestly labels the compile phase as prevalidated/no external calls (`demo.tsx:299-339`) but visually stages “Validating context,” “Checking evidence,” and “Building discriminating cases” with timers. It is an intentionally simulated path, not a call through the MCP server.
- Desktop matrix rows are pointer-clickable `tr` elements without keyboard focus/activation (`DifferenceMatrix.tsx:56-64`); no E2E keyboard or mobile verification exists.
- The receipt UI supports copy/print, but its Markdown omits most required fields and the displayed model/prompt is generic rather than recorded provenance (`receipt.tsx:25-45`, `182-193`).

## Persistence findings

| Store | Authority / risk |
| --- | --- |
| `compilationStore` map | In-process core state; used directly by web server functions. Lost on web process restart. |
| `mcp-server/.data/compilations.json` | Used only by stdio MCP process. Temp write/rename is good single-process hygiene; no concurrency/workspace controls. |
| Browser localStorage | Checked first and can hide/rewrite server records (`use-compilation.ts:19-28`). |
| `public/verification/monthly-export.json` | One hard-coded golden artifact, read by test page only for Contract A/AC1. |

No single source of truth exists. Dashboard/MCP history can diverge; retention, deletion, corrupted JSON recovery UX, cross-workspace isolation, and raw-excerpt retention policy are absent.

## Security findings

- No client-exposed API key was found in audited source. `.env` is ignored and `.env.example` labels the key server-only.
- Input validation exists on core compile and verification schemas, but the MCP tool JSON schemas are shallow (`context`/`answers` arrays are untyped) and server functions bypass MCP input/confirmation semantics.
- No arbitrary submitted code execution occurs on the MCP server; generated test materialization is prose only.
- No CSP/security header configuration, rate limiting, auth/workspace scoping, idempotency protection, request correlation, or full secret-redaction logger was found.

## Test and command results

| Command / probe | Exit | Result | Reproducibility / note |
| --- | ---: | --- | --- |
| `npm.cmd run test` | 1 | Failed | No `test` script is defined. npm also could not write its cache log in this environment. |
| `bun install --frozen-lockfile` | Blocked | Not run | Dependency installation can modify `node_modules`; prohibited by audit non-modification rule. Existing dependencies were present for read-only checks. |
| `Copy-Item .env.example .env` | Blocked | Not run | Would overwrite/create a local credential file; prohibited by audit rule. |
| `bun run dev` | Blocked | Not run | Long-running process that can write local logs; no listener was active when routes were probed. |
| `npm.cmd run test:contract` | 0 | Passed | 1 monthly-export test passed. |
| `npm.cmd run test:mcp` | 0 | Passed | 3 core tests passed; does not cover MCP transport or web integration. |
| `npm.cmd run validate:plugin` | 0 | Passed | Custom manifest/frontmatter validator passed. |
| `npm.cmd run lint` | 0 | Passed with warnings | 6 existing `react-refresh/only-export-components` warnings, no errors. |
| `bun run check` in `mcp-server` | 0 | Passed | TypeScript no-emit check. |
| MCP `tools/list` stdio probe | 0 | Passed | Required an escalated local process due sandbox restriction; returned nine tools. |
| `npm.cmd run test:contract:record` | Blocked | Not run | Writes `public/verification/monthly-export.json` and raw reports; prohibited by audit non-modification rule. |
| `npm.cmd run test:golden-fixture` | Blocked | Not run | Copies buggy/fixed source into fixture; prohibited by audit non-modification rule. |
| `npm.cmd run build` | Blocked | Not run | Writes `.output/` and generated deployment files; prohibited by audit non-modification rule. |
| Local web route probe | Connection refused | Failed | No listener at port 3001 during audit; not evidence that source routes cannot build. |

## Devpost readiness

### Code blockers

1. No authoritative MCP-backed golden journey across web, plugin, and server.
2. No MCP Apps UI resource.
3. Missing selection/verification version and contract-hash guards.
4. Seeded demo timezone scenario is factually incorrect.

### Deployment blockers

1. No hosted public/no-key demo URL or verified health endpoint.
2. No evidence of deployed MCP transport or embedded UI assets.
3. Local port 3001 was not listening during audit.

### Documentation blockers

1. `docs.install` says records are in-memory (`src/routes/docs.install.tsx:121-129`), while README/MCP docs describe file persistence.
2. Privacy page claims ephemeral 24-hour expiry, workspace retention, and deletion that no implementation provides (`src/routes/privacy.tsx:42-45`).
3. Plugin installation instructions are descriptive, not reproducible, and do not name supported surfaces precisely.

### Submission-form blockers

`docs/DEVPOST_SUBMISSION.md:71-80` leaves repository URL, hosted demo, video, `/feedback` ID, team verification, and submission unchecked. No screenshot assets or final submission proof were found. The PRD deadline has passed as of this audit date.

## Prioritized remediation plan

| Priority | Problem | Why it matters | Likely files/modules | Required tests | Effort | Blocks golden demo | Blocks submission |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0-1 | Make one application service authoritative for web and MCP | Prevents silent divergence and makes receipts trustworthy | `mcp-server/src/*`, `src/lib/ac/server-functions.ts`, persistence adapter | Cross-process compile/select/list/receipt integration test | L | Yes | Yes |
| P0-2 | Implement MCP Apps resource/UI or remove the claim and cut scope honestly | PRD requires embedded comparison and explicit server-authoritative action | New MCP UI bundle/resource registration, `ambiguity.render` | Host bridge action tests and text fallback test | L | Yes | Yes |
| P0-3 | Add version, selected-contract hash, and idempotency checks to all writes | Stops stale/replayed selections and mismatched verification | Core schemas, tool schemas, web API/service | Stale version, hash mismatch, replay tests | M | Yes | Yes |
| P0-4 | Correct and execute the seeded golden path | Current demo tells a false timezone story | `src/lib/ac/seed.ts`, fixture, demo evidence | Golden baseline-fails/fixed-passes plus UI receipt test | S | Yes | Yes |
| P1-1 | Implement plugin local workflow scripts and exact installation config | Converts instructions into a judge-runnable Codex workflow | `codex-plugin/` including `.mcp.json`, materializer, sanitizer, receipts | Clean-repo plugin smoke test | L | Yes | Yes |
| P1-2 | Replace/augment OpenRouter deviation with verifiable GPT-5.6 evidence | Build Week judging requires clear Codex/GPT-5.6 evidence | Model client, provenance, docs | Stubbed provider contract + live opt-in smoke test | M | Yes | Yes |
| P1-3 | Add context collection limits and robust secret scanning | Protects repository data and meets PRD boundary controls | Plugin collector, core schemas, sanitizer | Secret corpus, aggregate-limit, excluded-path tests | M | Yes | Yes |
| P1-4 | Build needs-context and receipt completeness flows | Current UI cannot answer questions; receipts omit data | Detail route, service layer, receipt serializer | Needs-context UI/E2E and receipt snapshot tests | M | Yes | Yes |
| P1-5 | Deploy a public no-key demo and finish Devpost evidence | Required external submission materials are absent | Deployment config, Devpost, video assets | Clean-browser smoke test | M | Yes | Yes |
| P2-1 | Add E2E, keyboard, mobile, AI-evaluation, and persistence tests | Existing unit tests do not prove judge journey | Playwright/Vitest suites, fixtures | Listed test matrix | L | No | Yes |
| P2-2 | Align README, install, privacy, and receipt claims | Prevents trust damage from false retention/persistence claims | `README.md`, install/privacy routes, receipt | Docs claim review | S | No | Yes |

## Final go/no-go assessment

**NO-GO.** The code is a useful prototype and has testable pieces, but it does not yet satisfy the PRD's required MCP-backed, version-safe, materializing, and judge-ready product path. The minimum conditional-go threshold is P0-1 through P0-4 plus a deployed no-key demonstration and completed external submission evidence. Do not represent the current web flow as an authoritative MCP Apps workflow or the seeded New York timestamp as a valid local-March example.
