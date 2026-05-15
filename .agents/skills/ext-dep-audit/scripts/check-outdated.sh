#!/usr/bin/env bash
# check-outdated.sh — list outdated dependencies
# usage: bash .agents/skills/ext-dep-audit/scripts/check-outdated.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
WORKSPACE="$ROOT/workspace"

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ workspace/ directory not found"
  exit 0
fi

cd "$WORKSPACE" || exit 0

echo "===== Outdated dependencies ====="
# prefer JSON output; fall back to table on failure
if pnpm outdated --format json 2>/dev/null; then
  :
else
  echo "⚠️ --format json failed, falling back to table mode:"
  pnpm outdated || true
fi

echo ""
echo "===== Direct dependency count ====="
pnpm ls --depth 0 2>/dev/null | grep -cE "^├|^└" || echo "0"
