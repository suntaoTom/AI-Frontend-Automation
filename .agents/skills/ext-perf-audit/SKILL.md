---
name: ext-perf-audit
description: Frontend performance audit. Analyzes bundle size, React rendering performance, network waterfalls, memory leaks, and initial load. Triggered when the user explicitly requests "performance audit / page jank analysis / bundle size optimization / initial load optimization".
---

# ext-perf-audit — Performance Audit

You are now a frontend performance optimization expert. Perform a performance audit on the specified component / page / module.

## Execution Approach

**Run scripts to gather data first, then use AI for static analysis.** Scripts handle measurement; AI handles pattern recognition.

### Step 1: Build Artifact Analysis (if dist exists)

```bash
bash .agents/skills/ext-perf-audit/scripts/bundle-size.sh
```

Script output:
- Total size + chunks sorted by size
- List of JS files larger than 100KB
- List of asset files larger than 500KB (images / fonts)

AI identifies:
- Warnings for any single chunk > 500KB
- Images not compressed / not converted to WebP
- No route-level code splitting (e.g., an oversized `index.*.js`)

### Step 2: Dependency Size Quick Scan

```bash
bash .agents/skills/ext-perf-audit/scripts/heavy-deps.sh
```

The script lists the top 20 largest packages in node_modules. AI cross-references the "Common Bundle Killers" section in [references/perf-checklist.md](references/perf-checklist.md) and provides recommendations.

### Step 3: Static Code Scan (AI reads source)

Check the directory specified by `$ARGUMENTS` across the 5 dimensions in [references/perf-checklist.md](references/perf-checklist.md):

1. **Bundle size** — full-library imports / duplicate dependencies / console.log / missing lazy loading
2. **Rendering performance** — missing memo/useMemo/useCallback / missing keys / new references created in render path / state hoisted too high / JS doing CSS's job
3. **Network performance** — serial requests that could be parallel / missing caching / image formats / missing prefetch
4. **Memory** — useEffect missing cleanup / closures holding large objects / no virtual scrolling
5. **Initial load** — blocking the critical path / missing Skeleton / waterfall requests

## Output Format

```
🔴 Critical (impacts user experience):
- [file:line] Issue description
  Impact: Estimated impact (e.g. +800ms on initial load / bundle +400KB)
  Fix: Specific solution + code example

🟡 Moderate (worth optimizing):
- [file:line] Issue description
  Fix: Solution

🔵 Suggestion (nice to have):
- [file:line] Issue description

📊 Overall: X/10, one-sentence summary
```

## Usage

```
/ext-perf-audit workspace/src/features/login/
/ext-perf-audit workspace/src/pages/dashboard/
/ext-perf-audit workspace/src/components/DataTable.tsx
```

## Design Principles

- If a script can measure it, don't ask AI to estimate it (bundle size / dependency size)
- Every recommendation must include an **estimated impact**; suggestions without numbers go under 🔵 only
- Avoid recommending aggressive refactors; prioritize fixes with maximum gain for minimum change
