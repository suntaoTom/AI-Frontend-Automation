---
name: ext-dep-audit
description: Dependency security and health audit. Scans for pnpm vulnerabilities, outdated dependencies, redundant packages, license risks, and Umi built-in dependency conflicts. Triggered when the user explicitly requests "dependency audit / dependency scan / security scan / check outdated packages".
---

# ext-dep-audit — Dependency Audit

You are now a dependency security and health audit expert. Perform a comprehensive checkup on `workspace/package.json`.

## Execution Approach

**Run scripts first to get deterministic results, then use AI for interpretation** — do not have AI guess the output of `pnpm audit`.

### Step 1: Security Vulnerability Scan

```bash
bash .agents/skills/ext-dep-audit/scripts/pnpm-audit.sh
```

The script outputs JSON. Classify by severity when interpreting:

| Level | Action |
|-------|--------|
| critical / high | Must fix immediately; provide `pnpm update <package>@<safe-version>` |
| moderate | Assess scope of impact; recommend a fix timeline |
| low | Log it; address in the next iteration |

### Step 2: Umi Built-in Dependency Conflicts

```bash
bash .agents/skills/ext-dep-audit/scripts/check-umi-conflict.sh
```

The script cross-references [references/umi-builtin-deps.md](references/umi-builtin-deps.md); any conflicting dependency is flagged 🔴.

### Step 3: Outdated Dependency Check

```bash
bash .agents/skills/ext-dep-audit/scripts/check-outdated.sh
```

Compares current versions against the latest; flags anything **behind by a major version**.

### Step 4: Dependency Tree Health (AI analysis)

After the scripts finish, AI reads `workspace/package.json` and additionally checks:

1. **Deprecated packages** — look for the `deprecated` field
2. **Duplicate functionality** — e.g. moment + dayjs, lodash + ramda, axios + umi-request
3. **Oversized packages** — large packages where only a small part is used (e.g. full `lodash` instead of `lodash/get`)
4. **License risks** — copyleft licenses like GPL / AGPL (important for commercial projects)
5. **Too many direct dependencies** — more than 30 warrants review
6. **devDependencies misplaced in dependencies** — e.g. `@types/*`, `eslint`, `vitest`

## Output Format

```
🔴 Security vulnerabilities (must fix):
- [package@version] Vulnerability description (CVE-xxx)
  Fix: pnpm update <package>@<safe-version>

🟡 Health issues (recommended fixes):
- [package] Issue description
  Recommendation: Proposed solution

🔵 Optimization suggestions:
- [package] Suggestion description

📊 Summary:
  Direct dependencies: X
  Security vulnerabilities: X critical / X high / X moderate
  Outdated dependencies: X (major version behind)
  Redundant dependencies: X
  License risks: X
```

## Modes

| Invocation | Behavior |
|-----------|---------|
| `/ext-dep-audit` | Audit only; output report |
| `/ext-dep-audit --fix` | After auditing, **ask the user** whether to apply safe upgrades (patch + minor); major version upgrades are never applied automatically |

## Design Principles

- Scripts gather data; AI interprets and recommends — don't let AI guess versions or CVEs from memory
- Every fix recommendation must include a concrete command the user can copy and run
- Destructive operations (major upgrades, deprecated package replacements) are suggested only, never auto-executed
