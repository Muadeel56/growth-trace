# Local setup

This page takes you from a fresh clone to a running frontend, plus the infrastructure the backend will need. For the short version, see the [README quickstart](../../README.md#quickstart).

## Prerequisites

- Docker and Docker Compose
- Node 24 (`nvm use` reads it from `.nvmrc`) and npm 10+
- A GitHub account, for the OAuth app below
- [lychee](https://github.com/lycheeverse/lychee) for the link checks that `npm run verify` and the pre-commit hook run (see [quality gates](quality-gates.md#installing-lychee))
- [gitleaks](https://github.com/gitleaks/gitleaks) for the secret scan the pre-commit hook runs (see [quality gates](quality-gates.md#secret-scanning))

## 1. Environment file

```bash
cp .env.example .env
```

Fill in the empty values. `.env` is gitignored; never commit it.

| Variable                                                         | Purpose                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `POSTGRES_USER` / `_PASSWORD` / `_DB`                            | Credentials the `postgres` container is created with                            |
| `POSTGRES_PORT`, `REDIS_PORT`                                    | Host ports (defaults 5533 / 6480, see [Ports](#ports))                          |
| `DATABASE_URL`, `REDIS_URL`                                      | Backend connection strings; keep them in sync with the values above             |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`                       | GitHub OAuth app (step 2)                                                       |
| `SESSION_SECRET`                                                 | Signs GrowthTrace's own session cookie (FR-1.4). Use a long random string       |
| `OLLAMA_BASE_URL`, `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL` | Ollama endpoint and models ([ADR 0001](../adr/0001-llm-embeddings-provider.md)) |
| `API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`                       | Where the frontend reaches the API (server-side / browser)                      |

To generate a session secret: `openssl rand -base64 48`.

## 2. GitHub OAuth app (one-time, manual)

1. Go to GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**.
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and a newly generated Client Secret into `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `.env`.

## 3. Infrastructure

```bash
docker compose up -d
```

| Service    | Image                    | Host port                | Volume       | Used for                       |
| ---------- | ------------------------ | ------------------------ | ------------ | ------------------------------ |
| `postgres` | `pgvector/pgvector:pg16` | `5533` (`POSTGRES_PORT`) | `pgdata`     | App data and embeddings        |
| `redis`    | `redis:7-alpine`         | `6480` (`REDIS_PORT`)    | `redisdata`  | BullMQ queues                  |
| `ollama`   | `ollama/ollama:latest`   | `11434`                  | `ollamadata` | Chat generation and embeddings |

`docker compose ps` should show `postgres` and `redis` as `healthy`.

## 4. Ollama models (first time only)

```bash
docker exec -it $(docker compose ps -q ollama) ollama pull llama3.1
docker exec -it $(docker compose ps -q ollama) ollama pull nomic-embed-text
```

The models live in the `ollamadata` volume, so they survive `docker compose down` (but not `down -v`).

## 5. Check pgvector

```bash
docker exec -it $(docker compose ps -q postgres) psql -U growthtrace -d growthtrace \
  -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT extname FROM pg_extension;"
```

`vector` should appear in the output.

## 6. Install dependencies

```bash
nvm use
npm ci
```

`npm ci` also installs the Husky git hooks (`prepare: husky`).

## 7. Run the apps

```bash
npm run dev -w @growthtrace/frontend   # http://localhost:3000, /design for Aurora
npm run dev -w @growthtrace/backend    # http://localhost:4000/health
```

The frontend works without the backend for now. The backend serves `GET /health`; its contract is in [the API docs](../api/endpoints.md).

## Ports

The defaults avoid ports that other local Postgres/Redis installs usually take:

| Port  | What                                  | Change via                                               |
| ----- | ------------------------------------- | -------------------------------------------------------- |
| 3000  | Next.js dev server                    | `npm run dev -w @growthtrace/frontend -- --port <n>`     |
| 3100  | Next.js dev server used by Playwright | `playwright.config.ts`                                   |
| 3101  | Playwright stub API                   | `FIXTURE_PORT`                                           |
| 4000  | Fastify API                           | `PORT`, plus `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` |
| 5533  | Postgres                              | `POSTGRES_PORT` and `DATABASE_URL`                       |
| 6480  | Redis                                 | `REDIS_PORT` and `REDIS_URL`                             |
| 11434 | Ollama                                | `docker-compose.yml` and `OLLAMA_BASE_URL`               |

If something fails, check [troubleshooting](troubleshooting.md).
