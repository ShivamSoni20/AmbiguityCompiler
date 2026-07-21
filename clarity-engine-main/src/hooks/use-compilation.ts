import { useQuery } from "@tanstack/react-query";
import { getCompilationById, listCompilationRecords } from "@/lib/ac/server-functions";

export const compilationKeys = {
  all: ["compilations"] as const,
  detail: (id: string) => ["compilations", id] as const,
};

export function useCompilations() {
  return useQuery({
    queryKey: compilationKeys.all,
    queryFn: async () => unwrapServerResult(await listCompilationRecords()),
  });
}

export function useCompilation(id: string) {
  return useQuery({
    queryKey: compilationKeys.detail(id),
    queryFn: async () => unwrapServerResult(await getCompilationById({ data: { id } })),
    retry: false,
  });
}

export function unwrapServerResult<T>(value: T | { result: T; error?: unknown }): T {
  if (value && typeof value === "object" && "result" in value && "error" in value) {
    return (value as { result: T }).result;
  }
  return value as T;
}
