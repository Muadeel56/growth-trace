# GrowthTrace

A multi-tenant SaaS that connects to your GitHub account and turns your real commit, repo, and PR history into an evidence-based dashboard and conversational assistant.

See [BRD.md](BRD.md) and [FRD.md](FRD.md) for the full business and functional requirements, and [docs/adr/0001-llm-embeddings-provider.md](docs/adr/0001-llm-embeddings-provider.md) for the LLM/embeddings provider decision.

## Prerequisites

- Docker & Docker Compose
- Node 24 (`nvm use` picks it up from `.nvmrc`) and npm 10+
- A GitHub account (for OAuth app registration, see below)

## Local dev setup

1. Copy the env template and fill in real values:

   ```bash
   cp .env.example .env
   ```

2. Register a GitHub OAuth App (manual, one-time):

   - Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy the generated Client ID and Client Secret into `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in your `.env` (never commit `.env`)

3. Start the local infra stack:

   ```bash
   docker compose up -d
   ```

   This brings up:
   - `postgres` — Postgres 16 with the `pgvector` extension available (host port `5533` by default, see `POSTGRES_PORT` in `.env` — chosen to avoid colliding with other local Postgres instances)
   - `redis` — for BullMQ background jobs (host port `6480` by default, see `REDIS_PORT`, to avoid colliding with other local Redis instances)
   - `ollama` — local LLM/embeddings runtime (see ADR 0001), host port `11434`

4. Pull the Ollama models used by the app (first time only):

   ```bash
   docker exec -it $(docker compose ps -q ollama) ollama pull llama3.1
   docker exec -it $(docker compose ps -q ollama) ollama pull nomic-embed-text
   ```

5. Verify pgvector is enabled:

   ```bash
   docker exec -it $(docker compose ps -q postgres) psql -U growthtrace -d growthtrace -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT extname FROM pg_extension;"
   ```

6. Install workspace dependencies:

   ```bash
   nvm use
   npm ci
   ```

Backend (`backend/`) and frontend (`frontend/`) project scaffolding begins in Week 1 and Week 5 respectively — see the timeline in [BRD.md](BRD.md#8-timeline--milestones). Until then each workspace holds a placeholder `src/index.ts` so the quality scripts below have something to check.

## Quality scripts

The repo is a single npm workspace root that owns every quality tool, so all of these run from the root:

| Script                    | What it does                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run lint`            | ESLint across every workspace. Warnings fail (`--max-warnings=0`).                        |
| `npm run lint:fix`        | Same, with auto-fixes applied.                                                            |
| `npm run format`          | Prettier writes every file (Tailwind classes get sorted).                                 |
| `npm run format:check`    | Prettier in check-only mode, used by `verify`.                                            |
| `npm run typecheck`       | `tsc --noEmit` in each workspace.                                                         |
| `npm run test`            | Vitest unit tests in each workspace.                                                      |
| `npm run test:responsive` | Playwright viewport checks at mobile (375×812), tablet (768×1024) and desktop (1440×900). |
| `npm run clean:check`     | knip — unused files, exports and dependencies.                                            |
| `npm run verify`          | All of the above in order, stopping at the first failure.                                 |

**Run `npm run verify` before opening a PR.** It is the single gate that says the branch is healthy.

Shared TypeScript, ESLint and Prettier configs live in `packages/config`; the root `eslint.config.js`, `prettier.config.js` and `tsconfig.base.json` just re-export them.

## Repo layout

- `backend/` — Fastify API (Node.js)
- `frontend/` — Next.js dashboard
- `packages/config/` — shared TypeScript, ESLint and Prettier configs
- `packages/ui/` — shared design-system components (placeholder)
- `docs/adr/` — architecture decision records
- `docker-compose.yml` — local dev infra (Postgres+pgvector, Redis, Ollama)
