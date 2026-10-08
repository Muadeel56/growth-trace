# Quality gates

**`npm run verify` is the single gate.** If it passes, the branch is healthy. Run it before opening a PR. CI runs the same command. The reasoning behind the setup is in [ADR 0003](../adr/0003-quality-gates-and-tooling.md).

Every tool is a root devDependency, and every script runs from the repo root. Shared configs live in `packages/config`; the root `eslint.config.js`, `prettier.config.js`, `stylelint.config.js` and `tsconfig.base.json` re-export them.

## Scripts

| Script                           | What it does                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run format`                 | Prettier writes every file (Tailwind classes get sorted)                                             |
| `npm run format:check`           | Prettier in check-only mode                                                                          |
| `npm run lint`                   | ESLint across every workspace. Warnings fail (`--max-warnings=0`). Includes the Aurora styling rules |
| `npm run lint:fix`               | Same, with auto-fixes applied                                                                        |
| `npm run lint:md`                | markdownlint-cli2 on every `*.md` (`.markdownlint-cli2.jsonc`, Prettier-compatible)                  |
| `npm run lint:styles`            | Stylelint on the design-system CSS: no raw colours or sizes outside the token block                  |
| `npm run check:styles`           | Fails if any stylesheet exists outside `packages/design-system/`                                     |
| `npm run check:links`            | lychee, **offline**: relative links and `#anchors` in every Markdown file (`lychee.toml`)            |
| `npm run check:links:remote`     | lychee, **online**: the same plus every external URL. Slow; the daily sweep runs it                  |
| `npm run typecheck`              | `tsc --noEmit` in each workspace                                                                     |
| `npm run test`                   | Vitest unit tests in each workspace ([testing](testing.md))                                          |
| `npm run docs:api`               | Regenerates `docs/api/openapi.json` and `docs/api/endpoints.md` from the Fastify schemas             |
| `npm run docs:api:check`         | Regenerates in memory and fails if the committed API docs are stale                                  |
| `npm run test:responsive`        | Playwright, Chromium: every route at every width ([responsive](../design-system/responsive.md))      |
| `npm run test:responsive:all`    | The same in Chromium, WebKit and Firefox                                                             |
| `npm run test:responsive:update` | Regenerates screenshot baselines in the Playwright Docker image                                      |
| `npm run clean:check`            | knip: unused files, exports and dependencies                                                         |
| `npm run verify`                 | The gate (below), stopping at the first failure                                                      |

`verify` runs, in this order: `format:check` → `lint` → `lint:md` → `lint:styles` → `check:styles` → `check:links` → `typecheck` → `test` → `docs:api:check` → `test:responsive` → `clean:check`. The fast, static checks come first.

## What runs where

| Check                          | Pre-commit            | `verify` | CI (`ci.yml`)            | Daily sweep (`sweep.yml`) |
| ------------------------------ | --------------------- | -------- | ------------------------ | ------------------------- |
| Prettier                       |                       | ✓        | ✓ `verify`               |                           |
| ESLint (+ Aurora rules)        |                       | ✓        | ✓ `verify`               |                           |
| markdownlint                   | ✓ staged `.md` files  | ✓        | ✓ `verify`, `docs`       | ✓                         |
| Stylelint, `check:styles`      |                       | ✓        | ✓ `verify`               |                           |
| Links + anchors, offline       | ✓ staged `.md` files  | ✓        | ✓ `verify`, `docs`       |                           |
| Links, external URLs           |                       |          |                          | ✓                         |
| TypeScript                     |                       | ✓        | ✓ `verify`               |                           |
| Vitest                         |                       | ✓        | ✓ `verify`               |                           |
| `docs:api:check`               |                       | ✓        | ✓ `verify`, `docs`       | ✓                         |
| Playwright + axe, Chromium     | ✓ if UI paths staged¹ | ✓        | ✓ `verify`, `responsive` |                           |
| Playwright, WebKit + Firefox   |                       |          | ✓ `responsive`           |                           |
| Screenshot diffs (`PW_VISUAL`) |                       |          | ✓ `responsive`           |                           |
| knip                           |                       | ✓        | ✓ `verify`               |                           |

¹ UI paths: `frontend/`, `packages/design-system/`, `e2e/`. A commit that touches neither UI paths nor `.md` files runs no hook checks at all.

## Pre-commit hook

`.husky/pre-commit` is installed by `npm install` / `npm ci` (`prepare: husky`). It has two blocks, each scoped by the staged paths:

1. **Responsive:** `npm run test:responsive` when anything under `frontend/`, `packages/design-system/` or `e2e/` is staged. A dev server already running on port 3100 is reused.
2. **Docs:** for staged `*.md` files only, `markdownlint-cli2 <files>` and then `scripts/check-links.sh <files>` (lychee, offline, with `--include-fragments`). A broken relative link or heading anchor blocks the commit.

To skip the hook in an emergency, use `git commit --no-verify`. CI runs the same checks, so it's only a delay.

## Installing lychee

lychee is a Rust binary, not an npm package, so `npm ci` doesn't install it. `check:links` (and therefore `verify`) and the docs pre-commit block fail with install instructions when it's missing:

```bash
brew install lychee          # macOS / Linuxbrew
cargo install lychee         # anywhere with Rust
```

Or download the Linux binary from the [releases page](https://github.com/lycheeverse/lychee/releases/latest) (`lychee-x86_64-unknown-linux-musl.tar.gz`) and put `lychee` on your `PATH` (for example `~/.local/bin`). CI pins **v0.24.2** (`LYCHEE_VERSION` in `ci.yml` and `sweep.yml`).

The decision was to keep `check:links` **inside** `verify`, failing clearly when lychee is missing, rather than leaving it to CI. That way a broken link shows up locally before the PR, and `verify` means the same thing on every machine.

## Link-check configuration

`lychee.toml`:

- `include_fragments`: anchors such as `BRD.md#8-timeline--milestones` must match a real heading.
- Excluded: `localhost` / `127.0.0.1` URLs (dev servers aren't running) and `github.com/settings/…` pages (they need a login).
- Accepted: `200..=206` and `429` (rate-limited isn't broken).
- Cache: `.lycheecache` (gitignored), max age one day. The sweep restores it between runs.
- Skipped files: `node_modules`, and `frontend/AGENTS.md` (written by `next dev`).

## CI

- **`verify`:** installs Playwright Chromium and lychee, then runs `npm run verify`. On failure it uploads the Playwright report.
- **`docs`:** `lint:md`, `docs:api:check` and offline lychee (`lycheeverse/lychee-action`). It finishes in about a minute, so docs-only PRs get quick feedback.
- **`responsive`:** Playwright per browser inside `mcr.microsoft.com/playwright:v1.63.0-noble`, with screenshot diffs.

## Daily sweep

`.github/workflows/sweep.yml` runs at 06:00 UTC and on manual dispatch (Actions → Daily sweep → Run workflow). Jobs: `markdownlint`, `links (external)` (online lychee, cached) and `docs:api:check`. If any fails, the `report` job opens an issue titled **Daily sweep failed** with the `documentation` label, or updates the open one, and attaches the lychee report.

To add a sweep check (for example the full browser matrix or `npm audit`): add a job, add its id to `report.needs`, and add a row for it in the report body step.

## Generated API docs

`docs/api/` is generated; never edit it by hand. The pipeline: `backend/src/app.ts` `buildApp()` registers `@fastify/swagger` (OpenAPI 3.1) and the routes, and `backend/scripts/generate-api-docs.ts` writes the sorted spec plus a Markdown rendering. Change a route schema, run `npm run docs:api`, and commit both files with the change.
