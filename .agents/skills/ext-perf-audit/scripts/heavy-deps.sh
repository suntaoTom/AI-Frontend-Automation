#!/usr/bin/env bash
# heavy-deps.sh — list the top 20 largest packages in node_modules
# usage: bash .agents/skills/ext-perf-audit/scripts/heavy-deps.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
NM="$ROOT/workspace/node_modules"

if [ ! -d "$NM" ]; then
  echo "⚠️ workspace/node_modules does not exist — run pnpm install first"
  exit 0
fi

echo "===== Top 20 dependencies by size ====="
# pnpm manages packages under .pnpm; actual sizes are read via top-level symlink resolution
du -sh "$NM"/* 2>/dev/null \
  | sort -rh \
  | grep -v "^\s*0" \
  | head -20

echo ""
echo "===== Tip ====="
echo "Cross-reference the 'Common Bundle Killers' section in references/perf-checklist.md for optimization opportunities"
echo "(e.g. moment → dayjs, lodash → lodash-es + tree shake, full antd → antd/es)"
