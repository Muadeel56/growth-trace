# Contributing to GrowthTrace

This applies to humans and coding agents alike. Start with [local setup](docs/development/setup.md) and the [docs map](docs/index.md).

## Branches

Branch from `main`, using a prefix that says what kind of change it is:

| Prefix   | For                                                | Example                       |
| -------- | -------------------------------------------------- | ----------------------------- |
| `feat/`  | New behaviour, including roadmap phases            | `feat/phase-5-documentation`  |
| `fix/`   | Bug fixes                                          | `fix/heatmap-scroll-position` |
| `docs/`  | Documentation-only changes                         | `docs/runbook-redis`          |
| `chore/` | Tooling, dependencies, CI with no behaviour change | `chore/bump-playwright`       |

Phase work follows `feat/phase-N-short-name`, matching the earlier phases. Every change lands through a PR; nothing is pushed straight to `main`.

## Commits

- **Imperative subject**, about 72 characters max: `Add sync status endpoint`, not `Added…`/`Adds…`.
- **Phase work is prefixed** `Phase N:`, for example `Phase 4: responsive design, touch targets and cross-browser checks`.
- The body explains _what and why_, grouped by area when the commit is large (see the Phase 3 and 4 commits).
- **Agent-authored commits** end with a co-author trailer naming the agent and model, for example:

  ```text
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Git hooks

`npm install` / `npm ci` installs the Husky hooks (`prepare: husky`). `.husky/pre-commit` runs checks only for what you staged:

- **UI paths** (`frontend/`, `packages/design-system/`, `e2e/`): `npm run test:responsive` (Playwright, Chromium).
- **Markdown** (`*.md`): markdownlint and an offline link/anchor check (lychee) on the staged files.
- Anything else: nothing.

The docs check needs **lychee**, a Rust binary: `brew install lychee`, `cargo install lychee`, or the [release binary](https://github.com/lycheeverse/lychee/releases/latest) on your `PATH`. See [quality gates](docs/development/quality-gates.md#installing-lychee).

## The gate

```bash
npm run verify
```

It runs format, lint (code and Markdown), styles, links, types, unit tests, the API-docs staleness check, Playwright and knip, and must pass before you open a PR. CI runs it too. Details are in [quality gates](docs/development/quality-gates.md).

## Styling rule

All UI is built from `@growthtrace/design-system` (Aurora): if a style doesn't exist, add a token or component there first, show it on `/design`, then use it. Lint rejects one-offs. See [design-system principles](docs/design-system/principles.md).

## Pull requests

Open the PR against `main`. The [PR template](.github/pull_request_template.md) asks for a summary, the reason, how you tested, and this checklist:

- [ ] `npm run verify` passes.
- [ ] If this PR changes behaviour, the matching doc is updated (see [the mapping below](#behaviour-change--doc-change)), or the PR says **No behaviour change**.
- [ ] API routes changed: `npm run docs:api` run and the result committed.
- [ ] An architectural decision was made: an ADR is added.
- [ ] UI changed: shown on `/design`, and screenshot baselines updated (`npm run test:responsive:update`).

CI (`verify`, `docs`, `responsive`) must be green before merging.

## Behaviour change ⇒ doc change

If a PR changes behaviour, it updates the doc that describes that behaviour **in the same PR**. Use this table to find "the matching doc":

| Change in…                            | Update…                                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/routes/**`               | `npm run docs:api` (generated)                                                                                                                      |
| `prisma/schema.prisma`                | [architecture/data-model.md](docs/architecture/data-model.md), [multi-tenancy.md](docs/architecture/multi-tenancy.md)                               |
| queues / workers                      | [architecture/sync-jobs.md](docs/architecture/sync-jobs.md), [operations/runbook.md](docs/operations/runbook.md)                                    |
| embeddings / retrieval / prompts      | [architecture/rag-pipeline.md](docs/architecture/rag-pipeline.md)                                                                                   |
| `packages/design-system/**`           | [design-system/\*.md](docs/design-system/principles.md)                                                                                             |
| scripts, hooks, CI, `packages/config` | [development/quality-gates.md](docs/development/quality-gates.md), and [ADR 0003](docs/adr/0003-quality-gates-and-tooling.md) if a decision changes |
| `docker-compose.yml`, `.env.example`  | [development/setup.md](docs/development/setup.md), [operations/deployment.md](docs/operations/deployment.md)                                        |

When a planned system gets built, also change its doc's `Status: Planned` line and replace the plan with what was actually built.

## Architecture decision records

Record a decision when it's hard to reverse, affects more than one area, or someone will later ask "why is it like this?" (a new dependency in a core path, a data-model rule, a change to the gate).

1. Copy [docs/adr/template.md](docs/adr/template.md) to `docs/adr/NNNN-short-title.md`, using the next free number (see the [ADR table](docs/index.md#architecture-decision-records)).
2. Fill in Context, Decision, Alternatives and Consequences. Set `Status: Proposed` and today's date.
3. Add a row to the ADR table in `docs/index.md`.
4. Set `Status: Accepted` when the PR merges. To reverse an accepted ADR, write a new one and mark the old one `Superseded by ADR NNNN`. Don't rewrite history.
