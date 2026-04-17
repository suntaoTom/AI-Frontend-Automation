#!/usr/bin/env bash
# check-umi-conflict.sh — 检查 workspace/package.json 是否引入了 Umi 已内置的依赖
# 用法: bash .claude/skills/ext-dep-audit/scripts/check-umi-conflict.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PKG="$ROOT/workspace/package.json"

if [ ! -f "$PKG" ]; then
  echo "❌ 未找到 $PKG"
  exit 0
fi

# Umi 已内置的依赖清单 (与 references/umi-builtin-deps.md 保持一致)
UMI_BUILTIN=(
  "axios"
  "react-router"
  "react-router-dom"
  "webpack"
  "vite"
  "eslint"
  "prettier"
  "stylelint"
  "antd"
  "@ant-design/icons"
)

found_any=0
echo "===== Umi 内置依赖冲突检查 ====="
for dep in "${UMI_BUILTIN[@]}"; do
  if grep -E "\"${dep}\"\\s*:" "$PKG" >/dev/null 2>&1; then
    line=$(grep -nE "\"${dep}\"\\s*:" "$PKG" | head -1)
    echo "🔴 $dep — Umi 已内置, 不应显式安装 ($line)"
    found_any=1
  fi
done

if [ "$found_any" = "0" ]; then
  echo "✅ 未发现 Umi 内置依赖冲突"
fi
