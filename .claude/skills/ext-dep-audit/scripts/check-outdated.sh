#!/usr/bin/env bash
# check-outdated.sh — 列出过时依赖
# 用法: bash .claude/skills/ext-dep-audit/scripts/check-outdated.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
WORKSPACE="$ROOT/workspace"

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ workspace/ 目录不存在"
  exit 0
fi

cd "$WORKSPACE" || exit 0

echo "===== 过时依赖 ====="
# 优先 JSON, 失败回落文本
if pnpm outdated --format json 2>/dev/null; then
  :
else
  echo "⚠️ --format json 失败, 回落到表格模式:"
  pnpm outdated || true
fi

echo ""
echo "===== 直接依赖数量 ====="
pnpm ls --depth 0 2>/dev/null | grep -cE "^├|^└" || echo "0"
