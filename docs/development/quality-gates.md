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
| `npm run check:secrets`          | gitleaks on staged changes; `-- --all` scans the whole history ([secret scanning](#secret-scanning)) |
| `npm run verify`                 | The gate (below), stopping at the first failure                                                      |

`verify` runs, in this order: `format:check` → `lint` → `lint:md` → `lint:styles` → `check:styles` → `check:links` → `typecheck` → `test` → `docs:api:check` → `test:responsive` → `clean:check`. The fast, static checks come first.

## What runs where

| Check                          | Pre-commit            | Pre-push | `verify` | CI (`ci.yml`)            | Daily sweep (`sweep.yml`) |
| ------------------------------ | --------------------- | -------- | -------- | ------------------------ | ------------------------- |
| Not on `main`                  | ✓                     |          |          | branch protection²       |                           |
| Prettier                       | ✓ staged files        |          | ✓        | ✓ `verify`               |                           |
| ESLint (+ Aurora, no-console)  | ✓ staged files        |          | ✓        | ✓ `verify`               |                           |
| Secrets (gitleaks)             | ✓ staged changes      |          |          | ✓ `secrets` (history)    |                           |
| markdownlint                   | ✓ staged `.md` files  |          | ✓        | ✓ `verify`, `docs`       | ✓                         |
| Stylelint, `check:styles`      |                       |          | ✓        | ✓ `verify`               |                           |
| Links + anchors, offline       | ✓ staged `.md` files  |          | ✓        | ✓ `verify`, `docs`       |                           |
| Links, external URLs           |                       |          |          |                          | ✓                         |
| TypeScript                     |                       |          | ✓        | ✓ `verify`               |                           |
| Vitest                         |                       |          | ✓        | ✓ `verify`               |                           |
| `docs:api:check`               |                       |          | ✓        | ✓ `verify`, `docs`       | ✓                         |
| Playwright + axe, Chromium     | ✓ if UI paths staged¹ |          | ✓        | ✓ `verify`, `responsive` |                           |
| Playwright, WebKit + Firefox   |                       |          |          | ✓ `responsive`           |                           |
| Screenshot diffs (`PW_VISUAL`) |                       |          |          | ✓ `responsive`           |                           |
| knip                           |                       | ✓        | ✓        | ✓ `verify`               |                           |

¹ UI paths: `frontend/`, `packages/design-system/`, `e2e/`.
² Hooks can be skipped locally (`--no-verify`); [branch protection](#branch-protection) is the layer that can't be.

## Git hooks

Husky installs them on `npm install` / `npm ci` (`prepare: husky`).

**`.husky/pre-commit`**, in order, stopping at the first failure:

1. **Not on `main`:** refuses to commit on `main`.
2. **lint-staged:** Prettier (`--write`) and ESLint (`--max-warnings=0`, so the Aurora rules and `no-console`) on the staged files only. The config is the `lint-staged` key in the root `package.json`.
3. **Secrets:** `scripts/check-secrets.sh` runs `gitleaks git --staged` ([secret scanning](#secret-scanning)).
4. **Responsive:** `npm run test:responsive` when anything under `frontend/`, `packages/design-system/` or `e2e/` is staged. A dev server already running on port 3100 is reused.
5. **Docs:** for staged `*.md` files only, `markdownlint-cli2 <files>` and then `scripts/check-links.sh <files>` (lychee, offline, with `--include-fragments`). A broken relative link or heading anchor blocks the commit.

**`.husky/pre-push`** runs knip (`npm run clean:check`). It takes too long for every commit, and CI `verify` runs it again.

Don't skip hooks (`--no-verify`, `HUSKY=0`). CI runs the same checks and branch protection blocks the merge, so skipping only moves the failure later. Agents may not skip them at all ([AGENTS.md](../../AGENTS.md#-never)).

## No console output

ESLint's `no-console` is an error everywhere except CLI scripts (`backend/scripts/`, `packages/config/scripts/`, `scripts/`, `e2e/`): the `consoleFiles` allowlist in `packages/config/eslint.config.js`. The backend logs through Fastify's logger instead. Like the styling rules it is in `lockedRules`, so an `eslint-disable` comment can't switch it off.

## Secret scanning

[gitleaks](https://github.com/gitleaks/gitleaks) looks for tokens, keys and passwords using its default rules plus `.gitleaks.toml`, which allowlists only the env example file, the lockfile, screenshot baselines and the generated OpenAPI file.

- **Pre-commit:** `scripts/check-secrets.sh` scans the staged changes.
- **CI `secrets` job:** checks out the full history and runs `scripts/check-secrets.sh --all`, so a secret that was committed and later deleted still fails.

gitleaks is a Go binary, so `npm ci` doesn't install it. The script fails with install steps when it's missing ([troubleshooting](troubleshooting.md#gitleaks-not-installed)). CI pins **8.30.1** (`GITLEAKS_VERSION` in `ci.yml`).

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
- **`secrets`:** gitleaks over the full git history.

## Branch protection

Git hooks run on the contributor's machine and can be skipped, so `main` is protected on GitHub. It is the only layer that `--no-verify` can't get around:

- Changes land through a PR; direct pushes are rejected.
- Required checks: `verify`, `docs`, `secrets`, `responsive (chromium)`, `responsive (webkit)` and `responsive (firefox)`, with the branch up to date with `main`.
- Force-pushes and branch deletion are blocked, and the rule applies to admins too.

To apply or restore it (needs repo admin):

```bash
gh api -X PUT repos/Muadeel56/growth-trace/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["verify", "docs", "secrets", "responsive (chromium)", "responsive (webkit)", "responsive (firefox)"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

Check it with `gh api repos/Muadeel56/growth-trace/branches/main/protection`. When a CI job is added or renamed, update `contexts` here and on GitHub.

## Coding-agent limits

Agents follow [AGENTS.md](../../AGENTS.md); Claude Code also loads `.claude/settings.json`. The layering and the reasons for it are in [ADR 0004](../adr/0004-agent-limits-and-enforcement.md).

| Layer                                 | Binds                 | What it enforces                                                                                                       |
| ------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md` (root, frontend, backend) | Every agent, by trust | Always / ask first / never, scope guardrails, definition of done                                                       |
| `.claude/settings.json` deny, allow   | Claude Code           | No reading env files, force-pushes, skipped hooks, pushes to `main` or `rm -rf`; safe npm scripts run without a prompt |
| `.claude/hooks/guard-bash.sh`         | Claude Code           | The same limits parsed per command segment, so `git -c x=y push -f`, `push origin +main` and `HUSKY=0` are caught too  |
| `.claude/hooks/lint-file.sh`          | Claude Code           | Prettier and ESLint on each edited file, with errors returned straight away                                            |
| `.claude/hooks/stop-gate.sh`          | Claude Code           | `npm run lint` and `npm run typecheck` before Claude hands back                                                        |
| Git hooks                             | Everyone, skippable   | The pre-commit and pre-push checks above                                                                               |
| CI and branch protection              | Everyone              | Everything; nothing merges red                                                                                         |

The hook scripts are POSIX `sh` and need `jq`. `guard-bash.sh` is tested in `packages/config/test/guard-bash.test.ts`; add a case there when you change it. It reads command text, so it also blocks a command that only mentions a blocked pattern (for example a heredoc whose body names an env file); write such content with an editor tool instead.

## Daily sweep

`.github/workflows/sweep.yml` runs at 06:00 UTC and on manual dispatch (Actions → Daily sweep → Run workflow). Jobs: `markdownlint`, `links (external)` (online lychee, cached) and `docs:api:check`. If any fails, the `report` job opens an issue titled **Daily sweep failed** with the `documentation` label, or updates the open one, and attaches the lychee report.

To add a sweep check (for example the full browser matrix or `npm audit`): add a job, add its id to `report.needs`, and add a row for it in the report body step.

## Generated API docs

`docs/api/` is generated; never edit it by hand. The pipeline: `backend/src/app.ts` `buildApp()` registers `@fastify/swagger` (OpenAPI 3.1) and the routes, and `backend/scripts/generate-api-docs.ts` writes the sorted spec plus a Markdown rendering. Change a route schema, run `npm run docs:api`, and commit both files with the change.
