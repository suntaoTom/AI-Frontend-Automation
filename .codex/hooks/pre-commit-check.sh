#!/bin/bash
# Pre-commit task status check.
# Trigger: PreToolUse (Bash). Warns before git commit when tasks are still in-progress.

echo "$CLAUDE_TOOL_INPUT" | grep -q 'git commit' || exit 0

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
has_inprogress=0

for f in "$PROJECT_ROOT"/docs/tasks/tasks-*.json; do
  [ -f "$f" ] || continue

  if grep -q '"status":\s*"in-progress"' "$f" 2>/dev/null; then
    if [ $has_inprogress -eq 0 ]; then
      echo "Pre-commit check: the following tasks are still in-progress. Confirm whether they should be marked done:"
      has_inprogress=1
    fi
    tasks=$(grep -B2 '"in-progress"' "$f" \
      | grep '"taskId"' \
      | sed 's/.*"taskId":\s*"\(.*\)".*/\1/' \
      | tr '\n' ' ')
    basename=$(basename "$f")
    echo "  $basename: $tasks"
  fi
done
