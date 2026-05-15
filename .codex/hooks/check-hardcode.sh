#!/bin/bash
# P0 hardcode check.
# Trigger: PostToolUse (Edit|Write). Scans edited ts/tsx/js/jsx files for Chinese copy that should go through i18n.

filepath="$CLAUDE_FILE_PATH"

[ -z "$filepath" ] && exit 0
echo "$filepath" | grep -qE '\.(tsx?|jsx?)$' || exit 0
[ -f "$filepath" ] || exit 0

matches=$(grep -nP '[\x{4e00}-\x{9fff}]' "$filepath" 2>/dev/null \
  | grep -vE '^[0-9]+:\s*(//|/\*|\*|\*/)' \
  | head -5)

if [ -n "$matches" ]; then
  echo "P0 hardcode check: Chinese copy found in $filepath. Please move user-facing text to i18n."
  echo "$matches"
fi
