#!/usr/bin/env bash
# check-umi-conflict.sh — check whether workspace/package.json installs dependencies already built into Umi
# usage: bash .agents/skills/ext-dep-audit/scripts/check-umi-conflict.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PKG="$ROOT/workspace/package.json"

if [ ! -f "$PKG" ]; then
  echo "❌ $PKG not found"
  exit 0
fi

# List of dependencies built into Umi (keep in sync with references/umi-builtin-deps.md)
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
echo "===== Umi built-in dependency conflict check ====="
for dep in "${UMI_BUILTIN[@]}"; do
  if grep -E "\"${dep}\"\\s*:" "$PKG" >/dev/null 2>&1; then
    line=$(grep -nE "\"${dep}\"\\s*:" "$PKG" | head -1)
    echo "🔴 $dep — already built into Umi; should not be explicitly installed ($line)"
    found_any=1
  fi
done

if [ "$found_any" = "0" ]; then
  echo "✅ No Umi built-in dependency conflicts found"
fi
