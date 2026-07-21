# Devpost submission packet

## Category

Developer Tools

## Project name

Ambiguity Compiler

## Tagline

Turn vague requirements into human-approved, executable contracts before Codex writes the wrong code.

## Description

AI coding agents are fast at implementation, but a short product requirement can still hide behavior-changing decisions. "Users can export their monthly transactions" leaves timezone, transaction-state, and boundary rules unspecified. If an agent silently chooses one interpretation, the code may be valid and still be wrong.

Ambiguity Compiler is a pre-implementation contract compiler for product-minded developers. It accepts a requirement and a deliberately small, user-approved context bundle. GPT-5.6 returns two or three behaviorally different contracts with acceptance criteria and discriminating scenarios. The developer compares the outcomes, explicitly locks the intended contract, and records a Vitest verification result alongside a decision receipt that preserves the selected and rejected alternatives.

The project combines a responsive web dashboard, a local stdio MCP server, and a Codex skill. Codex prepares context, materializes selected contract tests in the local repository, runs the test workflow, and applies the implementation only after the human has chosen a contract. GPT-5.6 is used for strict structured-output analysis; deterministic Zod validation checks the schema, evidence anchors, scenario separation, and state transitions.

For the judge walkthrough, the monthly-transaction-export fixture exposes a timezone-boundary bug, verifies the chosen user-local calendar-month behavior with Vitest, and creates a receipt that links the requirement, contract, test, result, and patch hash.

## Built with

- TypeScript
- React
- TanStack Start
- Bun
- MCP JSON-RPC
- Zod
- Vitest
- OpenRouter with GPT-5.6 structured outputs
- Codex

## Judge testing instructions

1. Open the hosted no-key `/demo` route when the deployment URL is available.
2. For a local run, follow `README.md` and open `/demo`.
3. Run `npm run test:golden-fixture` to see the timezone contract fail against the seeded bug and pass after the selected implementation is applied.
4. Run `npm run test:contract:record` to create the sanitized verification artifact used by the Test contracts screen.
5. Run `npm run build` for the production build check.

## Demo video script (under three minutes)

### 0:00–0:20 — problem

Show the requirement: "Users can export their monthly transactions." Explain that agents can write correct code for the wrong timezone or transaction-state interpretation.

### 0:20–0:55 — scoped analysis

Show the approved context excerpts and explain that only this small bundle is sent. Start compilation and show the competing contracts and their discriminating boundary case.

### 0:55–1:25 — human decision

Compare Contract A and Contract B, select the user-local calendar-month contract, and visibly confirm the choice.

### 1:25–2:05 — executable proof

Run the golden fixture: show the boundary test failing against UTC behavior, then passing after the selected contract implementation is applied.

### 2:05–2:35 — traceability

Open Test contracts and the receipt. Point out the linked acceptance criterion, Vitest result, patch hash, and rejected alternative.

### 2:35–2:55 — Codex and GPT-5.6

State that GPT-5.6 creates strict structured candidate contracts from scoped context. State that Codex prepared the local workflow, materialized/reran the test, and helped implement this project. End: "Codex can write code quickly. Ambiguity Compiler makes sure it writes the behavior humans chose."

## Submission checklist

- [ ] Create the Devpost project with this name, tagline, description, and Developer Tools category.
- [ ] Add the public repository URL and keep this README at its root.
- [ ] If the repository is private, share it with testing@devpost.com and build-week-event@openai.com.
- [ ] Deploy a no-key demo and add its URL to the private judge-testing field.
- [ ] Upload an unlisted or public YouTube video under three minutes with the required voiceover.
- [ ] Add the `/feedback` session ID for the primary Codex build session.
- [ ] Add all teammates and confirm they accepted invitations.
- [ ] Submit before July 21, 2026 at 5:00 PM PT.
