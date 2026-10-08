#!/usr/bin/env sh
# PostToolUse hook for Edit/Write/MultiEdit: formats and lints the one file Claude just
# changed, so a styling or lint violation goes straight back to Claude (exit 2) instead of
# surfacing later in `npm run verify`. Files Prettier and ESLint don't handle are skipped.

if ! command -v jq >/dev/null 2>&1; then
  echo "lint-file.sh: jq is required (install jq, e.g. apt install jq / brew install jq)." >&2
  exit 2
fi

file=$(jq -r '.tool_input.file_path // empty')
project_dir=${CLAUDE_PROJECT_DIR:-$(pwd)}

case $file in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

cd "$project_dir" || exit 0
bin=node_modules/.bin

case $file in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs)
    if ! out=$("$bin/prettier" --write --log-level=warn "$file" 2>&1 &&
      "$bin/eslint" --max-warnings=0 --no-warn-ignored "$file" 2>&1); then
      printf 'Lint failed for %s. Fix it before continuing:\n%s\n' "$file" "$out" >&2
      exit 2
    fi
    ;;
  *.css | *.md | *.json | *.jsonc | *.yml | *.yaml)
    if ! out=$("$bin/prettier" --write --log-level=warn --ignore-unknown "$file" 2>&1); then
      printf 'Prettier failed for %s:\n%s\n' "$file" "$out" >&2
      exit 2
    fi
    ;;
esac
exit 0
