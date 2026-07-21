import { spawnSync } from "node:child_process";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const fixtureRoot = resolve(root, "fixtures", "monthly-export");
const targetPath = resolve(fixtureRoot, "src", "export-transactions.ts");
const buggyPath = resolve(fixtureRoot, "src", "export-transactions.buggy.ts");
const fixedPath = resolve(fixtureRoot, "src", "export-transactions.fixed.ts");
const vitestCliPath = resolve(root, "node_modules", "vitest", "vitest.mjs");
const testPath = "fixtures/monthly-export/test/export-transactions.test.ts";

await copyFile(buggyPath, targetPath);
const baseline = runVitest();
await copyFile(fixedPath, targetPath);
const implemented = runVitest();

if (baseline.status === 0)
  throw new Error("The deliberately buggy UTC implementation unexpectedly passed.");
if (implemented.status !== 0)
  throw new Error(
    implemented.stderr || implemented.stdout || "The selected implementation did not pass.",
  );

process.stdout.write(
  "Golden fixture verified: baseline failed, selected user-local contract passed.\n",
);

function runVitest() {
  return spawnSync(process.execPath, [vitestCliPath, "run", testPath], {
    cwd: root,
    encoding: "utf8",
  });
}
