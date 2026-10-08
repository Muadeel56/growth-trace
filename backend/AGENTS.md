# Backend rules

These add to the root [AGENTS.md](../AGENTS.md); they don't repeat it.

- **Tenancy.** Every Prisma query on user-owned data filters by `userId` taken from the authenticated session, never from the request body, params or query string. See [multi-tenancy](../docs/architecture/multi-tenancy.md).
- **Schema changes.** Prisma schema changes go through a migration, need approval before you start, and update [data-model.md](../docs/architecture/data-model.md) and [multi-tenancy.md](../docs/architecture/multi-tenancy.md) in the same PR.
- **Logging.** Never log OAuth tokens, session secrets, prompts or LLM completions, not even at debug level.
- **Routes.** Every route has a TypeBox schema with `response`. After changing a route, run `npm run docs:api` and commit `docs/api/` with the change.
- **RAG.** The retrieval and chat path doesn't use LangChain ([ADR 0001](../docs/adr/0001-llm-embeddings-provider.md), [RAG pipeline](../docs/architecture/rag-pipeline.md)).
