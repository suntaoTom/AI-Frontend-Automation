# _imports/

**Raw requirements in markdown**, converted by the `prd-import` skill — not the final PRD.

## Purpose

Non-markdown files provided by backend or product teams (`.docx / .xlsx / .pptx`, etc.) are converted to markdown by the [prd-import skill](../../../.agents/skills/prd-import/SKILL.md) and deposited here, serving as input material for the `/prd` command.

## Flow

```
Product's login-requirements.docx
    ↓  pnpm prd:import login-requirements.docx
docs/prds/_imports/login-requirements-2026-04-20.md   ← raw translation, kept here for traceability
    ↓  /prd @docs/prds/_imports/login-requirements-2026-04-20.md
docs/prds/login.md                                     ← final PRD (goes through clarification + template)
```

## Naming Convention

`<original-filename>-<YYYY-MM-DD>.md` (if a duplicate exists on the same day, `-2` / `-3` is appended automatically).

## Should These Be Committed to Git?

**Depends on the situation**:

| Scenario | Commit? |
|----------|---------|
| Internal company requirements with team traceability value | ✅ Commit — allows reviewers to compare against the source during PR review |
| Contains sensitive information (client names / unreleased business details) | ❌ Add to `.gitignore`, keep locally |
| One-off experiments / drafts | ❌ Do not commit; delete when done |

Default is to **commit**; manually delete + `.gitignore` the sensitive ones individually.

## What Not to Do

- ❌ Do not manually edit files here — they are "translations of the source"; editing them breaks the link to the original
- ❌ Do not treat `_imports/` files as the final PRD — they have not gone through template validation and have no `[pending confirmation]` annotations
- ❌ Do not reference `_imports/` paths in `/plan` — `/plan` requires a formal PRD generated via `/prd` + the template
