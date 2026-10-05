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

7. Run the frontend (optional):

   ```bash
   npm run dev -w @growthtrace/frontend
   ```

   Open http://localhost:3000 for the placeholder dashboard and http://localhost:3000/design for the Aurora design system.

Backend (`backend/`) scaffolding begins in Week 1 — see the timeline in [BRD.md](BRD.md#8-timeline--milestones). Until then it holds a placeholder `src/index.ts` so the quality scripts below have something to check.

## Quality scripts

The repo is a single npm workspace root that owns every quality tool, so all of these run from the root:

| Script                           | What it does                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run lint`                   | ESLint across every workspace. Warnings fail (`--max-warnings=0`).                   |
| `npm run lint:fix`               | Same, with auto-fixes applied.                                                       |
| `npm run lint:styles`            | Stylelint on the design-system CSS: no raw colours or sizes outside the token block. |
| `npm run check:styles`           | Fails if any stylesheet exists outside `packages/design-system/`.                    |
| `npm run format`                 | Prettier writes every file (Tailwind classes get sorted).                            |
| `npm run format:check`           | Prettier in check-only mode, used by `verify`.                                       |
| `npm run typecheck`              | `tsc --noEmit` in each workspace.                                                    |
| `npm run test`                   | Vitest unit tests in each workspace.                                                 |
| `npm run test:responsive`        | Playwright, Chromium: every route at every width in `e2e/viewports.ts` (see below).  |
| `npm run test:responsive:all`    | The same in Chromium, WebKit and Firefox (what CI runs).                             |
| `npm run test:responsive:update` | Regenerates screenshot baselines in the Playwright Docker image.                     |
| `npm run clean:check`            | knip — unused files, exports and dependencies.                                       |
| `npm run verify`                 | All of the above in order, stopping at the first failure.                            |

**Run `npm run verify` before opening a PR.** It is the single gate that says the branch is healthy.

Shared TypeScript, ESLint, Prettier and Stylelint configs live in `packages/config`; the root `eslint.config.js`, `prettier.config.js`, `stylelint.config.js` and `tsconfig.base.json` just re-export them.

`test:responsive` starts its own Next.js dev server on port 3100 (or reuses one already on 3100), with a separate build dir (`.next-e2e`), so it runs fine while `npm run dev` is up. It also starts a stub API on port 3101 (`e2e/fixtures/server.ts`) that serves `e2e/fixtures/routes/*.json` and answers 501 to anything without a fixture, so the backend is never needed. Run `npx playwright install chromium` once before the first run.

## Responsive check

`e2e/responsive.spec.ts` loads every route in `routes` (`e2e/viewports.ts`) at every viewport, from 320px phones to 3840px (the two widest rows are Chromium-only), and fails on:

- horizontal page scroll, or any element sticking out past the viewport;
- text clipped by an `overflow: hidden` box (ellipsis with a `title` is allowed);
- tap targets under 44×44px on touch rows (≤768px). Exempt with `data-tap-exempt="<reason>"`, documented in the design-system README;
- `[data-chart]` wider than its container, or a `DataTable` showing the wrong mode for the width;
- any axe violation (WCAG 2.0/2.1/2.2 A and AA);
- in CI only, a screenshot diff over 1% against `e2e/__screenshots__/<browser>/`.

A new page needs only an entry in `routes`.

**Pre-commit.** Husky runs `npm run test:responsive` when a commit stages files under `frontend/`, `packages/design-system/` or `e2e/`, and skips it otherwise. `npm install` sets the hook up (`prepare: husky`).

**CI** (`.github/workflows/ci.yml`) runs `verify` and a `responsive` job per browser inside the Playwright Docker image. Failed runs upload `playwright-report/` and `test-results/` as artifacts, including screenshot diffs.

### Updating screenshot baselines

Fonts render differently on every OS, so baselines are only ever generated in the Playwright Docker image, pinned to the same version as `@playwright/test` (`mcr.microsoft.com/playwright:v1.63.0-noble`). Local runs skip the screenshot assertion; it runs only when `PW_VISUAL=1`, which the Docker script and CI set.

```sh
npm run test:responsive:update   # all 3 browsers; writes e2e/__screenshots__/
```

Review the changed PNGs, then commit them with the UI change. When you bump `@playwright/test`, bump the image tag in `package.json` and `.github/workflows/ci.yml` too, then regenerate.

## Styling

All UI comes from `@growthtrace/design-system` (Aurora). Lint rejects anything else: palette or arbitrary Tailwind classes, `style={{}}`, raw colours, stray CSS files and inline animations, and `eslint-disable` can't switch those rules off. See [packages/design-system/README.md](packages/design-system/README.md) and [CLAUDE.md](CLAUDE.md).

## Repo layout

- `backend/` — Fastify API (Node.js)
- `frontend/` — Next.js dashboard
- `packages/config/` — shared TypeScript, ESLint, Prettier and Stylelint configs, plus the Aurora lint rules
- `packages/design-system/` — Aurora design system (`@growthtrace/design-system`): tokens, motion presets, components
- `docs/adr/` — architecture decision records
- `docker-compose.yml` — local dev infra (Postgres+pgvector, Redis, Ollama)
