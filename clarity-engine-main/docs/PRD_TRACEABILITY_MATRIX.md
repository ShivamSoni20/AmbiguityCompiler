# PRD Traceability Matrix

Status values follow the audit prompt exactly. Evidence is code/static evidence unless a command is named. “Blocked” test evidence means the audit's non-modification rule prevented executing a script that writes generated or fixture files.

## Product flow

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PF-01 | Compile scoped requirement into 2–3 behavioral contracts before implementation | MVP core | PARTIAL | `mcp-server/src/core.ts:94-120`, `336-374` | `npm run test:mcp` passed (fallback only) | Live provider path and complete statuses are unverified/incomplete. | P1 | Add provider integration test and full status model. |
| PF-02 | No-login seeded web demo completes the golden journey | Judge core | BROKEN | `src/routes/demo.tsx:283-345` simulates a seeded adapter | Local route probe connection-refused; no E2E test | Demo is simulated and seeded New York boundary is factually incorrect. | P1 | Correct seed and run an E2E golden path. |
| PF-03 | Dashboard, MCP, and plugin share authoritative workflow state | MVP core | BROKEN | `src/lib/ac/server-functions.ts:5-14`; `src/hooks/use-compilation.ts:19-28` | No integration test | Direct core map, MCP JSON file, and browser localStorage are independent. | P0 | Introduce one service/persistence boundary for all clients. |
| PF-04 | Needs-context creates a new immutable version and remains actionable | MVP core | BROKEN | `core.ts:141-186`; `app.compilations.$id.tsx:90-106` | Core-only needs-context test passed | Record is mutated in place and web has no answer/submit control. | P1 | Implement immutable version records and UI/API answer flow. |

## Functional requirements

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR-01 | Intake validates 10–5,000 character software requirements and preserves original text | Core | PARTIAL | `mcp-server/src/core.ts:11-16`; `app.compilations.new.tsx:48-105` | Indirect core test only | No non-software/malicious classification, optional title UI minimum differs, no external identifier model. | P2 | Add intake policy/schema and tests. |
| FR-02 | Plugin prepares minimal repository context with exclusions, anchors, digest, preview, removal | Core security | MISSING | Manual web form only at `app.compilations.new.tsx:118-185`; skill `SKILL.md:10-12` | No collector tests | No repository collector, excluded-path logic, total budget, digest, or plugin preview implementation. | P1 | Build local collector/sanitizer with fixtures. |
| FR-03 | MCP creates immutable compilation, invokes GPT-5.6, returns valid contracts/needs-context | Core | PARTIAL | `core.ts:94-120`, `300-334` | Fallback core test passed | No immutable versions, direct GPT-5.6 proof, or out-of-scope/refused/failed statuses. | P1 | Persist versions and add stubbed/live provider contract tests. |
| FR-04 | Semantic validation repairs/rejects invalid model results | Core | PARTIAL | `core.ts:336-374` | Core test covers only secret/flow | No repair attempt; unsupported facts, prose code, evidence quotes, and scenario completeness not validated. | P1 | Expand validator and failure/repair tests. |
| FR-05 | Comparison shows contracts, evidence, assumptions, risks, and accessible differences | Core UX | PARTIAL | `InterpretationCard.tsx`; `DifferenceMatrix.tsx:33-140` | No accessibility test | Matrix desktop rows are not keyboard operable; explicit/inferred distinction is incomplete. | P2 | Add keyboard semantics and accessibility tests. |
| FR-06 | Every scenario has complete fixture/precondition/outputs/separation/test metadata | Core | PARTIAL | `core.ts:36-48`; `seed.ts:121-166` | No scenario schema test | Schema lacks precondition/action/candidate test name; seed contains non-separating cases and invalid timezone scenario. | P1 | Expand schema and fixture tests. |
| FR-07 | Selection needs explicit confirmation, one contract, note, actor/timestamp/version/hash, immutable history | Core | BROKEN | `core.ts:123-138`; `server-functions.ts:35-37` | Core false-confirmation unit path only | Web bridge bypasses confirmation; no actor/timestamp/version guard/history. | P1 | Require confirmation and expected version at service boundary. |
| FR-08 | Generate framework-neutral tests and Vitest materialization guidance after selection | Core | PARTIAL | `core.ts:189-218` | Core lifecycle test passed | Tool emits Vitest-only prose; no selected hash input or actual materializer. | P1 | Add neutral contracts, hash guard, and local materializer. |
| FR-09 | Codex discovers/runs targeted local tests with planned changes and redaction | Core | MISSING | Skill only instructs materialization at `SKILL.md:16-18` | No plugin runtime test | No command discovery, consent, diff, execution capture, or log redaction workflow. | P1 | Implement plugin scripts and clean-repo smoke test. |
| FR-10 | Verification requires selected contract version/hash and records sanitized result | Core | BROKEN | `core.ts:233-240`; `index.ts:85-98` | No mismatch test | Inputs omit contract hash/version; web uses hard-coded static artifact. | P1 | Add hash/version schemas and mismatch tests. |
| FR-11 | Receipt includes complete decision data plus Markdown, JSON, and web export | Core | PARTIAL | `core.ts:273-297`; `receipt.tsx:25-45` | No receipt snapshot test | MCP returns only object; web Markdown omits scenarios/provenance/limitations; no receipt hash/timestamps. | P1 | Build canonical receipt serializer and export tests. |
| FR-12 | Dashboard shows actual totals, statuses, recent records, categories, continue action | UX | PARTIAL | `src/routes/app.index.tsx:13-157` | No route test | UI exists but data can diverge from MCP and verified count includes receipt-ready state never produced by live core. | P2 | Use authoritative queries and dashboard integration test. |
| FR-13 | History filters/searches/sorts and labels synthetic seeded data | UX | PARTIAL | `app.history.tsx:24-136` | No route test | Filters exist; search omits requirement text, sort controls absent, seed label not consistently surfaced. | P2 | Add sort/search scope and seeded labels. |
| FR-14 | Preserve input, bounded retries, text fallback, honest seeded fallback | Reliability | PARTIAL | `demo.tsx:299-339`; `use-compilation.ts:22-28` | No failure-path test | No bounded retry/backoff; fallback is demo-only; error preservation is not proved. | P2 | Add failure/retry/preserved-input tests. |

