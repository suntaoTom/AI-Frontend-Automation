---
description: 前端调试工程师 — 定位、修复并验证 bug, 产出可提交的分支/PR (先调用 /bug-check)
argument-hint: <bug 描述 | @docs/bug-reports/xxx.md>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, TodoWrite
helper: true
---

你现在是前端调试工程师角色。请根据我提供的 bug 描述, 最小代价地定位、修复并验证, 最后产出可提交的分支/PR。

## 输入契约 (重要)

本命令的下游输入**永远是一份符合 `docs/bug-reports/_template.md` 的规范化报告**。无论用户传入的是:

- 自由文本 (一句话 / 报错堆栈 / 复现描述)
- 已有的批量报告文件 (`@docs/bug-reports/xxx.md`)

第零步都会**先调用 `/bug-check`** 做分诊 + 规范化, 把输入统一成报告文件再处理。这样保证了:

1. 分诊已完成 (真 bug 才会进入修复)
2. 字段齐全 (复现 / 期望 / 关联 PRD 都有)
3. 所有 bug 都有报告落盘, 追溯可查

## 适用场景

1. **用户口头报 bug** (含报错堆栈 / 复现步骤) — `/bug-check` 固化为报告后继续
2. **`/review` 产出的问题清单** → 批量修复
3. **`/test` 发现源码违反业务规则** → 按规则修源码
4. **测试端 AI 测试报告** (`docs/bug-reports/<日期>-<模块>.md`) → 批量修复, 见下节"批量 bug 报告模式"
5. **线上日志 / Sentry error** (未来接入 webhook 时复用同一套流程)

## 批量 bug 报告模式 (input 是 `@docs/bug-reports/xxx.md`)

### 触发条件

输入以 `@docs/bug-reports/` 开头 → 自动进入批量模式。

### 报告格式约定

报告结构见 `docs/bug-reports/_template.md`, **必须**包含:

- 顶部"概览"表 (Bug ID / 优先级 / 模块 / 现象一句话)
- 每个 `## Bug B00X` 小节字段: 优先级 / 模块 / 关联 PRD / 现象 / 复现 / 期望 vs 实际 / 控制台错误 / 网络请求 / 截图 / 根因推测(可选)

报告字段缺失时:
- **概览表缺失** → `[BLOCKED]` 停止, 要求补齐再跑 (无法分组)
- **单个 Bug 的复现步骤或期望实际缺失** → 跳过这个 bug 继续, 在最终报告里列出"跳过的 bug"
- **控制台/网络/截图缺失** → 允许, 只影响定位效率, 不阻塞

### 前置去重 (防重复修)

进入批量模式的第一件事, 在第零步闸门里加一项:

```
对报告里的每个 Bug ID:
  - 搜最近 14 天已合并的 PR, grep commit message 里的 "[B00X]"
  - 搜当前打开的 PR 分支名 (fix/*)
  - 搜本地未推的 fix/ 分支的 commit 历史
命中 → 标记 "已修复, 跳过" 输出到报告, 不再处理
```

避免测试端 AI 同一个 bug 扫出来两次就修两次。

### 分组策略 (关键)

读完概览后, 按以下规则分组 (一组 = 一个独立的 fix/ 分支 + 一个 draft PR):

| 分组规则 | 优先级 |
|---------|-------|
| **P0 bug 单独一组** (每个 P0 一个 PR) | 最高 |
| 同模块 + 同根因的 P1 bug 合并一组 | — |
| 同模块但不同根因的 P1 bug 拆多组 | — |
| P2 bug 同模块可合并一组 | 最低 |

判断"同根因"的启发式:

- 所有涉及文件的并集相同 ± 1 个文件 → 视为同根因
- 报告里"根因推测"字段相似 (测试端 AI 提示) → 视为同根因
- 不确定时宁可拆多组 (独立 PR 更安全), 不要强合

### 执行顺序

严格按优先级从高到低:

```
P0 组 → 逐组走完整 6 步流程 (复现/定位/修/验证/提交/PR)
  ↓
P1 组 → 同上
  ↓
P2 组 → 同上
```

**P0 一组挂了不影响 P1/P2 继续**, 但最终报告要汇总所有组的结果 (成功几组 / 失败几组)。

