# Ambiguity Compiler — Product Requirements Document

**Version:** 1.0  
**Status:** Hackathon implementation specification  
**Hackathon:** OpenAI Build Week  
**Official category:** Developer Tools  
**Target submission:** July 21, 2026 at 5:00 PM PT / July 22, 2026 at 5:30 AM IST  
**Primary surfaces:** Codex plugin, MCP-backed ChatGPT app, responsive web dashboard  
**Primary model:** GPT-5.6 through the OpenAI Responses API  
**Team assumption:** Solo builder or small team  

## 1. Executive summary

Ambiguity Compiler prevents coding agents and developers from silently choosing one interpretation of an underspecified software requirement.

It reads a requirement together with a deliberately scoped repository context bundle, generates two or three materially different behavioral contracts, constructs discriminating examples that make those interpretations produce different outcomes, asks a human to choose the intended contract, and then gives Codex a locked contract from which it can generate tests and implementation changes.

The complete product is delivered as:

1. A Codex plugin containing the repeatable local-repository workflow.
2. A remote MCP server exposing focused analysis, selection, verification, and receipt tools.
3. An MCP Apps UI for comparing interpretations and confirming a contract inside ChatGPT.
4. A standalone responsive website containing the landing page, seeded demo, dashboard, compilation history, and decision receipts.

The local Codex environment owns repository reading, local test execution, and file edits. The MCP server receives only the minimum context explicitly prepared for a compilation. It never receives unrestricted filesystem or repository access.

### One-line pitch

Ambiguity Compiler turns vague requirements into competing executable contracts before Codex writes the wrong code.

### Product promise

Within five minutes, a developer should be able to see the meaningful interpretations hidden inside one requirement, understand exactly where their behavior differs, select the intended contract, and generate a testable decision artifact before implementation begins.

## 2. Hackathon alignment

### Track fit

Submit under Developer Tools. The product directly supports software development, testing, agentic coding workflows, and safer use of coding agents.

### Required judging evidence

| Judging criterion | Evidence the product must demonstrate |
|---|---|
| Technological Implementation | Working Codex plugin, remote MCP tools, GPT-5.6 Structured Outputs, schema validation, repository-context preparation, test-contract generation, real test execution, and decision receipts |
| Design | A coherent compile → compare → choose → generate tests → verify journey across plugin, embedded UI, and web dashboard |
| Potential Impact | A credible reduction in rework caused by silent requirement interpretation, supported by user observations rather than fabricated statistics |
| Quality of the Idea | The novel unit is not requirement rewriting; it is converting ambiguity into competing behavioral contracts with discriminating executable scenarios |

### Submission requirements to preserve

- Working project built with Codex and GPT-5.6.
- Developer Tools category selected.
- Public project description explaining the problem and working flow.
- Public YouTube demo shorter than three minutes.
- Voiceover must explain the product, Codex use, and GPT-5.6 use.
- Repository URL with an appropriate license if public.
- README with setup, sample data, supported platforms, installation instructions, and testing instructions.
- A judge-ready demo or sandbox that does not require rebuilding from scratch.
- Codex /feedback Session ID from the session where most core functionality was built.

## 3. Problem

Software requirements frequently look clear while leaving behavior unspecified.

Examples:

- “Users can export their monthly transactions.”
- “Admins can retry failed jobs.”
- “Delete inactive accounts after 30 days.”
- “Notify the owner when processing completes.”

Each sentence can produce multiple reasonable implementations. A coding agent can select one interpretation, write valid code, pass existing tests, and still deliver the wrong product behavior.

Current workflows generally fail in four ways:

1. **Silent selection:** the agent chooses an interpretation without exposing alternatives.
2. **Prose-only clarification:** questions are asked, but the behavioral consequence of each answer is not shown.
3. **Non-executable decisions:** the selected interpretation is recorded in chat or a document but never encoded into tests.
4. **Decision loss:** later developers cannot reconstruct why one behavior was selected and others were rejected.

The expensive failure is therefore not syntax or code generation. It is committing to the wrong behavioral contract before implementation.

## 4. Product positioning

Ambiguity Compiler is:

- A pre-implementation contract compiler.
- A human-approval gate for agentic coding.
- A generator of discriminating behavioral scenarios.
- A durable decision-receipt system.
- A Codex-native developer workflow.

Ambiguity Compiler is not:

- A generic PRD generator.
- A project-management tool.
- A chatbot that asks unlimited clarification questions.
- A code generator that edits before approval.
- A replacement for product judgment.
- A universal formal-methods verifier.
- A tool that promises every requirement ambiguity can be discovered.

## 5. Target users

### Primary persona: product-minded developer

- Implements features from issues, briefs, or PRDs.
- Uses AI coding agents regularly.
- Wants fast clarification without a long meeting.
- Needs executable acceptance criteria.

**Job to be done:** “Before I let an agent implement this issue, show me the materially different behaviors hidden in it and let me lock the intended contract.”

