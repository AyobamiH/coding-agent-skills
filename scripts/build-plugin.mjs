import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";

export const PLUGIN_SKILLS = ["repo-map", "route-trace", "env-audit", "secret-audit",
  "api-contract-audit", "migration-review", "github-handoff", "deployment-preflight"];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

function collect(relative, destination, files) {
  const source = path.join(root, relative);
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`Refuse symlink: ${relative}`);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(source).sort()) collect(`${relative}/${name}`, `${destination}/${name}`, files);
  } else if (stat.isFile()) files.set(destination, fs.readFileSync(source));
  else throw new Error(`Not a regular file: ${relative}`);
}

// A deterministic ZIP with fixed DOS timestamps, UTF-8 names and no ZIP64 entries.
// No external archiver, npm installation or platform-dependent file mode required.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, bytes] of [...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.startsWith("/") || name.split("/").includes("..")) throw new Error("Unsafe ZIP path");
    const filename = Buffer.from(name), data = deflateRawSync(bytes), crc = crc32(bytes);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x800, 6);
    h.writeUInt16LE(8, 8); h.writeUInt16LE(33, 12); h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(data.length, 18); h.writeUInt32LE(bytes.length, 22); h.writeUInt16LE(filename.length, 26);
    local.push(h, filename, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6);
    h.copy(c, 8, 6, 28); c.writeUInt32LE(offset, 42);
    central.push(c, filename); offset += h.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.size, 8); end.writeUInt16LE(files.size, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export function buildPlugin(outputDirectory = path.join(root, "dist")) {
  const files = new Map();
  collect("plugin/plugin.json", "plugin.json", files);
  collect("plugin/icon.svg", "assets/icon.svg", files);
  collect("plugin/run-audit.mjs", "scripts/run-audit.mjs", files);
  collect("LICENSE", "LICENSE", files);
  collect("contracts/evidence-pack", "contracts/evidence-pack", files);
  for (const item of ["bin/coding-agent-skills", "scripts/lib", "schemas", "examples/manifests", "examples/command-policies", "package.json", "LICENSE"]) {
    collect(item, `assets/core/${item}`, files);
  }
  for (const skill of PLUGIN_SKILLS) {
    collect(`skills/${skill}`, `skills/${skill}`, files);
    collect("plugin/runner-guide.md", `skills/${skill}/references/runner.md`, files);
    const name = `skills/${skill}/SKILL.md`, source = files.get(name).toString();
    const frontmatterEnd = source.indexOf("\n---", 4) + 4;
    if (frontmatterEnd < 8) throw new Error(`Missing frontmatter: ${skill}`);
    const entry = `\n\n## Packaged execution\n\nRead [the bundled runner guide](references/runner.md) before inspecting the project.\nRun this skill's deterministic audit with the packaged runner. Its static output\nis the starting evidence; preserve this skill's narrower scope and reporting rules.\n`;
    files.set(name, Buffer.from(source.slice(0, frontmatterEnd) + entry + source.slice(frontmatterEnd)));
    const yamlPath = `skills/${skill}/agents/openai.yaml`;
    const yaml = files.get(yamlPath).toString().replace(/default_prompt: .*/, `default_prompt: "Use $${skill} to inspect my named repository and report evidence and limitations."`);
    files.set(yamlPath, Buffer.from(yaml));
  }
  const manifest = JSON.parse(files.get("plugin.json"));
  const core = JSON.parse(files.get("assets/core/package.json"));
  if (manifest.version !== core.version) throw new Error("Plugin and core versions must agree");
  const inventory = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b)).map(([name, bytes]) => [name, hash(bytes)]));
  files.set("checksums.json", Buffer.from(JSON.stringify({ algorithm: "sha256", files: inventory }, null, 2) + "\n"));
  const bytes = zip(files);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const filename = path.join(outputDirectory, `coding-agent-skills-${manifest.version}-plugin.zip`);
  fs.writeFileSync(filename, bytes);
  return { filename, sha256: hash(bytes), bytes: bytes.length, files: files.size, skills: PLUGIN_SKILLS };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildPlugin(process.argv[2]), null, 2));
}