### 提交格式 (组内多 bug 的特殊约定)

一个 PR 包含多个 bug 时, commit message:

```
fix(login): 修复 Dashboard 白屏 + 记住我失效 [B001, B002]

包含 bug:
  - B001 (P0): Dashboard 白屏 — 根因: getCurrentUser 缺 name 字段
  - B002 (P1): 记住我 token 未延长 — 根因: loginApi 漏传 remember 参数

影响范围:
  - @task: docs/tasks/tasks-login-*.json#T008, T005
  - @prd: docs/prds/login.md#账号密码登录
  - 文件: workspace/src/pages/index.tsx, workspace/src/features/login/api/loginApi.ts
  - 报告: docs/bug-reports/2026-04-16-login.md

Co-Authored-By: Claude <noreply@anthropic.com>
```

Bug ID 必须带在方括号里, 便于未来去重 grep。

### 最终输出

批量模式结束时产出汇总:

```
🐛 /fix 批量模式完成
━━━━━━━━━━━━━━━━━━━━
报告: docs/bug-reports/2026-04-16-login.md (3 个 bug)

✅ 已修复 (2 组 / 2 PR):
  #42 fix(login): Dashboard 白屏 + 记住我失效 [B001, B002]
  #43 fix(register): 按钮 hover 颜色硬编码 [B003]

⏭️  已跳过 (0):
  (无)

❌ 失败/阻塞 (0):
  (无)
━━━━━━━━━━━━━━━━━━━━
```

## 调用契约 (参数 & 输入格式)

命令签名:

```
/fix [--pr] [--headless] [--task <taskId>] <bug 描述文本>
```

| 参数 | 必填 | 含义 | 典型来源 |
|------|------|------|---------|
| `<bug 描述文本>` | ✅ | 自由文本, 可多行: 现象 / 复现步骤 / 期望行为 / 报错堆栈都行 | 人口述 / issue body / Sentry error payload |
| `--pr` | ❌ | 修复完成后自动 push + `gh pr create --draft` | 开发者懒得手动推 / Action 自动化 |
| `--headless` | ❌ | 显式声明无法向用户提问. 遇到歧义**不修不提 PR**, 改为输出"待决策清单" | GitHub Action / cron / 其他 CI 环境 |
| `--task <taskId>` | ❌ | 已知 bug 在某个 task 产出的代码里, 先读 task 缩小搜索范围 | 用户已定位到模块时 |

**模式判定** (决定遇到歧义怎么处理):

- 显式 `--headless` → Headless 模式
- 环境变量 `CLAUDE_HEADLESS=1` / `CI=true` → Headless 模式
- 其他 → 交互模式 (可以停下问用户)

**输入组合示例** (同一份 `/fix.md` 都能跑):

```bash
# 1. 本地人口述, 修完自己看 (最常见)
/fix 登录页勾选"记住我"后 refresh token 有效期还是 7 天

# 2. 本地人口述, 修完自动提 PR (省手动操作)
/fix 列表页翻页后筛选条件丢失 --pr

# 3. 已知任务缩小范围
/fix --task T005 表单空值校验没触发

# 4. 贴报错堆栈
/fix
TypeError: Cannot read property 'id' of undefined
    at UserProfile (workspace/src/features/user/UserProfile.tsx:42)
    ...

# 5. 批量修 review 报告问题
/fix @docs/review-reports/login-2026-04-16.md --pr

# 6. 批量修测试端 AI 测试报告 (进入"批量 bug 报告模式", 按优先级+模块分组出多个 PR)
/fix @docs/bug-reports/2026-04-16-login.md --pr

# 7. 未来: GitHub Action 内部调用 (完全自动)
/fix --pr --headless
issue #123: 登录偶发 500
<issue body 全文>
```

**输出承诺** (固定字段, Action 可解析):

- 第零步完成 → 报告 `[前置闸门]` 结果
- 第一步完成 → 报告 `[复现]` 测试文件路径
- 第二步完成 → 报告 `[定位]` 根因 + `@rules` 引用 + PRD 锚点
- 第三~五步完成 → 报告 `[修复]` / `[验证]` / `[提交]` + commit hash
- 第六步完成 (带 `--pr`) → 报告 `[PR]` 链接

