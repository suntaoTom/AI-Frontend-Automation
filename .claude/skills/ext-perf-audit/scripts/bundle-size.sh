#!/usr/bin/env bash
# bundle-size.sh — 分析 workspace/dist 产物体积
# 用法: bash .claude/skills/ext-perf-audit/scripts/bundle-size.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DIST="$ROOT/workspace/dist"

if [ ! -d "$DIST" ]; then
  echo "⚠️ dist/ 不存在, 请先跑 /build web 或 pnpm build"
  exit 0
fi

echo "===== 总体积 ====="
du -sh "$DIST"

echo ""
echo "===== JS 文件 > 100KB (按大小降序) ====="
find "$DIST" -name "*.js" -size +100k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== CSS 文件 > 50KB ====="
find "$DIST" -name "*.css" -size +50k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== 图片/字体 > 500KB ====="
find "$DIST" \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.woff*" -o -name "*.ttf" \) -size +500k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== Chunk 数量 ====="
find "$DIST" -name "*.js" | wc -l | awk '{print "  JS chunks: " $1}'
find "$DIST" -name "*.css" | wc -l | awk '{print "  CSS chunks: " $1}'
