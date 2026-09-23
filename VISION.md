---
schema: clawsweeper.project-vision.v1
project_id: coding-agent-skills
repository: AyobamiH/coding-agent-skills
---

# Project Vision

## Identity

Coding Agent Skills is a shared, versioned library of evidence-driven coding-agent skills, safety contracts, validators, and disposable harness fixtures.

## Purpose

Provide reusable, bounded workflows that help coding agents inspect, map, validate, and report on repositories while preserving clear separation between audit-only evidence production and explicitly authorised action.

## Owns

- Shared generic skill definitions and evidence-pack contracts.
- Safety, adapter, validation, CLI-result, and evidence-bundle schemas.
- Generic repository audit/verification workflows.
- Disposable fixtures and validators used to prove the shared skill pack.

## Does Not Own

- Project-specific product behaviour or real project adapters.
- Generic orchestration, memory, scheduling, permissions, or workflow state.
- Deployment, package installation, Git publication, migrations, or platform mutation unless a separately approved future skill explicitly owns such authority.
- OpenClaw itself.

## Non-Negotiable Invariants

- Inspect before acting.
- Audit-only and action-capable skills remain visibly distinct.
- Evidence is required before completion claims.
- Project adapters may narrow shared safety rules but never weaken them.
- Real project repositories are not modified by this repository's maintainer harness.
- The pack stays generic; project-specific behaviour belongs with the project that owns it.

## Evidence of Done

A skill change is done when its contracts, validators, fixtures, evidence output, and safety/completion semantics pass the pack's verification.

## Relationships

- OpenClaw or another orchestrator may call these skills but remains owner of orchestration and authority.
- Project repositories may own adapters that consume this shared contract.

## Canonical Sources

README.md, AGENTS.md, CONTRIBUTING.md, ROADMAP.md, RUNBOOK.md, and docs/architecture/, docs/safety/, and docs/authoring/.

## Agent Rule

Do not turn a reusable evidence library into an orchestrator. Keep shared skills generic and push project-specific intent back into the owning repository.
