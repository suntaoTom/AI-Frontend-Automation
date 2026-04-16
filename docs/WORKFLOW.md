# 工作流操作手册

> 新手请先看「🚀 快速开始」走通一遍, 之后做具体任务时再翻「📝 五步法」。

---

## 🚀 快速开始 (第一次打开项目必读)

### 环境准备 (3 条命令)

```bash
# 1. 装依赖
pnpm install

# 2. 把后端给的 OpenAPI 文件放到约定位置
cp <后端文件> workspace/api-spec/openapi.json

# 3. 生成 TS 类型 + 启动项目
pnpm gen:api && pnpm dev
```

看到 Umi 启动成功, 浏览器能打开, 说明环境 OK。

### 最小完整例子 (从 0 到 1 做一个「登录」功能)

```bash
# 启动 Claude
claude

# ① 让 AI 认识项目 (首次必做)
/start

# ② 把口语需求变 PRD (AI 会问几个问题, 回答完会生成 docs/prds/login.md)
/prd 我要做一个用户登录功能

# ③ 人工审 PRD, 填实 [待确认] 项 (关键! 不填下游会错)
# 用编辑器打开 docs/prds/login.md, 修改

# ④ 拆任务
/plan @docs/prds/login.md

# ⑤ 编码 (AI 按 tasks.json 顺序实现)
/code @docs/tasks/tasks-login-*.json

# ⑥ 生成测试并自动跑
/test workspace/src/features/login/

# ⑦ 审查代码
/review workspace/src/features/login/

# ⑧ 提交
git commit -m "feat(login): ..."
```

跑通一遍之后, 细节回头翻下面的「📝 五步法」。

---

## 🗺️ 决策树: 我现在该做什么?

```
打开项目
    ↓
环境装过了吗?                           否 → pnpm install + pnpm gen:api
    ↓ 是
要做的功能有 PRD 吗?                    否 → /prd <需求>
    ↓ 是
PRD 的 [待确认] 都填实了吗?             否 → 手动填 (不能省)
    ↓ 是
PRD 里的接口都在 openapi.json 里?       否 → 走「缺接口时怎么办」(见下)
    ↓ 是
任务清单拆过了吗?                       否 → /plan @docs/prds/xxx.md
    ↓ 是
代码写完了吗?                           否 → 让 AI 按任务清单实现
    ↓ 是
测试生成过了吗?                         否 → /test <目录>
    ↓ 是
审查过了吗?                             否 → /review <目录>
    ↓ 是
git commit → 完工
```

---

## 📝 五步法 (日常开发)

### Step 1 — 需求变 PRD

```bash
/prd 我要做一个用户登录功能
```

**AI 会做**:
- 反问 3-5 个关键问题 (登录方式? 安全策略? 后端接口?)
- 扫 `workspace/api-spec/openapi.json` 推荐可复用接口, 缺的生成 stub
- 生成草稿到 `docs/prds/<模块名>.md`, 含 `[待确认]` 标注

**你要做**:
- 打开生成的 PRD 人工审 — **详细方法看 [prds/REVIEW.md](./prds/REVIEW.md)**
- 改一点跑一下 `/prd-check @docs/prds/xxx.md` 实时自检, 看还差哪些没改完
- `[待确认]` 必须清零才能跑 `/plan`

**常见卡点**:
- ❓ `/prd-check` 报错不知道怎么改 → 看 [prds/REVIEW.md](./prds/REVIEW.md) 的三种处理方式 (填实 / 标下迭代 / 整段删)
- ❓ AI 标 🆕 的接口 → 看下节「缺接口时怎么办」

---

### Step 2 — PRD 拆任务

⚠️ **前置检查**: 确认 `workspace/api-spec/openapi.json` 是最新的 (必要时先 `pnpm gen:api`)

```bash
/plan @docs/prds/login.md
```

**AI 会做**:
- 校验 PRD 里 ✅ 状态的 operationId 都在 openapi.json 里
- 按依赖排序生成 `docs/tasks/tasks-login-*.json`
- 每个任务带 `prdRef` + `businessRules`

**你要做**:
- 看一眼任务清单是否合理
- 任务多可以分批做

**常见卡点**:
- ❓ AI 报「operationId 找不到」→ 拉最新 openapi.json, 或让后端确认
- ❓ AI 报「🆕 接口未评审」→ 见「缺接口时怎么办」

---

### Step 3 — 编码

⚠️ **前置检查**: 确保类型已生成 `pnpm gen:api`

```bash
/code @docs/tasks/tasks-login-*.json

# 中断后续跑
/code @docs/tasks/tasks-login-*.json --from T005

# 只做某几个任务 (局部返工)
/code @docs/tasks/tasks-login-*.json --only T003,T004
```

**AI 会做**:
- 前置校验: PRD 仍合法 (内嵌 `/prd-check`) + `workspace/src/types/api.ts` 已生成
- 按 `dependencies` 严格顺序执行, 状态 `pending → in-progress → done`
- 每个文件 JSDoc 写入 `@prd` / `@task` / `@rules` (business rules 原文照抄)
- API 类型从 `@/types/api` import, 不手写
- 维护所在目录 README.md 的文件清单
- 遇到 PRD 模糊/OpenAPI 缺字段/要选方案 → 改 `blocked` 并停下问你

