# Codex Workflow

An AI-driven R&D workflow framework for turning requirements into traceable PRDs, task manifests, implementation, tests, reviews, builds, deployment notes, and release/change reports.

This repository has been migrated toward Codex while keeping the original Claude Code materials as legacy source prompts.

## Current Codex Entrypoints

| Area | Location | Purpose |
|------|----------|---------|
| Onboarding | [AGENTS.md](AGENTS.md) | Project rules summary for Codex |
| Skills | [.agents/skills/](.agents/skills/) | Codex-discoverable skill packages |
| Sub-agents | [.codex/agents/](.codex/agents/) | Codex sub-agent TOML definitions |
| Hooks | [.codex/hooks.json](.codex/hooks.json), [.codex/hooks/](.codex/hooks/) | Codex hook configuration and scripts |
| Legacy prompts/rules | [.claude/](.claude/) | Original Claude Code commands and the shared rule files |
| Workflow docs | [docs/WORKFLOW.md](docs/WORKFLOW.md) | Operations manual |

## Framework Shape

```text
claude-code-workflow/
|-- AGENTS.md
|-- .agents/
|   `-- skills/
|-- .codex/
|   |-- agents/
|   |-- hooks/
|   `-- hooks.json
|-- .claude/
|   |-- commands/
|   |-- rules/
|   |-- skills/
|   |-- agents/
|   `-- hooks/
|-- docs/
|   |-- WORKFLOW.md
|   |-- prds/
|   |-- tasks/
|   |-- bug-reports/
|   `-- retrospectives/
`-- workspace/
    `-- scripts/
```

## What Is Migrated

- `AGENTS.md` is now the Codex onboarding document.
- Extension skills and `prd-import` have Codex-facing copies under `.agents/skills/`.
- Four sub-agents have Codex TOML definitions under `.codex/agents/`.
- Hook scripts and hook registration have Codex-facing copies under `.codex/`.

## What Remains Legacy

- `.claude/commands/` remains the original slash-command prompt library.
- `.claude/rules/` remains the shared rule source for coding style, testing, hardcoding, file docs, and tech stack.
- Some historical docs under `docs/` and `.claude/` intentionally reference Claude Code because they record original decisions.

## Where To Start

| Goal | Open |
|------|------|
| Use this project with Codex | [AGENTS.md](AGENTS.md) |
| Understand the end-to-end workflow | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Inspect Codex runtime configuration | [.codex/README.md](.codex/README.md) |
| Inspect Codex skills | [.agents/skills/README.md](.agents/skills/README.md) |
| Understand original framework decisions | [docs/DECISIONS.md](docs/DECISIONS.md) |

## Notes

- The `workspace/` frontend scaffold is not fully present in this checkout; only `workspace/scripts/prd-import.mjs` exists at the time of migration.
- Root `pnpm dev`, `pnpm build`, and `pnpm gen:api` expect a populated `workspace/package.json`.
- The migration preserves legacy `.claude/` files rather than deleting them so future updates can compare Codex-facing files with the original prompts.

## License

[MIT](LICENSE)
