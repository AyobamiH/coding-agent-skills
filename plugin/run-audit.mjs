import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const commands = new Set(["repo-map", "route-trace", "env-audit", "secret-audit",
  "api-contract-audit", "migration-review", "github-handoff", "deployment-preflight"]);
const args = process.argv.slice(2);
if (Number(process.versions.node.split(".")[0]) < 20 || args.length !== 2 || !commands.has(args[0])) {
  process.stderr.write("Requires Node.js 20+ and: run-audit.mjs <supported-audit> <absolute-project-root>\n");
  process.exit(2);
}
if (!path.isAbsolute(args[1])) {
  process.stderr.write("An explicit absolute project root is required.\n");
  process.exit(2);
}
// Never accept a file as a repository root; do not read it to diagnose failure.
try {
  if (!fs.statSync(args[1]).isDirectory()) {
    process.stderr.write("The project root must be a directory.\n");
    process.exit(4);
  }
} catch {
  process.stderr.write("The project directory is unavailable.\n");
  process.exit(4);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = spawnSync(process.execPath,
  [path.join(root, "assets/core/bin/coding-agent-skills"), ...args, "--json"],
  { shell: false, encoding: "utf8", timeout: 60000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
if (run.error || run.signal) {
  process.stderr.write("Audit did not finish within resource limits; no successful result is available.\n");
  process.exit(5);
}
process.stdout.write(run.stdout);
process.stderr.write(run.stderr);
process.exitCode = run.status ?? 5;
