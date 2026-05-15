# .agents/ - Codex Skill Entrypoints

> Codex loads project-local skills from this directory. These packages are the Codex-facing entrypoints for reusable workflows that need scripts, references, or progressive context loading.

## Directory Overview

| Directory | Responsibility | Notes |
|-----------|----------------|-------|
| [skills/](skills/) | Project-local Codex skills | Mirrors the reusable skill packages originally maintained under `.claude/skills/` |

## Boundary With .codex/

| Directory | Purpose |
|-----------|---------|
| `.agents/skills/` | Skills that Codex can discover and invoke from natural-language requests |
| `.codex/agents/` | Codex sub-agent configuration in TOML format |
| `.codex/hooks/` | Hook scripts and Codex hook configuration |
| `.claude/` | Legacy Claude Code prompts, rules, and historical source material |

## Maintenance

- Add a `SKILL.md` with frontmatter for every skill package.
- Keep each skill's scripts and references inside the same skill directory.
- Update [skills/README.md](skills/README.md) when adding, removing, or renaming a skill.
- Prefer `.agents/skills/<name>/...` paths in Codex-facing docs.
