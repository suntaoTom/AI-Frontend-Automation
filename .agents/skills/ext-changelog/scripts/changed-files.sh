#!/usr/bin/env bash
# changed-files.sh — list files changed within the specified range (A/M/D)
# usage: bash .agents/skills/ext-changelog/scripts/changed-files.sh [since] [scope]

set -u

SINCE="${1:-7 days ago}"
SCOPE="${2:-.}"

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 0

if [ ! -d ".git" ]; then
  echo "❌ Not a git repository"
  exit 0
fi

echo "===== Changed file list (since=$SINCE, scope=$SCOPE) ====="
echo "Format: <status> <file path>  (A=Added, M=Modified, D=Deleted, R=Renamed)"
echo ""

git log --since="$SINCE" --no-merges --name-status --pretty=format:"" -- "$SCOPE" \
  | grep -E "^[AMDR]" \
  | sort -u

echo ""
echo "===== Aggregated by module ====="
git log --since="$SINCE" --no-merges --name-status --pretty=format:"" -- "$SCOPE" \
  | grep -E "^[AMDR]" \
  | awk '{print $2}' \
  | awk -F'/' '{
      if ($0 ~ /^workspace\/src\/features\//) print $4
      else if ($0 ~ /^workspace\/src\/pages\//) print "pages/" $4
      else if ($0 ~ /^workspace\/src\/components\//) print "components"
      else if ($0 ~ /^workspace\/src\//) print "src/" $3
      else if ($0 ~ /^docs\//) print "docs/" $2
      else print "root"
    }' \
  | sort | uniq -c | sort -rn