### Secondary persona: engineering lead

- Reviews specifications and implementation plans.
- Wants traceability between a decision, tests, and code.
- Needs a lightweight approval mechanism.

**Job to be done:** “Show me which interpretation was selected, who selected it, what evidence supported it, and which tests enforce it.”

### Hackathon persona: judge

- Has only a few minutes.
- Needs a seeded repository and reliable path.
- Must see Codex and GPT-5.6 doing different, necessary jobs.
- Should not need credentials, setup work, or private source code.

## 6. Core product principles

1. **Expose alternatives before implementation.**
2. **Behavior, not wording.** Interpretations must produce observably different outcomes.
3. **Human choice is mandatory.** No production code edit before contract selection.
4. **Evidence over invention.** Every ambiguity must reference requirement text or repository context.
5. **Minimum context.** Send only relevant excerpts to the MCP server.
6. **Structured model output.** GPT-5.6 responses must follow strict schemas.
7. **Deterministic verification.** Validate structure, references, uniqueness, and test execution in code.
8. **Abstention is valid.** Insufficient context produces a targeted question, not fabricated alternatives.
9. **One decision receipt.** Preserve selected and rejected behaviors with evidence.
10. **Text fallback everywhere.** The workflow must remain usable without custom MCP UI.

## 7. MVP scope

### Supported ambiguity categories

The hackathon MVP supports exactly three categories:

1. **Boundary and time**
   - Calendar period versus rolling window
   - Inclusive versus exclusive boundaries
   - User timezone versus UTC

2. **Authorization and actor**
   - Owner versus administrator
   - Account-level versus resource-level permission
   - Acting user versus affected user

3. **Lifecycle and state**
   - Pending, completed, failed, cancelled, or deleted
   - Behavior during an in-progress transition
   - Empty and missing states

### Supported implementation stack

- TypeScript repository
- Node.js HTTP API
- Vitest test runner
- JSON-compatible input and output
- One seeded demonstration repository

### Golden requirement

“Users can export their monthly transactions.”

The system should compile at least these plausible contracts:

1. User-local calendar month; completed transactions only.
2. UTC calendar month; completed and pending transactions.
3. Rolling 30-day window ending at request time.

### Golden discriminating cases

- Transaction at 00:30 local time on the first day but still in the previous UTC day.
- Pending transaction inside the selected period.
- Transaction exactly at the end boundary.
- No transactions.
- Administrator requesting another user’s export.

### Explicit MVP exclusions

- GitHub OAuth and automatic remote-repository cloning.
- Arbitrary languages and test frameworks.
- Multi-tenant organization administration.
- Billing.
- Production authentication.
- Automatic pull-request creation.
- Automatic deployment.
- Arbitrary code execution on the MCP server.
- Retrieval of secrets, environment files, or credential stores.
- More than three top-level interpretations per compilation.

## 8. End-to-end experience

### Flow A: Codex plugin compilation

1. User installs the Ambiguity Compiler plugin.
2. User opens a supported TypeScript repository.
3. User asks Codex to compile an issue or requirement.
4. The plugin skill reads the requirement, repository guidance, relevant types, routes, and tests.
5. The skill constructs a scoped context bundle and displays exactly what will be sent.
6. User confirms analysis.
7. Codex calls the MCP compile tool.
8. MCP server invokes GPT-5.6 with a strict schema.
9. Server performs semantic validation.
10. Results render as an interpretation comparison UI when supported, with a text-table fallback.
11. User selects a contract or supplies missing information.
12. Selection is stored by the MCP server.
13. Codex fetches the locked contract and writes local tests.
14. Codex runs tests against the existing implementation.
15. Codex optionally implements the feature after explicit user instruction.
16. Test results are recorded.
17. MCP server creates a decision receipt.
18. Codex saves AMBIGUITY_RECEIPT.md and ambiguity-contract.json in the repository.

### Flow B: Standalone web demo

1. Judge opens the landing page.
2. Judge selects Try the live demo.
3. Seeded repository context and the golden requirement are preloaded.
4. Judge starts compilation without an account.
5. Interpretation cards appear progressively.
6. Judge opens the difference matrix.
7. Judge runs the discriminating cases.
8. Judge selects the intended contract.
9. The UI shows generated Vitest contracts and simulated baseline results.
10. The final screen shows the locked decision receipt and explains how to run the same flow through Codex.

### Flow C: Dashboard history

1. User opens the dashboard.
2. User sees recent compilations and current states.
3. User filters by ambiguous, awaiting decision, verified, or needs context.
4. User opens a compilation.
5. User can review the original requirement, context digest, interpretations, selection, verification, and receipt.

### Flow D: Insufficient context

1. GPT-5.6 cannot produce two evidence-grounded, behaviorally different contracts.
2. Compilation status becomes needs_context.
3. System asks one to three targeted questions.
4. User answers.
5. A new immutable compilation version is created.
6. Previous output remains available for audit.

