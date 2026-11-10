# Agent Operating Contract

This repository contains shared coding-agent skills, safety contracts, validators, and disposable harness fixtures.

## Scope

Agents working here may maintain the shared skill pack, validators, documentation, examples, and synthetic fixtures. They must not add new skills, real project adapters, platform integrations, deployment procedures, or project-specific behavior unless a human explicitly approves that milestone.

## Maintainer Loop

Use `./scripts/run-next --allow <permission>` to inspect the repository, validate the current pack, read the roadmap/changelog/work ledger, and decide the next bounded action. The loop is intentionally conservative: it selects and evidences work, then stops at approval boundaries.

Supported permission flags are:

- `harness-hardening`
- `docs-hardening`
- `test-hardening`
- `adapter-harness`
- `evidence-harness`
- `release-preflight`
- `commit`
- `tag`
- `push`

Unknown flags must fail closed. Permission flags do not weaken skill restrictions.

## Safety Boundaries

Agents must not:

- create new skills without explicit approval
- modify real project repositories
- add real project adapters
- run platform publication or infrastructure commands
- apply database changes
- mutate local services or background processes
- read local environment files
- print secrets or credentials
- use destructive Git operations
- weaken shared safety policies, command policies, evidence requirements, or adapter inheritance

## Evidence Standard

Every maintainer-loop run must leave evidence in `runs/skill-runs.md` or an approved report. Evidence must include the command used, granted permissions, files changed, validation commands, validation result, release status, next state, and unresolved approval gates.

<!-- repository-agent-foundations:begin -->
## Repository-owned agent foundations

Before changing code, configuration or documentation, read the checked-in
[Secure API Delivery skill](.agents/skills/secure-api-delivery/SKILL.md).
Open it directly if your agent catalog does not list repository skills; no global
installation or user home directory is required. Record initial security scope,
exact revision, affected trust boundaries and permitted effects even for
documentation-only work. Mark checks passed, failed, not run or not applicable
with reasons; do not imply a security certification from documentation checks.

Use the [project knowledge map](.agents/knowledge/README.md) to find existing
authoritative docs, source entry points, commands and decisions. Follow the
existing project rules above and any narrower directory instructions. Update
the relevant canonical knowledge and this map in the same change when behavior,
architecture or commands change. Preserve rationale and verified lessons, not
raw chats, secrets, private host inventories or stale live status.

The local skill adds a review workflow, not execution authority or a CI gate.
It never authorizes live scans, credential changes, publication, spending,
deployment or weakening existing checks. Validate portable discovery with
`node .agents/validate-foundations.mjs`; application checks remain separate.
<!-- repository-agent-foundations:end -->
