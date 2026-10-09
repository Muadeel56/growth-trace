#!/usr/bin/env sh
# PreToolUse guard for Claude Code's Bash tool. Reads the hook JSON on stdin and exits 2
# (blocking the command; stderr goes back to Claude) when the command would:
#   - force-push (-f, --force*, --mirror, +refspec), in any position or with `git -c ...`
#   - skip git hooks (--no-verify, `commit -n`, HUSKY=0)
#   - commit or push while on main, or push to main
#   - touch a .env file through the shell (.env.example is fine)
#   - rm -rf anything other than dependencies or build output
# Prefix-matched deny rules in settings.json are easy to get around; this parses each
# segment of a compound command instead. See docs/development/quality-gates.md.

if ! command -v jq >/dev/null 2>&1; then
  echo "guard-bash.sh: jq is required to check shell commands (install jq, e.g. apt install jq / brew install jq)." >&2
  exit 2
fi

# Words below are split on purpose; never glob-expand them.
set -f

cmd=$(jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

block() {
  echo "Blocked by .claude/hooks/guard-bash.sh: $1 See AGENTS.md (Boundaries). Don't rephrase the command to get around this; tell the user instead." >&2
  exit 2
}

# Token boundaries: start or end of segment, whitespace, or a quote.
B='(^|[[:space:]"'\''])'
E='([[:space:]"'\'']|$)'
# `git` plus any global options (-c k=v, -C dir, --no-pager, --git-dir=...).
GIT="${B}git([[:space:]]+(-[cC][[:space:]]+[^[:space:]]+|--?[a-zA-Z-]+(=[^[:space:]]+)?))*[[:space:]]+"

has() { printf '%s\n' "$seg" | grep -Eq -- "$1"; }

# Whole-command checks (they hold in any segment).
seg=$cmd
has "${B}HUSKY=0${E}" && block "HUSKY=0 skips the git hooks."
has "--no-verify${E}" && block "--no-verify skips the git hooks."

project_dir=${CLAUDE_PROJECT_DIR:-$(pwd)}
branch=$(git -C "$project_dir" branch --show-current 2>/dev/null)

# Build output and dependencies are the only things rm -rf may remove.
rm_target_ok() {
  case $1 in
    *..*) return 1 ;;
    /*) case $1 in "$project_dir"/*) ;; *) return 1 ;; esac ;;
  esac
  name=$(basename "$1")
  case $name in
    node_modules | dist | build | .next | .next-e2e | .turbo | coverage | test-results | playwright-report | blob-report | *.tsbuildinfo) return 0 ;;
  esac
  return 1
}

# Split on ;, &, |, && and || (and newlines) and check each simple command.
segments=$(printf '%s\n' "$cmd" | awk '{ gsub(/&&|\|\||[;&|]/, "\n"); print }')

old_ifs=$IFS
IFS='
'
for seg in $segments; do
  IFS=$old_ifs

  # .env files: any word whose last path part is .env or .env.<x>, except .env.example.
  for word in $(printf '%s\n' "$seg" | tr -s ' \t"'\''=<>():`$' '\n\n\n\n\n\n\n\n\n\n'); do
    case ${word##*/} in
      .env.example) ;;
      .env | .env.*) block "shell access to ${word}. Secrets stay out of agent context; use .env.example for variable names." ;;
    esac
  done

  if has "${GIT}push${E}"; then
    has "[[:space:]](-[a-zA-Z]*f[a-zA-Z]*|--force[^[:space:]]*|--mirror|\+[^[:space:]]+)${E}" &&
      block "force-push rewrites shared history."
    has "[[:space:]]([^[:space:]]*:)?(refs/heads/)?main${E}" &&
      block "pushing to main. Push a feature branch and open a PR."
    [ "$branch" = main ] && block "pushing while on main. Create a feature branch first (feat/, fix/, docs/, chore/)."
  fi

  if has "${GIT}commit${E}"; then
    has "[[:space:]]-[a-zA-Z]*n[a-zA-Z]*${E}" && block "commit -n skips the git hooks."
    [ "$branch" = main ] && block "committing on main. Create a feature branch first (feat/, fix/, docs/, chore/)."
  fi

  # rm with both a recursive and a force flag.
  if has "${B}rm[[:space:]]" &&
    has "[[:space:]](-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)${E}" &&
    has "[[:space:]](-[a-zA-Z]*f[a-zA-Z]*|--force)${E}"; then
    targets=$(printf '%s\n' "$seg" | sed -E 's/.*(^|[[:space:]])rm[[:space:]]+//' | tr -s ' \t' '\n' | grep -v '^-' | tr -d "\"'")
    [ -z "$targets" ] && block "rm -rf without a target."
    for target in $targets; do
      rm_target_ok "$target" || block "rm -rf $target. Only node_modules and build output (dist, .next, coverage, test-results...) may be force-removed."
    done
  fi

  IFS='
'
done
IFS=$old_ifs

exit 0