## MCP server

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MCP-01 | Streamable HTTP MCP with HTTPS deployment, health/ready, correlation IDs | Judge core | PRD_DEVIATION | `mcp-server/src/index.ts:1-245` uses stdio readline | Stdio `tools/list` probe passed | No HTTP transport, `/health`, `/ready`, HTTPS config, or correlation ID. | P1 | Use MCP SDK/transport and add endpoint smoke tests. |
| MCP-02 | Initial compile/get/render/context/select/tests/verify/receipt/list tools exist | Core | PARTIAL | `index.ts:24-115`, runtime `tools/list` | Stdio probe returned all nine tools | Names exist, but inputs/outputs omit versions, hashes, cursors, and complete receipt semantics. | P1 | Align tool contracts to PRD and test each handler. |
| MCP-03 | Tool annotations/schemas match behavior and complete structuredContent | Core | PARTIAL | `index.ts:117-133`, `195-199` | `tools/list` probe | Shallow array schemas, no output schema/resource metadata/idempotency; generate-tests annotation does not reflect no write. | P1 | Define strict input/output schemas and annotations. |
| MCP-04 | `ambiguity.render` attaches real MCP Apps UI resource with text fallback | Judge core | MISSING | `core.ts:220-231`; no UI resource files found | No test exists | JSON/text only; no resource URI, bridge, or embedded component. | P0 | Implement resource registration and host tests. |
| MCP-05 | Web and MCP handlers call same service/persistence layer | Core | BROKEN | `server-functions.ts:5-14`; `persistence.ts:5-23` | No cross-surface test | Web imports core directly; stdio process has separate persistence. | P0 | Extract shared service/store and integration tests. |

## Codex plugin

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PLG-01 | Valid plugin manifest and skill frontmatter | Core | IMPLEMENTED | `codex-plugin/.codex-plugin/plugin.json`; `SKILL.md:1-4` | `npm run validate:plugin` passed | Custom validation is narrower than host installation validation. | P2 | Validate on supported Codex surface. |
| PLG-02 | Ordered workflow: preview, explicit selection, materialize, run, record, receipt | Core | PARTIAL | `SKILL.md:10-20` | No workflow test | High-level instructions exist; no AGENTS read, planned diff, install consent, redaction, or file-writing implementation. | P1 | Add executable workflow helpers and smoke test. |
| PLG-03 | `.mcp.json`, `.app.json`, scripts, references, assets, reproducible installation | Judge core | MISSING | `codex-plugin/` inventory contains only manifest, skill, README | No test exists | All PRD-required supporting package elements absent; README is not exact setup. | P1 | Add files/assets and exact surface instructions. |

## AI/model layer

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AI-01 | GPT-5.6 via OpenAI Responses API and official SDK | Core evidence | PRD_DEVIATION | `core.ts:300-325` | Live call unverified | Raw OpenRouter chat-completions is used; actual resolved GPT-5.6 is not proved. | P1 | Add direct Responses API or verifiable provider provenance. |
| AI-02 | Strict Structured Outputs plus deterministic semantic checks | Core | PARTIAL | `core.ts:317-333`, `336-374`, `427-510` | Core fallback tests only | Strict schema requested, not live-proved; semantic checks incomplete. | P1 | Add invalid-output/repair integration corpus. |
| AI-03 | One repair, timeout, retry, refusal/out-of-scope, prompt/model/token telemetry | Reliability | MISSING | `core.ts:300-334` | No test exists | No timeout, repair, telemetry, resolved snapshot, or required statuses. | P1 | Add bounded client and provenance records. |

## Context safety

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CTX-01 | Secret scan, count/per-excerpt/aggregate limits, stable anchors | Security core | PARTIAL | `core.ts:4-16`, `91-98` | Secret synthetic test passed | One regex, no 30k aggregate cap, no robust/fail-closed secret corpus. | P1 | Introduce sanitizer and budget tests. |
| CTX-02 | Exclude env/dependencies/build/binaries; treat source as untrusted | Security core | MISSING | Skill prose `SKILL.md:10-12` | No test exists | No collection implementation or prompt-injection boundary enforcement. | P1 | Implement allowlist/exclusion collector. |

