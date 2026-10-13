import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { PLUGIN_SKILLS } from "./build-plugin.mjs";
import { validateCliResult } from "./lib/cli-result.mjs";

const [installed, ...repositories] = process.argv.slice(2);
if (!installed || !repositories.length) throw new Error("Usage: prove-plugin.mjs <unpacked-plugin> <local-checkout> ...");
const schema = JSON.parse(fs.readFileSync(path.join(installed, "assets/core/schemas/cli-result.schema.json"), "utf8"));
const version = JSON.parse(fs.readFileSync(path.join(installed, "plugin.json"), "utf8")).version;
function git(directory, ...args) {
  const result = spawnSync("git", args, { cwd: directory, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error("Local Git evidence unavailable");
  return result.stdout.trim();
}
const evidence = { packageVersion: version, platform: process.platform, node: process.version, repositories: [] };
for (const directory of repositories.map(value => path.resolve(value))) {
  const before = git(directory, "status", "--porcelain=v1", "--untracked-files=all");
  const record = { checkout: path.basename(directory), commit: git(directory, "rev-parse", "HEAD"), cleanBefore: before === "", audits: [] };
  for (const command of PLUGIN_SKILLS) {
    const result = spawnSync(process.execPath, [path.join(path.resolve(installed), "scripts/run-audit.mjs"), command, directory], { encoding: "utf8", timeout: 65000, maxBuffer: 16 * 1024 * 1024 });
    if (result.error || !result.stdout) throw new Error(`No audit result: ${command}`);
    const report = JSON.parse(result.stdout);
    const issues = validateCliResult(schema, report, version);
    if (issues.length || result.status !== 0 || report.changedState !== false) throw new Error(`Acceptance failed: ${command}`);
    record.audits.push({ command, exitCode: result.status, status: report.status, findings: report.findings.length,
      warnings: report.warnings.length, skipped: report.skipped.length, notVerified: report.notVerified.length,
      schemaValid: true, changedState: report.changedState, safety: report.safety });
  }
  const after = git(directory, "status", "--porcelain=v1", "--untracked-files=all");
  if (before !== after) throw new Error("Repository state changed");
  record.cleanAfter = after === "";
  evidence.repositories.push(record);
}
console.log(JSON.stringify(evidence, null, 2));
