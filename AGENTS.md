# GrowthTrace: rules for coding agents

This is the single rulebook for every coding agent (Claude Code, Codex, Cursor and others) and for humans. Area rules live in [frontend/AGENTS.md](frontend/AGENTS.md) and [backend/AGENTS.md](backend/AGENTS.md). Claude-specific notes live in [CLAUDE.md](CLAUDE.md).

## Project snapshot

GrowthTrace is a multi-tenant SaaS that connects to a user's GitHub account and turns their real commit, repo and PR history into an evidence-based dashboard and a conversational assistant. Achievements are derived from what the user actually shipped, never self-reported. Requirements: [BRD](docs/product/BRD.md) (BR-x) and [FRD](docs/product/FRD.md) (FR-x.x, NFR-x). Every other doc is in the [docs map](docs/index.md).

**Stack:** TypeScript, npm workspaces, Next.js App Router, Fastify, Postgres + pgvector, Redis + BullMQ, Ollama, Tailwind v4 through the Aurora design system, Vitest, Playwright.

| Path                     | What lives there                                                                |
| ------------------------ | ------------------------------------------------------------------------------- |
| `frontend/`              | Next.js App Router UI ([rules](frontend/AGENTS.md))                             |
| `backend/`               | Fastify API, later Prisma, sync workers and RAG ([rules](backend/AGENTS.md))    |
| `packages/design-system` | Aurora: tokens, components, motion ([README](packages/design-system/README.md)) |
| `packages/config`        | Shared TS, ESLint (incl. Aurora rules), Prettier, Stylelint configs             |
| `e2e/`                   | Playwright responsive, accessibility and screenshot checks                      |
| `docs/`                  | Product, architecture, API (generated), design system, ADRs                     |
| `scripts/`               | Repo scripts used by hooks and `verify` (links, secrets)                        |

## Commands

```bash
npm ci                                  # install; also installs the Husky git hooks
npm run dev -w @growthtrace/frontend    # Next.js on http://localhost:3000
npm run dev -w @growthtrace/backend     # Fastify on http://localhost:4000
npm test                                # Vitest in every workspace
npm run verify                          # the gate: must pass before work is done
npm run test:responsive                 # Playwright + axe, Chromium, every route and width
npm run test:responsive:update          # regenerate screenshot baselines (Docker)
npm run docs:api                        # regenerate docs/api/ after a route change
```

Local tools that npm doesn't install: `lychee` and `gitleaks` (see [setup](docs/development/setup.md)).

## Boundaries

### ✅ Always

- Run `npm run verify` before calling work done.
- Build UI only from `@growthtrace/design-system` tokens and components (see [styling rule](#styling-rule)).
- Scope every database query by the `userId` of the authenticated session ([multi-tenancy](docs/architecture/multi-tenancy.md)).
- Update docs alongside code, using the [behaviour change ⇒ doc change table](CONTRIBUTING.md#behaviour-change--doc-change).
- Keep diffs small and focused on the task.

### ⚠️ Ask first

- Adding a dependency.
- Changing the Prisma schema.
- Adding a design-system token or component.
- Changing CI, Husky hooks, `.claude/`, `.gitleaks.toml`, `knip.json` or the ESLint allowlists in `packages/config/eslint.config.js`.
- Anything on the [out-of-scope list](#scope-guardrails).

### 🚫 Never

- Read or write `.env` files (`.env.example` is fine).
- Log tokens, secrets, prompts or LLM completions.
- Use `git commit --no-verify`, `HUSKY=0` or any other way to skip hooks.
- Force-push, or commit or push to `main`.
- Add raw colours, arbitrary Tailwind values, `style={{}}`, new CSS files or inline animations.
- Add LangChain to the core RAG path.
- Leave dead code, `TODO`s, `console.log` calls or commented-out blocks.

## Styling rule

All UI is built from `@growthtrace/design-system`. If a style you need doesn't exist, add a token (to `tokens.css` and `tokens.ts`) or a component to the design system first, show it on `/design`, and then use it. Never style a one-off: no arbitrary Tailwind values, no `style={{}}`, no raw colours, no new CSS files, no inline animations. Lint rejects them, and `eslint-disable` comments can't switch the rules off; allowlists live in `packages/config/eslint.config.js` and change only through review. How to add a token or component: [packages/design-system/README.md](packages/design-system/README.md).

## Scope guardrails

These are out of scope for v1 ([BRD §3](docs/product/BRD.md#3-scope), [FRD §11](docs/product/FRD.md#11-out-of-scope-v1)). If a request falls in this list, push back, cite the list, and don't build it unless the user changes the requirements first.

- Data sources other than GitHub (GitLab, Jira, calendars, etc.).
- Teams, shared workspaces or dashboards, leaderboards, or any social or cross-user comparison.
- A mobile app, including React Native.
- Payment, billing, subscriptions or usage-based pricing (single free tier only).
- An admin or operator dashboard or analytics inside the product.
- LangChain as a dependency of the core or shipped RAG path.
- Fine-tuning or hosting a custom LLM.

Keep this list in sync with the BRD and FRD when either changes.

## Definition of done

- Git hooks pass (pre-commit and pre-push), with no skipping.
- `npm run verify` passes, including the responsive check.
- Docs are updated per the [mapping table](CONTRIBUTING.md#behaviour-change--doc-change).
- No new knip findings.
- The [PR template](.github/pull_request_template.md) checklist is complete.

## Git workflow

- Branch from `main` with a prefix: `feat/`, `fix/`, `docs/`, `chore/` ([branches](CONTRIBUTING.md#branches)).
- Commit style: imperative subject, `Phase N:` prefix for phase work ([commits](CONTRIBUTING.md#commits)).
- Agent-authored commits end with a `Co-Authored-By:` trailer naming the agent and model.
- Every change lands through a PR using the [PR template](.github/pull_request_template.md); CI must be green.
