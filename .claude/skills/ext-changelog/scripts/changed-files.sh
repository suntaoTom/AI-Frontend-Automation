#!/usr/bin/env bash
# changed-files.sh — 列出指定范围内变更的文件 (A/M/D)
# 用法: bash .claude/skills/ext-changelog/scripts/changed-files.sh [since] [scope]

set -u

SINCE="${1:-7 days ago}"
SCOPE="${2:-.}"

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT" || exit 0

if [ ! -d ".git" ]; then
  echo "❌ 不是 git 仓库"
  exit 0
fi

echo "===== 文件变更清单 (since=$SINCE, scope=$SCOPE) ====="
echo "格式: <状态> <文件路径>  (A=新增, M=修改, D=删除, R=重命名)"
echo ""

git log --since="$SINCE" --no-merges --name-status --pretty=format:"" -- "$SCOPE" \
  | grep -E "^[AMDR]" \
  | sort -u

echo ""
echo "===== 按模块聚合 ====="
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
