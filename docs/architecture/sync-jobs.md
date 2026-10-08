# Sync jobs

> Status: Planned (per FRD §4 and the BRD Week 2 milestone). Update when the BullMQ queues and workers land.

Covers: BR-2, BR-6, FR-1.5, FR-2.1–2.6, FR-3.1–3.3, FR-5.3, NFR-4, NFR-6.

Syncing pulls a user's GitHub activity into `Event` rows and then queues the embedding of each new event. It runs in BullMQ workers, backed by Redis, so the API stays responsive and failures can be retried.

## Queues and job types

| Queue   | Job     | Payload               | Enqueued by                                        | Does                                                                   |
| ------- | ------- | --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `sync`  | `sync`  | `{ userId, reason }`  | first login, `POST /sync`, the repeatable schedule | Fetches new GitHub activity since the last cursor and upserts `Event`s |
| `embed` | `embed` | `{ userId, eventId }` | the sync worker, once per new or changed event     | Summarises the event (FR-3.1), embeds it, upserts `EventEmbedding`     |

`reason` is `login`, `manual` or `scheduled`, and is used for logs and `SyncJob` history only. Scheduled syncs are BullMQ _job schedulers_ (repeatable jobs), one per user, every few hours, added at login and removed on account deletion.

## Fairness between users (FR-2.6)

One user's large backfill must not starve everyone else. Each user has at most one active `sync` job (job ID `sync:<userId>`). A sync pages through GitHub in bounded slices (for example 10 pages), then re-queues itself to continue from its cursor. Other users' jobs run between slices instead of waiting behind a long backfill. Worker concurrency is a small fixed number, so no single user can occupy every slot for long.

## Lifecycle and status

`POST /sync` inserts a `SyncJob` row (`queued`) and adds the job. The worker moves the row through `running`, then one of:

| Status      | Meaning                                                                | `SyncStatus` UI                |
| ----------- | ---------------------------------------------------------------------- | ------------------------------ |
| `succeeded` | Every item processed                                                   | `synced`                       |
| `partial`   | Some items failed after retries; the rest were saved (NFR-4)           | `synced` with a warning detail |
| `failed`    | The job couldn't run at all (token revoked, GitHub down after retries) | `error`                        |

`GET /me` returns the latest `SyncJob`, which drives `SyncStatus` and **Sync now** (FR-5.3).

## GitHub rate limits

GitHub enforces two kinds of limit, and the client handles both from the first version (a BRD risk mitigation):

- **Primary limit:** 5,000 requests/hour per OAuth token. Every response carries `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-used` and `x-ratelimit-reset` (epoch seconds). The client records them per user in Redis. When `remaining` drops below a small reserve (say 50), the job stops fetching, saves its cursor, and re-queues itself with a delay until `reset`.
- **Secondary limits:** these guard against bursts and concurrency. A `403` or `429` with `retry-after` means wait that many seconds. Without `retry-after`, wait at least 60 seconds, then back off exponentially. To avoid triggering them, requests for one user are sequential (worker concurrency is per user: one active `sync` job per `userId`, guaranteed by the job ID `sync:<userId>`), and there's a global cap on parallel GitHub requests across users.
- Use conditional requests (`If-None-Match` with the stored `ETag`) where GitHub supports them. A `304` doesn't count against the primary limit.

## Idempotency

Re-running a sync must never duplicate or lose events (BR-6, FR-3.3):

- **Dedupe key:** `Event` is unique on (`userId`, `githubEventId`), and the worker writes with `upsert`. Re-fetching an overlapping page is harmless.
- **Cursor:** each user stores the newest `occurredAt`/ETag it has fully processed. The cursor only moves forward after its page is saved, so a crash re-fetches at most one page.
- **One sync per user at a time:** the job ID `sync:<userId>` makes BullMQ ignore a second add while one is waiting or active. **Sync now** while a sync runs returns the existing job.
- **Embeddings:** `embed` jobs use the job ID `embed:<eventId>`, and `EventEmbedding` is unique on `eventId` (upsert). The job skips the event if its stored `summaryText` hash and `model` haven't changed.
- **Deleted users:** every job first checks that the `User` still exists, and exits successfully if not.

## Partial failure (NFR-4)

A single failed request must not fail the whole sync:

- Pages and items are processed independently. A failure fetching one repo's commits, or one malformed event, is retried **in-line** (up to 3 times, with exponential backoff and jitter, honouring `retry-after`), then recorded and skipped.
- The job finishes as `partial` with `itemsOk`/`itemsFailed` counts and a short, token-free error summary.
- The job **fails as a whole** (and BullMQ retries it) only for errors that affect everything: the token was rejected (`401`), GitHub is unreachable, or the database is down.

## Retry, backoff and dead letters

| Setting                 | `sync`                                 | `embed`                |
| ----------------------- | -------------------------------------- | ---------------------- |
| `attempts`              | 5                                      | 5                      |
| `backoff`               | exponential, 30s base                  | exponential, 10s base  |
| Per-item in-job retries | 3 (with jitter, honours `retry-after`) | n/a (one item per job) |
| `removeOnComplete`      | keep last 100                          | keep last 1,000        |
| `removeOnFail`          | keep (for inspection)                  | keep                   |

When a job runs out of attempts, BullMQ moves it to the queue's **failed** set. That set is the dead-letter queue: nothing deletes it automatically. The worker's `failed` event marks the `SyncJob` `failed` and logs `userId`, job ID and error class (never the token). The [runbook](../operations/runbook.md#redis-and-bullmq) covers inspecting and retrying failed jobs.

**`401` from GitHub is not retried.** The token was revoked or expired, so retrying can't help. The job fails immediately and marks the account `reconnect required`, and the UI asks the user to sign in again.
