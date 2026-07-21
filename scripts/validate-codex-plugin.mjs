import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const pluginRoot = resolve(root, "codex-plugin");
const manifestPath = resolve(pluginRoot, ".codex-plugin", "plugin.json");
const skillPath = resolve(pluginRoot, "skills", "ambiguity-compiler", "SKILL.md");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const required = ["name", "version", "description", "license", "skills"];
for (const key of required) {
  if (typeof manifest[key] !== "string" || manifest[key].length === 0) {
    throw new Error(`plugin.json requires a non-empty ${key}.`);
  }
}
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  throw new Error("plugin.json version must be strict semver.");
}
if (typeof manifest.author?.name !== "string" || manifest.author.name.length === 0) {
  throw new Error("plugin.json requires author.name.");
}
if (
  typeof manifest.interface?.displayName !== "string" ||
  typeof manifest.interface?.shortDescription !== "string"
) {
  throw new Error("plugin.json requires interface display metadata.");
}
if (
  !Array.isArray(manifest.interface.defaultPrompt) ||
  manifest.interface.defaultPrompt.length > 3
) {
  throw new Error("plugin.json supports at most three default prompts.");
}
if (
  manifest.interface.defaultPrompt.some(
    (prompt) => typeof prompt !== "string" || prompt.length > 128,
  )
) {
  throw new Error("Each plugin default prompt must be at most 128 characters.");
}
await access(skillPath);
const skill = await readFile(skillPath, "utf8");
if (!skill.startsWith("---\nname: ambiguity-compiler\n")) {
  throw new Error("The plugin skill requires valid frontmatter.");
}

process.stdout.write("Codex plugin manifest and skill are valid.\n");
