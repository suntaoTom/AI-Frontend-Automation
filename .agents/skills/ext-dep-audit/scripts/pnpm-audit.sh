#!/usr/bin/env bash
# pnpm-audit.sh — run pnpm audit and output JSON for AI parsing
# usage: bash .agents/skills/ext-dep-audit/scripts/pnpm-audit.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
WORKSPACE="$ROOT/workspace"

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ workspace/ directory not found: $WORKSPACE"
  exit 0
fi

cd "$WORKSPACE" || exit 0

echo "===== pnpm audit (JSON) ====="
if ! pnpm audit --json 2>/dev/null; then
  echo "⚠️ --json mode failed, falling back to text mode:"
  pnpm audit || true
fi
