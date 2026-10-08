# GrowthTrace API

Fastify backend. Today it serves `GET /health` and the OpenAPI pipeline. Auth, Prisma, sync
workers and RAG follow the [BRD timeline](../docs/product/BRD.md#8-timeline--milestones); the
requirements are in the [FRD](../docs/product/FRD.md) and the planned design in
[docs/architecture/](../docs/architecture/overview.md).

```bash
npm run dev -w @growthtrace/backend   # http://localhost:4000/health
npm run docs:api                      # regenerate docs/api/ after changing a route schema
```

- `src/app.ts`: `buildApp()` registers `@fastify/swagger` and every route, without listening.
  Tests use it with `app.inject()`. It throws if a route has no `schema.response`.
- `src/routes/`: one Fastify plugin per area, with TypeBox schemas.
- `src/server.ts`: local entrypoint (listens on `PORT`, default 4000).
- `scripts/generate-api-docs.ts`: writes [docs/api/](../docs/api/endpoints.md) from the schemas.
