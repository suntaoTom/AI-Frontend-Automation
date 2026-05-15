#!/bin/bash
# Incomplete task reminder.
# Trigger: ConversationStart. Scans docs/tasks for in-progress tasks.

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
found=0

for f in "$PROJECT_ROOT"/docs/tasks/tasks-*.json; do
  [ -f "$f" ] || continue

  if grep -q '"status":\s*"in-progress"' "$f" 2>/dev/null; then
    if [ $found -eq 0 ]; then
      echo "Incomplete tasks found:"
      found=1
    fi
    tasks=$(grep -B2 '"in-progress"' "$f" \
      | grep '"taskId"' \
      | sed 's/.*"taskId":\s*"\(.*\)".*/\1/' \
      | tr '\n' ' ')
    basename=$(basename "$f")
    echo "  $basename: $tasks"
  fi
done