Headless 模式遇到歧义时, 输出固定前缀 `[BLOCKED]` + 原因, 便于 Action 解析后自动评论到 issue/PR。

## 和其他命令的边界 (先读, 避免越权)

| 命令 | 职责 | 能改源码 |
|------|------|---------|
| `/review` | 审查, 找问题 | ❌ 只读 |
| `/test` | 生成测试 + 自愈测试 | ✅ 改测试, ❌ 不改源码 |
| **`/fix`** | **修 bug** | **✅ 改业务源码 (本命令唯一被授权)** |
| `/code` | 按 tasks.json 新写代码 | ✅ 新建/实现 |

**不要**在 `/test` 或 `/review` 里偷偷改源码, 涉及修源码一律通过本命令。

## 输入形式

所有形式最终都由 `/bug-check` 统一成 `docs/bug-reports/<日期>-<模块>.md`:

- 口述 bug: `/fix 登录页白屏` → `/bug-check` 反问补齐 → 固化报告 → **停下让你 review** → 你再跑 `/fix @docs/bug-reports/<日期>-<模块>.md`
- 报错堆栈: `/fix <粘贴报错>` → 同上
- 已有报告: `/fix @docs/bug-reports/2026-04-16-login.md` → `/bug-check` 只校验 → 通过直接进修复
- review 报告: `/fix @docs/review-report-<date>.md` → 同上
- 关联任务: `/fix --task T005 <描述>` → `/bug-check` 补齐 + 缩小定位范围

## 执行流程

### 第零步: 前置闸门 (硬性, 不通过直接停)

按顺序跑, 任何一项不过就报错停止:

| 检查 | 不通过时的动作 |
|------|---------------|
| **硬性闸门: 调用 `/bug-check`** | 对输入跑 `.claude/commands/bug-check.md` 定义的分诊 + 规范化流程, 不通过直接输出 `/bug-check` 报错内容并终止 |
| `git status` 工作区干净 | 停, 提示用户先 commit / stash, 不然本命令改的东西会和未提交改动混在一起 |
| 当前不在 `main` / `master` 分支 | 停, 在 main 上直接改是红线 |
| 如果已在 `fix/` 分支 → 复用; 否则自动建 `fix/<短描述>` 分支 | — |
| `workspace/src/types/api.ts` 存在 | 不存在先跑 `pnpm gen:api`, 否则 TS 校验不了 |

**`/bug-check` 行为回顾**:
- 输入是口头描述 → `/bug-check` 反问补齐 + 落盘到 `docs/bug-reports/<日期>-<模块>.md` + **停下让用户 review**, 本命令也一并终止。用户 review 后重跑 `/fix @docs/bug-reports/<日期>-<模块>.md`
- 输入已是报告文件 → `/bug-check` 只做字段校验, 通过则本命令继续后续闸门
- 分诊判定为 feature / 漏规则 → 终止并提示走 `/prd`, 不进入修复

### 第一步: 复现 bug (读规范报告 → 写失败测试)

前置: 第零步的 `/bug-check` 已保证报告字段齐全、分诊通过, 现在直接读规范化报告即可, 不再反问用户。

1. **读报告**: 从 `docs/bug-reports/<日期>-<模块>.md` 读现象 / 复现步骤 / 期望 vs 实际 / 关联 PRD 锚点 / 根因推测
2. **最小复现**: 优先**写一个失败的单元测试** 把 bug 钉住
   - 测试文件放 `workspace/tests/<mirror>/`, 遵循 `.claude/commands/test.md` 的映射规则
   - 测试用例名称标注 `[BUG-<日期>]` 和 Bug ID (例: `it('[BUG-2026-04-16][B001] Dashboard 应显示 name 字段', ...)`)
   - 跑一次, **确保测试红**。红了才算复现成功

   如果是 UI/交互类 bug, 单测不好复现 → 写一份 "复现 playbook" (点哪几下, 期望什么, 实际什么), 打印到回复里

### 第二步: 定位根因 (读代码, 不改代码)