## State and persistence

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ST-01 | Full state machine, stale version rejection, immutable confirmed versions | Core | BROKEN | `core.ts:65-71`, `123-186`; `server-functions.ts:61-95` | No stale-version test | Status set is incomplete; records mutate; web resets version to 1. | P1 | Model versioned immutable entities and guards. |
| ST-02 | No test generation before selection; rejected alternatives preserved | Core | PARTIAL | `core.ts:189-218`, `273-290` | Core lifecycle test passed | Preconditions exist; rejected reason/selection event and contract-hash validation do not. | P1 | Add event model and negative tests. |
| ST-03 | Retention, deletion, corruption/concurrency safety, workspace isolation | Reliability | MISSING | `persistence.ts:9-28`; `browser-store.ts:3-28` | No test exists | No expiration/delete/workspace; no lock; browser/MCP stores diverge. | P2 | Add durable store policy and tests. |

## Web UI and MCP UI

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WEB-01 | Landing, no-login demo, dashboard, compare, tests, receipt, history | Judge UX | PARTIAL | Routes in `src/routes/`; `routeTree.gen.ts:185-263` | Route probe connection-refused | Required core source routes exist but no running-server/clean-browser proof. | P2 | Deploy and add browser smoke suite. |
| WEB-02 | `/how-it-works`, `/docs/testing`, `/app/settings`, navigation and truthful fallback | UX | PARTIAL | Route tree lacks those expected paths; demo fallback at `demo.tsx:299-339` | Route probe blocked | Three PRD routes absent; no settings/retention UI. | P2 | Add/cut-document routes and test navigation. |
| WEB-03 | Seeded demo uses valid discriminating data and no fabricated progress | Judge UX | BROKEN | `seed.ts:123-130`; `demo.tsx:283-339` | No E2E test | New York timezone assertion is false; timer stages mimic analysis despite fallback label. | P1 | Correct fixture and simplify fallback disclosure. |

## Security

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Server-only credential boundary, schema validation, no arbitrary code execution | Security core | PARTIAL | `.env.example`; `core.ts:11-16`, `300-333`; `generateTestContracts` prose | Secret test passed | Boundary is present, but secrets/log/redaction and tool schemas are incomplete. | P1 | Harden scanner/logging/tool validation. |
| SEC-02 | CSP, rate limits, auth/workspace scope, idempotency, correlation IDs | Security/reliability | MISSING | No implementation found; `index.ts:136-245` | No test exists | All listed controls absent. | P1 | Add deployment middleware and scoped request model. |

## Testing and accessibility

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TEST-01 | Unit/integration coverage for sanitizer, state, tools, receipt, version/hash | Core | PARTIAL | `mcp-server/src/core.test.ts` | `npm run test:mcp` passed 3 tests | No tool transport, hash/version, receipt, persistence, or validator-negative coverage. | P1 | Add isolated and integration suites. |
| TEST-02 | Golden baseline fails then selected implementation passes | Judge proof | PARTIAL | `scripts/run-golden-fixture.mjs:13-26`; fixture test | Blocked: runner mutates fixture | Correct runner structure exists but was not executed in read-only audit. | P2 | Run in CI/temp workspace and retain evidence. |
| TEST-03 | AI evaluations, E2E, keyboard, mobile, fallback, persistence consistency | Judge confidence | MISSING | No Playwright/eval/accessibility files in inventory | No test exists | Required test classes absent. | P1 | Add evaluation corpus and browser tests. |
| A11Y-01 | Keyboard, focus, mobile matrix semantics, live regions, no color-only state | UX quality | PARTIAL | Dialog uses AlertDialog; mobile matrix button at `DifferenceMatrix.tsx:101-139` | No accessibility test | Desktop rows not keyboard controls; no audited 44px/focus/live-region coverage. | P2 | Add semantic controls and axe/keyboard tests. |

## Deployment and submission

| ID | PRD requirement | Criticality | Status | Code evidence | Test evidence | Gap | Severity | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEP-01 | Hosted demo, deployed MCP endpoint, health/ready, clean judge path | Judge core | UNVERIFIED | `vite.config.ts` targets Cloudflare; no deployed URL/config proof | Port 3001 connection-refused | Source does not prove deployment or health endpoints. | P2 | Deploy and run clean judge smoke test. |
| SUB-01 | README, license, sample data, testing/platform/plugin documentation | Submission | PARTIAL | `README.md`, `LICENSE`, `fixtures/monthly-export/`, docs | README links static-reviewed | Material exists but plugin instructions/claims have gaps. | P2 | Align docs after implementation. |
| SUB-02 | Repository URL, public demo, video, feedback ID, screenshots, submitted Devpost entry | Submission | MISSING | `docs/DEVPOST_SUBMISSION.md:71-80` unchecked | No external evidence in repo | Required submission artifacts absent; deadline is passed. | P0 | Complete external assets/submission or treat as post-deadline. |
