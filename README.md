# GrowthTrace

[![CI](https://github.com/Muadeel56/growth-trace/actions/workflows/ci.yml/badge.svg)](https://github.com/Muadeel56/growth-trace/actions/workflows/ci.yml)

GrowthTrace is a multi-tenant SaaS that connects to your GitHub account and turns your real commit, repo and PR history into an evidence-based dashboard and a conversational assistant. Answers are grounded in your own activity: a RAG pipeline over pgvector, running on a local Ollama model. Everything is self-hosted with Docker Compose.

## Quickstart

You need Docker, Node 24 (via `nvm`) and npm 10+. The full walkthrough, including the GitHub OAuth app, is in [docs/development/setup.md](docs/development/setup.md).

1. `cp .env.example .env`, then fill in the GitHub OAuth and `SESSION_SECRET` values.
2. `docker compose up -d` starts Postgres + pgvector (5533), Redis (6480) and Ollama (11434).
3. Pull the models:

   ```bash
   docker exec -it $(docker compose ps -q ollama) ollama pull llama3.1
   docker exec -it $(docker compose ps -q ollama) ollama pull nomic-embed-text
   ```

4. `nvm use && npm ci`
5. `npm run dev -w @growthtrace/frontend`, then open `http://localhost:3000` (and `/design` for the Aurora design system).

Before opening a PR, run `npm run verify`, the single quality gate. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Docs

Start at the **[docs map](docs/index.md)**. The main sections:

- Product: [BRD](docs/product/BRD.md) and [FRD](docs/product/FRD.md), the requirements
- [Architecture](docs/architecture/overview.md): system overview, data model, multi-tenancy, sync jobs, RAG
- [API](docs/api/endpoints.md): generated from the Fastify schemas (`npm run docs:api`)
- [Design system](docs/design-system/principles.md): Aurora principles, tokens, components, motion, responsive
- [Development](docs/development/setup.md): setup, testing, quality gates, troubleshooting
- [Operations](docs/operations/deployment.md): deployment and runbook
- [Decisions](docs/index.md#architecture-decision-records): ADRs

## Repo layout

| Path                      | What                                                                            |
| ------------------------- | ------------------------------------------------------------------------------- |
| `frontend/`               | Next.js (App Router) dashboard                                                  |
| `backend/`                | Fastify API (`buildApp()` in `src/app.ts`, routes in `src/routes/`)             |
| `packages/design-system/` | Aurora design system (`@growthtrace/design-system`): tokens, motion, components |
| `packages/config/`        | Shared TypeScript, ESLint, Prettier and Stylelint configs + Aurora lint rules   |
| `e2e/`                    | Playwright responsive/accessibility checks and the stub API                     |
| `docs/`                   | Product, architecture, API, design-system, development and operations docs      |
| `docker-compose.yml`      | Local infra: Postgres + pgvector, Redis, Ollama                                 |
