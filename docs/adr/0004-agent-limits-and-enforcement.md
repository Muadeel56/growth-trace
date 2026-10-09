# ADR 0004: Agent limits and enforcement layers

Status: Proposed
Date: 2026-10-08

## Context

Most code in this repo is written by coding agents (Claude Code, Codex, Cursor). Until now their rules lived in a root `AGENTS.md` and an identical `CLAUDE.md`, and nothing enforced them: the pre-commit hook ran only the responsive and Markdown checks, ESLint had no `no-console` rule, there was no secret scanner, and `main` had no branch protection. An unused export, `bg-[#f00]`, a `console.log` or a leaked token would all have committed cleanly, and an agent could force-push or push to `main`.

Rules that depend only on an agent reading and obeying them fail silently. Prefix-matched permission rules are easy to get around (`git -c x=y push -f`, `git push origin +main`, `HUSKY=0 git commit`). And tool-specific config only binds the tool it belongs to.

## Decision

Agent limits are layered. Each layer is cheaper and earlier than the next, and every hard limit is enforced by at least one layer that the agent can't switch off:

1. **Rules.** Root `AGENTS.md` is the single, tool-neutral rulebook (snapshot, commands, always / ask first / never, scope guardrails, definition of done). `frontend/AGENTS.md` and `backend/AGENTS.md` add area rules. `CLAUDE.md` files import `AGENTS.md` and add only Claude-specific notes, so no rule exists in two places.
2. **Claude Code settings and hooks** (`.claude/`, committed and reviewed). Deny rules for env files, force-push, skipped hooks, pushing to `main` and `rm -rf`. A PreToolUse hook (`guard-bash.sh`) parses each command segment, so the same limits hold however the command is written. A PostToolUse hook lints each edited file, and a Stop hook runs lint and typecheck before Claude hands back.
3. **Git hooks** (bind everyone, can be skipped). Pre-commit refuses commits on `main` and runs lint-staged (Prettier, ESLint with the Aurora rules and `no-console`), gitleaks, the responsive check and the Markdown checks. Pre-push runs knip.
4. **CI.** `verify`, `docs`, `responsive` and the new `secrets` (gitleaks over the full history) jobs.
5. **Branch protection on `main`.** A PR is required, the CI checks above must pass, force-pushes and deletions are blocked, and admins are included. This is the only layer that `--no-verify` can't get around.

`no-console` joins the styling rules in `lockedRules`, so `eslint-disable` can't switch it off.

## Alternatives considered

- **Rules only (`AGENTS.md`).** Cheap and portable, but nothing happens when an agent ignores them.
- **Claude settings only.** Strong for Claude Code, invisible to Codex, Cursor and people. Prefix deny rules alone are easy to get around, hence the guard hook.
- **CI and branch protection only.** Airtight, but feedback arrives minutes later and after a push; the earlier layers make the common mistakes fail in seconds.
- **Third-party guard frameworks or per-tool configs for Codex and Cursor.** More to maintain; both tools read `AGENTS.md`, and the git hooks, CI and branch protection bind them anyway. Revisit if a test shows a tool ignoring `AGENTS.md`.

## Consequences

- Hard limits hold for every agent and human: git hooks catch them early, and CI plus branch protection catch them for certain.
- Contributors need `gitleaks` installed locally, like `lychee`; the hook fails with install steps when it's missing.
- `guard-bash.sh` matches command text, so it also blocks commands that only mention a blocked pattern (for example a heredoc whose body names an env file). Agents write such content with an editor tool instead. It is covered by `packages/config/test/guard-bash.test.ts`.
- `.claude/`, Husky hooks, `.gitleaks.toml` and the ESLint allowlists become reviewed config: changing them is an "ask first" item in `AGENTS.md`.
- Adding or renaming a CI job means updating the required checks in branch protection ([quality gates](../development/quality-gates.md#branch-protection)).
