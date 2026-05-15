---
name: ext-changelog
description: Generate a human-readable code change impact report — aggregates commits by module, identifies risk areas, and links to PRDs / tasks / bugs. Used for weekly reports, handoffs, and retrospectives. Unlike /release (structured changelog for version tags). Triggered when the user explicitly requests "change report / weekly report / what changed recently / handoff document".
---

# ext-changelog — Change Impact Report

You are now a code change analyst. Generate a readable impact report for git changes in the specified file/directory over a specified time range.

## Difference from /release

- `/release` — oriented toward **publishing**; outputs a structured changelog for tags/releases
- `/ext-changelog` — oriented toward **understanding**; outputs a human-readable change narrative for weekly reports / handoffs / retrospectives

## Execution Approach

**Run git log through scripts; AI handles grouping and interpretation** — do not let AI reconstruct commits from memory.

### Step 1: Get the commit list

```bash
bash .agents/skills/ext-changelog/scripts/range-commits.sh [since] [scope] [author]
```

Parameters (all optional):
- `since` — start date; defaults to `7 days ago`; also accepts `2026-04-01`
- `scope` — path scope; defaults to `.` (entire repo)
- `author` — author filter; defaults to empty (all authors)

Each output line: `hash|date|author|subject`

### Step 2: Get changed file statistics

```bash
bash .agents/skills/ext-changelog/scripts/changed-files.sh [since] [scope]
```

Output: A/M/D status for each file + its module directory.

### Step 3: AI aggregates by module

After reading the script output:
1. Group by `workspace/src/features/<module>/` prefix
2. Parse commit messages in `type(scope): description` format
3. Link to references in `docs/prds/` / `docs/tasks/` / `docs/bug-reports/`
4. Identify risk areas:
   - Large-scale changes (a single commit touching > 10 files)
   - Cross-module changes (one commit spanning multiple features)
   - Commit messages containing `WIP` / `TODO` / `FIXME`
   - Feature commits not linked to any PRD or task

## Output Format

```markdown
# Change Report: 2026-04-10 → 2026-04-17

## Summary
This week the main work was completing the login module, fixing 3 bugs, and refactoring the auth logic.

## Breakdown by Module

### login (12 commits, 5 files added, 3 files modified)
- Added username/password login + remember-me feature
- Added login form component, auth hook, and API wrapper
- PRD: docs/prds/login.md

### auth (3 commits, 2 files modified)
- Refactor: extracted shared auth logic into useAuth hook
- Impact: used by both login and register modules

## Bug Fixes
- Fixed Dashboard blank screen (login token expiry not redirecting)
- Fixed remember-me token not extending its validity period

## Risk Areas
- register page has not been regression-tested since the auth module refactor
- 2 [pending confirmation] items remain in login.md PRD

## Stats
- Total commits: 18
- Files added: 7
- Files modified: 11
- Active contributors: 2 (alice, bob)
```

## Usage

```
/ext-changelog                                    # this week's changes
/ext-changelog --since 2026-04-01                  # this month's changes
/ext-changelog workspace/src/features/login/       # login module changes
/ext-changelog --author alice --since 2026-04-14   # Alice's output over the last 3 days
```

## Design Principles

- All git commands go through scripts; AI never manually constructs `git log` arguments
- Reports should read as a **narrative**, not a raw dump of the commit list
- Risk areas must be specific (point to a file or module); no filler like "recommend more testing"
- Read-only: never modifies code
