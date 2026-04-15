你现在是任务清单完备性检查器。对输入的 tasks.json 执行硬性闸门检查, 输出是否可以进入 `/code` 编码阶段。

## 适用场景

1. **用户想看任务清单是否可执行** — 跑 `/plan` 生成后, 快速体检
2. **`/code` 命令的前置校验** — `/code` 执行前必须先跑本命令, 不通过直接拒绝进入编码

## 输入

- `@docs/tasks/tasks-xxx.json` 路径 → 直接读取
- 不带路径 → 停下询问: 「请指定要检查的任务清单路径, 例: /plan-check @docs/tasks/tasks-login-2026-04-15.json」

## 检查项 (按顺序执行, 不短路, 一次报全部问题)

### 检查 1: 结构合法 (P0)

校验 JSON 结构:
- 必含字段: `moduleCode` / `prdRef` / `tasks[]` / `createdAt`
- `tasks[]` 每项必含: `taskId` / `type` / `name` / `filePath` / `description` / `prdRef` / `businessRules` / `acceptanceCriteria` / `status`
- `type` 取值必须在: `precondition | gen-api | api | mock | constants | utils | locale | config | model | store | hook | wrapper | component | page`
- `status` 取值必须在: `pending | in-progress | done | blocked`
- `taskId` 全局唯一 (无重复)

> 说明: 基建类 type (`precondition` / `constants` / `utils` / `locale` / `config` / `model` / `wrapper`) 用于 i18n、路由守卫、access 配置、常量、工具函数、运行时配置等不属于 api/component/page 的工程文件。

**不通过时**: 列出违规任务的 taskId 和具体字段问题

### 检查 2: 依赖图合法 (P0)

对 `tasks[].dependencies` 数组做图论校验:
- **无悬挂引用**: dependencies 里的每个 taskId 都真实存在
- **无循环依赖**: 用拓扑排序检测环
- **无前向引用**: 依赖的 taskId 必须在当前 taskId 之前声明 (按数组顺序)

**不通过时**: 列出问题边 (A → B 不存在 / A → B → A 成环 / A 出现在 B 之前但依赖 B)

### 检查 3: PRD 追溯链完整 (P0)

- 顶层 `prdRef` 指向的 PRD 文件必须存在
- 每个 task 的 `prdRef` 必须是 `<PRD路径>#<锚点>` 格式
- 锚点必须在对应 PRD 的 **二级 / 三级 / 四级标题** (`## / ### / ####`) 里真实存在 — 「数据契约」「Mock 数据约定」「接口提议」等章节天然是嵌套在功能点下的 H3/H4, 允许直接引用
- `businessRules` 数组非空, 且每条不含 `[待确认]` / `TODO` / `???`
  - **豁免**: `type ∈ { precondition, gen-api, config, locale }` 的任务允许 `businessRules` 为空 (这些是工具/基建任务, 无业务语义可摘)
- `businessRules` 每条措辞应能在 PRD「业务规则」章节找到原文 (允许轻微标点差异)

**不通过时**: 列出断裂的 taskId + 问题类型 (锚点不存在 / rules 为空 / rules 含占位符)

### 检查 4: API 契约对齐 (P0)

对 `type: "api"` 或 `type: "mock"` 的任务:
- 任务描述或 filePath 暗示的 operationId, 必须出现在以下三处之一:
  1. `api-spec/openapi.json`
  2. `api-spec/openapi.local.json`
  3. PRD 的「接口提议」章节 stub (`operationId: xxx`)
- 如三处均缺, 进一步检查 tasks[] 是否存在一个 `type: "precondition"` 任务承诺把 stub 落地, 若存在则降级为**警告** (不阻塞), 提示执行顺序上必须先做 precondition
- 对 `type: "api"` 任务, 如 `description` 里写了 operationId, 直接查
- 如任务里没明确 operationId, 做软提示 (不阻塞), 要求用户确认

**不通过时**: 列出任务使用了未定义的 operationId (三处都找不到且无 precondition 兜底)

### 检查 5: 任务顺序符合规范 (P1)

