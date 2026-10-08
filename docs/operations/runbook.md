# Runbook

> Status: Planned (per FRD §2: no in-app admin, so operations run directly against infrastructure). Entries for sync, workers and chat describe the planned design ([sync jobs](../architecture/sync-jobs.md), [RAG pipeline](../architecture/rag-pipeline.md)). Update each entry with real commands and log messages as the code lands.

Covers: NFR-3, NFR-4, NFR-5, NFR-6, FR-2.5.

Each entry is **symptom → check → fix**. Commands assume the compose project directory; in production add `-f docker-compose.yml -f docker-compose.prod.yml`. Never paste tokens, prompts or user content into tickets or chat (NFR-6).

## First look

```bash
docker compose ps                                  # anything not "running"/"healthy"?
docker compose logs --since 30m api worker | tail -200
curl -s localhost:4000/health                      # {"status":"ok","source":"api"}
```

## GitHub sync

### Sync is rate-limited

- **Symptom:** syncs stay `running` for a long time, or logs show `rate limited, resuming at <time>`. Users see stale "last synced" times.
- **Check:** the worker logs `x-ratelimit-remaining` / `reset` per user. Look for `403`/`429` with `retry-after` (secondary limit) in the logs.
- **Fix:** usually nothing; the job resumes by itself after `reset`. If it happens constantly, lower worker concurrency or the global GitHub request cap, and check that conditional requests (`ETag`) are being sent. Don't retry jobs by hand while a user is rate-limited; that just burns the remaining quota.

### Token revoked or expired

- **Symptom:** one user's syncs fail immediately; `SyncJob.status = failed`, error `GitHub token rejected (401)`. The UI shows `SyncStatus` `error` and asks the user to reconnect.
- **Check:** `SELECT status, error, "finishedAt" FROM "SyncJob" WHERE "userId" = '<id>' ORDER BY "startedAt" DESC LIMIT 5;`
- **Fix:** the user signs in with GitHub again, which stores a new token and queues a sync. No operator action is needed. If **every** user gets 401s, check that the OAuth app (client ID/secret) still exists and wasn't rotated.

### Partial sync

- **Symptom:** `SyncJob.status = partial`, with `itemsFailed > 0`.
- **Check:** the job's `error` summary and the worker logs for that job ID, which list failing repos or items by ID.
- **Fix:** transient failures (5xx, timeouts) are picked up by the next sync, because the cursor didn't advance past them. A single item failing every time (a malformed payload) is a bug: file an issue with the event ID and GitHub event type (no payload contents).

## Ollama

### Ollama is down

- **Symptom:** chat returns errors or never starts streaming. Embed jobs fail with `ECONNREFUSED ollama:11434`.
- **Check:** `docker compose ps ollama`, `docker compose logs --tail 100 ollama`, `curl -s localhost:11434/api/version`.
- **Fix:** `docker compose restart ollama`. Embed jobs retry with backoff, so they recover by themselves within their attempts. Failed ones can be retried (see [Stuck or failed jobs](#stuck-or-failed-jobs)).

### Model missing

- **Symptom:** `404 model "llama3.1" not found` (or `nomic-embed-text`).
- **Check:** `docker compose exec ollama ollama list`
- **Fix:** `docker compose exec ollama ollama pull <model>`. Models live in the `ollamadata` volume; if that volume was removed, both models have to be pulled again.

### Slow answers or out-of-memory

- **Symptom:** the first token takes well over 3s (NFR-3), the first question after idle is very slow, or Ollama restarts with OOM in `dmesg` / `docker compose logs`.
- **Check:** `docker stats ollama` (memory), `docker compose exec ollama ollama ps` (which models are loaded, and whether on GPU or CPU), and request timings in the API logs (embed, search and first-token times are logged separately).
- **Fix:**
  - Cold loads: raise `keep_alive` so models stay in memory.
  - Memory: `llama3.1` 8B needs about 5–6 GB at 4-bit quantisation, plus the embedding model. Give the container more memory, or switch to a smaller quantisation/model via `OLLAMA_CHAT_MODEL` (see ADR 0001).
  - Long prompts: check the retrieval `k` and history trimming. Prefill time grows with prompt length.

## Redis and BullMQ

### Redis is down

- **Symptom:** `POST /sync` fails, workers log `ECONNREFUSED redis:6379` / `ETIMEDOUT`, the health check is red.
- **Check:** `docker compose ps redis`, `docker compose exec redis redis-cli ping` (→ `PONG`), and disk space for the `redisdata` volume.
- **Fix:** `docker compose restart redis`. Jobs persisted in Redis survive a restart. If Redis data is lost, nothing permanent is lost: scheduled syncs are re-registered on the next login or deploy, and the next sync catches up from the cursor stored in Postgres.

### Queue backlog

- **Symptom:** "last synced" lags for many users; the waiting count keeps growing.
- **Check:**

  ```bash
  docker compose exec redis redis-cli LLEN bull:sync:wait
  docker compose exec redis redis-cli ZCARD bull:sync:delayed
  docker compose exec redis redis-cli LLEN bull:embed:wait
  ```

  Also check whether workers are running (`docker compose ps worker`) and whether they are mostly waiting on GitHub rate limits.

- **Fix:** if workers are down, start them. If it's sustained load, scale workers (`docker compose up -d --scale worker=2`) within GitHub limits. A large embed backlog after a model change is expected; let it drain.

### Stuck or failed jobs

- **Symptom:** a `SyncJob` sits in `running` for over 30 minutes, or failed jobs pile up.
- **Check:** BullMQ moves jobs whose worker died back to `wait` once their lock expires (the `stalled` event in the logs). To list failed jobs, run `docker compose exec redis redis-cli ZRANGE bull:sync:failed 0 20`. Planned: a small admin script `npm run jobs -- list failed sync`.
- **Fix:** retry failed jobs once the cause is fixed (planned: `npm run jobs -- retry sync --all`; until then, `Queue.retryJobs()` from a Node REPL). Mark orphaned `SyncJob` rows `failed` so the UI stops showing them as running: `UPDATE "SyncJob" SET status = 'failed', error = 'stalled', "finishedAt" = now() WHERE status = 'running' AND "startedAt" < now() - interval '1 hour';`

## Postgres and pgvector

### pgvector extension missing

- **Symptom:** a migration or query fails with `type "vector" does not exist` or `operator does not exist: vector <=> vector`.
- **Check:** `docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT extname, extversion FROM pg_extension;"`. Also confirm the image is `pgvector/pgvector:pg16` and not plain `postgres`.
- **Fix:** `CREATE EXTENSION IF NOT EXISTS vector;` (the first Prisma migration will include it). If the image is wrong, fix `docker-compose.yml`; the data volume is compatible as long as the Postgres major version matches.

### Postgres is down or full

- **Symptom:** the API returns 500s, and logs show `ECONNREFUSED postgres:5432` or `could not extend file … No space left on device`.
- **Check:** `docker compose ps postgres`, `docker compose logs --tail 100 postgres`, `df -h` on the Docker data root.
- **Fix:** restart the container. For disk, free space or grow the volume, then check that the backup job still prunes old dumps.

### Slow vector search

- **Symptom:** the search step in chat timings goes over about 50 ms.
- **Check:** `EXPLAIN ANALYZE` the search query (with the user's ID) and confirm it uses the HNSW index.
- **Fix:** `REINDEX INDEX CONCURRENTLY <hnsw index>` after a large bulk load. Tune `hnsw.ef_search`. Run `VACUUM ANALYZE "EventEmbedding"`.