**你要做**:
- 开着 `pnpm dev` 在浏览器看效果
- AI 问你的时候回答, 不问就让它继续

**常见卡点**:
- ❓ TS 报错 `Cannot find module '@/types/api'` → 跑 `pnpm gen:api`
- ❓ 字段不对 → 检查 workspace/api-spec/openapi.json 是不是最新的
- ❓ AI 报 PRD 已变更 → 回 Step 1/2 修 PRD 重跑 `/plan`

---

### Step 4 — 生成测试

```bash
/test workspace/src/features/login/
```

**AI 会做**:
- 读源码 JSDoc 的 `@rules` 列出规则清单给你确认
- 按规则生成测试 (每条规则一个 `it()`)
- 自动运行, 失败按 4 类分诊:

| 失败类型 | 处理 |
|---------|------|
| 测试代码错 (selector 等) | AI 自动修 |
| 环境缺配置 / 依赖 | 停下问你 |
| 测试预期错 (AI 猜错了) | AI 自动改预期 |
| 源码真的有 bug | 停下问你 |

**你要做**:
- 看规则清单确认没漏
- 红了看 AI 报告决定改哪边

**常见卡点**:
- ❓ 测试一直红 → 先怀疑测试, 最后才怀疑源码 (见铁律 3)

---

### Step 5 — 审查 & 提交

```bash
/review workspace/src/features/login/
```

修掉 AI 指出的问题, 然后:

```bash
git commit -m "feat(login): 实现登录功能"
```

---

## 🔌 前后端协作 (重点)

### 核心理念: 契约先行, 前端不等后端

API 契约 (`api-spec/openapi.json`) 是前后端的合同。契约一旦评审锁定, 双方就能并行开发。

### 缺接口时怎么办 (后端还没实现)

**不要等**。三种方案:

#### 方案 A (推荐): 前端写 stub, 评审后合并到主 openapi.json

```
/prd 时 AI 自动生成 stub 放在 PRD「接口提议」章节
    ↓
前后端 15-30 分钟评审
    ↓
后端把 stub 合进 api-spec/openapi.json
    ↓
前端 pnpm gen:api → 有类型 → 开发 + 写 mock
```

#### 方案 B (兜底): 本地 stub 文件

适用: stub 已评审通过, 但后端短期无法合主文件 (下班/跨时区/排期靠后)。

**什么时候生成 `openapi.local.json`** (明确时机, 不要乱建):

| 阶段 | 是否建 local | 说明 |
|------|------------|------|
| `/prd` 生成草稿时 | ❌ | stub 只写在 PRD「接口提议」章节, 未评审不进 local |
| 人工审 PRD / 跑 `/prd-check` / `/plan` | ❌ | stub 还是提议状态, 随时可能改 |
| **前后端评审通过后, 后端无法立即合主文件** | ✅ **这里建** | 手动把评审过的 stub 从 PRD 复制到 `openapi.local.json` |
| 后端已把 stub 合进主 `openapi.json` | ❌ 反而要删 | 主文件已有就不需要 local 了 |

**操作步骤** (路径 B 触发后):

```bash
# 1. 文件不存在就新建
touch workspace/api-spec/openapi.local.json
```

```json
// workspace/api-spec/openapi.local.json — 从 PRD「接口提议」章节拷贝评审过的 stub
{
  "openapi": "3.0.0",
  "info": { "title": "local stubs", "version": "0.0.1" },
  "paths": { /* 粘贴 PRD 里评审通过的 yaml, 转成 json */ }
}
```

```bash
# 2. 生成类型 (gen-api.mjs 会自动合并主 json + local)
pnpm gen:api

# 3. 正常开发, 类型从 @/types/api 取
pnpm dev
```

**关键规则**:
- ⚠️ **单向搬运**: PRD stub 是源头, local 只是拷贝, 不要反过来改
- ⚠️ **仅本迭代用**: 后端一实现, 立即删 local 里对应条目 (整个文件也可以删)
- ⚠️ **未评审不建**: 基于未评审的字段开发, 字段一变就白写

#### 方案 C: 禁止

不要手写类型 + 手写 mock, 会导致联调全炸。

---

## 🛠️ API 类型日常操作

### 后端发新版 openapi.json 时

```bash
# 1. 替换文件
cp <后端给的新文件> workspace/api-spec/openapi.json

# 2. 重新生成类型
pnpm gen:api

# 3. 让 TS 告诉你哪些代码受影响
pnpm dev

# 4. 按报错修代码 + mock + 测试 → 全绿后提交
git add workspace/api-spec/openapi.json workspace/src/types/api.ts <受影响的文件>
```

### 强制规则

- ❌ 不要手写 request/response 类型, 一律 `import type { paths } from '@/types/api'`
- ❌ 不要手改 `workspace/src/types/api.ts` (会被 gen:api 覆盖)
- ❌ 不要手改 `workspace/api-spec/openapi.json` (要改推后端)
- ✅ mock 和测试断言用生成的类型, 让 TS 保证一致性

