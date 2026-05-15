#!/usr/bin/env bash
# range-commits.sh — output the list of commits within the specified range
# usage: bash .agents/skills/ext-changelog/scripts/range-commits.sh [since] [scope] [author]
# e.g.:  bash ... "7 days ago"
#        bash ... "2026-04-01"
#        bash ... "7 days ago" "workspace/src/features/login/"
#        bash ... "7 days ago" "." "alice"

set -u

SINCE="${1:-7 days ago}"
SCOPE="${2:-.}"
AUTHOR="${3:-}"

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 0

if [ ! -d ".git" ]; then
  echo "❌ Not a git repository"
  exit 0
fi

echo "===== Commit list (since=$SINCE, scope=$SCOPE, author=${AUTHOR:-all}) ====="

GIT_ARGS=(log --since="$SINCE" --no-merges --pretty=format:"%h|%ad|%an|%s" --date=short)
if [ -n "$AUTHOR" ]; then
  GIT_ARGS+=(--author="$AUTHOR")
fi
GIT_ARGS+=(-- "$SCOPE")

git "${GIT_ARGS[@]}"
echo ""  # ensure trailing newline
echo ""
echo "===== Stats ====="
TOTAL=$(git "${GIT_ARGS[@]}" | wc -l | tr -d ' ')
echo "Total commits: $TOTAL"
echo "Active authors:"
git "${GIT_ARGS[@]}" | awk -F'|' '{print "  " $3}' | sort -u
