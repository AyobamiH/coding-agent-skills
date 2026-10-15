import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { test, after } from "node:test";
import { buildPlugin, PLUGIN_SKILLS } from "../scripts/build-plugin.mjs";
import { validateValue } from "../scripts/lib/schema-validator.mjs";
import { validateCliResult } from "../scripts/lib/cli-result.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "coding-plugin-"));
after(() => fs.rmSync(temporary, { recursive: true, force: true }));
const release = buildPlugin(path.join(temporary, "build"));
const installed = path.join(temporary, "installed plugin");
const archive = fs.readFileSync(release.filename);
const extracted = new Map();
for (let at = 0; archive.readUInt32LE(at) === 0x04034b50;) {
  const compressed = archive.readUInt32LE(at + 18);
  const nameLength = archive.readUInt16LE(at + 26), extraLength = archive.readUInt16LE(at + 28);
  const name = archive.subarray(at + 30, at + 30 + nameLength).toString();
  assert(!path.isAbsolute(name) && !name.split("/").includes(".."));
  assert(!extracted.has(name));
  const start = at + 30 + nameLength + extraLength;
  const bytes = inflateRawSync(archive.subarray(start, start + compressed));
  assert.equal(bytes.length, archive.readUInt32LE(at + 22));
  const target = path.join(installed, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  extracted.set(name, bytes);
  at = start + compressed;
}
const runner = path.join(installed, "scripts/run-audit.mjs");
const schema = JSON.parse(extracted.get("assets/core/schemas/cli-result.schema.json"));
const run = (...args) => spawnSync(process.execPath, [runner, ...args], { encoding: "utf8", cwd: temporary });
function snapshot(directory) {
  const result = {};
  function visit(relative) {
    for (const entry of fs.readdirSync(path.join(directory, relative), { withFileTypes: true })) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(name);
      else if (entry.isFile()) result[name] = createHash("sha256").update(fs.readFileSync(path.join(directory, name))).digest("hex");
    }
  }
  visit("");
  return result;
}

test("plugin archive is reproducible, checksummed and contains eight self-contained skills", () => {
  assert.equal(buildPlugin(path.join(temporary, "second")).sha256, release.sha256);
  const manifest = JSON.parse(extracted.get("plugin.json"));
  assert.equal(manifest.name, "coding-agent-skills");
  assert.equal(manifest.version, JSON.parse(extracted.get("assets/core/package.json")).version);
  assert.equal(manifest.extensions["com.openai"].interface.shortDescription.length <= 30, true);
  assert.deepEqual([...extracted.keys()].filter(name => /^skills\/[^/]+\/SKILL.md$/.test(name)).map(name => name.split("/")[1]).sort(), [...PLUGIN_SKILLS].sort());
  assert(!extracted.has(".app.json") && !extracted.has("mcp.json"));
  const hashes = JSON.parse(extracted.get("checksums.json")).files;
  assert.equal(Object.keys(hashes).length, extracted.size - 1);
  for (const [name, expected] of Object.entries(hashes)) {
    assert.equal(createHash("sha256").update(extracted.get(name)).digest("hex"), expected, name);
  }
  for (const [name, bytes] of extracted) {
    if (!name.startsWith("skills/") || !name.endsWith(".md")) continue;
    for (const match of bytes.toString().matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), match[1].split("#")[0]));
      assert(extracted.has(target), `${name}: missing reference ${target}`);
    }
  }
});

test("every extracted audit returns schema-valid evidence without changing a target or running its scripts", () => {
  const target = path.join(temporary, "target repository with spaces");
  fs.cpSync(path.join(root, "tests/fixtures/audit-bundle/static-project"), target, { recursive: true });
  fs.writeFileSync(path.join(target, "package.json"), JSON.stringify({ name: "acceptance-target", scripts: {
    build: "node -e \"require('fs').writeFileSync('TARGET_RAN','yes')\"",
    test: "node -e \"require('fs').writeFileSync('TARGET_RAN','yes')\""
  } }));
  // Synthetic sentinel only; never read a real project's environment file.
  const sentinel = "SYNTHETIC_PLUGIN_CANARY_564fe910";
  fs.writeFileSync(path.join(target, ".env"), `TOKEN=${sentinel}\n`);
  assert.equal(spawnSync("git", ["init", "--quiet"], { cwd: target }).status, 0);
  assert.equal(spawnSync("git", ["-c", "user.name=Plugin Test", "-c", "user.email=plugin-test@example.invalid",
    "-c", "commit.gpgsign=false", "commit", "--allow-empty", "--quiet", "-m", "Disposable acceptance fixture"], { cwd: target }).status, 0);
  const before = snapshot(target);
  for (const command of PLUGIN_SKILLS) {
    const output = run(command, target);
    assert.equal(output.status, 0, `${command}: ${output.stderr}`);
    assert(!output.stdout.includes(sentinel));
    const result = JSON.parse(output.stdout);
    assert.deepEqual(validateValue(schema, result), [], command);
    assert.deepEqual(validateCliResult(schema, result, "0.2.20"), [], command);
    assert.equal(result.command, command);
    assert.equal(result.changedState, false);
    assert.equal(result.safety.targetCommandsRun, false);
    assert.equal(result.safety.secretsRead, false);
  }
  assert.deepEqual(snapshot(target), before);
  assert(!fs.existsSync(path.join(target, "TARGET_RAN")));
});

test("packaged metadata preserves narrowing project-adapter validation", () => {
  const target = path.join(root, "tests/fixtures/route-trace/adapter-project");
  const output = run("route-trace", target);
  assert.equal(output.status, 0, output.stderr);
  const result = JSON.parse(output.stdout);
  assert.equal(result.adapter.present, true);
  assert.equal(result.adapter.enabled, true);
  assert.deepEqual(validateCliResult(schema, result, "0.2.20"), []);
});

test("runner fails closed on missing, file, relative, extra and unsupported inputs", () => {
  assert.equal(run().status, 2);
  assert.equal(run("repo-map", "relative").status, 2);
  assert.equal(run("deploy", root).status, 2);
  assert.equal(run("repo-map", root, "--execute").status, 2);
  assert.equal(run("repo-map", path.join(temporary, "does-not-exist")).status, 4);
  assert.equal(run("repo-map", path.join(root, "package.json")).status, 4);
});
