#!/usr/bin/env sh
# Secret scan with gitleaks (.gitleaks.toml). gitleaks is a Go binary, not an npm package,
# so fail with install steps when it's missing.
# Usage: scripts/check-secrets.sh            staged changes (pre-commit)
#        scripts/check-secrets.sh --all      the whole git history (what CI scans)
if ! command -v gitleaks >/dev/null 2>&1; then
  cat >&2 <<'MSG'
gitleaks is not installed; it blocks commits that contain secrets.
Install one of these, then re-run:
  brew install gitleaks
  go install github.com/zricethezav/gitleaks/v8@latest
  Linux binary: https://github.com/gitleaks/gitleaks/releases/latest
    (extract gitleaks_<version>_linux_x64.tar.gz into a directory on PATH, e.g. ~/.local/bin)
See docs/development/troubleshooting.md#gitleaks-not-installed
MSG
  exit 1
fi
if [ "$1" = "--all" ]; then
  exec gitleaks git --no-banner --redact --config .gitleaks.toml .
fi
exec gitleaks git --staged --no-banner --redact --config .gitleaks.toml .