## 9. Information architecture

### Public website

- / — Landing page
- /demo — No-login golden demonstration
- /how-it-works — Product and architecture explanation
- /docs/install — Plugin and MCP installation
- /docs/testing — Judge and developer testing path
- /privacy — Data handling and retention

### Dashboard

- /app — Overview
- /app/compilations/new — Start web compilation
- /app/compilations/:id — Compilation overview
- /app/compilations/:id/compare — Interpretation matrix
- /app/compilations/:id/tests — Discriminating cases and generated contracts
- /app/compilations/:id/receipt — Final decision receipt
- /app/history — Search and filter
- /app/settings — Demo preferences and retention

### Embedded MCP component states

- compact-summary
- comparison
- discriminating-case
- confirmation
- verification
- receipt
- needs-context
- error

## 10. Functional requirements

### FR-1: Requirement intake

The system must:

- Accept requirement text between 10 and 5,000 characters.
- Accept an optional requirement title and external issue identifier.
- Reject empty, non-software, or obviously malicious input.
- Preserve the original text verbatim in the decision receipt.
- Allow seeded sample content.
- Never accept secrets or environment-variable values intentionally.

### FR-2: Local context preparation

The Codex plugin must:

- Read repository-level AGENTS.md instructions where available.
- Identify likely implementation surfaces from symbols, routes, types, and tests.
- Collect only relevant excerpts.
- Exclude .env files, keys, tokens, credentials, node_modules, build output, and binary files.
- Limit excerpts by file count and character budget.
- Attach stable file path and line anchors.
- Compute a context digest.
- Show a preview before the first remote analysis call.
- Allow the user to remove any excerpt.

### FR-3: Ambiguity compilation

The MCP server must:

- Accept requirement and scoped context.
- Create an immutable compilation record.
- Invoke GPT-5.6 using Structured Outputs.
- Produce two or three interpretations, or needs_context.
- Restrict categories to the MVP taxonomy.
- Attach evidence references to every assumption.
- Produce at least one discriminating case for every interpretation pair.
- Never output private chain-of-thought.
- Return concise public reasoning summaries only.

### FR-4: Semantic validation

Validation must reject or repair output when:

- Fewer than two interpretations are returned for compiled status.
- Interpretation identifiers are duplicated.
- Acceptance criteria are identical after normalization.
- Evidence references do not exist.
- A discriminating case produces identical expected outcomes for all interpretations.
- A category is outside the supported taxonomy.
- The model introduces unsupported repository facts.
- The output contains executable code in a field that only permits prose.

Allow one model repair attempt. If semantic validation still fails, return a deterministic golden fallback only for the seeded demo. All other sessions become analysis_failed.

### FR-5: Comparison experience

The UI must:

- Display two or three interpretation cards.
- Show contract, assumptions, evidence, risk, and expected behavior.
- Provide a difference matrix by scenario.
- Clearly distinguish explicit requirement text from inferred assumptions.
- Allow keyboard and screen-reader comparison.
- Never visually preselect a recommended interpretation.

### FR-6: Discriminating scenarios

Every scenario must include:

- Human-readable name.
- Input fixture.
- Context or precondition.
- Expected output per interpretation.
- Explanation of why the scenario separates contracts.
- Candidate test name.
- Deterministic unique identifier.

### FR-7: Contract selection

The system must:

- Require explicit confirmation.
- Allow exactly one selected contract in the MVP.
- Allow a user note.
- Record actor label, timestamp, version, and contract hash.
- Preserve rejected interpretations.
- Prevent selection when compilation requires more context.
- Create a new version rather than overwriting a previous confirmed selection.

### FR-8: Test-contract generation

After selection, the system must:

- Return framework-neutral test specifications.
- Provide Vitest materialization instructions.
- Include setup, action, expected result, and traceability fields.
- Map each test to an acceptance criterion.
- Avoid writing arbitrary test files on the MCP server.
- Let local Codex materialize and review the patch.

### FR-9: Local test execution

The Codex workflow must:

- Detect the repository test command from package scripts where practical.
- Ask before installing packages.
- Show planned file changes.
- Run the smallest relevant test subset first.
- Capture exit code, test names, failures, and duration.
- Redact secrets from logs.
- Never upload complete raw logs by default.

### FR-10: Verification recording

The MCP server must accept:

- Compilation identifier.
- Contract version.
- Test framework.
- Test result summary.
- Exit code.
- Hash of generated test patch.
- Optional sanitized failure excerpts.

The server must reject verification for an unselected or mismatched contract version.

### FR-11: Decision receipt

The receipt must include:

- Original requirement.
- Context digest and referenced file paths.
- Supported ambiguity categories found.
- All interpretations.
- Selected contract.
- Rejected contracts and reasons if supplied.
- Acceptance criteria.
- Discriminating scenarios.
- Generated test identifiers.
- Verification result.
- Model and prompt version.
- Timestamps.
- Known limitations.

