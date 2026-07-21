import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ac/AppShell";

export const Route = createFileRoute("/app")({
  component: AppShell,
});
