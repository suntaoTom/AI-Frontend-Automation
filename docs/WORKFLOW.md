# Workflow Operations Manual

> New members: read "🚀 Quick Start" first to run through it once, then refer to "📝 Eight-Step Method" for specific tasks.

---

## 🚀 Quick Start (Required reading when opening the project for the first time)

### Environment Setup (3 commands)

```bash
# 1. Install dependencies
pnpm install

# 2. Place the OpenAPI file from the backend in the designated location
cp <backend-file> workspace/api-spec/openapi.json

# 3. Generate TS types + start the project
pnpm gen:api && pnpm dev
```

When you see Umi start successfully and the browser opens, the environment is ready.

### Minimal Complete Example (Building a "Login" feature from scratch)

```bash
# Start Claude
claude

# ① Let the AI understand the project (required on first use)
/start

# ② Convert verbal requirements to PRD (AI will ask a few questions, then generate docs/prds/login.md)
/prd I want to build a user login feature

# ③ Manually review the PRD, fill in [TBD] items (critical! leaving them empty causes downstream errors)
# Open docs/prds/login.md in your editor and make changes

# ④ Break down tasks
/plan @docs/prds/login.md

# ⑤ Code (AI implements in tasks.json order)
/code @docs/tasks/tasks-login-*.json

# ⑥ Generate tests and run automatically
/test workspace/src/features/login/

# ⑦ Code review
/review workspace/src/features/login/

# ⑧ Commit
git commit -m "feat(login): ..."

# ⑨ Build + local verification (as needed)
/build web

# ⑩ Deploy to production (as needed)
/deploy web --env staging

# ⑪ Publish changelog (as needed)
/release v1.0.0
```

After running through it once, refer to the "📝 Eight-Step Method" below for details.

---

## 🗺️ Decision Tree: What should I do now?

```
Open project
    ↓
Environment installed?                          No → pnpm install + pnpm gen:api
    ↓ Yes
Does the feature have a PRD?                    No → /prd <requirement>
    ↓ Yes
Are all PRD [TBD] items filled in?              No → Fill manually (cannot skip)
    ↓ Yes
Are all PRD APIs in openapi.json?               No → See "What to do when APIs are missing" (below)
    ↓ Yes
Has the task list been broken down?             No → /plan @docs/prds/xxx.md
    ↓ Yes
Is the code written?                            No → Let AI implement per task list
    ↓ Yes
Are tests generated?                            No → /test <directory>
    ↓ Yes
Has it been reviewed?                           No → /review <directory>
    ↓ Yes
git commit
    ↓
Want to preview locally?                         Yes → /build <platform> → local preview/install
    ↓ No or done
Need to deploy?                                  No → Done
    ↓ Yes
/deploy <platform> --env <environment>
    ↓
Need to publish changelog?                      No → Done
    ↓ Yes
/release <version> → Done
```

---

## 📝 Eight-Step Method (Daily Development)

### Step 1 — Requirements to PRD

#### If requirements are in non-markdown format (Word / Excel / PPT)

Use the `prd-import` skill to convert to markdown first, then run `/prd`:

```bash
# Product gave a Word document
pnpm prd:import requirements/login-requirements.docx
# → docs/prds/_imports/login-requirements-2026-04-20.md

# Then use the converted md as input
/prd @docs/prds/_imports/login-requirements-2026-04-20.md
```

