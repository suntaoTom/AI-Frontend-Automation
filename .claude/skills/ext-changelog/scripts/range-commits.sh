#!/usr/bin/env bash
# range-commits.sh — 输出指定范围内的 commit 列表
# 用法: bash .claude/skills/ext-changelog/scripts/range-commits.sh [since] [scope] [author]
# 例:   bash ... "7 days ago"
#       bash ... "2026-04-01"
#       bash ... "7 days ago" "workspace/src/features/login/"
#       bash ... "7 days ago" "." "alice"

set -u

SINCE="${1:-7 days ago}"
SCOPE="${2:-.}"
AUTHOR="${3:-}"

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 0

if [ ! -d ".git" ]; then
  echo "❌ 不是 git 仓库"
  exit 0
fi

echo "===== Commit 列表 (since=$SINCE, scope=$SCOPE, author=${AUTHOR:-all}) ====="

GIT_ARGS=(log --since="$SINCE" --no-merges --pretty=format:"%h|%ad|%an|%s" --date=short)
if [ -n "$AUTHOR" ]; then
  GIT_ARGS+=(--author="$AUTHOR")
fi
GIT_ARGS+=(-- "$SCOPE")

git "${GIT_ARGS[@]}"
echo ""  # 保证最后换行
echo ""
echo "===== 统计 ====="
TOTAL=$(git "${GIT_ARGS[@]}" | wc -l | tr -d ' ')
echo "总 commit: $TOTAL"
echo "活跃作者:"
git "${GIT_ARGS[@]}" | awk -F'|' '{print "  " $3}' | sort -u