---

## ⚠️ 三条铁律

1. **PRD 是事实源头** — 没 PRD 不要直接 `/plan`, AI 会瞎编规则
2. **`[待确认]` 必须人工填** — `/plan` 入口硬性校验, 有 `[待确认]` 直接报错不执行 (`[默认假设]` 不拦, 评审会再定)
3. **测试红了先怀疑测试** — 顺序: 测试代码 → 环境 → 测试预期 → 源码

---

## 📖 术语小词典

| 术语 | 含义 | 第一次见在 |
|------|------|----------|
| `operationId` | OpenAPI 里每个接口的唯一名字 (比路径更稳定) | PRD 数据契约 |
| `[待确认]` | AI 不确定的项, 必须人工填 | /prd 输出 |
| `@rules` | 源文件 JSDoc 里的业务规则, 测试断言的来源 | 源文件头部 |
| `@prd` / `@task` | 源文件指向 PRD 和任务的锚点 | 源文件头部 |
| stub | OpenAPI 片段, 前端先写的「接口提议」 | 缺接口时怎么办 |
| `workspace/api-spec/openapi.json` | 后端给的 OpenAPI 契约文件, 事实源头 | 环境准备 |
| `workspace/src/types/api.ts` | 自动生成的 TS 类型, 不要手改 | 编码 |

---

## 🛟 常见场景速查

| 场景 | 动作 |
|------|------|
| 项目跑不起来 | `pnpm install && pnpm gen:api && pnpm dev` |
| TS 报 `@/types/api` 找不到 | `pnpm gen:api` |
| 改了 PRD 要重拆任务 | `/plan @docs/prds/xxx.md` (覆盖旧 tasks.json) |
| 改了源码要更新测试 | `/test <文件>` (自动识别哪些过期) |
| 只补缺失的测试 | `/test <目录> --only-missing` |
| 强制重新生成全部测试 | `/test <目录> --force` |
| 加新需求到现有模块 | PRD 加新 `## 二级标题`, 再跑 `/plan` |
| 修 bug, 不算新需求 | 直接跟 AI 说, 不走完整流程 |
| 不知道项目里有哪些命令 | 输入 `/` 看自动补全 |
| CLAUDE.md 改了不生效 | Ctrl+D 重启 claude 会话 |
| 完全卡死 | 退出会话重启, 90% 玄学问题靠重启解决 |

---

## 🔬 深入原理 (非必读, 有兴趣再看)

<details>
<summary>展开: 可追溯链</summary>

```
PRD 锚点          →  任务条目          →  源文件 JSDoc     →  测试用例
docs/prds/x.md       docs/tasks/x.json    workspace/src/..    workspace/tests/..
## 搜索表单       →   prdRef           →  @prd / @rules   →   it('R1: ...')
                      businessRules
```

任何一环改了, 顺着链路检查下游是否需要更新。

</details>

<details>
<summary>展开: OpenAPI 版本自动识别</summary>

`gen:api` 脚本 [scripts/gen-api.mjs](../workspace/scripts/gen-api.mjs) 会自动识别后端给的是 Swagger 2.0 还是 OpenAPI 3.x:

| 后端版本 | 处理方式 | 额外产物 |
|---------|---------|--------|
| OpenAPI 3.x | 直接生成 | - |
| Swagger 2.0 | 先用 swagger2openapi 转成 3.x, 再生成 | `.openapi.v3.json` (临时, 已 gitignore) |

前端感知不到差异, 统一跑 `pnpm gen:api`。判断版本: 打开 `openapi.json` 看根字段是 `"openapi"` 还是 `"swagger"`。

</details>

<details>
<summary>展开: 本地 stub 合并逻辑</summary>

存在 `workspace/api-spec/openapi.local.json` 时, `gen:api` 会:
1. 读主 `openapi.json`
2. 合并 `workspace/api-spec/openapi.local.json` 的 `paths` 和 `components`
3. 产出 `.openapi.merged.json` (临时)
4. 后续流程不变

每次运行会打印当前 local 里的提议接口, 提醒评审进度。

</details>

---

## 📚 想深入了解时看哪些文件

| 想了解 | 看这里 |
|--------|--------|
| 整体规范 | [../CLAUDE.md](../CLAUDE.md) |
| PRD 怎么写 | [prds/_template.md](prds/_template.md) |
| PRD 怎么审 | [prds/REVIEW.md](prds/REVIEW.md) |
| OpenAPI 协作 | [../workspace/api-spec/README.md](../workspace/api-spec/README.md) |
| 代码注释规范 | [../.claude/rules/file-docs.md](../.claude/rules/file-docs.md) |
| 禁止硬编码 | [../.claude/rules/no-hardcode.md](../.claude/rules/no-hardcode.md) |
| 编码风格 | [../.claude/rules/coding-style.md](../.claude/rules/coding-style.md) |
| 技术栈 | [../.claude/rules/tech-stack.md](../.claude/rules/tech-stack.md) |
| 全部命令 | [../.claude/commands/](../.claude/commands/) — `/prd` `/prd-check` `/plan` `/plan-check` `/code` `/test` `/review` `/start` |
