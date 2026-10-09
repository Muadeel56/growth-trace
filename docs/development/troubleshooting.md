# Troubleshooting

Known local-development problems and their fixes. For production symptoms (sync failures, queue backlog), see the [runbook](../operations/runbook.md).

## Port already in use

**Symptom:** `docker compose up` fails with `Bind for 0.0.0.0:5533 failed: port is already allocated`, or `next dev` says `EADDRINUSE`.

**Fix:** find the process with `ss -ltnp | grep <port>` (macOS: `lsof -i :<port>`). Either stop it or move GrowthTrace:

- Postgres/Redis: change `POSTGRES_PORT` / `REDIS_PORT` in `.env` **and** the matching `DATABASE_URL` / `REDIS_URL`.
- Ollama (11434): usually a native Ollama install. Stop it (`systemctl stop ollama`) or change the host side of the port mapping in `docker-compose.yml` and `OLLAMA_BASE_URL`.
- Playwright (3100/3101): a leftover dev server from an earlier run. Playwright reuses it locally, so this only matters if that server is broken. Kill it and re-run.

See the [port table](setup.md#ports).

## Playwright browsers not installed

**Symptom:** `browserType.launch: Executable doesn't exist at ~/.cache/ms-playwright/...`.

**Fix:** `npx playwright install chromium`. On a fresh Linux machine add `--with-deps`. Install `webkit firefox` too for `test:responsive:all`. After bumping `@playwright/test`, run it again.

## Screenshot diffs on your machine

**Symptom:** `toHaveScreenshot` fails locally with tiny font differences.

**Cause:** baselines are rendered in the Playwright Docker image, and your OS renders fonts differently. Screenshot assertions should only run when `PW_VISUAL=1`.

**Fix:** don't set `PW_VISUAL` locally. To refresh baselines, run `npm run test:responsive:update` (needs Docker); see [responsive.md](../design-system/responsive.md#updating-screenshot-baselines).

## Stale `.next-e2e` build

**Symptom:** Playwright pages show old UI, odd hydration errors, or the dev server on 3100 won't start after a Next.js upgrade.

**Fix:** stop any server on 3100, `rm -rf frontend/.next-e2e`, re-run. Same for `frontend/.next` with `npm run dev`.

## Ollama model not pulled

**Symptom:** calls to Ollama return `404 model "llama3.1" not found, try pulling it first`.

**Fix:**

```bash
docker exec -it $(docker compose ps -q ollama) ollama pull llama3.1
docker exec -it $(docker compose ps -q ollama) ollama pull nomic-embed-text
docker exec -it $(docker compose ps -q ollama) ollama list
```

`docker compose down -v` deletes the `ollamadata` volume and the models with it.

## `lychee` not installed

**Symptom:** `npm run verify`, `npm run check:links` or a commit touching `.md` files stops with `lychee is not installed`.

**Fix:** lychee is a Rust binary, not an npm package. Install one of these:

```bash
brew install lychee        # macOS / Linuxbrew
cargo install lychee       # any platform with Rust
```

Or download the static Linux binary from the [lychee releases](https://github.com/lycheeverse/lychee/releases/latest) (`lychee-x86_64-unknown-linux-musl.tar.gz`) and put `lychee` in a directory on your `PATH`, such as `~/.local/bin`.

## `gitleaks` not installed

**Symptom:** a commit stops with `gitleaks is not installed`.

**Fix:** gitleaks is a Go binary, not an npm package. Install one of these:

```bash
brew install gitleaks                                  # macOS / Linuxbrew
go install github.com/zricethezav/gitleaks/v8@latest   # any platform with Go
```

Or download the Linux binary from the [gitleaks releases](https://github.com/gitleaks/gitleaks/releases/latest) (`gitleaks_<version>_linux_x64.tar.gz`) and put `gitleaks` in a directory on your `PATH`, such as `~/.local/bin`. CI pins the version in `GITLEAKS_VERSION` (`ci.yml`).

## gitleaks flags a false positive

**Symptom:** the pre-commit hook or the CI `secrets` job reports a leak in something that isn't a secret (a test fixture, a placeholder).

**Fix:** if it's a real secret, remove it, rotate it, and never commit it. If it isn't, ask for review before adding a path or regex to the allowlist in `.gitleaks.toml`; one-off `gitleaks:allow` comments are not used in this repo.

## Commit refused on `main`

**Symptom:** `pre-commit: refusing to commit on main`.

**Fix:** move the work to a branch: `git switch -c feat/short-name`, then commit. Your staged changes come with you.

## Link check fails on a heading anchor

**Symptom:** `check:links` reports `Cannot find fragment` for `file.md#some-heading`.

**Fix:** anchors are the GitHub slug of the heading: lowercase, spaces become `-`, and punctuation is dropped (`## 8. Timeline & Milestones` becomes `#8-timeline--milestones`). Renaming a heading breaks every link to it, so search for the old anchor with `grep -rn '#old-anchor' --include='*.md' .`.

## `docs:api:check` fails

**Symptom:** `API docs are stale, run npm run docs:api`.

**Fix:** a route schema changed. Run `npm run docs:api` and commit `docs/api/` with the change.