Exports:

- Human-readable Markdown.
- Machine-readable JSON.
- Web receipt view.

### FR-12: Dashboard

The dashboard must show:

- Total compilations.
- Awaiting-decision count.
- Verified-contract count.
- Needs-context count.
- Recent compilations.
- Category distribution using actual session data only.
- Continue action for incomplete compilations.

No fabricated productivity statistics are allowed.

### FR-13: History

- Filter by status and ambiguity category.
- Search requirement title and identifier.
- Sort by created or updated time.
- Display useful empty, loading, error, and populated states.
- Seed the judge demo with clearly labelled synthetic history.

### FR-14: Failure and fallback

- Preserve local input after network failure.
- Retry idempotent read operations automatically with bounded backoff.
- Never automatically repeat a state-changing selection call.
- Provide text output when the MCP UI cannot load.
- Keep the golden demo usable through prevalidated fallback data.
- Label fallback output honestly.

## 11. MCP server specification

### 11.1 Responsibilities

The MCP server is the authoritative backend for:

- Compilation creation and versioning.
- GPT-5.6 calls.
- Structured-output validation.
- Contract selection.
- Verification summaries.
- Decision receipts.
- Embedded UI resources.
- Cross-session dashboard data.

The MCP server does not:

- Browse the user’s local filesystem.
- Clone arbitrary repositories in the MVP.
- Execute submitted code.
- Store secrets.
- Apply local patches.
- Deploy code.

### 11.2 Transport

- MCP over Streamable HTTP.
- HTTPS in deployed environments.
- Local HTTP permitted for development.
- Health endpoint separate from MCP transport.
- Request correlation identifier on every call.

### 11.3 Tool design

Data and rendering are separated. Data tools return complete structuredContent without UI coupling. Render tools attach the comparison component.

#### Tool: compile_requirement

Purpose: create a new compilation from requirement text and a scoped context bundle.

Inputs:

- requirement_title
- requirement_text
- source_reference, optional
- context_bundle
- retention_mode: ephemeral or saved
- client_request_id

Outputs:

- compilation_id
- version
- status
- interpretations
- discriminating_cases
- context_digest
- warnings

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: true because scoped content is sent to the model service

#### Tool: get_compilation

Purpose: retrieve the authoritative compilation snapshot.

Inputs:

- compilation_id
- version, optional

Outputs:

- complete compilation snapshot

Annotations:

- readOnlyHint: true
- destructiveHint: false
- openWorldHint: false

#### Tool: render_compilation

Purpose: render an already-created compilation in the embedded comparison UI.

Inputs:

- compilation_id
- view: compact, compare, cases, receipt

Outputs:

- snapshot needed by the UI
- UI resource metadata

Annotations:

- readOnlyHint: true
- destructiveHint: false
- openWorldHint: false

#### Tool: provide_context_answer

Purpose: add answers to targeted clarification questions and create a new compilation version.

Inputs:

- compilation_id
- base_version
- answers
- client_request_id

Outputs:

- new version snapshot

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: true

#### Tool: select_contract

Purpose: persist the user-confirmed contract choice.

Inputs:

- compilation_id
- version
- interpretation_id
- confirmation: true
- optional note
- client_request_id

Outputs:

- selection identifier
- selected contract snapshot
- contract hash
- next action

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: false

The tool must refuse confirmation=false and must not infer confirmation from conversation context.

#### Tool: generate_test_contracts

Purpose: generate framework-neutral test specifications for the selected contract.

Inputs:

- compilation_id
- selected_contract_hash
- target_framework: vitest

Outputs:

- test contract list
- traceability matrix
- materialization guidance

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: true

#### Tool: record_verification

Purpose: store sanitized local execution results.

Inputs:

- compilation_id
- selected_contract_hash
- framework
- exit_code
- passed
- test_summaries
- patch_hash
- client_request_id

Outputs:

- verification identifier
- updated compilation status

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: false

#### Tool: create_decision_receipt

Purpose: finalize and return Markdown and JSON decision receipts.

Inputs:

- compilation_id
- selected_contract_hash

Outputs:

- receipt identifier
- receipt_markdown
- receipt_json
- completion status

Annotations:

- readOnlyHint: false
- destructiveHint: false
- openWorldHint: false

#### Tool: list_compilations

Purpose: return dashboard history for the current demo workspace.

Inputs:

- status filter, optional
- category filter, optional
- query, optional
- cursor, optional
- limit

Outputs:

- compilation summaries
- next cursor

Annotations:

- readOnlyHint: true
- destructiveHint: false
- openWorldHint: false

### 11.4 MCP UI resources

Provide one host-agnostic React bundle with views selected by tool result:

- Comparison cards
- Difference matrix
- Scenario explorer
- Confirmation panel
- Verification summary
- Decision receipt

