---
name: ambiguity-compiler
description: Compile underspecified requirements into competing behavioral contracts before editing implementation code.
---

# Ambiguity Compiler workflow

Use this workflow when a requirement could have materially different behavior depending on time boundaries, authorization, or lifecycle state.

1. Restate the requirement without deciding its behavior.
2. Prepare only the smallest relevant source, test, and documentation excerpts. Do not send environment files, credentials, or unrelated repository content.
3. Call `ambiguity.compile` with the requirement and approved context.
4. If the result needs context, ask the targeted question and call `ambiguity.provide_context` with the answer.
5. Use `ambiguity.render` with `compare` and explain the differing scenarios. Do not label a contract as recommended.
6. Ask the human to choose a contract. Call `ambiguity.select` only after explicit `confirmation: true`.
7. Call `ambiguity.generate_tests`, materialize the selected Vitest contract in the local repository, and run the targeted test.
8. Call `ambiguity.record_verification` with sanitized counts, duration, patch hash, and a short failure excerpt only when needed.
9. Call `ambiguity.get_receipt` and save its Markdown or JSON output with the implementation work.

Never edit production behavior before the explicit contract selection. If no meaningful interpretation differs, report that the requirement is sufficiently specified instead of manufacturing ambiguity.
