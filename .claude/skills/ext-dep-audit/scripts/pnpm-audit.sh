#!/usr/bin/env bash
# pnpm-audit.sh — 跑 pnpm audit 输出 JSON 供 AI 解析
# 用法: bash .claude/skills/ext-dep-audit/scripts/pnpm-audit.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
WORKSPACE="$ROOT/workspace"

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ workspace/ 目录不存在: $WORKSPACE"
  exit 0
fi

cd "$WORKSPACE" || exit 0

echo "===== pnpm audit (JSON) ====="
if ! pnpm audit --json 2>/dev/null; then
  echo "⚠️ --json 模式失败, 回落到文本模式:"
  pnpm audit || true
fi
