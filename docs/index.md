# GrowthTrace docs

Plain Markdown in the repo is the source of truth. Pages marked _Planned_ describe systems that aren't built yet. They're written from the requirements and get updated as the code lands. API docs are generated; never edit them by hand.

## Start here

- **New contributor:** [README](../README.md) → [setup](development/setup.md) → [CONTRIBUTING](../CONTRIBUTING.md) → [architecture overview](architecture/overview.md) → [design-system principles](design-system/principles.md).
- **Coding agent:** [AGENTS.md](../AGENTS.md) → [CONTRIBUTING](../CONTRIBUTING.md) (branches, commits, the doc-mapping table) → [quality gates](development/quality-gates.md) (`npm run verify`) → [design-system principles](design-system/principles.md) → the [FRD](product/FRD.md) requirement IDs for your task → the matching architecture page.
- **Operator:** [deployment](operations/deployment.md) → [runbook](operations/runbook.md) → [architecture overview](architecture/overview.md) (components and ports).

## Product

- [BRD](product/BRD.md): business requirements, goals, scope, success criteria and timeline (BR-x).
- [FRD](product/FRD.md): functional and non-functional requirements, the data model and the API summary (FR-x.x, NFR-x).

## Architecture

- [Overview](architecture/overview.md): system diagram, components and ports, the dashboard request flow and the sync → embed flow.
- [Data model](architecture/data-model.md) _(Planned)_: entities, relations, indexes and the `userId`-on-every-table rule.
- [Multi-tenancy](architecture/multi-tenancy.md) _(Planned)_: isolation rules (NFR-2), how they're enforced, vector-search scoping, cross-tenant tests.
- [Sync jobs](architecture/sync-jobs.md) _(Planned)_: BullMQ queues, GitHub rate limits, idempotency, partial failure, retries and dead letters.
- [RAG pipeline](architecture/rag-pipeline.md) _(Planned)_: embed → store → retrieve → prompt → stream, grounding rules and the NFR-3 latency budget.

## API

- [Endpoints](api/endpoints.md) _(generated)_: every route with its parameters, bodies, responses and auth. Regenerate with `npm run docs:api`.
- [openapi.json](api/openapi.json) _(generated)_: the OpenAPI 3.1 document, built from the Fastify schemas.

## Design system

- [Principles](design-system/principles.md): why Aurora exists, the styling rule, and do/don't examples.
- [Tokens](design-system/tokens.md): token groups and naming, colour roles, contrast guarantees, light/dark.
- [Components](design-system/components.md): every component with its purpose, key props and `/design` section.
- [Motion](design-system/motion.md): presets, `AuroraMotionProvider`, `useCountUp`, reduced motion, and why there are no inline animations.
- [Responsive](design-system/responsive.md): the viewport matrix, what fails the check, `data-tap-exempt`, and screenshot baselines.
- [Package README](../packages/design-system/README.md): how to add a token or component, the responsive rules, enforcement, and the allowlist policy.

## Development

- [Setup](development/setup.md): clone to running app, env vars, the GitHub OAuth app, ports.
- [Testing](development/testing.md): Vitest, Playwright, the stub API and fixtures.
- [Quality gates](development/quality-gates.md): every script, what runs where (pre-commit / verify / CI / sweep), lychee.
- [Troubleshooting](development/troubleshooting.md): known local problems and their fixes.

## Operations

- [Deployment](operations/deployment.md) _(Planned)_: self-hosted Docker Compose, env vars, volumes, backups, upgrades, Gitea.
- [Runbook](operations/runbook.md) _(Planned)_: symptom → check → fix for sync, Ollama, Redis/BullMQ and Postgres/pgvector.

## Architecture decision records

New ADRs start from the [template](adr/template.md); see [CONTRIBUTING](../CONTRIBUTING.md#architecture-decision-records).

| #    | Title                                                              | Status   | Date       |
| ---- | ------------------------------------------------------------------ | -------- | ---------- |
| 0001 | [LLM and embeddings provider](adr/0001-llm-embeddings-provider.md) | Accepted | 2026-09-20 |
| 0002 | [Aurora design system](adr/0002-aurora-design-system.md)           | Accepted | 2026-10-08 |
| 0003 | [Quality gates and tooling](adr/0003-quality-gates-and-tooling.md) | Accepted | 2026-10-08 |
