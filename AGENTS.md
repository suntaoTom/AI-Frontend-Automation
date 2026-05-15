# Project Configuration - AI Frontend Automation Knowledge Base

> Onboarding for Codex. Detailed rules remain under `.claude/rules/` and are loaded on demand.
> Codex-facing workflow entrypoints live under `.agents/skills/`; Codex runtime config lives under `.codex/`.
> The original Claude Code slash-command prompts remain under `.claude/commands/` as legacy source material.

---

## Project Structure

This project has two layers:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Root | `.agents/` / `.codex/` / `.claude/` / `docs/` / `AGENTS.md` | AI automation framework: skills, agents, hooks, rules, PRDs, tasks |
| workspace/ | `workspace/src/` / `workspace/config/` / ... | The actual frontend project (UmiJS) |

Commands like `pnpm dev` / `pnpm gen:api` at the root are expected to proxy into `workspace/`. If `workspace/package.json` is absent, treat the frontend scaffold as not yet installed.

---

## P0 No Hardcoding (Highest Priority)

Every variable value is introduced via config, constants, Design Tokens, or i18n. Never hardcode. Config itself must not duplicate; reuse hierarchically.

Covers: copy/i18n, colors and styles, API endpoints, business enums, sizes and spacing, magic numbers.

Detailed rules and examples: `.claude/rules/no-hardcode.md`

---

## Tech Stack (Summary)

UmiJS 4 + React 18 + TypeScript 5 + Ant Design 5 (`@umijs/max`)

- Routing: Umi convention-based routing.
- Requests: `@umijs/plugin-request`.
- State: `useModel` first, Zustand as fallback.
- Build: Umi + Vite mode.
- Lint: `@umijs/lint`.
- Package manager: pnpm.
- Do not install dependencies that Umi already bundles, such as axios, react-router-dom, or webpack.

Full tech stack and project structure: `.claude/rules/tech-stack.md`

---

## Coding Style (Summary)

- Comments explain why, not what. Delete commented-out code.
- File-header JSDoc is mandatory for code files.
- Components use PascalCase; hooks start with `use`; constants use UPPER_SNAKE_CASE; types do not use an `I` prefix.
- Use function components with exported Props interfaces.
- Extract logic into hooks; components should primarily render.
- Requests use umi-request; interceptors live in `app.ts`; do not use axios.
- State: `useModel` first, Zustand as fallback, and server data never goes in the store.
- Routing: convention-based first; permissions via `@umijs/plugin-access` and wrappers.
- Git messages: `type(scope): description`; branch prefixes: `feature/`, `fix/`, `refactor/`.

Full coding style: `.claude/rules/coding-style.md`

---

## File Documentation Convention (Must Follow)

Every time you create or modify a code file, keep these in sync:

1. The `README.md` of its directory (file manifest table).
2. The JSDoc header of the file (`@description`, `@module`, `@dependencies`, `@prd`, `@task`, `@design`, `@rules`).
3. The module-level `README.md` of the feature module (business flow and public exports).
4. The global index `workspace/src/README.md`.

The business anchors (`@prd`, `@task`, `@design`, `@rules`) are the key to the Requirements -> Design -> Code -> Test traceability chain. They let `/test` generate tests from business rules instead of source-code behavior, and let `/review` check consistency against the design spec.

Detailed formats and templates: `.claude/rules/file-docs.md`

---

## Testing (Summary)

- The sole source of test assertions is `@rules` in the file-header JSDoc, not AI guesses.
- One `it()` per `@rules` entry; the `it` name quotes the rule verbatim.
- Assertion query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
- Mock policy: HTTP via MSW; do not mock internal modules; do not assert mock call counts.
- Location: all tests go under `workspace/tests/`, mirroring `workspace/src/` (for example, `workspace/tests/features/login/components/LoginForm.test.tsx`); E2E under `workspace/tests/e2e/`.
- Test-failure triage order: test code -> environment -> test expectation -> source. Source is the last thing to doubt.

Full testing rules: `.claude/rules/testing.md`

---

## Notes

- Do not use the `any` type; always define explicit types.
- Do not use inline styles; use CSS Modules or Ant Design component styles.
- Image assets go under `workspace/public/images/`.
- Environment variables start with `UMI_APP_`.
- Every async operation must handle loading and error states.
- Forms must have validation and error messages using antd Form built-in validation.
- List pages must handle empty state using antd Empty.
- Page components live in `workspace/src/pages/`; business logic lives in `workspace/src/features/`; do not mix them.
- Mock data lives in `workspace/mock/` using Umi's built-in mock feature.

---

## Codex Migration Map

| Capability | Codex-facing location | Legacy/source location |
|------------|-----------------------|------------------------|
| Onboarding | `AGENTS.md` | `CLAUDE.md` |
| Skills | `.agents/skills/` | `.claude/skills/` |
| Sub-agents | `.codex/agents/*.toml` | `.claude/agents/*.md` |
| Hooks | `.codex/hooks.json`, `.codex/hooks/` | `.claude/settings.json`, `.claude/hooks/` |
| Rules | `.claude/rules/` | `.claude/rules/` |
| Slash-command prompts | `.claude/commands/` | `.claude/commands/` |

---

## Project Workflow Docs

- `docs/WORKFLOW.md`: required operations manual, from one-line requirement to launch.
- `docs/tasks/`: JSON task manifests generated by `/plan`; one file per feature module.
- `docs/prds/`: Product Requirements Docs; template at `docs/prds/_template.md`.
- `workspace/api-spec/`: OpenAPI contract files provided by backend; `pnpm gen:api` generates `workspace/src/types/api.ts`.
- See `docs/README.md` and `workspace/api-spec/README.md` when those files exist.

---

## API Type Iron Rule

- API types must be imported from `@/types/api`; hand-writing request/response types is forbidden.
- `workspace/src/types/api.ts` is generated by `pnpm gen:api`; do not edit it by hand.
- If an OpenAPI field is wrong, ask backend to fix `workspace/api-spec/openapi.json`; do not work around it on the frontend.

---

## Using Task Manifests

- Before coding, read the relevant task manifest: `docs/tasks/tasks-xxx.json`.
- Execute tasks in `taskId` order and by `dependencies`.
- When a task is done, update its `status` to `"done"`.
- Status values: `pending`, `in-progress`, `done`, `blocked`.
