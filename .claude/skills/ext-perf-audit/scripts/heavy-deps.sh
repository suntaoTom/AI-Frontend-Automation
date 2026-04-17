#!/usr/bin/env bash
# heavy-deps.sh — 列出 node_modules 中体积最大的前 20 个包
# 用法: bash .claude/skills/ext-perf-audit/scripts/heavy-deps.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
NM="$ROOT/workspace/node_modules"

if [ ! -d "$NM" ]; then
  echo "⚠️ workspace/node_modules 不存在, 请先 pnpm install"
  exit 0
fi

echo "===== 体积 Top 20 的依赖包 ====="
# pnpm 用 .pnpm 管理, 真实大小看顶层符号链接解析后的结果
du -sh "$NM"/* 2>/dev/null \
  | sort -rh \
  | grep -v "^\s*0" \
  | head -20

echo ""
echo "===== 提示 ====="
echo "对照 references/perf-checklist.md 的「常见体积杀手」看是否有优化空间"
echo "(如: moment → dayjs, lodash → lodash-es + tree shake, full antd → antd/es)"