按 `task.type` 校验排序:
- 如果整个 tasks[] 里有任何 `api` / `mock` 任务, 必须存在一个 `type: "gen-api"` 的任务且排在所有 `api`/`mock` 之前
- `page` 任务必须依赖至少一个 `component` 任务 (通过 dependencies)
  - **豁免**: 纯占位/提示页 (如 `403`/`404`/`500` 等系统页) 可以只依赖 `locale` 任务, 因为它们只由 antd 内置组件 (如 `Result`) 直接装配, 无业务组件可抽
  - 判定依据: 任务名或 filePath 含 `403` / `404` / `500`, 或 description 明确说「无业务逻辑」「纯展示」
- `api` 任务不能依赖 `component` / `page` (方向反了)
- `store` / `hook` 不能依赖 `page`

**不通过时**: 列出顺序违规的任务对

### 检查 6: PRD 未漂移 (P1)

- 比较 `tasks.json.createdAt` 与 PRD 文件的最后修改时间 (`git log -1 --format=%cI <PRD路径>` 或文件 mtime)
- 如 PRD 在 tasks.json 之后被修改过, 发出**警告** (不阻塞, 但强烈建议)
- 对 PRD 跑一遍 `/prd-check` 的 5 项检查规则, 若 PRD 现在不通过, 则本检查**阻塞** (说明 PRD 被改坏了)

**不通过时 (阻塞)**: 提示「PRD 当前不通过 /prd-check, 请先修 PRD 再重跑 /plan」
**警告时 (不阻塞)**: 提示「PRD 在 <时间> 被修改, 建议重跑 /plan 以同步最新规则; 如确认无规则变化, 可继续」

## 附加检查 (软提示, 不阻塞)

- 是否所有任务 `status` 仍为 `pending` (或存在遗留 `in-progress`, 提示可能上次中断)
- 是否存在 `blocked` 任务 (列出, 提示用户决定是否可继续)
- `acceptanceCriteria` 是否为空 (空不阻塞, 但测试生成会缺参考)

## 输出格式

### 通过时

```
✅ 任务清单完备性检查通过: docs/tasks/tasks-login-2026-04-15.json

已通过检查 (6/6):
  ✅ 结构合法 (12 个任务)
  ✅ 依赖图无环、无悬挂、无前向引用
  ✅ PRD 追溯链完整 (12 个 prdRef 锚点全部存在)
  ✅ API 契约对齐 (5 个 operationId 全部在 openapi.json)
  ✅ 任务顺序符合规范 (gen-api 置顶, 依赖方向正确)
  ✅ PRD 未漂移

⚠️ 软提示:
  • 3 个任务 status 为 blocked (T008/T009/T010), 请决定是否跳过

下一步: /code @docs/tasks/tasks-login-2026-04-15.json
```

### 不通过时

```
❌ 任务清单完备性检查未通过: docs/tasks/tasks-login-2026-04-15.json

已阻塞问题 (需全部修复后才能跑 /code):

[检查 2: 依赖图合法]  2 处问题
  T005 依赖 T099, 但 T099 不存在
  T003 → T007 → T003 存在循环依赖

[检查 3: PRD 追溯链]  1 处问题
  T004 prdRef 指向 docs/prds/login.md#手机号登录,
    但 login.md 中无此二级标题 (现有锚点: #账号密码登录 / #用户注册 / #路由守卫与角色权限 / #登出)

[检查 6: PRD 未漂移]  阻塞
  docs/prds/login.md 当前未通过 /prd-check (存在 3 处 [待确认])

已通过 (3/6):
  ✅ 结构合法
  ✅ API 契约对齐
  ✅ 任务顺序符合规范

修复方式:
  (A) PRD 有改动 → 回去修 PRD, 重跑 /prd-check 确认绿灯, 再跑 /plan 重拆任务
  (B) tasks.json 被手动改错 → 直接 /plan 重新生成 (不要手工修 tasks.json)
  (C) 某任务该删 → 直接删除该对象, 同时清理引用它的 dependencies

修完后重新执行: /plan-check @docs/tasks/tasks-login-2026-04-15.json
```

## 设计原则

- **只读检查, 不修改 tasks.json**
- **不短路**: 6 项全跑完再报
- **PRD 漂移是重点**: 这是生产事故高发区, PRD 改了 tasks 没重拆, 代码必错
- **复用 `/prd-check`**: 检查 6 直接跑一遍 PRD 侧闸门, 不重复实现
- **tasks.json 被污染时, 优先建议重跑 `/plan`**, 而不是手修 (手修容易再引入不一致)

需求如下:
$ARGUMENTS