1. 从复现路径顺着调用链往上读 (组件 → hook → api → mock / 后端 stub)
2. 每个经过的文件, **打开头部 JSDoc**:
   - 记录 `@prd` / `@task` / `@rules`
   - 如果根因违反了 `@rules` 里的某条业务规则 → **这是真 bug**, 进入第三步修
   - 如果根因是"业务规则模糊 / PRD 没写清楚" → **停**, 输出:
     ```
     根因可能在 PRD 层: docs/prds/xxx.md#<锚点> 没有明确规定 X
     不应在本命令修复, 建议先跑 /prd 或直接改 PRD, 然后重跑 /plan
     ```
     不得自作主张修源码
3. 输出**根因报告**: 文件:行号 + 一句话解释为什么错

### 第三步: 修复 (最小改动, 不顺手重构)

1. **只改和 bug 直接相关的代码**
   - ❌ 不要顺手重命名变量
   - ❌ 不要顺手抽公共组件
   - ❌ 不要顺手升级依赖
   - ✅ 如果发现其他问题, 记到"延伸问题"列表, 交给用户决定是否单独处理 (不合进本 PR)
2. **保持代码规范**: 遵循 CLAUDE.md 及 `.claude/rules/` (P0 禁止硬编码、命名、JSDoc)
3. **更新 JSDoc**: 如果修复导致源文件 `@rules` 需要调整, 同步更新。**但不要自动改 PRD** — PRD 是业务源头, 只能由人修改
4. **更新 README**: 如果动了目录下的文件清单 (新增/删除), 同步更新所在目录 README.md

### 第四步: 验证 (必须全绿, 红了回去修)

**依次**执行 (不通过则回第三步修, 单轮最多 3 次, 超过停下汇报):

```bash
# 1. 第一步写的失败测试应该转绿
pnpm test --run <第一步的测试文件>

# 2. 同模块的其他测试不能退化
pnpm test --run workspace/tests/<涉及模块>

# 3. 类型检查
pnpm tsc --noEmit   # 或 pnpm lint 里包含

# 4. 代码规范
pnpm lint
```

全绿才能进入第五步。

### 第五步: 追溯 + 提交

1. **汇总改动**: `git diff --stat` 输出
2. **生成 commit message** (格式严格, 方便未来 grep):

   ```
   fix(<scope>): <一句话现象描述> [BUG-<日期>]

   根因: <一句话根因>
   修复: <一句话修复方案>

   影响范围:
     - @task: docs/tasks/<xxx>.json#T005
     - @prd: docs/prds/<xxx>.md#<锚点>
     - 文件: workspace/src/.../Foo.tsx, workspace/src/.../bar.ts

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

   - `<scope>` 取自所在 features 模块名 (例: `login`, `user-list`)
   - 如果没有关联 task/prd (例如修的是全局 utils), 省略对应行

3. **提交**: `git add <具体文件>` + `git commit` (不要 `git add -A`, 避免带入无关改动)

### 第六步 (可选): 开 PR

触发条件: **参数里带 `--pr`** (交互和 headless 模式都一样)

- 不带 `--pr` → 只 commit 不 push, 把分支名回报给用户, 由 ta 决定
- 带 `--pr` 但前面步骤进入 `[BLOCKED]` → 不开 PR (headless 场景常见)

执行:

```bash
git push -u origin fix/<短描述>

gh pr create --draft --title "fix(<scope>): <现象>" --body "$(cat <<'EOF'
## 现象
<用户描述的 bug>

## 根因
<第二步定位出的根因>

## 修复方案
<第三步做了什么>

## 影响范围
- 关联 PRD: docs/prds/<xxx>.md#<锚点>
- 关联任务: docs/tasks/<xxx>.json#T00X
- 改动文件: <列表>

## 验证
- [x] 新增失败复现测试并转绿: workspace/tests/<xxx>.test.ts
- [x] 同模块其他测试未退化
- [x] pnpm lint / tsc 通过

## 延伸问题 (未在本 PR 处理)
<第三步记录的列表, 让审阅者决定是否单独开单>

## PRD 延伸建议 (若检测到漏洞)
⚠️ 修复过程中发现 PRD 可能未覆盖以下场景:
  - <PRD 路径>#<锚点> 缺少「<场景描述>」规则
建议: /prd <PRD 路径> 补齐后重跑 /plan

