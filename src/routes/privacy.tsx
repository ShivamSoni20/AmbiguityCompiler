import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/ac/PublicShell";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy — Ambiguity Compiler" },
      {
        name: "description",
        content: "What context is sent, what is retained, and what the prototype does not do.",
      },
    ],
  }),
});

function Privacy() {
  return (
    <div className="min-h-dvh bg-canvas">
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documentation
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Privacy</h1>
        </header>
        <div className="prose-invert space-y-6 text-sm leading-relaxed text-foreground/90">
          <Sect title="What context is sent">
            Only the file excerpts you explicitly approve in the context preview are sent for
            compilation. Nothing else in your repository is transmitted.
          </Sect>
          <Sect title="Context preview">
            Before every compilation the plugin renders a full preview of the excerpts. You can
            remove individual excerpts or cancel the compilation entirely.
          </Sect>
          <Sect title="What is excluded">
            The plugin runs a secret scan and rejects excerpts that appear to contain access tokens,
            API keys, or connection strings. Excerpts are truncated if they exceed the per-file line
            limit.
          </Sect>
          <Sect title="Retention">
            This local prototype writes compilation records to the configured JSON data file. It
            does not implement automatic expiry, user accounts, remote backup, or a deletion
            workflow; remove the local data file to delete prototype records.
          </Sect>
          <Sect title="No server-side code execution">
            Test contracts run on your machine. The server never executes your code.
          </Sect>
          <Sect title="Model processing">
            Approved context is sent only to the configured OpenAI Responses API or OpenRouter
            structured-output provider. Review the selected provider's data-handling terms before
            using sensitive material.
          </Sect>
          <Sect title="Hackathon prototype limitations">
            This is a hackathon prototype, not a production data-processing service. Do not use with
            regulated, personal, or otherwise sensitive data.
          </Sect>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2">{children}</p>
    </section>
  );
}
