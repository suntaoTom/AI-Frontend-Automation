# agents/ - Codex Sub-Agent Definitions

> Specialized Codex sub-agents for bounded, parallel work. These TOML files are adapted from the legacy `.claude/agents/*.md` prompts.

## File Manifest

| Agent | Responsibility | Typical Use |
|-------|----------------|-------------|
| [test-writer.toml](test-writer.toml) | Generate tests from source-file `@rules`, one `it()` per rule | Parallel test generation after implementation |
| [code-reviewer.toml](code-reviewer.toml) | Read-only rule review for files or directories | Independent review or large-directory review split |
| [bug-fixer.toml](bug-fixer.toml) | Fix one triaged true bug with minimal changes | Parallel handling of independent bug reports |
| [meta-auditor.toml](meta-auditor.toml) | Read-only framework health scan and retrospective report | Milestone or maintenance audits |

## TOML Shape

Each file uses:

```toml
name = "agent-name"
description = "When to use this sub-agent"
developer_instructions = """
Full role, input, steps, output format, and boundaries.
"""
```

## Boundaries

- Keep each agent narrowly scoped.
- Do not encode paths that do not exist in the repository.
- Codex-facing references should point to `AGENTS.md`, `.agents/skills/`, `.codex/`, or the legacy `.claude/` files only when those files remain the actual source material.
