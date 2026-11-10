# Repository knowledge entry point

## Purpose and authority
[README](../../README.md) describes shared evidence-driven coding workflows. [AGENTS](../../AGENTS.md) limits maintainer authority; adding adapters, platform integrations or new distributed skills requires explicit approval. The repository-local secure-api-delivery copy is development guidance for this checkout, not an addition to the distributed pilot pack in skills/.

## Architecture and entry paths
- [CLI](../../bin/coding-agent-skills), [scripts](../../scripts/), [skills](../../skills/), [contracts](../../contracts/) and [schemas](../../schemas/) hold execution wrappers, skill definitions and evidence contracts.
- [Architecture](../../docs/architecture/README.md) owns the shared-library/project-adapter split.
- [Safety](../../docs/safety/README.md) and [authoring](../../docs/authoring/README.md) define restrictions and authoring rules.
- [Project installation](../../docs/adapters/project-installation.md) and [adapter discovery](../../docs/adapters/discovery.md) explain project-owned adapters.
- [Roadmap](../../ROADMAP.md) and [work ledger](../../work-ledger.md) own queued work and recorded progress.

## Setup and verification
[Package](../../package.json) requires Node >=20. A source checkout exposes bin/coding-agent-skills validate-pack without global installation. Existing checks: node scripts/validate-pack.mjs ., node scripts/test-pack.mjs, and node --test. Read the [harness guide](../../docs/testing/README.md) before changing tests. The maintainer selector ./scripts/run-next --allow docs-hardening can refuse a roadmap item requiring other permissions; a refusal does not grant those permissions. Record it and keep the user-authorised task separate instead of weakening the selector.

## Decisions and lessons
Audit-only skills are distinct from controlled local build verification. Project adapters may narrow restrictions and enrich evidence, never weaken shared safety or completion requirements. Evidence packs must distinguish attempted, passed, failed, skipped and unverifiable work. [Release policy](../../docs/release/README.md) remains authoritative; validation does not authorize publication.

## Maintenance
Update canonical contracts and docs in the same change as architecture, command or behavior changes, then keep this map aligned. Preserve verified rationale and lessons, not raw chats, secrets, machine inventories or stale live state. Validate checkout guidance with node .agents/validate-foundations.mjs; this does not replace pack validation.