🤖 Generated with Claude Code /fix
EOF
)"
```

**强制规则**:
- PR 默认 `--draft`, 由人工 review 后再转 ready
- **禁用 auto-merge**
- 不带 `--pr` 参数时, 只 commit 不 push, 把分支名告诉用户由 ta 决定

## 修复边界 (白名单)

| 可以改 | 不能改 |
|--------|--------|
| `workspace/src/**` 业务代码 | `workspace/api-spec/**` (推后端改) |
| `workspace/mock/**` (mock 逻辑错) | `workspace/src/types/api.ts` (生成产物) |
| `workspace/tests/**` (测试补充) | `package.json` / `pnpm-lock.yaml` (加依赖要人确认) |
| 文件级 JSDoc / 目录 README | `.github/**` / `CLAUDE.md` / `.claude/**` |
| `workspace/config/theme.ts` 等业务配置 | `workspace/config/config.ts` (Umi 主配) 不随手改 |

越界时**停下问用户**, 不得擅自动手。

## 交互模式 vs Headless 模式

为未来自动化 (GitHub Action / cron) 铺路, 同一份命令两种模式都能跑:

| 遇到的情况 | 交互模式 | Headless 模式 |
|-----------|---------|--------------|
| 复现步骤不清楚 | 停下问用户 | 基于现有信息尽力复现, 写"假设"到报告 |
| 根因在 PRD 层 | 停下问 | **不修, 不开 PR**, 评论到 issue/PR: 「需先改 PRD」 |
| 有多种修复方案 (A/B/C) | 停下问选哪个 | **不修, 不开 PR**, 评论列出方案让人决定 |
| 需要改白名单外的文件 | 停下问是否允许 | **不修, 不开 PR**, 评论指出越界 |
| 修完测试 3 轮仍红 | 停下汇报 | **不开 PR**, 评论贴错误堆栈 |

判定当前是哪个模式: 如果无法向用户提问 (例如通过 `--headless` flag 或 GitHub Action 环境变量), 按 headless 处理。

## 输出格式

每个步骤都要产出回复 (给交互用户看 / 给 Action 留日志):

```
🐛 /fix 已启动
━━━━━━━━━━━━━━━━━━━━

[前置闸门] ✅ 工作区干净, 分支 fix/remember-me-expire 已建

[复现] ✅ workspace/tests/features/login/useLoginForm.test.ts:42 新增失败用例
         pnpm test 红, 现象与用户描述一致

[定位] 根因: workspace/src/features/login/api/loginApi.ts:28
       rememberMe 参数未传给后端 → refresh token 有效期未延长
       违反规则: @rules "勾选记住我时, refresh token 有效期延长"
       来源: docs/prds/login.md#账号密码登录

[修复] 修改 1 个文件:
  - workspace/src/features/login/api/loginApi.ts (+2 -1)

[验证]
  ✅ 新用例转绿 (1 pass)
  ✅ 同模块回归 (12 pass)
  ✅ pnpm lint / tsc 无报错

[提交] ✅ commit bc3f1a2
  fix(login): 记住我勾选时 refresh token 未延长 [BUG-2026-04-16]

[PR] ⏭️  未带 --pr, 跳过。分支已准备好: fix/remember-me-expire
     需要开 PR 请: gh pr create --draft 或重跑 /fix ... --pr

━━━━━━━━━━━━━━━━━━━━
延伸问题 (未处理):
  • loginApi.ts 缺少 retry 逻辑 (非本次 bug, 建议单独处理)
```

## 设计原则

- **输入契约单一**: 所有输入先经 `/bug-check` 统一成规范报告, `/fix` 本体不处理裸文本
- **分诊在前**: 不是真 bug (feature / 漏规则) 在 `/bug-check` 阶段就拦住, 不浪费修复算力
- **最小改动**: 修一个 bug 只改相关代码, 不顺手改其他
- **可追溯**: commit / PR / 源码 JSDoc / bug 报告 四处都能反推到 PRD 锚点
- **不越权**: 源码是 /fix 独家可改, PRD 层问题必须停下, `/fix` 不自动修改 PRD
- **PRD 延伸提示**: 修复过程中发现 PRD 漏洞时, 记录在 PR 描述里提醒人去补, 不自动改 PRD
- **自愈有限度**: 单轮最多 3 次, 防死循环
- **安全边界明确**: 白名单外的文件一律停下问

需求如下:
$ARGUMENTS
