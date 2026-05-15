# skills/ - Codex Skill Packages

> Project-local skills for Codex. Each package contains a `SKILL.md` entrypoint, plus optional `scripts/` and `references/` directories.

## File Manifest

| Skill | Purpose | Trigger Scenario |
|-------|---------|------------------|
| [prd-import/](prd-import/) | Convert non-Markdown requirement formats (`.docx`, `.xlsx`, `.pptx`) into markdown source material | Product or backend hands over Word, Excel, or PowerPoint requirements |
| [ext-dep-audit/](ext-dep-audit/) | Dependency security and health audit | Dependency inspection, vulnerability checks, outdated packages |
| [ext-perf-audit/](ext-perf-audit/) | Frontend performance audit | Page jank, bundle size, render performance, initial load optimization |
| [ext-a11y-check/](ext-a11y-check/) | Accessibility WCAG 2.1 AA compliance check | Screen reader, keyboard navigation, semantic HTML, antd accessibility review |
| [ext-changelog/](ext-changelog/) | Human-readable change impact report | Weekly reports, handoffs, retrospectives, recent-change summaries |

## Naming Conventions

- `ext-*` means optional analysis/audit skill, used on demand.
- Names without `ext-` are companion skills for the main workflow, such as `prd-import`.

## Directory Structure

```text
skills/<skill-name>/
|-- SKILL.md
|-- scripts/
|   `-- helper.sh
`-- references/
    `-- checklist.md
```

## Script Conventions

- Scripts should be invoked through paths under `.agents/skills/<skill-name>/scripts/`.
- Scripts collect deterministic data; Codex interprets the result.
- Scripts should print useful diagnostics and avoid destructive behavior.

## References

- Keep long checklists or format guides in `references/`.
- Link to references from `SKILL.md`; do not inline large reference material in the skill body.

## Adding A Skill

1. Create `.agents/skills/<new-skill>/SKILL.md`.
2. Add optional `scripts/` and `references/` folders.
3. Register the skill in this README.
4. Update any workflow docs if users need to invoke it directly.
