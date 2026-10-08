# Deployment

> Status: Planned (per BR-7, NFR-5 and the BRD Week 5 "self-deploy" milestone). The compose stack below runs today for local infrastructure. The production overrides, backend image and Gitea pipeline are the plan; update this page when they land.

Covers: BR-7, NFR-1, NFR-5, NFR-6.

GrowthTrace is self-hosted on our own server with Docker Compose. There is no PaaS: the same `docker-compose.yml` that runs local infrastructure is the base of production, with a production override file for the app containers and a reverse proxy.

## Topology

| Service    | Image                               | Exposed                         | Volume       |
| ---------- | ----------------------------------- | ------------------------------- | ------------ |
| `proxy`    | Caddy (planned)                     | 80/443, TLS for the public host | `caddydata`  |
| `frontend` | built from `frontend/` (planned)    | internal 3000, via proxy        | —            |
| `api`      | built from `backend/` (planned)     | internal 4000, via proxy        | —            |
| `worker`   | same image as `api`, worker command | none                            | —            |
| `postgres` | `pgvector/pgvector:pg16`            | **none** in production          | `pgdata`     |
| `redis`    | `redis:7-alpine`                    | **none** in production          | `redisdata`  |
| `ollama`   | `ollama/ollama` (pin a version tag) | **none** in production          | `ollamadata` |

In production only the proxy publishes ports. The local compose file maps Postgres, Redis and Ollama to host ports for development; the production override removes those mappings (`ports: !reset []`) so the services are reachable only on the compose network.

## Environment variables

From `.env.example`. In production, put them in a root-owned `.env` on the server (mode `600`), never in the repo or the image (NFR-1).

| Variable                                            | Production notes                                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Strong unique password. The compose default `growthtrace` is for local only                                                             |
| `DATABASE_URL`                                      | Use the service host: `postgresql://…@postgres:5432/growthtrace`                                                                        |
| `REDIS_URL`                                         | `redis://redis:6379`                                                                                                                    |
| `POSTGRES_PORT`, `REDIS_PORT`                       | Unused in production (no host ports)                                                                                                    |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`          | A **separate** OAuth app with the production callback URL `https://<host>/api/auth/callback/github`                                     |
| `SESSION_SECRET`                                    | 48+ random bytes. Rotating it signs everyone out                                                                                        |
| `OLLAMA_BASE_URL`                                   | `http://ollama:11434`                                                                                                                   |
| `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBEDDING_MODEL`       | `llama3.1`, `nomic-embed-text` ([ADR 0001](../adr/0001-llm-embeddings-provider.md)). Changing the embedding model requires re-embedding |
| `API_BASE_URL`                                      | Internal URL the Next.js server uses: `http://api:4000`                                                                                 |
| `NEXT_PUBLIC_API_BASE_URL`                          | Public URL the browser uses: `https://<host>/api`. Inlined at **build** time                                                            |

A token-encryption key (for `GithubAccount.encryptedAccessToken`) will be added to this list with the auth work.

## First deploy

1. Provision the host: Docker Engine + Compose plugin, a firewall allowing only 22/80/443, DNS for the host.
2. Clone the repo (or pull images from the Gitea registry, below) to `/srv/growthtrace`.
3. Create `.env` from `.env.example` with the production values above.
4. `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
5. Pull the models: `docker compose exec ollama ollama pull llama3.1 && docker compose exec ollama ollama pull nomic-embed-text`.
6. Run migrations: `docker compose run --rm api npx prisma migrate deploy` (once Prisma lands).
7. Check `https://<host>/api/health` returns `{"status":"ok","source":"api"}`.

## Volumes and backups

| Volume       | Contains                       | Back up?                                                               |
| ------------ | ------------------------------ | ---------------------------------------------------------------------- |
| `pgdata`     | All user data, tokens, vectors | **Yes.** It's the only state that can't be regenerated                 |
| `redisdata`  | Queues and job history         | No. Jobs are re-creatable; in-flight syncs re-run on the next schedule |
| `ollamadata` | Downloaded models (several GB) | No. Re-pull the models                                                 |

Nightly logical backup with a 14-day local and 30-day off-site retention:

```bash
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" \
  > /srv/backups/growthtrace-$(date +%F).dump
```

Copy the dump off the host (restic or rclone to another machine). Because tokens are encrypted, the backup is only usable together with the encryption key, so store the key separately from the dumps.

**Test a restore** at least once before launch, and after any major Postgres upgrade:

```bash
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d growthtrace_restore --clean --if-exists < growthtrace-YYYY-MM-DD.dump
```

## Upgrades

1. Read the PR/changelog for migrations, new env vars and model changes.
2. Back up (`pg_dump` above).
3. `git pull` (or pull the new image tags), then `docker compose … build`.
4. `docker compose … run --rm api npx prisma migrate deploy`.
5. `docker compose … up -d`. The API and worker restart, and BullMQ resumes waiting jobs.
6. Check `/api/health` and the [runbook](runbook.md) checks.

**Rollback:** redeploy the previous image tag. If a migration was destructive, restore the backup taken in step 2. Prefer expand/contract migrations, so the previous version still runs against the new schema.

**Infrastructure images:** pin explicit tags (`pgvector/pgvector:pg16`, `redis:7-alpine`, an `ollama/ollama` version). A Postgres **major** upgrade needs a dump and restore into the new major version, not just a tag bump.

## CI and mirroring with Gitea

The canonical repo is on GitHub, which runs CI (`ci.yml`) and the daily docs sweep (`sweep.yml`). A self-hosted Gitea instance (per the BRD's infra constraint) mirrors it with a pull mirror, and can build and deploy with **Gitea Actions**.

Gitea Actions runs GitHub Actions workflow syntax through `act_runner`, so `ci.yml` and `sweep.yml` mostly work unchanged. Known differences to check before relying on them there:

- **`schedule`** triggers are supported, but pull mirrors don't fire `push`/`pull_request` events. Run CI on GitHub and use Gitea for deployment only.
- **Actions are fetched from GitHub by default** (`DEFAULT_ACTIONS_URL`). If the runner has no internet access, mirror `actions/checkout`, `actions/setup-node`, `actions/cache`, `lycheeverse/lychee-action` and `peter-evans/create-issue-from-file` into Gitea.
- **`peter-evans/create-issue-from-file`** calls the GitHub REST API. On Gitea it would need the Gitea API instead, so keep the sweep's issue reporting on GitHub.
- **Job containers** (`container:` in the `responsive` job) need a runner with Docker access; the label must map to an image (for example `ubuntu-latest:docker://node:24-bookworm`).
- **`GITHUB_TOKEN` permissions** blocks are ignored by Gitea, which issues its own token per job.

A deploy workflow on Gitea (build images, push them to the Gitea container registry, then `docker compose pull && up -d` over SSH) is the planned next step.
