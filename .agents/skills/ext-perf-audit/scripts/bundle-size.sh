#!/usr/bin/env bash
# bundle-size.sh — analyze workspace/dist artifact sizes
# usage: bash .agents/skills/ext-perf-audit/scripts/bundle-size.sh

set -u

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DIST="$ROOT/workspace/dist"

if [ ! -d "$DIST" ]; then
  echo "⚠️ dist/ does not exist — run /build web or pnpm build first"
  exit 0
fi

echo "===== Total size ====="
du -sh "$DIST"

echo ""
echo "===== JS files > 100KB (sorted by size descending) ====="
find "$DIST" -name "*.js" -size +100k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== CSS files > 50KB ====="
find "$DIST" -name "*.css" -size +50k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== Images/fonts > 500KB ====="
find "$DIST" \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.woff*" -o -name "*.ttf" \) -size +500k -exec ls -l {} \; 2>/dev/null \
  | sort -k5 -rn \
  | awk '{printf "  %8.2f KB  %s\n", $5/1024, $NF}'

echo ""
echo "===== Chunk counts ====="
find "$DIST" -name "*.js" | wc -l | awk '{print "  JS chunks: " $1}'
find "$DIST" -name "*.css" | wc -l | awk '{print "  CSS chunks: " $1}'