The component:

- Receives structuredContent through the MCP Apps bridge.
- Calls select_contract only from an explicit confirmation action.
- Keeps transient tab and expansion state locally.
- Treats MCP server state as authoritative.
- Provides a plain-text equivalent.
- Supports compact inline and expanded layouts.

## 12. Codex plugin specification

### 12.1 Package structure

    ambiguity-compiler/
    ├── .codex-plugin/
    │   └── plugin.json
    ├── skills/
    │   └── ambiguity-compiler/
    │       ├── SKILL.md
    │       ├── references/
    │       │   ├── ambiguity-taxonomy.md
    │       │   ├── context-bundle-schema.md
    │       │   └── test-materialization.md
    │       └── scripts/
    │           ├── sanitize-context.ts
    │           ├── validate-bundle.ts
    │           ├── materialize-vitest.ts
    │           └── create-local-receipt.ts
    ├── .mcp.json
    ├── .app.json
    ├── assets/
    │   ├── icon.png
    │   ├── logo.png
    │   └── screenshot.png
    ├── README.md
    └── LICENSE

### 12.2 Skill trigger

The skill should activate when the user asks Codex to:

- Find ambiguity in a requirement.
- Compile an issue into behavioral contracts.
- Compare interpretations before implementation.
- Generate discriminating acceptance tests.
- Lock a specification contract.

It should not activate for:

- Generic code review.
- Bug diagnosis without a requirement.
- Simple syntax questions.
- Requests to implement a fully specified change directly.

### 12.3 Skill workflow

1. Confirm requirement source.
2. Inspect the smallest relevant repository surface.
3. Build and validate the context bundle.
4. Show a disclosure summary.
5. Call compile_requirement.
6. Present UI or text fallback.
7. Wait for explicit selection.
8. Call select_contract.
9. Call generate_test_contracts.
10. Materialize Vitest files locally.
11. Show diff.
12. Run targeted tests.
13. Record sanitized verification.
14. Create and save receipts.

### 12.4 Required plugin guardrails

- No code modification before selection.
- No remote transmission before context preview.
- Never include secrets or hidden files.
- Never claim an interpretation is correct.
- Never conceal rejected alternatives.
- Never upload complete files when excerpts suffice.
- Ask before package installation or broad test execution.
- Preserve unrelated user changes.

## 13. AI system

### 13.1 GPT-5.6 responsibilities

- Extract explicit behavioral statements.
- Identify supported ambiguity categories.
- Generate two or three plausible behavioral contracts.
- Separate evidence from assumptions.
- Generate discriminating scenarios.
- Ask targeted context questions.
- Generate framework-neutral test contracts.
- Produce concise explanations.

### 13.2 Deterministic responsibilities

- Secret detection and context limits.
- Schema validation.
- Evidence-reference validation.
- Identifier uniqueness.
- Category allowlist.
- Interpretation count.
- Normalized acceptance-criteria comparison.
- Contract hashing.
- State-transition enforcement.
- Version consistency.
- Test-result parsing.
- Receipt construction.

### 13.3 Structured output statuses

- compiled
- needs_context
- out_of_scope
- refused
- analysis_failed

### 13.4 Model configuration

- Use GPT-5.6 through the Responses API.
- Use strict Structured Outputs.
- Use standard reasoning for normal compilation.
- Allow one higher-effort repair call only after semantic validation failure.
- Record model alias and resolved snapshot when available.
- Version system prompts and schemas.
- Never store private reasoning tokens or request hidden chain-of-thought.

### 13.5 Core schema

    type CompilationOutput = {
      status:
        | "compiled"
        | "needs_context"
        | "out_of_scope"
        | "refused"
        | "analysis_failed";
      requirementSummary: string;
      explicitBehaviors: Array<{
        id: string;
        statement: string;
        evidenceRefs: string[];
      }>;
      ambiguities: Array<{
        id: string;
        category: "boundary_time" | "authorization_actor" | "lifecycle_state";
        question: string;
        evidenceRefs: string[];
      }>;
      interpretations: Array<{
        id: string;
        title: string;
        contract: string;
        assumptions: Array<{
          statement: string;
          evidenceRefs: string[];
        }>;
        acceptanceCriteria: string[];
        riskIfWrong: string;
      }>;
      discriminatingCases: Array<{
        id: string;
        name: string;
        setup: Record<string, unknown>;
        action: Record<string, unknown>;
        expectedByInterpretation: Record<string, unknown>;
        separationExplanation: string;
      }>;
      contextQuestions: string[];
      limitations: string[];
    };

## 14. Context bundle

### 14.1 Allowed content

- Requirement text.
- Relevant README or domain documentation excerpts.
- Route and controller signatures.
- Request and response schemas.
- Domain types and enums.
- Existing relevant tests.
- Repository instructions.

### 14.2 Excluded content

