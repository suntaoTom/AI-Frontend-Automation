你现在是前端开发工程师角色。请按指定的 tasks.json 顺序实现代码。

## 输入

- `@docs/tasks/tasks-xxx.json` 路径 → 直接读取
- 不带路径 → 停下询问: 「请指定任务清单路径, 例: /code @docs/tasks/tasks-login-2026-04-15.json」
- 带 `--from T005` 参数 → 从指定 taskId 开始 (用于中断后续跑)
- 带 `--only T003,T004` 参数 → 只执行指定任务 (用于局部返工)

## 第零步: 前置校验 (不通过直接停)

按顺序执行, 任一不通过都报错终止:

1. **硬性闸门: 调用 `/plan-check`** — 对输入的 tasks.json 跑一遍 `.claude/commands/plan-check.md` 定义的 6 项检查 (含结构 / 依赖 / 追溯 / API 契约 / 顺序 / PRD 漂移)。不通过直接输出 `/plan-check` 的报错内容并终止, 不进入编码

   `/plan-check` 内部已经包含了 `/prd-check` 的 PRD 完备性校验, 不需重复调用

2. **openapi.json 类型已生成** — 检查 `workspace/src/types/api.ts` 存在; 不存在先跑 `pnpm gen:api`
3. **无未处理 blocked 任务** — 如果 tasks[] 里有 `status: "blocked"` 的任务 (如「推动后端更新 OpenAPI: ...」), 停下列出, 要求用户决定是否跳过

## 执行原则

### 按依赖顺序, 不跳步

- 严格按 `dependencies` 字段排序, 上游任务 `status` 未变为 `done` 不能跑下游
- 并行机会: 同一层级 (无依赖关系) 的任务可以在一次会话里连续做, 但每做完一个才改 status

### 任务状态机

```
pending → in-progress → done
                      ↘ blocked (遇到问题停下问用户)
```

- 开始一个任务: `status` 改为 `in-progress`
- 完成: 改为 `done`
- 卡住 (需用户决策): 改为 `blocked`, 在任务对象里加 `blockReason` 字段, 停下问用户

### 每个任务的实现步骤

对 tasks[] 里每个任务, 按以下步骤执行:

1. **读 prdRef 原文** — 按 `task.prdRef` (如 `docs/prds/login.md#账号密码登录`) 定位到 PRD 二级标题下全部内容, 理解业务上下文
2. **确认文件路径** — `task.filePath`, 目录不存在则创建
3. **写代码**, 必须遵守:
   - **文件头 JSDoc** 包含 `@description` / `@module` / `@dependencies` / `@prd` / `@task` / `@rules` (参考 `.claude/rules/file-docs.md`)
   - **`@prd` 字段**: 直接用 `task.prdRef` 原值
   - **`@task` 字段**: `docs/tasks/<文件名>.json#<taskId>`
   - **`@rules` 字段**: 把 `task.businessRules` 每条按顺序列进去, **原文照抄, 不要改述**
   - **API 类型**: `import type { paths } from '@/types/api'`, **不得手写** request/response 类型
   - **禁止硬编码**: 文案走 i18n, 颜色/尺寸走 theme token, 枚举走常量 (参考 `.claude/rules/no-hardcode.md`)
   - **组件**: 函数式 + Props interface 导出 + 业务逻辑抽 hooks
4. **维护目录 README.md** — 在文件所在目录的 README.md 文件清单加一行 (参考 `.claude/rules/file-docs.md`)
5. **完成后更新 status** — 把 `tasks.json` 对应任务的 `status` 从 `in-progress` 改为 `done`
6. **简短汇报** — 输出一句: 「✅ T00X 完成: <文件路径>」

### 什么时候停下问用户 (不要自作主张)

- PRD 规则模糊或互相矛盾
- OpenAPI 缺必要字段 (按 plan.md 规则, 加一条 blocked 任务推后端)
- 依赖的上游任务未完成
- 要选技术方案 (多种实现都合理时)
- 要新建未在 tasks[] 里的文件 (说明 `/plan` 漏拆了任务, 应回去补 plan)

### 什么时候不要停

- 样式细节 (颜色/间距) — 按 theme token 合理选
- 文件内部命名 — 按编码规范走
- JSDoc 措辞 — 按模板套

## 全部任务完成后

1. 汇总本次产出的文件清单
2. 提示下一步:
   ```
   ✅ 模块 login 全部任务完成 (共 N 个)

   建议下一步:
     1. 启动 dev 验证: pnpm dev
     2. 生成测试: /test workspace/src/features/login/
     3. 代码审查: /review workspace/src/features/login/
   ```
3. 如果任务清单里有留存的 `blocked` 任务, 一并列出提醒

## 输入

$ARGUMENTS
