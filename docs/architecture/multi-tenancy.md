# Multi-tenancy and data isolation

> Status: Planned (per FRD §1, §9 and NFR-2). Update when the Prisma client and auth middleware land.

Covers: BR-3, NFR-2, NFR-6, FR-3.4.

GrowthTrace is multi-tenant with a shared database: every user's data lives in the same tables, separated by `userId`. There is no admin view and no cross-user feature (FRD §11), so the rule is absolute: **no code path may return another user's rows**.

## The rules

1. **`userId` comes from the session, never from request input.** The auth hook resolves the session cookie to a `userId` and attaches it to the request (`request.userId`). Route params, query strings, bodies and headers never carry a `userId` to be trusted. Routes are shaped as `/me`, `/events` and `/stats`, not `/users/:id/events`.
2. **Every query on `Event`, `EventEmbedding`, `SyncJob`, `ChatMessage`, `GithubAccount` and the user profile is scoped by that `userId`.** That includes reads, updates and deletes. Updating by primary key alone (`where: { id }`) is not allowed; use `where: { id, userId }`.
3. **Vector search filters inside the query,** not after it (see below).
4. **Background jobs carry `userId` in their payload,** and workers scope every query by it, exactly as routes do.
5. **Logs and errors never include another user's data,** tokens or full prompts (NFR-6). Log `userId` and IDs, not content.

## How it will be enforced

Rules 1 and 2 are enforced in code, not by convention.

**A tenant-scoped Prisma client.** Route handlers and workers never import the raw `PrismaClient`. They get `db.forUser(userId)`, a Prisma client extension that:

- injects `userId` into `where` for `findMany`, `findFirst`, `findUnique`, `count`, `aggregate`, `update(Many)`, `delete(Many)` and `upsert` on tenant-owned models;
- injects `userId` into `data` for `create(Many)`;
- throws if a caller passes a _different_ `userId` than the one it was created with.

The raw client is used only in the auth module (to look up a user by `githubId`) and in migrations. An ESLint `no-restricted-imports` rule restricts the raw client import to those paths.

```ts
// Planned shape
fastify.get('/events', { schema }, async (request) => {
  const db = request.db; // = prisma.forUser(request.userId), set by the auth hook
  return db.event.findMany({ orderBy: { occurredAt: 'desc' }, take: 50 });
  // → WHERE "userId" = $1 is added by the extension
});
```

Postgres row-level security was considered as a second layer. It is not planned for v1, because the Prisma connection pool would need `SET app.user_id` per transaction. It's worth revisiting if raw SQL usage grows.

## Vector search scoping

Raw SQL for pgvector bypasses the Prisma extension, so it lives in one function, `searchEmbeddings(userId, queryVector, k)`, and that function always puts the tenant filter in the same statement:

```sql
SELECT e.id, e."summaryText", e."occurredAt", 1 - (v.vector <=> $2) AS score
FROM "EventEmbedding" v
JOIN "Event" e ON e.id = v."eventId" AND e."userId" = $1
WHERE v."userId" = $1
ORDER BY v.vector <=> $2
LIMIT $3;
```

Filtering **after** retrieval (fetch the global top-k, then drop other users' rows) is wrong twice over: it leaks other tenants' data into application memory, and it returns too few results whenever other users' vectors are nearer. With an HNSW index, set `hnsw.ef_search` high enough, or use pgvector's iterative index scans, so the filtered query still finds k rows. See the [RAG pipeline](rag-pipeline.md#3-retrieve).

## Jobs

Job payloads are `{ userId, … }` and nothing else that identifies a user. Workers:

- build `db.forUser(job.data.userId)` first, and use it for every query;
- load the GitHub token for that `userId` only, and drop it when the job finishes;
- use job IDs that include `userId` (`sync:<userId>`), so one user can't enqueue or dedupe away another user's job.

## Testing

Isolation gets a dedicated test suite, run in `npm run test` against a real Postgres (Testcontainers or the compose database):

- **Cross-tenant read:** seed users A and B with events, embeddings, sync jobs and chat. As A, call every route and every repository function. Assert that none of B's IDs appear in any response.
- **Cross-tenant write:** as A, try to update or delete B's rows by ID. Assert zero rows are affected and that B's data is unchanged.
- **Vector search:** give B a vector identical to A's query. Assert A's top-k still contains only A's events.
- **Jobs:** run a sync job for A and assert that no row with `userId = B` was written.
- **Route audit:** a test walks every registered route and fails if its handler doesn't run behind the auth hook (except an explicit allowlist such as `/health` and `/auth/*`).

The BRD success criteria also require a manual check with two real GitHub accounts before launch.
