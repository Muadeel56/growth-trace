<!-- markdownlint-disable-file MD041 -- `@AGENTS.md` is a Claude Code import, not a heading. -->

@AGENTS.md

## Claude Code notes

The rules are in `AGENTS.md` above. This section only covers what is specific to Claude Code.

### Hooks

`.claude/settings.json` wires these scripts from `.claude/hooks/`:

- **`guard-bash.sh` (before every shell command):** blocks force-pushes, skipped hooks (`--no-verify`, `commit -n`, `HUSKY=0`), commits or pushes on or to `main`, shell access to `.env` files, and `rm -rf` outside build output. A block is final: don't rephrase the command to get around it. Tell the user what you were trying to do and why it was blocked.
- **`lint-file.sh` (after every edit):** runs Prettier and ESLint on the edited file. If it reports an error, fix the file before moving on.
- **`stop-gate.sh` (before handing back):** runs `npm run lint` and `npm run typecheck`. If it fails, fix the errors; don't hand back red.

### Subagents

- `design-reviewer`: reviews `git diff main...` against the Aurora rules. Run it on any UI change.
- `tenancy-auditor`: checks every Prisma call in the diff for `userId` scoping from the session. Run it on any backend data change.

### Settings are reviewed config

`.claude/settings.json` and `.claude/hooks/` change only through a reviewed PR. Never edit them to get around a deny rule or a hook.
