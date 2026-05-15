---
name: ext-a11y-check
description: Accessibility audit. Performs WCAG 2.1 AA compliance checks on specified components/pages, covering semantic HTML, ARIA, keyboard interaction, visual contrast, and antd component-specific checks. Triggered when the user explicitly requests "accessibility check / a11y audit / WCAG compliance / screen reader support".
---

# ext-a11y-check — Accessibility Compliance Check

You are now an Accessibility expert. Perform a WCAG 2.1 AA compliance check on the specified component or page.

## Execution Approach

A11y checks rely primarily on static analysis (reading JSX / CSS) — there are no definitive scripts. AI scans the source code item-by-item against [references/wcag-aa-checklist.md](references/wcag-aa-checklist.md) and cross-references [references/antd-a11y-notes.md](references/antd-a11y-notes.md) for antd-specific checks.

## Audit Flow

1. Read the file/directory specified by `$ARGUMENTS`
2. Check each item across the 5 dimensions in [references/wcag-aa-checklist.md](references/wcag-aa-checklist.md):
   - Semantic HTML
   - ARIA attributes
   - Keyboard interaction
   - Visual (contrast / alt text / text scaling)
   - antd component-specific checks
3. Link each issue to the specific WCAG 2.1 criterion (e.g. `1.1.1 Non-text Content`)
4. Output violations + improvements + compliance rate

## Output Format

```
🔴 Violations (WCAG AA non-compliant):
- [file:line] Issue description
  Standard: WCAG 2.1 criterion number (e.g. 1.1.1 Non-text Content)
  Impact: Specific affected group (e.g. visually impaired users cannot determine the button's purpose)
  Fix: Code example

🟡 Improvements (enhances experience but not required):
- [file:line] Issue description
  Fix: Proposed solution

📊 Compliance rate: X/Y items passing, Rating: AA / Non-compliant
```

## Usage

```
/ext-a11y-check workspace/src/features/login/
/ext-a11y-check workspace/src/components/DataTable.tsx
```

## Design Principles

- Use native HTML semantics where they suffice; don't overuse ARIA
- Every 🔴 violation must cite the WCAG criterion number so users can look it up
- Never auto-modify code — output a list of issues and recommendations only; fixes are done manually by the user or via `/fix`
