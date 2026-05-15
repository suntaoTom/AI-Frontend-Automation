# hooks/ - Codex Automation Hooks

> Configured in `.codex/hooks.json`, executed automatically on supported Codex events. Warn only, never block.

## File Manifest

| File | Trigger | Purpose |
|------|---------|---------|
| check-hardcode.sh | After each ts/tsx/js/jsx file edit/create | Scans for hardcoded Chinese strings; warns immediately on P0 rule violations |
| check-tasks-status.sh | At the start of a session, if supported by the host | Lists in-progress tasks; reminds where the last session left off |
| pre-commit-check.sh | Before git commit shell commands | Checks whether task status was forgotten to be updated to done |

## Adding A New Hook

1. Create a `.sh` script in this directory and make it executable where applicable.
2. Add a comment at the top of the script stating trigger event and purpose.
3. Reference it under the corresponding event in `.codex/hooks.json`.
4. Update the file manifest in this README.

## Available Environment Variables

| Variable | Available In | Description |
|----------|--------------|-------------|
| `$CLAUDE_FILE_PATH` | PostToolUse (Edit/Write) | Path of the file just edited; retained for compatibility with migrated scripts |
| `$CLAUDE_TOOL_INPUT` | PreToolUse | Input content of the tool about to be executed; retained for compatibility with migrated scripts |

## Design Principles

- Warn only, never block.
- Stay silent when no issues are found.
- Keep hooks lightweight and bounded by a short timeout.
