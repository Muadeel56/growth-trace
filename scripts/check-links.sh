#!/usr/bin/env sh
# Offline link + anchor check (relative links and #fragments, no network). lychee is a
# Rust binary, not an npm package, so fail with install steps when it's missing.
# Usage: scripts/check-links.sh [paths...]   (default: whole repo)
if ! command -v lychee >/dev/null 2>&1; then
  cat >&2 <<'MSG'
lychee is not installed; it checks Markdown links and #anchors.
Install one of these, then re-run:
  brew install lychee
  cargo install lychee
  Linux binary: https://github.com/lycheeverse/lychee/releases/latest
    (extract lychee-x86_64-unknown-linux-musl.tar.gz into a directory on PATH, e.g. ~/.local/bin)
See docs/development/troubleshooting.md#lychee-not-installed
MSG
  exit 1
fi
[ "$#" -eq 0 ] && set -- .
exec lychee --offline --include-fragments "$@"