- Secrets and credentials.
- Environment files.
- Lockfiles unless directly required.
- Dependencies.
- Generated files.
- Build artifacts.
- Binary content.
- Unrelated business data.
- Full repository archive.

### 14.3 Limits

- Maximum 12 excerpts.
- Maximum 4,000 characters per excerpt.
- Maximum 30,000 characters total for MVP.
- Every excerpt must include path, kind, and stable anchor.
- Sanitizer must fail closed on suspected secrets.

## 15. Data model

### Workspace

- id
- display_name
- is_demo
- created_at

### Compilation

- id
- workspace_id
- title
- source_reference
- original_requirement
- status
- current_version
- retention_mode
- created_at
- updated_at
- expires_at

### CompilationVersion

- id
- compilation_id
- version_number
- context_digest
- prompt_version
- schema_version
- model_identifier
- structured_output
- created_at

### ContextReference

- id
- compilation_version_id
- path
- anchor
- kind
- content_hash
- excerpt, nullable according to retention mode

### ContractSelection

- id
- compilation_version_id
- interpretation_id
- contract_hash
- actor_label
- note
- confirmed_at

### TestContract

- id
- selection_id
- test_identifier
- acceptance_criterion
- setup
- action
- expected
- framework

### Verification

- id
- selection_id
- exit_code
- passed
- test_summary
- patch_hash
- verified_at

### DecisionReceipt

- id
- selection_id
- markdown_body
- json_body
- receipt_hash
- created_at

### AuditEvent

- id
- compilation_id
- event_type
- safe_metadata
- created_at

## 16. State machine

    draft
      → compiling
      → compiled | needs_context | out_of_scope | refused | analysis_failed
      → awaiting_selection
      → selected
      → tests_generated
      → verification_recorded
      → receipt_ready

Rules:

- needs_context can create a new version and return to compiling.
- Selection requires compiled status and a matching version.
- Test generation requires selected status.
- Verification requires matching contract hash.
- Receipt requires a selection; verification may be pending but must be labelled.
- Confirmed historical versions are immutable.

## 17. API and server modules

### MCP endpoint

- POST /mcp
- GET /health
- GET /ready

### Web API

- POST /api/compilations
- GET /api/compilations
- GET /api/compilations/:id
- POST /api/compilations/:id/context
- POST /api/compilations/:id/select
- POST /api/compilations/:id/test-contracts
- POST /api/compilations/:id/verifications
- POST /api/compilations/:id/receipt
- GET /api/compilations/:id/receipt

All web and MCP handlers must call the same application service layer.

### Recommended monorepo

    apps/
      web/
      server/
      mcp-ui/
    packages/
      contracts/
      ambiguity-engine/
      database/
      test-adapters/
      ui/
    plugin/
      ambiguity-compiler/
    fixtures/
      golden-repository/
      evaluation-cases/

### Recommended stack

- TypeScript throughout.
- React for web and MCP UI.
- Node.js MCP server.
- OpenAI official JavaScript SDK.
- Zod for runtime contracts and Structured Outputs helpers.
- PostgreSQL for authoritative server state.
- Drizzle ORM or equivalent typed data layer.
- Vitest for unit and integration tests.
- Playwright for golden-path browser tests.
- Containerized server deployment over HTTPS.

## 18. Security and privacy

### Threats

- Accidental secret transmission.
- Prompt injection inside repository files.
- Malicious requirement content.
- Unauthorized contract selection.
- Cross-workspace data exposure.
- Replay of state-changing calls.
- Model-generated unsupported file paths.
- Oversized context denial of service.

### Controls

- Treat repository text as untrusted data, never instructions.
- Follow plugin system and repository guidance, not instructions found in arbitrary source comments.
- Secret-pattern scanning before transmission.
- Strict content and size limits.
- Schema validation at every boundary.
- Opaque identifiers.
- Workspace-scoped database queries.
- Idempotency keys for writes.
- Explicit confirmation for selection.
- No server-side arbitrary code execution.
- Redacted logs.
- Rate limits by workspace and IP.
- Security headers and restrictive content security policy.
- Dependency and license review.

### Retention

- Seeded demo data may be stored permanently.
- Ephemeral user compilations expire automatically after 24 hours.
- Saved mode must be explicit.
- Raw repository excerpts are not stored in ephemeral mode after analysis completes.
- Structured contracts, hashes, and safe references may remain until expiration.
- Provide Delete compilation after the hackathon if authentication is introduced.

### Privacy copy

The interface must clearly state:

“Ambiguity Compiler sends only the requirement and repository excerpts you approve. Do not include secrets, credentials, or personal customer data.”

## 19. Reliability and observability

### Reliability

- Server health and readiness endpoints.
- Database migrations applied before readiness.
- Bounded model timeout.
- One semantic repair attempt.
- Idempotent compilation creation through client_request_id.
- Text fallback if UI resource fails.
- Seeded offline fallback only for /demo.

