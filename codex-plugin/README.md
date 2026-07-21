# Ambiguity Compiler Codex Plugin

This local plugin bundle provides the **Ambiguity Compiler** skill. It guides an agent through scoped context approval, contract comparison, explicit selection, test materialization, and verification recording.

## Install

1. In Codex Desktop, install this local folder as a plugin.
2. Configure an MCP server named `ambiguity-compiler` that starts `bun run start` from `mcp-server/`.
3. Configure the provider variables from the root `.env.example` in the MCP server environment.
4. Invoke the **Ambiguity Compiler** skill before asking an agent to implement an underspecified behavior.

The plugin bundle itself does not include credentials, an MCP Apps application ID, or remote deployment configuration. The web dashboard remains the supported visual UI; the MCP service returns structured data and receipt resources to compatible clients.

## Workflow guarantee

The skill is designed to keep this order intact:

```text
approve excerpts → compile → resolve context gaps → compare → explicitly confirm
→ generate test contracts → materialize tests locally → run verification → record receipt
```

See `../mcp-server/README.md` for standard transport, tool, persistence, and privacy details.
