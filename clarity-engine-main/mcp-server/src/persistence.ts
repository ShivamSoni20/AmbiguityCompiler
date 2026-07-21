import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { listAllCompilations, replaceCompilationStore } from "./core";

const dataPath = process.env.AMBIGUITY_COMPILER_DATA_FILE
  ? resolve(process.env.AMBIGUITY_COMPILER_DATA_FILE)
  : resolve(
      process.cwd(),
      basename(process.cwd()) === "mcp-server" ? ".data" : "mcp-server/.data",
      "compilations.json",
    );

export function compilationDataPath() {
  return dataPath;
}

export async function hydrateCompilationStore() {
  try {
    const serialized = await readFile(dataPath, "utf8");
    replaceCompilationStore(JSON.parse(serialized));
  } catch (error) {
    if (isMissingFile(error)) return;
    throw error;
  }
}

export async function persistCompilationStore() {
  await mkdir(dirname(dataPath), { recursive: true });
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(listAllCompilations(), null, 2)}\n`, "utf8");
  await rename(temporaryPath, dataPath);
}

function isMissingFile(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