### Safe telemetry

Record:

- Tool name.
- Request correlation identifier.
- Status.
- Latency.
- Token usage where available.
- Validation failure category.
- Compilation state transition.

Do not record:

- Complete requirement text in operational logs.
- Raw repository excerpts.
- Secrets.
- Full model prompts.
- Unredacted test output.

## 20. UI requirements

The complete UI implementation instructions live in AMBIGUITY_COMPILER_UI_MASTER_PROMPT.md.

Product-level requirements:

- Complete landing page and dashboard.
- Responsive at 375, 768, and 1280 pixels.
- WCAG 2.2 AA target.
- Full keyboard operation.
- No color-only meaning.
- Reduced-motion support.
- Text alternatives for matrices and code comparisons.
- Loading, empty, error, offline, fallback, and success states.
- No fabricated logos, testimonials, usage counts, or performance claims.
- Seeded data labelled as synthetic.

## 21. Accessibility

- Semantic headings and landmarks.
- Visible focus rings.
- Minimum 44 by 44 pixel touch targets.
- Matrix has table semantics and a stacked-card mobile alternative.
- Interpretation tabs use correct tab patterns.
- Confirmation dialog traps and restores focus.
- Live regions announce compilation completion and selection.
- Code blocks have accessible labels and copy feedback.
- Status uses text and icon in addition to color.
- No timed interactions.
- Avoid motion that implies compilation progress when fallback data is used.

## 22. Performance

- Landing page should become interactive quickly on a typical broadband connection.
- Avoid loading the dashboard bundle on public pages.
- Lazy-load heavy comparison and code-editor components.
- MCP widget should remain small and avoid unnecessary dependencies.
- Paginate history.
- Stream or progressively reveal server state without inventing fake model steps.
- Cache static UI assets.

## 23. Testing strategy

### Unit tests

- Context sanitizer.
- Secret detector.
- Schema validation.
- Evidence-reference validator.
- Interpretation uniqueness.
- Contract hashing.
- State transitions.
- Receipt rendering.
- MCP tool annotations and schemas.

### Integration tests

- MCP compile tool with stubbed GPT output.
- Structured-output failure and repair.
- Selection version mismatch.
- Idempotent write replay.
- Test-contract generation.
- Verification hash mismatch.
- Receipt creation.
- Database workspace isolation.

### AI evaluations

Create at least 20 fixtures:

- Six boundary/time.
- Six authorization/actor.
- Six lifecycle/state.
- Two out-of-scope or insufficient-context.

Measure:

- Correct status.
- Evidence grounding.
- Interpretation behavioral distinctness.
- Discriminating-case usefulness.
- Unsupported-fact rate.
- Context-question quality.

Human review is required; do not claim objective correctness for ambiguous requirements.

### End-to-end tests

- Landing to demo receipt.
- New web compilation to selection.
- Needs-context versioning.
- MCP text fallback.
- Keyboard-only golden flow.
- Mobile comparison flow.
- API failure with preserved input.

### Judge smoke test

From a clean environment:

1. Open hosted demo.
2. Complete golden compilation.
3. Install local plugin using documented steps.
4. Open golden repository.
5. Run plugin prompt.
6. Select contract.
7. Generate and run tests.
8. Produce receipt.

## 24. Acceptance criteria

The MVP is ready when:

- The hosted demo completes without authentication.
- The golden requirement produces two or three valid interpretations.
- At least one scenario visibly separates every interpretation pair.
- The user must confirm before selection.
- No test or implementation file is written before selection.
- Codex materializes real Vitest tests in the fixture repository.
- Tests run and their summary can be recorded.
- Markdown and JSON receipts are generated.
- MCP custom UI and text fallback both work.
- Context sanitizer blocks seeded secrets.
- Tool annotations match actual behavior.
- All core state transitions have automated tests.
- Judge installation takes less than five minutes.
- README includes supported platforms and complete testing instructions.
- Demo video is below three minutes and includes required voiceover topics.

## 25. Build plan

### Day 1: contracts and golden repository

- Create monorepo.
- Build golden TypeScript API fixture.
- Define Zod and JSON schemas.
- Implement context bundle and sanitizer.
- Implement deterministic validation.
- Create prompt version one and evaluation fixtures.

### Day 2: MCP server and GPT-5.6

- Implement database schema.
- Implement compile_requirement and get_compilation.
- Integrate Responses API Structured Outputs.
- Add semantic validation and one repair path.
- Implement selection versioning.
- Add integration tests.

### Day 3: plugin and tests

- Scaffold Codex plugin.
- Write SKILL.md workflow.
- Add .mcp.json and app reference.
- Implement local context scripts.
- Implement Vitest materializer.
- Implement verification and receipt tools.
- Validate plugin.

### Day 4: complete UI

