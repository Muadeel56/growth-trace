#!/usr/bin/env sh
# Stop hook: before Claude hands work back, run lint and typecheck. On failure exit 2 with
# the output, so Claude fixes it first. `stop_hook_active` is true when Claude is already
# continuing because of this hook; then let it stop, or a persistent failure would loop.

if command -v jq >/dev/null 2>&1; then
  active=$(jq -r '.stop_hook_active // false')
  [ "$active" = true ] && exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

if ! out=$(npm run --silent lint 2>&1); then
  printf 'npm run lint failed. Fix these before handing back:\n%s\n' "$out" | tail -n 60 >&2
  exit 2
fi
if ! out=$(npm run --silent typecheck 2>&1); then
  printf 'npm run typecheck failed. Fix these before handing back:\n%s\n' "$out" | tail -n 60 >&2
  exit 2
fi
exit 0
