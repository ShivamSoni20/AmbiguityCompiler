import { randomUUID } from "node:crypto";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import {
  buildReceipt,
  compileInputSchema,
  compileRequirement,
  contextAnswersInputSchema,
  generateTestContracts,
  getCompilation,
  listCompilations,
  provideContextAnswers,
  recordVerification,
  renderCompilation,
  selectContract,
  selectContractInputSchema,
  testContractInputSchema,
} from "./core";
import {
  compilationDataPath,
  hydrateCompilationStore,
  persistCompilationStore,
} from "./persistence";

const workspaceSchema = z.string().trim().min(1).max(120).default("default");
const compilationIdSchema = z.string().trim().min(1).max(120);
const workspaceId = () => process.env.AMBIGUITY_COMPILER_WORKSPACE_ID ?? "default";
type BunRuntime = {
  serve(options: unknown): unknown;
};

let mutationQueue = Promise.resolve();

function createAmbiguityServer() {
  const server = new McpServer({ name: "ambiguity-compiler", version: "0.3.0" });

  server.registerTool(
    "ambiguity.compile",
    {
      title: "Compile requirement",
      description: "Compile scoped requirement context into competing behavioral contracts.",
      inputSchema: {
        ...compileInputSchema.shape,
        workspaceId: workspaceSchema.optional(),
      },
      annotations: { openWorldHint: true },
    },
    async ({ workspaceId: requestedWorkspace, ...input }) =>
      toolResult(() =>
        mutate(() => compileRequirement(input, requestedWorkspace ?? workspaceId())),
      ),
  );

  server.registerTool(
    "ambiguity.get",
    {
      title: "Get compilation",
      description: "Fetch an authoritative compilation snapshot.",
      inputSchema: { compilationId: compilationIdSchema, workspaceId: workspaceSchema.optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ compilationId, workspaceId: requestedWorkspace }) =>
      toolResult(() =>
        read(() => getCompilation(compilationId, requestedWorkspace ?? workspaceId())),
      ),
  );

  server.registerTool(
    "ambiguity.render",
    {
      title: "Render compilation",
      description: "Return compact, comparison, test-case, or receipt data for a compilation.",
      inputSchema: {
        compilationId: compilationIdSchema,
        view: z.enum(["compact", "compare", "cases", "receipt"]).default("compare"),
        workspaceId: workspaceSchema.optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ compilationId, view, workspaceId: requestedWorkspace }) =>
      toolResult(() =>
        read(() => renderCompilation(compilationId, view, requestedWorkspace ?? workspaceId())),
      ),
  );

  server.registerTool(
    "ambiguity.provide_context",
    {
      title: "Provide clarification context",
      description: "Answer targeted questions and create the next compilation version.",
      inputSchema: {
        compilationId: compilationIdSchema,
        ...contextAnswersInputSchema.shape,
        workspaceId: workspaceSchema.optional(),
      },
      annotations: { openWorldHint: true },
    },
    async ({ compilationId, workspaceId: requestedWorkspace, ...input }) =>
      toolResult(() =>
        mutate(() =>
          provideContextAnswers(compilationId, input, requestedWorkspace ?? workspaceId()),
        ),
      ),
  );

  server.registerTool(
    "ambiguity.select",
    {
      title: "Confirm and lock contract",
      description:
        "Explicitly confirm and lock one compiled interpretation at an expected version.",
      inputSchema: {
        compilationId: compilationIdSchema,
        ...selectContractInputSchema.shape,
        workspaceId: workspaceSchema.optional(),
      },
    },
    async ({ compilationId, workspaceId: requestedWorkspace, ...input }) =>
      toolResult(() =>
        mutate(() => selectContract(compilationId, input, requestedWorkspace ?? workspaceId())),
      ),
  );

  server.registerTool(
    "ambiguity.generate_tests",
    {
      title: "Generate test contracts",
      description: "Create Vitest test-contract specifications for the locked contract hash.",
      inputSchema: {
        compilationId: compilationIdSchema,
        ...testContractInputSchema.shape,
        workspaceId: workspaceSchema.optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ compilationId, workspaceId: requestedWorkspace, ...input }) =>
      toolResult(() =>
        read(() =>
          generateTestContracts(compilationId, input, requestedWorkspace ?? workspaceId()),
        ),
      ),
  );

  server.registerTool(
    "ambiguity.record_verification",
    {
      title: "Record verification",
      description: "Record a sanitized Vitest verification result for the locked contract hash.",
      inputSchema: {
        compilationId: compilationIdSchema,
        framework: z.literal("vitest"),
        exitCode: z.number().int().min(0).max(255),
        passed: z.number().int().min(0),
        failed: z.number().int().min(0),
        durationMs: z.number().int().min(0),
        patchHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
        selectedContractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
        expectedVersion: z.number().int().min(1),
        idempotencyKey: z.string().min(8).max(120).optional(),
        failureExcerpt: z.string().max(1_200).optional(),
        workspaceId: workspaceSchema.optional(),
      },
    },
    async ({ compilationId, workspaceId: requestedWorkspace, ...verification }) =>
      toolResult(() =>
        mutate(() =>
          recordVerification(compilationId, verification, requestedWorkspace ?? workspaceId()),
        ),
      ),
  );

  server.registerTool(
    "ambiguity.get_receipt",
    {
      title: "Get decision receipt",
      description: "Fetch the complete receipt for a compilation decision.",
      inputSchema: { compilationId: compilationIdSchema, workspaceId: workspaceSchema.optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ compilationId, workspaceId: requestedWorkspace }) =>
      toolResult(() =>
        read(() => buildReceipt(compilationId, requestedWorkspace ?? workspaceId())),
      ),
  );

  server.registerTool(
    "ambiguity.list",
    {
      title: "List compilations",
      description: "List compilation summaries in one workspace.",
      inputSchema: { workspaceId: workspaceSchema.optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ workspaceId: requestedWorkspace }) =>
      toolResult(() =>
        read(() =>
          listCompilations(requestedWorkspace ?? workspaceId()).map((record) => ({
            id: record.id,
            version: record.version,
            title: record.title,
            status: record.status,
            updatedAt: record.updatedAt,
            selectedInterpretationId: record.selectedInterpretationId,
            selectedContractHash: record.selectedContractHash,
          })),
        ),
      ),
  );

  server.registerTool(
    "ambiguity.health",
    {
      title: "Service health",
      description: "Report local MCP service readiness without exposing configuration secrets.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () =>
      toolResult(async () => {
        await hydrateCompilationStore();
        return {
          status: "ok",
          storage: compilationDataPath(),
          transport: process.env.MCP_TRANSPORT ?? "stdio",
        };
      }),
  );

  server.registerResource(
    "service-health",
    "ambiguity://health",
    {
      title: "Ambiguity Compiler service health",
      description: "Local readiness and data-store path for the active MCP service.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              status: "ok",
              dataPath: compilationDataPath(),
              appsUi: "not configured; use the web dashboard or MCP tool responses",
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "decision-receipt",
    new ResourceTemplate("ambiguity://compilations/{id}/receipt", { list: undefined }),
    {
      title: "Decision receipt",
      description: "Read a persisted decision receipt by compilation id.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const compilationId = Array.isArray(variables.id) ? variables.id[0] : variables.id;
      if (!compilationId) throw new Error("A compilation id is required for the receipt resource.");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              await read(() => buildReceipt(compilationId, workspaceId())),
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  return server;
}

async function read<T>(operation: () => T | Promise<T>) {
  await hydrateCompilationStore();
  return operation();
}

async function mutate<T>(operation: () => T | Promise<T>) {
  const run = async () => {
    await hydrateCompilationStore();
    const result = await operation();
    await persistCompilationStore();
    return result;
  };
  const result = mutationQueue.then(run, run);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function toolResult(operation: () => unknown | Promise<unknown>) {
  try {
    const result = await operation();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      structuredContent: result as Record<string, unknown>,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: error instanceof Error ? error.message : "Unknown server error.",
        },
      ],
      isError: true,
    };
  }
}

async function start() {
  await hydrateCompilationStore();
  if (process.env.MCP_TRANSPORT === "http") {
    const port = Number(process.env.MCP_PORT ?? 3333);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
    });
    const server = createAmbiguityServer();
    await server.connect(transport);
    const runtime = (globalThis as typeof globalThis & { Bun?: BunRuntime }).Bun;
    if (!runtime) throw new Error("MCP HTTP mode requires the Bun runtime.");
    runtime.serve({
      hostname: "127.0.0.1",
      port,
      fetch: async (request: { url: string }) => {
        const path = new URL(request.url).pathname;
        if (path === "/health") {
          return Response.json({ status: "ok" });
        }
        if (path !== "/mcp") {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        try {
          return await transport.handleRequest(request);
        } catch (error) {
          console.error("MCP HTTP request failed.", error);
          return Response.json({ error: "MCP request failed" }, { status: 500 });
        }
      },
    });
    console.error(`Ambiguity Compiler MCP listening on http://127.0.0.1:${port}/mcp`);
    return;
  }

  const server = createAmbiguityServer();
  await server.connect(new StdioServerTransport());
}

start().catch((error) => {
  console.error("Unable to start Ambiguity Compiler MCP.", error);
  process.exitCode = 1;
});
