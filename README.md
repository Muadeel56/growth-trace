# GrowthTrace

A multi-tenant SaaS that connects to your GitHub account and turns your real commit, repo, and PR history into an evidence-based dashboard and conversational assistant.

See [BRD.md](BRD.md) and [FRD.md](FRD.md) for the full business and functional requirements, and [docs/adr/0001-llm-embeddings-provider.md](docs/adr/0001-llm-embeddings-provider.md) for the LLM/embeddings provider decision.

## Prerequisites

- Docker & Docker Compose
- Node.js + npm
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

Backend (`backend/`) and frontend (`frontend/`) project scaffolding begins in Week 1 and Week 5 respectively — see the timeline in [BRD.md](BRD.md#8-timeline--milestones).

## Repo layout

- `backend/` — Fastify API (Node.js)
- `frontend/` — Next.js dashboard
- `docs/adr/` — architecture decision records
- `docker-compose.yml` — local dev infra (Postgres+pgvector, Redis, Ollama)
