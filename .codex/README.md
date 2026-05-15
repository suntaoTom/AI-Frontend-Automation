# .codex/ - Codex Runtime Configuration

> Codex-facing runtime configuration for this project. This directory contains sub-agent definitions and hook configuration adapted from the original Claude Code setup.

## Directory Overview

| Directory/File | Responsibility |
|----------------|----------------|
| [agents/](agents/) | Codex sub-agent definitions in TOML format |
| [hooks/](hooks/) | Hook scripts used by Codex |
| [hooks.json](hooks.json) | Codex hook registration |

## Relationship To Other Directories

| Directory | Purpose |
|-----------|---------|
| `.agents/skills/` | Discoverable Codex skills with scripts and references |
| `.codex/` | Runtime configuration for Codex agents and hooks |
| `.claude/` | Legacy Claude Code commands, rules, and historical source material |
| `AGENTS.md` | Codex onboarding and project rules summary |

## Current Status

The Codex migration keeps `.claude/` as source documentation for legacy slash-command prompts and rule files, while Codex-native reusable pieces live here and under `.agents/`.

## Maintenance

- Add new Codex sub-agents under `.codex/agents/*.toml`.
- Register hook scripts in `.codex/hooks.json`.
- Keep hook scripts warning-only unless the project explicitly changes that policy.
- Prefer `AGENTS.md` for Codex onboarding language.
