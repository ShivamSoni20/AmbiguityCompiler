import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PublicHeader, PublicFooter } from "@/components/ac/PublicShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/docs/install")({
  component: Install,
  head: () => ({ meta: [{ title: "Install — Ambiguity Compiler" }] }),
});

const TABS = [
  {
    id: "chatgpt",
    label: "ChatGPT / Codex desktop",
    body: (
      <>
        <Step n={1} title="Set environment variables">
          <Code>Copy-Item .env.example .env</Code>
        </Step>
        <Step n={2} title="Add your key">
          Set <Code inline>AMBIGUITY_COMPILER_MODEL_PROVIDER</Code> and the matching server-only API
          key in the environment that runs the MCP server.
        </Step>
        <Step n={3} title="Start MCP">
          <Code>cd mcp-server; bun run start</Code>
        </Step>
        <Step n={4} title="Connect in Codex">
          Add the running stdio server as <Code inline>ambiguity-compiler</Code> in your Codex MCP
          settings.
        </Step>
      </>
    ),
  },
  {
    id: "cli",
    label: "Codex CLI",
    body: (
      <>
        <Step n={1} title="Open the project">
          <Code>cd clarity-engine-main</Code>
        </Step>
        <Step n={2} title="Install dependencies">
          <Code>bun install --frozen-lockfile</Code>
        </Step>
        <Step n={3} title="Run the app">
          <Code>bun run dev</Code>
        </Step>
      </>
    ),
  },
  {
    id: "local",
    label: "Local development",
    body: (
      <>
        <Step n={1} title="Copy the environment template">
          <Code>Copy-Item .env.example .env</Code>
        </Step>
        <Step n={2} title="Choose a model">
          <Code>OPENROUTER_MODEL=openai/gpt-5.6-sol</Code>
        </Step>
        <Step n={3} title="Start the web app">
          <Code>bun run dev</Code>
        </Step>
        <Step n={4} title="Start the MCP server">
          <Code>cd mcp-server; bun run start</Code>
        </Step>
      </>
    ),
  },
  {
    id: "judge",
    label: "Judge quick test",
    body: (
      <>
        <Step n={1} title="Open the demo">
          Visit <Code inline>/demo</Code> — no account needed.
        </Step>
        <Step n={2} title="Walk the six steps">
          Requirement → Context → Compile → Compare → Tests → Receipt.
        </Step>
        <Step n={3} title="Verify the receipt">
          Confirm the contract hash and the traceable acceptance criteria.
        </Step>
      </>
    ),
  },
];

function Install() {
  return (
    <div className="min-h-dvh bg-canvas">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentation
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Install the Codex plugin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Four short paths depending on your setup.
          </p>
        </header>
        <Tabs defaultValue="chatgpt">
          <TabsList className="flex flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4 space-y-4">
              {t.body}
            </TabsContent>
          ))}
        </Tabs>

        <section className="mt-10 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Troubleshooting</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            <li>Live compilation fails: verify the selected provider and matching API key.</li>
            <li>Schema errors: choose a model that supports strict structured outputs.</li>
            <li>Records are local JSON data, not a multi-user or cloud database.</li>
          </ul>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs font-mono text-muted-foreground">Step {n}</div>
      <div className="mt-1 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function Code({ children, inline = false }: { children: React.ReactNode; inline?: boolean }) {
  const text = String(children);
  if (inline)
    return <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-xs">{text}</code>;
  return (
    <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-border bg-elevated px-3 py-2">
      <code className="overflow-x-auto font-mono text-xs">{text}</code>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Copy"
        onClick={() => {
          navigator.clipboard.writeText(text);
          toast.success("Copied");
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
