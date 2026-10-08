# ADR 0003: Quality gates and tooling

Status: Accepted
Date: 2026-10-08

## Context

GrowthTrace is built by one person with coding agents as frequent contributors. Agents produce a lot of plausible code quickly, and there is no second human reviewer. The project needs **one trustworthy gate**: a single command that, when it passes, means the branch is healthy, and that runs the same way on a laptop, in a git hook and in CI. The same applies to documentation: docs have to stay accurate as the code moves, without relying on someone remembering.

## Decision

### Workspace and toolchain

- npm workspaces (`backend`, `frontend`, `packages/*`) with a **root-owned toolchain**: ESLint, Prettier, Stylelint, TypeScript, Vitest, Playwright, knip and markdownlint are root devDependencies, so every tool has one version.
- Shared configs live in `packages/config` (`tsconfig.base.json`, ESLint flat config with the Aurora rules, Prettier, Stylelint). The root config files re-export them.

### One gate: `npm run verify`

Runs in order and stops at the first failure: Prettier check → ESLint (`--max-warnings=0`) → markdownlint → Stylelint → `check:styles` → `check:links` (lychee, offline) → `tsc` per workspace → Vitest per workspace → `docs:api:check` → Playwright + axe (Chromium) → knip. Playwright runs every route at every viewport. CI also runs it in Chromium, WebKit and Firefox, with screenshot baselines generated only in the pinned Playwright Docker image so fonts render identically.

### Hooks and CI

- Husky pre-commit, **scoped by path**: the responsive check only when `frontend/`, `packages/design-system/` or `e2e/` is staged; markdownlint + offline lychee only on staged `.md` files. Other commits run nothing.
- CI (`ci.yml`) mirrors `verify` (job `verify`), adds the 3-browser `responsive` matrix and a fast `docs` job. A scheduled `sweep.yml` checks external links daily and opens an issue on failure.

### Docs gates

- **markdownlint-cli2**, extending `markdownlint/style/prettier`, so it never fights Prettier over formatting.
- **lychee** for links: offline (relative links and `#anchors`) in `verify`, pre-commit and CI; online (external URLs) in the daily sweep. `check:links` goes through `scripts/check-links.sh`, which fails with install instructions when lychee is missing, so the gate behaves the same everywhere.
- **Generated API docs:** Fastify route schemas are written in **TypeBox** (`typebox` + `@fastify/type-provider-typebox`), which produces plain JSON Schema: Fastify's validation format and `@fastify/swagger`'s input, with no conversion layer. `backend/scripts/generate-api-docs.ts` (run with **tsx**) builds the app, takes `app.swagger()` (OpenAPI 3.1) and writes `docs/api/openapi.json` + `endpoints.md`, sorted and Prettier-formatted so output is deterministic. `docs:api:check` regenerates in memory and fails on any difference. `buildApp()` refuses to register a route without a response schema.

## Alternatives considered

- **Turborepo or Nx.** Task caching and graphs pay off with many packages and slow builds. With four workspaces and no build step in the gate, they would add config and a second mental model for little gain. Revisit if `verify` gets slow.
- **Biome** instead of ESLint + Prettier. Faster, but it can't host our custom Aurora rules or `better-tailwindcss`, which are the point of the lint setup.
- **lint-staged on every file.** Running linters only on staged files is fast but gives partial answers (type errors and unused exports are whole-program properties). We keep `verify` as the full gate and scope hooks by _path_ instead, running whole checks only when they're relevant.
- **Percy or Chromatic** for visual diffs. Hosted, paid and external. Docker-pinned Playwright screenshots in the repo give deterministic diffs with no service.
- **Zod (`fastify-type-provider-zod`)** for schemas. Nicer ergonomics, but it needs a Zod-to-JSON-Schema transform before OpenAPI, which adds a layer between the schema and the docs.
- **Node's built-in TypeScript stripping** to run the generator. It can't resolve the NodeNext-style `./app.js` imports to `.ts` sources without changing the backend's import convention, so we use `tsx`.

## Consequences

- Commits touching UI pay for a Chromium Playwright run in pre-commit (it reuses a dev server already running on port 3100). Docs-only and backend-only commits stay fast.
- Updating screenshot baselines requires Docker (`npm run test:responsive:update`).
- **lychee is an external Rust binary**, not an npm package. Contributors install it once (brew, cargo or the release binary), and CI installs a pinned version (`LYCHEE_VERSION` in `ci.yml` and `sweep.yml`).
- Every API change has to commit regenerated docs, or `verify` fails. Every route needs a schema, or the app won't start.
- Changes to scripts, hooks, CI or `packages/config` update [quality-gates.md](../development/quality-gates.md), plus a new ADR when they change a decision recorded here.