- Build landing page.
- Build dashboard and history.
- Build compilation comparison.
- Build MCP embedded component.
- Add responsive and accessible states.
- Connect all UI to backend.

### Day 5: hardening and submission

- Run AI eval fixtures.
- Complete Playwright golden path.
- Deploy web, MCP server, and UI assets.
- Test from clean judge path.
- Finish README, privacy page, and installation guide.
- Record demo.
- Capture screenshots.
- Retrieve /feedback Session ID.
- Submit before the deadline.

### Scope-cut order

Cut in this order if behind:

1. Dashboard charts; keep summary cards and history list.
2. Saved-mode retention; keep demo and ephemeral mode.
3. Settings page beyond retention explanation.
4. Multiple receipt export formats; keep Markdown and JSON.
5. Web-based new compilation; keep seeded demo and plugin flow.
6. Custom MCP animation; keep accessible static comparison UI.

Never cut:

- MCP server.
- Codex plugin.
- Structured GPT-5.6 compilation.
- Human selection gate.
- Discriminating scenarios.
- Real local test materialization.
- Text fallback.
- Judge-ready hosted demo.

## 26. Risks and mitigations

| Risk | Severity | Mitigation |
|---|---:|---|
| Looks like a prompt wrapper | High | Real MCP tools, structured contracts, repository context, test materialization, state machine, verification, and receipts |
| Model invents interpretations | High | Evidence references, strict taxonomy, semantic validation, needs-context state |
| Repository secrets leak | High | Local sanitization, preview, strict limits, fail-closed secret detector |
| MCP UI consumes too much time | High | One reusable component with text fallback; standalone UI shares components |
| Test generation breaks repository | High | Vitest-only MVP, show diff, targeted test run, no edit before approval |
| Requirement has only one reasonable interpretation | Medium | Return sufficiently specified or needs_context rather than forcing alternatives |
| Judges cannot install plugin | High | Hosted no-login demo, clean installation guide, fixture repository |
| API outage during judging | High | Seeded fallback for demo, clear fallback label |
| Scope becomes a full SDLC platform | High | Three ambiguity categories, one language, one test framework |

## 27. Success metrics

Hackathon metrics:

- Golden demo completion.
- Time to first comparison.
- Contract-selection completion.
- Test-materialization success.
- Judge installation success.
- Number of evaluation fixtures passing human review.

Post-hackathon candidate metrics:

- Compilations that lead to a selected contract.
- Selected contracts with generated tests.
- Later contract changes.
- Clarification questions answered before implementation.

Do not claim reduced defects or saved engineering hours without real longitudinal evidence.

## 28. Demo narrative

1. A developer receives: “Users can export their monthly transactions.”
2. Codex inspects the relevant route, transaction status enum, and existing tests.
3. The plugin shows the exact context bundle being sent.
4. MCP server and GPT-5.6 compile three plausible contracts.
5. The comparison UI shows a timezone-boundary transaction where expected results differ.
6. The developer selects user-local calendar month and completed transactions only.
7. Codex generates Vitest cases and runs them.
8. The existing implementation fails the timezone case.
9. Codex implements the selected contract and tests pass.
10. A decision receipt records the chosen and rejected behaviors.

The closing line:

“Codex can write code quickly. Ambiguity Compiler makes sure it is writing the behavior humans actually chose.”

## 29. Devpost submission checklist

- [ ] Category is Developer Tools.
- [ ] Hosted demo is public and operational.
- [ ] Plugin installation instructions are verified.
- [ ] Supported platforms are stated.
- [ ] Judge testing path uses the golden repository.
- [ ] Repository includes license.
- [ ] README explains architecture and setup.
- [ ] README distinguishes Codex responsibilities from GPT-5.6 responsibilities.
- [ ] Sample data is included.
- [ ] Public YouTube video is shorter than three minutes.
- [ ] Voiceover covers product, Codex use, and GPT-5.6 use.
- [ ] /feedback Codex Session ID is saved.
- [ ] Submission is not left as a draft.

## 30. Definition of done

Ambiguity Compiler is complete for the hackathon when a judge can install or open it, compile the seeded ambiguous requirement, compare behaviorally distinct contracts, explicitly select one, generate and execute real tests, and inspect a decision receipt—without receiving hidden setup help from the builder.

## 31. Official implementation references

- OpenAI Build Week: https://openai.devpost.com/
- Build Codex plugins: https://learn.chatgpt.com/docs/build-plugins
- Build an MCP-backed app: https://learn.chatgpt.com/docs/build-app
- Build an MCP server: https://developers.openai.com/apps-sdk/build/mcp-server
- Define MCP tools: https://developers.openai.com/apps-sdk/plan/tools
- Build ChatGPT UI: https://developers.openai.com/apps-sdk/build/chatgpt-ui
- Manage app state: https://developers.openai.com/apps-sdk/build/state-management
- Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- Apps SDK guidelines: https://developers.openai.com/apps-sdk/app-guidelines