| Input Type | How to Handle |
|---------|---------|
| Text / `.md` / `.txt` | Run `/prd` directly |
| **`.docx` / `.xlsx` / `.pptx`** | **Run `pnpm prd:import` first, then `/prd @<converted-output>`** |
| `.pdf` | Directly `/prd @<file>.pdf` (Claude Code native support) |
| Images (`.png` / `.jpg`) | Directly `/prd @<file>.png` (multimodal recognition) |
| `.doc` / `.xls` / `.ppt` (old formats) | Save as new format (`.docx` etc.) in Word/WPS first, then convert |
| **Online docs** (Feishu/Notion/Yuque/Tencent Docs/Google Docs) | Export `.md` or `.docx` from the platform, then handle as per the corresponding row above. Notion / Yuque export directly to `.md` is the easiest. See [prd-import/references/formats.md](../.agents/skills/prd-import/references/formats.md#online-docs) |

Before using `prd:import` for the first time, install dependencies once: `cd workspace && pnpm install` (automatically installs mammoth + xlsx). See [.agents/skills/prd-import/SKILL.md](../.agents/skills/prd-import/SKILL.md) for the Codex skill entrypoint.

#### When using text / existing md directly

```bash
/prd I want to build a user login feature
```

**What AI will do**:
- Ask 3-5 key questions (login methods? security policy? backend API? **design mockups?**)
- Scan `workspace/api-spec/openapi.json` to recommend reusable APIs, generate stubs for missing ones
- If design mockups are available (Figma link / local file / MCP), generate a "feature-to-design-frame mapping" table
- Generate a draft to `docs/prds/<module-name>.md`, with `[TBD]` annotations

**What you need to do**:
- Open the generated PRD and manually review — **see [prds/REVIEW.md](./prds/REVIEW.md) for detailed instructions**
- Confirm the "Design Mockups" section links are correct (click Figma links to verify they open)
- Run `/prd-check @docs/prds/xxx.md` periodically to self-check progress
- All `[TBD]` items must be cleared before running `/plan`

**Common blockers**:
- ❓ `/prd-check` reports errors and you don't know how to fix → See [prds/REVIEW.md](./prds/REVIEW.md) for three handling approaches (fill in / mark for next iteration / delete section)
- ❓ APIs marked 🆕 by AI → See "What to do when APIs are missing" below

---

### Step 2 — Break PRD into Tasks

⚠️ **Pre-check**: Confirm `workspace/api-spec/openapi.json` is up to date (run `pnpm gen:api` if needed)

```bash
/plan @docs/prds/login.md
```

**What AI will do**:
- Validate that all ✅-status operationIds in the PRD exist in openapi.json
- Generate `docs/tasks/tasks-login-*.json` sorted by dependencies
- Each task includes `prdRef` + `businessRules`

**What you need to do**:
- Review the task list to see if it's reasonable
- For many tasks, you can work in batches

**Common blockers**:
- ❓ AI reports "operationId not found" → Pull latest openapi.json, or confirm with backend
- ❓ AI reports "🆕 API not reviewed" → See "What to do when APIs are missing"

---

### Step 3 — Coding

⚠️ **Pre-check**: Ensure types are generated `pnpm gen:api`

```bash
/code @docs/tasks/tasks-login-*.json

# Resume after interruption
/code @docs/tasks/tasks-login-*.json --from T005

# Only do specific tasks (partial redo)
/code @docs/tasks/tasks-login-*.json --only T003,T004
```

**What AI will do**:
- Pre-validation: PRD still valid (embedded `/prd-check`) + `workspace/src/types/api.ts` generated
- Execute in strict `dependencies` order, status `pending → in-progress → done`
- Write JSDoc with `@prd` / `@task` / `@rules` (business rules copied verbatim) for each file
- Import API types from `@/types/api`, no hand-writing
- Maintain the file manifest in the directory's README.md
- When PRD is ambiguous / OpenAPI is missing fields / needs a decision → change to `blocked` and stop to ask you

**What you need to do**:
- Keep `pnpm dev` running and check the browser
- Answer AI when it asks, let it continue otherwise

**Common blockers**:
- ❓ TS error `Cannot find module '@/types/api'` → Run `pnpm gen:api`
- ❓ Wrong fields → Check if workspace/api-spec/openapi.json is the latest
- ❓ AI reports PRD has changed → Go back to Step 1/2, fix PRD and re-run `/plan`

#### What happens when you open a new agent after interruption (checkpoint recovery)

The checkpoint memory for `/code` is **entirely in the `status` field of tasks.json** — no hidden cache. Open a new agent and re-run `/code @docs/tasks/xxx.json`, and it will:

| Status | Behavior |
|------|------|
| `done` | Auto-skip, no redo |
| `pending` | Continue in `dependencies` order |
| `in-progress` | **Stop and ask you** (previous session interrupted at this task, file state unknown) |

When encountering `in-progress`, AI will read `task.filePath` + JSDoc, determine if the file exists and if `@rules` already covers `businessRules` for this task, then give you 4 options:

- **A. Continue completing** — file is partially written, complete based on current state
- **B. Delete and redo** — existing code deviates from rules, delete the file and rewrite from scratch
- **C. Mark as done** — it's actually complete, just didn't get to update the status last time
- **D. Revert to pending** — no real code changes, run through normal flow again

> ⚠️ Don't manually change `status` — let AI read the current state first and decide. If you already know where the breakpoint is, use `--from T005` to skip this process directly.

---

### Step 4 — Generate Tests

```bash
/test workspace/src/features/login/
```

**What AI will do**:
- Read the `@rules` from source code JSDoc, list the rules for you to confirm
- Generate tests based on rules (one `it()` per rule)
- Run automatically, failures diagnosed into 4 categories:

| Failure Type | Handling |
|---------|------|
| Test code error (selectors, etc.) | AI auto-fixes |
| Missing environment config / dependencies | Stop and ask you |
| Wrong test expectation (AI guessed wrong) | AI auto-corrects the expectation |
| Source code has a real bug | Stop and ask you |

**What you need to do**:
- Review the rules list to confirm nothing is missed
- When tests fail, read AI's report to decide which side to fix

**Common blockers**:
- ❓ Tests keep failing → Suspect the test first, source code last (see Iron Rule 3)

---

### Step 5 — Review & Commit

```bash
/review workspace/src/features/login/
```

Fix the issues pointed out by AI, then:

```bash
git commit -m "feat(login): implement login feature"
```

---

### Step 6 — Build + Local Verification

```bash
# Build Web, automatically start local preview
/build web

# Build Android APK
/build android

# Build multiple platforms simultaneously
/build web,android

# Build with specific environment config (e.g., staging uses different API base URL)
/build web --env staging

# Clean old artifacts and rebuild
/build web --clean
```

**What AI will do**:
- Check if dependencies + type files are ready
- Execute the platform-specific build command
- Validate artifacts (files exist, size is reasonable, signature is correct)
- Start local preview or output install commands

**What you'll get after building**:

| Platform | Output |
|------|------|
| Web | 🌐 `http://localhost:4173` local preview + `workspace/dist/` directory |
| Android | 📱 APK file path + `adb install` command |
| iOS | 📱 Simulator install command or .ipa path |
| HarmonyOS | 📱 `hdc install` command + .hap path |

**What you need to do**:
- Check the result locally, or install on your phone to try
- No issues → `/deploy` to go live
- Issues found → fix code, then `/build` again

**Common blockers**:
- ❓ Build reports TS errors → Fix code first, then re-run `/build`
- ❓ APK install fails → Check if developer mode + USB debugging is enabled on the phone
- ❓ Just want to build without preview → `/build web --no-preview`

---

### Step 7 — Deploy

```bash
# Interactive: select platform and environment
/deploy

# Specify platform and environment
/deploy web --env staging

# Deploy multiple platforms simultaneously
/deploy web,ios,android --env staging

# Full-platform production release
/deploy all --env production

# Canary release (production only)
/deploy web --env production --canary 10%

# Specify CI/CD platform
/deploy web --env staging --ci gitlab

# Rollback
/deploy web --env production --rollback
```

**What AI will do**:
- Check `workspace/deploy.config.ts` configuration
- Validate Git status (production must be on main branch with no uncommitted changes)
- Check if build artifacts exist (if not, prompt to run `/build` first, or add `--rebuild` to build automatically)
- Push artifacts to server/platform → verify → notify (DingTalk/Feishu) → output access URL

**Platform × Environment Overview**:

| Platform | staging | production |
|------|---------|------------|
| Web | CI → CDN test domain | CI → CDN production domain + optional canary |
| iOS | CI → TestFlight | CI → App Store Connect |
| Android | CI → internal distribution (Pgyer/fir) | CI → Google Play |
| HarmonyOS | CI → internal distribution | CI → AppGallery Connect |

**What you need to do**:
- First time: create `workspace/deploy.config.ts` (AI will output a template)
- Configure CI/CD secrets (certificates/tokens/webhooks)
- AI will stop and wait for your approval when deploying to production
- AI will stop and wait for your confirmation between each canary release step

**Common blockers**:
- ❓ No deploy.config.ts → Running `/deploy` for the first time will output a template
- ❓ CI trigger fails → Check token permissions (GitHub: `workflow` scope, GitLab: `api` scope)
- ❓ Signing fails → Check if certificate/keystore is configured correctly
- ❓ Want to use GitLab/Jenkins instead of GitHub → Switch `ci.platform` in deploy.config.ts

**Supported CI/CD platforms**: GitHub Actions / GitLab CI / Jenkins

---

### Step 8 — Publish Changelog (Optional)

```bash
# Automatically aggregate all changes since the last tag
/release v1.0.0

# Or preview without specifying a version
/release
```

**What AI will do**:
- Read git log, categorize and aggregate commits by `type(scope)`
- Extract associated PRDs / tasks / bug reports / PR numbers from commit messages
- Generate structured changelog (new features / fixes / refactoring / other + statistics)

**What you need to do**:
- Review the changelog preview
- AI will ask step by step: save to CHANGELOG.md? Create git tag? Publish GitHub Release? You decide each step.

---

## 🐛 What to do when you find a bug

### Three bug sources, all go through `/bug-check` triage then `/fix`

| Source | Command | What `/bug-check` does |
|------|------|---------------------|
| Found during local development | `/fix <description>` | Triage (real bug / feature / missing rule) + ask clarifying questions → solidify report → stop for you to review |
| Issues reported by `/review` | `/fix @docs/review-reports/xxx.md --pr` | Validate format + triage |
| **Bugs from QA AI testing** | `/fix @docs/bug-reports/xxx.md --pr` | Validate format + triage |

> **Core logic**: "Code doesn't implement a rule that exists in the PRD" = bug → `/fix`; "Rule doesn't exist in the PRD" = missing rule → `/prd` to add it. `/bug-check` handles this routing.

**Standalone check**: You don't have to run `/fix` — you can run `/bug-check @docs/bug-reports/xxx.md` anytime to validate the format and see triage results.

### QA AI Testing Integration (Important)

The bridge between QA AI and `/fix` is **`docs/bug-reports/<date>-<module>.md`** (format: see [bug-reports/_template.md](./bug-reports/_template.md)).

**The system prompt for QA AI** is in [bug-reports/README.md](./bug-reports/README.md) — copy it verbatim, and it will write reports using the template without modifying code on its own.

**Integration flow**:

```
You ask QA AI to test /login
    ↓
QA AI writes docs/bug-reports/2026-04-16-login.md (3 bugs)
    ↓
(Optional) /bug-check @docs/bug-reports/2026-04-16-login.md  ← self-check format + triage
    ↓
You review briefly (3-5 min, filter out false positives)
    ↓
/fix @docs/bug-reports/2026-04-16-login.md --pr
    ↓
/fix embeds /bug-check validation → groups by priority + module → generates 1~N draft PRs
    ↓
You review PRs → merge
```

### Verbal bug report flow

```
/fix login page white screen
    ↓
/fix embeds /bug-check → triage + clarifying questions → solidify to docs/bug-reports/<date>-<module>.md → stop
    ↓
You review the report (confirm assumptions, correct details)
    ↓
/fix @docs/bug-reports/<date>-<module>.md [--pr]
    ↓
Normal fix flow
```

> Verbal bugs are also persisted as report files, treated the same as QA AI output, with unified traceability.

### Fully Automated Loop (Future optional)

`.github/workflows/claude-fix.yml` is already written. When enabled:
- Comment `@claude fix` on a GitHub issue → workflow automatically triggers `/fix --pr --headless`
- Setup steps: see [.github/SETUP.md](../.github/SETUP.md)

**When not enabled, run commands locally** — it uses the same `/fix.md` either way.

---

## 🔌 Frontend-Backend Collaboration (Important)

### Core philosophy: Contract first, frontend doesn't wait for backend

The API contract (`api-spec/openapi.json`) is the agreement between frontend and backend. Once the contract is reviewed and locked, both sides can develop in parallel.

### What to do when APIs are missing (backend hasn't implemented yet)

**Don't wait**. Three options:

#### Option A (Recommended): Frontend writes stub, merges into main openapi.json after review

```
/prd — AI auto-generates stubs placed in PRD "API Proposals" section
    ↓
Frontend + backend review session (15-30 minutes)
    ↓
Backend merges stub into api-spec/openapi.json
    ↓
Frontend pnpm gen:api → has types → develop + write mocks
```

#### Option B (Fallback): Local stub file

When to use: stub is reviewed and approved, but backend can't merge to main file short-term (off work / cross-timezone / later in schedule).

**When to generate `openapi.local.json`** (clear timing, don't create arbitrarily):

| Stage | Create local? | Note |
|------|------------|------|
| During `/prd` draft generation | ❌ | Stubs only go in PRD "API Proposals" section, not in local before review |
| Manual PRD review / `/prd-check` / `/plan` | ❌ | Stub is still proposal status, may change |
| **After frontend-backend review is approved, but backend can't immediately merge to main** | ✅ **Create here** | Manually copy reviewed stubs from PRD to `openapi.local.json` |
| Backend has merged stubs into main `openapi.json` | ❌ Delete instead | Main file already has it, local is no longer needed |

**Steps** (when Option B is triggered):

```bash
# 1. Create the file if it doesn't exist
touch workspace/api-spec/openapi.local.json
```

```json
// workspace/api-spec/openapi.local.json — copy reviewed stubs from PRD "API Proposals" section
{
  "openapi": "3.0.0",
  "info": { "title": "local stubs", "version": "0.0.1" },
  "paths": { /* paste reviewed yaml from PRD, converted to json */ }
}
```

```bash
# 2. Generate types (gen-api.mjs automatically merges main json + local)
pnpm gen:api

# 3. Develop normally, types come from @/types/api
pnpm dev
```

**Key rules**:
- ⚠️ **One-way transfer**: PRD stubs are the source, local is just a copy — don't reverse-modify
- ⚠️ **Current iteration only**: Once backend implements, immediately delete the corresponding entry from local (the whole file can also be deleted)
- ⚠️ **No unreviewed stubs**: Developing based on unreviewed fields means wasted work when fields change

#### Option C: Forbidden

Don't hand-write types + hand-write mocks — it will cause integration failures.

---

## 🛠️ Daily API Type Operations

### When backend publishes a new openapi.json

```bash
# 1. Replace the file
cp <new-file-from-backend> workspace/api-spec/openapi.json

# 2. Regenerate types
pnpm gen:api

# 3. Let TS tell you which code is affected
pnpm dev

# 4. Fix code per errors + mock + tests → commit when all green
git add workspace/api-spec/openapi.json workspace/src/types/api.ts <affected-files>
```

### Mandatory rules

- ❌ Don't hand-write request/response types, always `import type { paths } from '@/types/api'`
- ❌ Don't manually edit `workspace/src/types/api.ts` (will be overwritten by gen:api)
- ❌ Don't manually edit `workspace/api-spec/openapi.json` (push backend to fix it)
- ✅ Use generated types in mocks and test assertions, let TS ensure consistency

---

## ⚠️ Three Iron Rules

1. **PRD is the source of truth** — don't run `/plan` without a PRD, AI will make up rules
2. **`[TBD]` must be filled manually** — `/plan` has a hard gate that errors on `[TBD]` (but `[default assumption]` won't block — confirm at review)
3. **When tests fail, suspect the test first** — order: test code → environment → test expectation → source code

---

## 📖 Glossary

| Term | Meaning | First seen |
|------|------|----------|
| `operationId` | The unique name for each API in OpenAPI (more stable than the path) | PRD data contract |
| `[TBD]` | Items AI is unsure about, must be filled manually | /prd output |
| `@rules` | Business rules in file JSDoc, the source for test assertions | File header |
| `@prd` / `@task` | Anchors in source files pointing to PRD and tasks | File header |
| stub | OpenAPI fragment, an "API proposal" written by the frontend first | When APIs are missing |
| `workspace/api-spec/openapi.json` | OpenAPI contract file from backend, source of truth | Environment setup |
| `workspace/src/types/api.ts` | Auto-generated TS types, don't edit manually | Coding |
| `deploy.config.ts` | Deploy config file defining platforms/environments/CI/notifications | /deploy |
| canary | A deployment strategy that gradually rolls out to a percentage of users, optional for production | /deploy |

---

## 🛟 Common Scenario Quick Reference

| Scenario | Action |
|------|------|
| Project won't start | `pnpm install && pnpm gen:api && pnpm dev` |
| TS reports `@/types/api` not found | `pnpm gen:api` |
| Changed PRD, need to re-plan tasks | `/plan @docs/prds/xxx.md` (overwrites old tasks.json) |
| Changed source code, need to update tests | `/test <file>` (auto-detects which are stale) |
| Found a bug locally, want AI to fix it | `/fix <description>` → `/bug-check` triage+solidify → review → `/fix @<report>` |
| QA AI found a bunch of bugs | Run `/bug-check @<report>` first to self-check, then `/fix @<report> --pr` |
| Not sure if it's a bug or missing requirement | `/bug-check <description>` — triage result tells you to go to `/fix` or `/prd` |
| Want issue comments to trigger auto-fix | Enable `.github/workflows/claude-fix.yml` (see `.github/SETUP.md`) |
| Just fill in missing tests | `/test <directory> --only-missing` |
| Force regenerate all tests | `/test <directory> --force` |
| Add new requirements to existing module | Add new `## section` to PRD, then run `/plan` |
| Fix bug, not a new requirement | Tell AI directly, no need to go through the full flow |
| Don't know what commands are available | Type `/` to see autocomplete |
| Product gave Word/Excel/PPT requirements | `pnpm prd:import <file>` to convert to md, then `/prd @<output>` |
| Product gave Feishu/Notion/Yuque links | Export as `.md` (Notion/Yuque) or `.docx` (others) from the platform, then handle as above |
| Page feels sluggish, want to investigate performance | `/ext-perf-audit workspace/src/features/xxx/` |
| Accessibility/compliance audit | `/ext-a11y-check workspace/src/features/xxx/` |
| Dependency security audit | `/ext-dep-audit` |
| Need change report for weekly summary/handoff | `/ext-changelog --since 2026-04-10` |
| Check framework health / find rule drift and dead links | `/meta-audit` (read-only observation, no auto-fix) |
| View past meta-audit findings | Browse [`docs/retrospectives/`](retrospectives/) |
| Want to know why a certain design decision was made | Browse [`docs/DECISIONS.md`](DECISIONS.md) |
| Local preview of build output | `/build web` → open localhost in browser |
| Install Android APK on phone to try | `/build android` → `adb install <APK-path>` |
| Build looks good, ready to deploy | `/deploy web --env staging` (auto-detects /build artifacts) |
| Deploy to test environment | `/deploy web --env staging` |
| Release all platforms to production simultaneously | `/deploy all --env production` |
| Production rollback | `/deploy web --env production --rollback` |
| First deployment, don't know how to configure | `/deploy` → AI outputs config template |
| AGENTS.md changes not taking effect | Restart the Codex session |
| Completely stuck | Exit and restart session, 90% of mysterious issues are solved by restart |

---

## 🧰 Extension Skills (ext-* skill packages)

Beyond the main commands of the Eight-Step Method, the project also provides a set of **on-demand** extension skills (distinguished by the `ext-` prefix), organized **as packages** under [`.agents/skills/`](../.agents/skills/), containing SKILL.md + deterministic scripts + reference materials for Codex:

| Skill | Purpose | Typical Scenario |
|------|------|---------|
| [ext-perf-audit](../.agents/skills/ext-perf-audit/) | Frontend performance audit (bundle size/rendering/network/memory/first paint) | Page feels sluggish / pre-release optimization |
| [ext-a11y-check](../.agents/skills/ext-a11y-check/) | Accessibility WCAG 2.1 AA compliance check | Screen reader support / keyboard navigation / compliance requirements |
| [ext-dep-audit](../.agents/skills/ext-dep-audit/) | Dependency security & health audit (vulnerabilities/outdated/redundant/licenses) | Quarterly dependency audit / security alert response |
| [ext-changelog](../.agents/skills/ext-changelog/) | Human-readable change impact report (aggregated by module) | Weekly summary / handoff / retrospective (different from `/release`'s versioned changelog) |

**Difference between commands and skill packages**:

| | commands/ single file | skills/ package form |
|---|---|---|
| Location | `.claude/commands/*.md` | `.agents/skills/<name>/SKILL.md` (+ scripts/ + references/) |
| Capability | Pure prompt templates | Can run deterministic scripts (metrics/git/pnpm) + load large reference materials on demand |
| Trigger | Explicit `/xxx` input | Explicit input or AI auto-invocation based on description |
| Suitable for | Thinking-type workflows (/prd /plan /code) | Tool-type audits (requires real data) |

**`ext-` naming convention**: Not part of the main Eight-Step flow, use on demand. See [`.agents/skills/README.md`](../.agents/skills/README.md).

**When to use**:
- Main commands (`/prd` `/code` `/test` ...) are **required flow** — run per the Eight-Step Method
- Extension skills are **optional specialized audits** — use when the corresponding scenario arises, not required every time

---

## 🤖 Sub-agents (Parallel / Context protection)

The project provides 4 sub-agents, spawned by the main command using the `Agent` tool, running in **isolated contexts**, supporting parallelism:

| Agent | Responsibility | Typical Spawn Scenario |
|------|------|----------------|
| [test-writer](../.codex/agents/test-writer.toml) | Generate tests per `@rules` + run validation | After `/code` completes multiple files / parallel `/test` for multiple modules |
| [code-reviewer](../.codex/agents/code-reviewer.toml) | Read-only review, scan for issues per rules | `/review` splitting large directories / independent second-opinion before PR |
| [bug-fixer](../.codex/agents/bug-fixer.toml) | Fix a single triaged true-bug | `/fix` handling multiple bug reports in parallel |
| [meta-auditor](../.codex/agents/meta-auditor.toml) | God's-eye scan of the entire framework, find inconsistencies/drift/dead links, output read-only observation report | Triggered by `/meta-audit` command |

**When the main agent will spawn**:
- Tasks can be done in parallel independently (5 bugs fixed in parallel is 5x faster than serial)
- Afraid of polluting main context (large directory review reads many files)
- Needs an independent perspective (main agent just wrote the code, let reviewer look independently)

**User perspective**: Usually you don't need to call agents directly — the main command will decide when to spawn. For manual invocation, see [.codex/agents/README.md](../.codex/agents/README.md).

---

## 🪝 Automation Hooks (Silent guardians)

The project has 3 built-in hooks for Codex (configured in `.codex/hooks.json`) that run automatically in the background when the host supports the corresponding event — no manual triggering needed:

| Hook | Trigger | What it does | Why it's needed |
|------|---------|--------|-----------|
| **P0 Hardcode Detection** | After each edit/creation of `.ts` `.tsx` files | Scans files for Chinese text, immediately warns about any that haven't gone through i18n | No need to wait for `/review` to discover P0 no-hardcode violations |
| **Incomplete Task Reminder** | Each time a new session starts | Scans all tasks.json under `docs/tasks/`, lists `in-progress` tasks | Automatically tells you where you left off, no need to look manually |
| **Pre-commit Status Check** | Before executing `git commit` | Checks if any tasks are still `in-progress` but about to be committed | Prevents forgetting to change completed tasks to `done` |

**What you'll see**:

```
# Output automatically when starting a session:
📋 Found incomplete tasks:
  docs/tasks/tasks-login-2026-04-15.json: T005 T006

# After editing a file, if there's hardcoded Chinese text:
⚠️ P0 Hardcode Detection: Chinese text found in workspace/src/features/auth/LoginForm.tsx, please use i18n
  42:    <Button>Login</Button>
  58:    message.success('Login successful');

# Before git commit, if there are tasks with outdated status:
⚠️ Pre-commit check: The following tasks are still in-progress, confirm whether to change to done:
  docs/tasks/tasks-login-2026-04-15.json: T005
```

> Hooks only remind, they don't block. You decide whether to handle warnings when you see them.

---

## 🔍 Meta-Audit (Framework Health Check)

As the project grows, commands/skills/agents/rules reference each other, and rule drift, dead links, and broken traceability chains can appear. The `/meta-audit` command spawns the `meta-auditor` sub-agent to do a **read-only** full scan and produces an observation report for human review.

```bash
# Full scan (6 dimensions)
/meta-audit

# Scan only one dimension
/meta-audit --focus=traceability
/meta-audit --focus=dead-links

# Custom report path
/meta-audit --output=/tmp/audit.md
```

**6 scan dimensions**:

| Dimension | What it scans |
|------|-------|
| `rule-violations` | Static rule violations (hardcoded Chinese / inline styles / any types / hand-written API types) |
| `doc-drift` | Spec docs vs actual code inconsistencies (AGENTS.md says A but code does B) |
| `internal-consistency` | Internal consistency in `.agents/`, `.codex/`, `.claude/`, and `docs/` (do command/skill/agent lists match the README?) |
| `traceability` | Whether the PRD → task → source → test traceability chain is broken |
| `dead-links` | Whether md relative links point to non-existent files |
| `orphaned-assets` | Files that exist but are not referenced by anyone |

**Output**: `docs/retrospectives/<date>-meta-audit.md` — divided into 🔴 Must Fix / 🟡 Suggested Fix / 🔵 Discussion, with trend comparison.

**Design principles** (important):

- **Read-only observation, no auto-fix** — agent tool permissions restricted to `[Read, Grep, Glob, Write]`, and Write is only allowed for the report path
- **Manual trigger, no scheduled runs** — reports no one reads are just noise
- **Reports are immutable** — next scan auto-compares trends, don't check off "handled" in old reports
- **Adopting suggestions goes through normal PR flow** — change rules in `.claude/rules/`, change Codex runtime config in `.codex/`, change skills in `.agents/skills/`, change code via `/fix`, open GitHub issues for discussion items

**Suggested frequency**: After milestones / every 1-2 weeks / after adding new mechanisms. See [retrospectives/README.md](retrospectives/README.md).

---

## 🔬 Deep Dive (Optional reading, for the curious)

<details>
<summary>Expand: Traceability chain</summary>

```
PRD anchor           →  Task entry          →  Source file JSDoc   →  Test case
docs/prds/x.md           docs/tasks/x.json    workspace/src/..       workspace/tests/..
## Search Form       →   prdRef           →  @prd / @rules      →   it('R1: ...')
                          businessRules
```

When any link changes, check downstream along the chain to see if updates are needed.

</details>

<details>
<summary>Expand: OpenAPI version auto-detection</summary>

The `gen:api` script [scripts/gen-api.mjs](../workspace/scripts/gen-api.mjs) automatically detects whether the backend gave Swagger 2.0 or OpenAPI 3.x:

| Backend Version | Handling | Extra Output |
|---------|---------|--------|
| OpenAPI 3.x | Generate directly | - |
| Swagger 2.0 | Convert to 3.x with swagger2openapi first, then generate | `.openapi.v3.json` (temporary, gitignored) |

Frontend doesn't feel the difference, just run `pnpm gen:api`. To check version: open `openapi.json` and look at whether the root field is `"openapi"` or `"swagger"`.

</details>

<details>
<summary>Expand: Local stub merge logic</summary>

When `workspace/api-spec/openapi.local.json` exists, `gen:api` will:
1. Read the main `openapi.json`
2. Merge `paths` and `components` from `workspace/api-spec/openapi.local.json`
3. Output `.openapi.merged.json` (temporary)
4. The rest of the process is unchanged

Each run prints the current proposed APIs in local, reminding you of review progress.

</details>

<details>
<summary>Expand: Build → Deploy pipeline</summary>

```
/build web,android              ← Build + local verification (not live yet)
    ↓
Step 1: Build (per platform, in parallel)
    ├── Web: pnpm build → dist/  → 🌐 http://localhost:4173
    └── Android: gradle → .apk   → 📱 adb install command
    ↓
User local verification (check in browser / install on phone)
    ↓ No issues
/deploy web,android --env staging  ← Push artifacts to server (no rebuild)
    ↓
Step 1: Pre-checks
    ├── deploy.config.ts exists and fields are valid
    ├── Git: no uncommitted changes
    └── Artifacts exist and are fresh (< 30 min, otherwise prompt to re-run /build)
    ↓
Step 2: Deploy
    ├── Web: rsync → server → nginx reload → 🌐 https://staging.example.com
    └── Android: upload to Pgyer → 📱 https://www.pgyer.com/xxxx
    ↓
Step 3: Verification (health check)
    ↓
Step 4: Notification (DingTalk + Feishu, with access/download URLs)
```

One-step shortcut:
```
/deploy web --env staging --rebuild   ← Auto runs /build then deploys
```

</details>

---

## 📚 Where to look when you want to learn more

| Want to know | Look here |
|--------|--------|
| Overall conventions | [../AGENTS.md](../AGENTS.md) |
| How to write a PRD | [prds/_template.md](prds/_template.md) |
| How to review a PRD | [prds/REVIEW.md](prds/REVIEW.md) |
| QA AI testing integration | [bug-reports/README.md](bug-reports/README.md) |
| Bug report template | [bug-reports/_template.md](bug-reports/_template.md) |
| GitHub automation (optional) | [../.github/SETUP.md](../.github/SETUP.md) |
| OpenAPI collaboration | [../workspace/api-spec/README.md](../workspace/api-spec/README.md) |
| Code comment conventions | [../.claude/rules/file-docs.md](../.claude/rules/file-docs.md) |
| No hardcoding rule | [../.claude/rules/no-hardcode.md](../.claude/rules/no-hardcode.md) |
| Coding style | [../.claude/rules/coding-style.md](../.claude/rules/coding-style.md) |
| Testing conventions | [../.claude/rules/testing.md](../.claude/rules/testing.md) |
| Codex sub-agent conventions | [../.codex/agents/README.md](../.codex/agents/README.md) |
| Codex runtime index | [../.codex/README.md](../.codex/README.md) |
| CI/CD Workflows | [../.github/workflows/](../.github/workflows/) — deploy-web / deploy-ios / deploy-android / deploy-harmony |
| Tech stack | [../.claude/rules/tech-stack.md](../.claude/rules/tech-stack.md) |
| Engineering retrospective reports | [retrospectives/README.md](retrospectives/README.md) — read-only observations from `/meta-audit`, immutable snapshots |
| Architecture Decision Records (ADR) | [DECISIONS.md](DECISIONS.md) — background/rationale/alternatives for major framework decisions |
| All commands | Main flow [`../.claude/commands/`](../.claude/commands/): `/prd` `/prd-check` `/plan` `/plan-check` `/code` `/test` `/review` `/bug-check` `/fix` `/release` `/build` `/deploy` `/start` `/meta-audit` |
| Extension skill packages | [`../.agents/skills/`](../.agents/skills/) — `ext-perf-audit` / `ext-a11y-check` / `ext-dep-audit` / `ext-changelog` |
