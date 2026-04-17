# .claude/ — AI 自动化配置

> 本项目的 Claude Code 配置集中地。子目录按职责分工, 各自有独立 README。

## 目录清单

| 目录/文件 | 职责 | 触发方式 |
|----------|------|---------|
| [commands/](commands/) | 主流程命令 (八步法) | 用户显式输入 `/<name>` |
| [skills/](skills/) | 扩展技能包 (ext-\*), 含脚本和参考资料 | 显式 `/ext-xxx` 或 AI 按 description 自动调用 |
| [agents/](agents/) | 子代理定义, 支持并行/独立 context 工作 | 主命令内部 `Agent` 工具 spawn |
| [hooks/](hooks/) | 自动化钩子脚本, 事件触发 | `settings.json` 里配置的事件 (PostToolUse 等) |
| [rules/](rules/) | 长期稳定的编码规范, 供 AI 读取 | `CLAUDE.md` 按需引用 |
| [settings.json](settings.json) | 共享 hooks 配置 (入 git) | Claude Code 启动时加载 |
| settings.local.json | 个人权限/环境变量 (gitignore) | 本地生效, 不影响团队 |

## 快速查阅

### 我想...

| 场景 | 去哪 |
|------|-----|
| 看有哪些斜杠命令 | [commands/](commands/) |
| 加新的审计/分析类技能 | [skills/README.md](skills/README.md) 参考约定 |
| 让某些事件自动触发检查 | [hooks/README.md](hooks/README.md) 看怎么加 |
| 让 AI 遵守某条规范 | [rules/](rules/) 加 md 文件, 在 CLAUDE.md 里引 |
| 让大任务并行跑 | [agents/README.md](agents/README.md) 看 sub-agent 怎么用 |
| 配置权限减少确认弹窗 | 改 `settings.local.json` (不入 git) |
| 配置全团队共享的 hook | 改 `settings.json` (入 git) |

## 命令 / 技能 / 代理 / 钩子 / 规则的边界

| 机制 | 是什么 | 适合做什么 | 特点 |
|-----|-------|-----------|------|
| **命令** (commands/) | 单 md 文件 prompt 模板 | 八步法主流程, 纯思考类工作流 | 用户显式触发, 跑在主 context |
| **技能包** (skills/) | 文件夹 + SKILL.md + 脚本 + 资源 | 要跑真实命令拿数据的工具类任务 | 可显式或自动触发, 渐进式加载 |
| **代理** (agents/) | 子代理定义 + 独立 context | 并行工作 / 保护主 context 的重任务 | 主命令 spawn, 隔离 context |
| **钩子** (hooks/) | 事件触发的脚本 | 静默自动检查 (不阻断) | 后台跑, 不需要 AI 决策 |
| **规则** (rules/) | 长期稳定的规范文档 | 编码风格 / 禁止硬编码 等约束 | 被 `CLAUDE.md` 引用, AI 自动遵守 |

## 添加新东西时

1. **先判断类型** — 用上面的边界表对号入座, 别往错的地方塞
2. **写 README 或注释** — 每个子目录都要能自洽
3. **更新 CLAUDE.md** — 如果是规则/新机制, 顶层 CLAUDE.md 要引到
4. **更新 WORKFLOW.md** — 如果用户会用到, 要在工作流手册里登记

## 当前项目状态

**命令** (13): `/prd` `/prd-check` `/plan` `/plan-check` `/code` `/test` `/review` `/bug-check` `/fix` `/build` `/deploy` `/release` `/start`

**技能包** (4): `ext-dep-audit` `ext-perf-audit` `ext-a11y-check` `ext-changelog`

**代理** (3): `test-writer` `code-reviewer` `bug-fixer` — 详见 [agents/README.md](agents/README.md)

**钩子** (3): `check-hardcode` `check-tasks-status` `pre-commit-check` — 详见 [hooks/README.md](hooks/README.md)

**规则** (5): `coding-style` `file-docs` `no-hardcode` `tech-stack` `testing`
