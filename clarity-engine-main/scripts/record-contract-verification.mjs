import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const reportPath = resolve(root, "artifacts", "test-reports", "monthly-export-vitest.json");
const publicArtifactPath = resolve(root, "public", "verification", "monthly-export.json");
const testPath = "src/lib/ac/monthly-export-api.test.ts";
const vitestCliPath = resolve(root, "node_modules", "vitest", "vitest.mjs");

mkdirSync(resolve(root, "artifacts", "test-reports"), { recursive: true });
mkdirSync(resolve(root, "public", "verification"), { recursive: true });

const run = spawnSync(
  process.execPath,
  [vitestCliPath, "run", testPath, "--reporter=json", "--outputFile", reportPath],
  {
    cwd: root,
    encoding: "utf8",
  },
);

if (!existsSync(reportPath)) {
  process.stderr.write(run.stderr || run.stdout || "Vitest did not write a JSON report.\n");
  process.exit(run.status ?? 1);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const patchHash = createHash("sha256")
  .update(readFileSync(resolve(root, "src", "lib", "ac", "monthly-export-api.ts")))
  .update(readFileSync(resolve(root, "src", "lib", "ac", "monthly-export-api.test.ts")))
  .digest("hex");
const exitCode = run.status ?? 1;
const artifact = {
  framework: "vitest",
  target: "monthly-export",
  contract: "A",
  criteria: ["AC1"],
  exitCode,
  passed: Number(report.numPassedTests ?? 0),
  failed: Number(report.numFailedTests ?? 0),
  durationMs: Math.max(
    0,
    Number(report.endTime ?? Date.now()) - Number(report.startTime ?? Date.now()),
  ),
  patchHash: `sha256:${patchHash}`,
};

writeFileSync(publicArtifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
process.stdout.write(
  `Sanitized Vitest result written to public/verification/monthly-export.json (${artifact.passed} passed, ${artifact.failed} failed).\n`,
);
process.exit(exitCode);
