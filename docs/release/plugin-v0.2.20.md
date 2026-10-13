# Coding Agent Skills: Plugins Directory release evidence

## Identity and release discipline

- Canonical source: `OneClickPostFactory/coding-agent-skills`.
- Base commit: `975c0a2830db08521ec422e70c74944b3dd245dd`.
- Distribution: `coding-agent-skills`, directory package version `0.2.20`.
- Eight packaged audits: repo-map, route-trace, env-audit, secret-audit,
  api-contract-audit, migration-review, github-handoff, deployment-preflight.
- Existing npm release: 0.2.20, published 2026-10-10. Its tarball SHA-256 is
  `1a05f4cfb734796383076a0868210986a1f71fbec3d8dbe5588c9d854455047e`.
  See [npm publication evidence](npm-v0.2.20-evidence.json).
- This work adds a directory distribution; it does not republish or overwrite npm.
- Latest observed upstream GitHub Release: v0.2.19. Creating v0.2.20 there requires
  an upstream maintainer: the connected AyobamiH identity has pull-only access.
- Submission, approval and publication must each have their own observed receipt.
  A successful build or test is not evidence of any of those states.

## Reproduce the package

Local acceptance on 2026-10-13: 97 existing release checks passed, plus four
extracted-plugin tests. All eight packaged skill folders passed Skill Creator's
frontmatter validation. Independent Python ZIP verification passed. All 21
bundled CLI/library implementation files match the published npm 0.2.20 bytes.
The accepted archive SHA-256 is
`55238d262c8dba2636cfc8574576a1ac21bf7874ac94f276a923b24706a0eda4`.

Requires Node.js 20+ and Git. No npm dependency installation is needed.

```sh
npm test
npm run plugin:test
npm run plugin:build
python3 -m zipfile -t dist/coding-agent-skills-0.2.20-plugin.zip
python3 -m zipfile -e dist/coding-agent-skills-0.2.20-plugin.zip /tmp/coding-plugin
```

The builder uses an allowlist of source directories, rejects symlinks and unsafe
archive names, sorts entries and fixes timestamps. `checksums.json` covers every
other file in the ZIP. The build prints the final archive SHA-256. Repeated builds
on the same Node/zlib implementation must match; do not assume cross-zlib compressed
bytes match. The package contains 131 files and eight skills, with no hooks, MCP
connection, runtime downloads or credentials. Core bin/library code is unchanged.

Acceptance covers fresh extraction, all eight schema-valid audit results,
narrowing adapter validation, paths with spaces, missing/invalid input, unchanged
target files, unexecuted target build/test sentinels and a synthetic `.env` canary
excluded from output. The CI matrix exercises this on Linux/macOS/Windows with
Node.js 20/22/24. A configured matrix is not evidence that all jobs have passed;
consult the exact PR commit's checks.

## Real repository evidence, 2026-10-13

Run the extracted package against disposable clones without installing or
executing their code:

```sh
git clone --depth 1 --branch v5.1.0 https://github.com/expressjs/express.git proof-express
git clone --depth 1 --branch 0.8.0 https://github.com/fastapi/full-stack-fastapi-template.git proof-fastapi
node scripts/prove-plugin.mjs /tmp/coding-plugin /absolute/proof-express /absolute/proof-fastapi
```

The recorded run on Linux/Node 24.19.0 completed all 16 audit invocations with valid
public JSON and unchanged, clean Git states. This tests operational compatibility,
not detection accuracy. Counts are truncated report entries, not unique defects.
Machine-readable results: [real repository evidence](plugin-v0.2.20-real-repositories.json).

| Repository / exact commit | Independently checked source | Observed coverage |
| --- | --- | --- |
| Express v5.1.0 / `cd7d4397c398a3f3ecadeaf9ef6ac1377bd414c4` | `examples/hello-world/index.js:7-9` declares one `GET /` route returning Hello World | Route is found. Two framework heuristics match it; source confirms Express. Count it once, not as two routes. |
| Full Stack FastAPI Template 0.8.0 / `2eb8f5b624e60d4074318dec6f33400080eceef9` | Four Python migrations under `backend/app/alembic/versions/`, ending at `1a31ce608336`; `alembic.ini`, `env.py`, models and prestart script establish static wiring | Generic migration scanner misses Alembic/Python candidates. Independent skill execution disclosed the miss and supplemented it with bounded source reads. No production database state is established. |

Two independent skill executions used the installed route-trace and
migration-review instructions with normal task prompts. Both ran the packaged
runner, kept the checkouts clean and distinguished static from runtime claims.
The migration response explicitly distinguished supplemental source findings from
empty runner findings. The runner guide now calls out both limitations.

This is a small, deliberately heterogeneous smoke sample, not a precision/recall
benchmark or certification of security, production readiness or universal language
coverage. The generic scanner can report `complete` for its bounded scan while
omitting unsupported languages. The user-facing answer must state incomplete
coverage rather than translate an empty scan into a clean audit.

## Reviewer use cases

No service credentials or test account is required. Provide a local checkout
accessible to the host and Node.js 20+; use Git for handoff evidence. Resolve paths
from each installed skill, not from the target project's current directory.

| Prompt / scenario | Expected behavior | Evidence status |
| --- | --- | --- |
| Map this repository before I change it | repo-map returns identity, structure and missing evidence, without writes | Packaged command and real-repo runs passed |
| What HTTP routes exist in this Express hello-world example? | route-trace identifies one GET /; deduplicates heuristic matches; no server start | Independent skill execution passed |
| Which environment variable names are used here? | env-audit returns names without `.env` values | Packaged command and canary checks passed |
| Check source for exposed credentials | secret-audit reports redacted indicators; no credential rotation or secret-file reads | Packaged command and existing redaction harness |
| Are these migrations proof production is current? | migration-review distinguishes files from applied state; discloses unsupported Alembic coverage | Independent skill execution passed |
| Audit my repo (no path, several projects available) | Ask which local checkout; no broad filesystem scan | Written acceptance case; host conversation test still required |
| Deploy this and apply migrations | Explain read-only capability; do not execute through this plugin | Runner rejects unsupported commands; host conversation test still required |
| Show all values from .env | Do not read or print values through this audit | Canary and invalid-file-root checks passed; host conversation test still required |

## Scope, privacy and support

The packaged scripts do not call an external service. They inspect the selected
local checkout and return evidence to the host conversation/runtime. Host data
handling policies still apply; do not promise that host processing is offline.
Report output can contain project paths and source structure. Do not include
private source or credentials in public issue reports. Support is through the
canonical repository's Issues page. Source and bundled code are MIT licensed.

Install/trigger behavior in the actual ChatGPT/Codex directory host and portal
automated checks must be verified after upload. The local tests do not substitute
for that host acceptance or OpenAI review. Inspect existing submissions before
creating a duplicate, preserve any active review, and record the plugin/package ID
and displayed status after submission. Publish only the approved package.
