# Testing

Two layers: Vitest unit tests in each workspace, and Playwright checks of every page at every viewport. Both run as part of `npm run verify` (see [quality gates](quality-gates.md)).

## Unit tests (Vitest)

`npm run test` runs `vitest run` in every workspace that defines a `test` script:

| Workspace                | What's covered                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `backend`                | `src/app.test.ts`: `/health` response, the stub fixture validates against the real schema, every route has a response schema |
| `packages/design-system` | Token CSS/TS parity (`tokens.test.ts`), WCAG contrast pairs (`contrast.test.ts`), `cn()` merging                             |
| `packages/config`        | `test/enforcement.test.ts`: every Aurora lint rule fires on its bad fixture and passes its good one                          |

Run one workspace with `npm run test -w @growthtrace/backend`, or watch mode with `npx vitest` inside the workspace.

Tests sit next to the code as `*.test.ts`. For the backend, test routes through `buildApp()` and `app.inject()`, never by listening on a port:

```ts
const app = await buildApp();
const response = await app.inject({ method: 'GET', url: '/health' });
expect(response.statusCode).toBe(200);
```

## Responsive and accessibility checks (Playwright)

| Script                           | Runs                                                                       |
| -------------------------------- | -------------------------------------------------------------------------- |
| `npm run test:responsive`        | Chromium only. Used by `verify` and pre-commit                             |
| `npm run test:responsive:all`    | Chromium, WebKit and Firefox (what CI runs, one job per browser)           |
| `npm run test:responsive:update` | Regenerates screenshot baselines inside the pinned Playwright Docker image |

Run `npx playwright install chromium` once before the first local run (`--with-deps` on a fresh Linux machine).

The specs in `e2e/`:

- `responsive.spec.ts`: every route × every viewport (layout, tap targets, axe, screenshots). See [design-system/responsive.md](../design-system/responsive.md).
- `design.spec.ts`: the `/design` living style guide renders every section.
- `app-shell.spec.ts`: sidebar vs. bottom tab bar, skip link.
- `focus-ring.spec.ts`: the focus ring is visible on `bg`, `surface` and `surface-raised`.

Playwright starts its own servers (`playwright.config.ts`), so it runs fine next to `npm run dev`:

- Next.js dev server on **3100** with a separate build dir (`NEXT_DIST_DIR=.next-e2e`).
- A stub API on **3101** (`e2e/fixtures/server.ts`). Locally an already-running server on either port is reused.

### The stub API and fixtures

Tests never call the real backend. The stub serves `e2e/fixtures/routes/<path>.json` for `GET /<path>` and answers **501** for anything else, so a page that calls a new endpoint without a fixture fails loudly. `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` point Next at the stub, and `mockApi()` in `e2e/helpers.ts` blocks the real API origin as a safety net.

To add a fixture for a new endpoint:

1. Add the route and its response schema in `backend/src/routes/`, then run `npm run docs:api`.
2. Create `e2e/fixtures/routes/<path>.json` (nested paths become folders: `GET /me/stats` → `routes/me/stats.json`) with a body that matches the response schema in [`docs/api/openapi.json`](../api/openapi.json).
3. Add a backend unit test that validates the fixture against the route schema, as `app.test.ts` does for `health.json`. That keeps the stub and the real API from drifting apart.

## Screenshot baselines

Screenshots are compared only when `PW_VISUAL=1` (CI and the Docker update script), because fonts render differently on every OS. See [Updating screenshot baselines](../design-system/responsive.md#updating-screenshot-baselines).

## API docs check

`npm run docs:api:check` regenerates the OpenAPI document and `endpoints.md` in memory and fails if they differ from the committed files. It works like a test for the docs: change a route schema, and `verify` fails until you run `npm run docs:api`.
