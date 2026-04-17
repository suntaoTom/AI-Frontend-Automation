# 工作流操作手册

> 新手请先看「🚀 快速开始」走通一遍, 之后做具体任务时再翻「📝 八步法」。

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

# ⑨ 构建 + 本地验证 (按需)
/build web

# ⑩ 部署上线 (按需)
/deploy web --env staging

# ⑪ 发布 changelog (按需)
/release v1.0.0
```

跑通一遍之后, 细节回头翻下面的「📝 八步法」。

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
git commit
    ↓
想本地看看效果?                          是 → /build <平台> → 本地预览/安装
    ↓ 否或看完了
需要部署上线吗?                          否 → 完工
    ↓ 是
/deploy <平台> --env <环境>
    ↓
需要发布 changelog 吗?                  否 → 完工
    ↓ 是
/release <版本号> → 完工
```

---

## 📝 八步法 (日常开发)

### Step 1 — 需求变 PRD

```bash
/prd 我要做一个用户登录功能
```

**AI 会做**:
- 反问 3-5 个关键问题 (登录方式? 安全策略? 后端接口? **设计稿?**)
- 扫 `workspace/api-spec/openapi.json` 推荐可复用接口, 缺的生成 stub
- 如果有设计稿 (Figma 链接 / 本地文件 / MCP), 生成「功能点与设计帧映射」表
- 生成草稿到 `docs/prds/<模块名>.md`, 含 `[待确认]` 标注

**你要做**:
- 打开生成的 PRD 人工审 — **详细方法看 [prds/REVIEW.md](./prds/REVIEW.md)**
- 确认「设计稿」章节链接正确 (有 Figma 链接的话点一下能打开)
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

#### 中断后再开一个 agent 会怎样 (断点恢复)

`/code` 的断点记忆**全在 tasks.json 的 `status` 字段**, 没有隐藏缓存。下次打开新 agent 重跑 `/code @docs/tasks/xxx.json`, 它会这样处理:

| 状态 | 行为 |
|------|------|
| `done` | 自动跳过, 不重做 |
| `pending` | 按 `dependencies` 顺序续跑 |
| `in-progress` | **停下问你** (上次会话在这个任务中断, 文件状态未知) |

遇到 `in-progress` 时 AI 会先读 `task.filePath` + JSDoc, 判断文件是否存在、`@rules` 是否已覆盖本任务 `businessRules`, 然后给你 4 个选项:

- **A. 继续补全** — 文件已部分写入, 基于现状补完
- **B. 删除重做** — 已有代码偏离规则, 删文件从头写
- **C. 标记为 done** — 其实写完了, 上次没来得及改状态
- **D. 回退为 pending** — 没真正动代码, 走正常流程重跑

> ⚠️ 别手动改 `status`, 让 AI 读完现状再决定。如果你已经知道断点在哪, 用 `--from T005` 直接跳过本流程。

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

### Step 6 — 构建 + 本地验证

```bash
# 构建 Web, 自动启动本地预览
/build web

# 构建 Android APK
/build android

# 多平台同时构建
/build web,android

# 指定环境配置构建 (如 staging 用不同接口地址)
/build web --env staging

# 清理旧产物后重建
/build web --clean
```

**AI 会做**:
- 检查依赖 + 类型文件是否就绪
- 执行平台对应的构建命令
- 校验产物 (文件存在、大小合理、签名正确)
- 启动本地预览或输出安装命令

**构建完你会拿到**:

| 平台 | 产出 |
|------|------|
| Web | 🌐 `http://localhost:4173` 本地预览 + `workspace/dist/` 目录 |
| Android | 📱 APK 文件路径 + `adb install` 命令 |
| iOS | 📱 模拟器安装命令 或 .ipa 路径 |
| HarmonyOS | 📱 `hdc install` 命令 + .hap 路径 |

**你要做**:
- 本地看一眼效果, 或手机装一下试试
- 没问题 → `/deploy` 部署上线
- 有问题 → 改代码, 再 `/build`

**常见卡点**:
- ❓ 构建报 TS 错误 → 先修代码再重新 `/build`
- ❓ APK 安装失败 → 检查手机是否开了开发者模式 + USB 调试
- ❓ 只想构建不预览 → `/build web --no-preview`

---

### Step 7 — 部署

```bash
# 交互式选择平台和环境
/deploy

# 指定平台和环境
/deploy web --env staging

# 多平台同时部署
/deploy web,ios,android --env staging

# 全平台生产发布
/deploy all --env production

# 灰度发布 (仅 production)
/deploy web --env production --canary 10%

# 指定 CI/CD 平台
/deploy web --env staging --ci gitlab

# 回滚
/deploy web --env production --rollback
```

**AI 会做**:
- 检查 `workspace/deploy.config.ts` 配置
- 校验 Git 状态 (production 必须在 main 分支, 无未提交变更)
- 检查构建产物是否存在 (没有则提示先 `/build`, 或加 `--rebuild` 自动构建)
- 把产物推到服务器/平台 → 验证 → 通知 (钉钉/飞书) → 输出访问地址

**平台 × 环境一览**:

| 平台 | staging | production |
|------|---------|------------|
| Web | CI → CDN 测试域名 | CI → CDN 生产域名 + 灰度可选 |
| iOS | CI → TestFlight | CI → App Store Connect |
| Android | CI → 内部分发 (蒲公英/fir) | CI → Google Play |
| HarmonyOS | CI → 内部分发 | CI → AppGallery Connect |

**你要做**:
- 首次使用: 创建 `workspace/deploy.config.ts` (AI 会输出模板)
- 配置 CI/CD secrets (证书/token/webhook)
- production 部署时 AI 会停下等你审批
- 灰度每步之间 AI 会停下等你确认

**常见卡点**:
- ❓ 没有 deploy.config.ts → 首次运行 `/deploy` 会输出模板
- ❓ CI 触发失败 → 检查 token 权限 (GitHub: `workflow` scope, GitLab: `api` scope)
- ❓ 签名失败 → 检查证书/keystore 是否配置正确
- ❓ 想用 GitLab/Jenkins 而不是 GitHub → 在 deploy.config.ts 的 `ci.platform` 切换

**支持的 CI/CD 平台**: GitHub Actions / GitLab CI / Jenkins

---

### Step 8 — 发布 Changelog (可选)

```bash
# 自动聚合自上次 tag 以来的所有变更
/release v1.0.0

# 或不指定版本号, 先预览
/release
```

**AI 会做**:
- 读 git log, 按 `type(scope)` 分类聚合 commit
- 从 commit message 提取关联 PRD / 任务 / Bug 报告 / PR 号
- 生成结构化 changelog (新功能 / 修复 / 重构 / 其他 + 统计)

**你要做**:
- 审 changelog 预览
- AI 会逐步询问: 保存到 CHANGELOG.md? 打 git tag? 发 GitHub Release? 每步你自己决定

---

## 🐛 发现 bug 时怎么办

### 三种 bug 来源, 都经 `/bug-check` 分诊后走 `/fix`

| 来源 | 命令 | `/bug-check` 的作用 |
|------|------|---------------------|
| 本地开发时发现 | `/fix <描述>` | 分诊 (真 bug / feature / 漏规则) + 反问补齐 → 固化报告 → 停下让你 review |
| `/review` 报出的问题 | `/fix @docs/review-reports/xxx.md --pr` | 校验格式 + 分诊 |
| **测试端 AI 测试** | `/fix @docs/bug-reports/xxx.md --pr` | 校验格式 + 分诊 |

> **核心逻辑**: 「代码没实现 PRD 有的规则」= bug → `/fix`; 「PRD 里没这个规则」= 漏规则 → `/prd` 补规则。`/bug-check` 负责做这个分流。

**独立自检**: 不一定非要跑 `/fix`, 随时可以单独跑 `/bug-check @docs/bug-reports/xxx.md` 验格式、看分诊结果。

### 测试端 AI 测试对接 (重点)

测试端 AI 和 `/fix` 之间的桥是 **`docs/bug-reports/<日期>-<模块>.md`** (格式见 [bug-reports/_template.md](./bug-reports/_template.md))。

**给测试端 AI 的 system prompt** 见 [bug-reports/README.md](./bug-reports/README.md), 原样拷贝, 它就会按模板写报告, 不会自己去改代码。

**对接流程**:

```
你让测试端 AI 测 /login
    ↓
测试端 AI 写 docs/bug-reports/2026-04-16-login.md (3 个 bug)
    ↓
(可选) /bug-check @docs/bug-reports/2026-04-16-login.md  ← 自检格式 + 分诊
    ↓
你 review 一眼 (3-5 min, 剔除误报)
    ↓
/fix @docs/bug-reports/2026-04-16-login.md --pr
    ↓
/fix 内嵌 /bug-check 校验 → 按优先级 + 模块分组 → 产出 1~N 个 draft PR
    ↓
你审 PR → merge
```

### 口头报 bug 的流程

```
/fix 登录页白屏
    ↓
/fix 内嵌 /bug-check → 分诊 + 反问补齐 → 固化到 docs/bug-reports/<日期>-<模块>.md → 停下
    ↓
你 review 报告 (确认推测、修正细节)
    ↓
/fix @docs/bug-reports/<日期>-<模块>.md [--pr]
    ↓
正常修复流程
```

> 口头 bug 也会落盘成报告文件, 和测试端 AI 产出的一视同仁, 追溯统一。

### 完全自动闭环 (未来可选)

`.github/workflows/claude-fix.yml` 已写好, 启用后:
- 在 GitHub issue 里评论 `@claude fix` → workflow 自动触发 `/fix --pr --headless`
- 启用步骤见 [.github/README.md](../.github/README.md)

**未启用时命令本地跑就行**, 和启用后用的是同一份 `/fix.md`。

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
| `deploy.config.ts` | 部署配置文件, 定义平台/环境/CI/通知 | /deploy |
| 灰度 (canary) | 按百分比逐步放量的部署策略, production 可选 | /deploy |

---

## 🛟 常见场景速查

| 场景 | 动作 |
|------|------|
| 项目跑不起来 | `pnpm install && pnpm gen:api && pnpm dev` |
| TS 报 `@/types/api` 找不到 | `pnpm gen:api` |
| 改了 PRD 要重拆任务 | `/plan @docs/prds/xxx.md` (覆盖旧 tasks.json) |
| 改了源码要更新测试 | `/test <文件>` (自动识别哪些过期) |
| 本地发现某个 bug 想让 AI 修 | `/fix <描述>` → `/bug-check` 分诊+固化 → review → `/fix @<报告>` |
| 测试端 AI 测出来一堆 bug | 先 `/bug-check @<报告>` 自检, 再 `/fix @<报告> --pr` |
| 不确定是 bug 还是缺需求 | `/bug-check <描述>` — 分诊结果告诉你走 `/fix` 还是 `/prd` |
| 想要 issue 评论触发自动修 | 启用 `.github/workflows/claude-fix.yml` (见 `.github/README.md`) |
| 只补缺失的测试 | `/test <目录> --only-missing` |
| 强制重新生成全部测试 | `/test <目录> --force` |
| 加新需求到现有模块 | PRD 加新 `## 二级标题`, 再跑 `/plan` |
| 修 bug, 不算新需求 | 直接跟 AI 说, 不走完整流程 |
| 不知道项目里有哪些命令 | 输入 `/` 看自动补全 |
| 页面感觉卡顿想查性能 | `/ext-perf-audit workspace/src/features/xxx/` |
| 合规/无障碍专项检查 | `/ext-a11y-check workspace/src/features/xxx/` |
| 依赖安全巡检 | `/ext-dep-audit` |
| 周报/交接需要变更报告 | `/ext-changelog --since 2026-04-10` |
| 本地预览构建结果 | `/build web` → 浏览器打开 localhost 预览 |
| Android APK 装手机试试 | `/build android` → `adb install <APK路径>` |
| 构建没问题要部署了 | `/deploy web --env staging` (自动检测 /build 产物) |
| 部署到测试环境 | `/deploy web --env staging` |
| 多平台同时发布到生产 | `/deploy all --env production` |
| 生产回滚 | `/deploy web --env production --rollback` |
| 首次部署不知道怎么配 | `/deploy` → AI 输出配置模板 |
| CLAUDE.md 改了不生效 | Ctrl+D 重启 claude 会话 |
| 完全卡死 | 退出会话重启, 90% 玄学问题靠重启解决 |

---

## 🧰 扩展技能 (ext-* skill 包)

除了八步法的主命令, 项目还提供了一批**按需使用**的扩展技能 (以 `ext-` 前缀区分), 以**包的形式**放在 [`.claude/skills/`](../.claude/skills/) 下, 含 SKILL.md + 确定性脚本 + 参考资料:

| 技能 | 用途 | 典型场景 |
|------|------|---------|
| [ext-perf-audit](../.claude/skills/ext-perf-audit/) | 前端性能审计 (包体积/渲染/网络/内存/首屏) | 页面感觉卡 / 发版前专项优化 |
| [ext-a11y-check](../.claude/skills/ext-a11y-check/) | 无障碍 WCAG 2.1 AA 合规检查 | 需要支持屏幕阅读器 / 键盘操作 / 合规要求 |
| [ext-dep-audit](../.claude/skills/ext-dep-audit/) | 依赖安全与健康度审计 (漏洞/过时/冗余/许可证) | 季度依赖巡检 / 安全告警响应 |
| [ext-changelog](../.claude/skills/ext-changelog/) | 可读的变更影响报告 (按模块聚合) | 周报 / 交接 / 复盘 (不同于 `/release` 的发版 changelog) |

**命令 vs 技能包的区别**:

| | commands/ 单文件 | skills/ 包形式 |
|---|---|---|
| 位置 | `.claude/commands/*.md` | `.claude/skills/<name>/SKILL.md` (+ scripts/ + references/) |
| 能力 | 纯 prompt 模板 | 可跑确定性脚本 (度量/git/pnpm) + 按需加载大段参考资料 |
| 触发 | 显式输入 `/xxx` | 显式输入 或 AI 根据 description 自动调用 |
| 适合 | 思考类工作流 (/prd /plan /code) | 工具类审计 (要真实数据) |

**ext- 命名约定**: 非八步法主流程, 按需使用。详见 [`.claude/skills/README.md`](../.claude/skills/README.md)。

**什么时候用**:
- 主命令 (`/prd` `/code` `/test` ...) 是**必走流程**, 按八步法跑
- 扩展技能是**可选专项**, 出现对应场景再用, 不必每次都跑

---

## 🤖 子代理 (并行/保护 context)

项目提供 3 个 sub-agent, 由主命令用 `Agent` 工具 spawn, 跑在**独立 context** 里, 支持并行:

| 代理 | 职责 | 典型 spawn 场景 |
|------|------|----------------|
| [test-writer](../.claude/agents/test-writer.md) | 按 `@rules` 生成测试 + 跑验证 | `/code` 完成多文件后 / `/test` 多模块并行 |
| [code-reviewer](../.claude/agents/code-reviewer.md) | 只读审查, 按规则扫问题 | `/review` 拆分大目录 / 提 PR 前第二视角 |
| [bug-fixer](../.claude/agents/bug-fixer.md) | 修单个已分诊的 true-bug | `/fix` 处理多 bug 报告时并行 |

**什么时候主 agent 会 spawn**:
- 任务可独立并行 (5 个 bug 一起修比串行快 5 倍)
- 怕污染主 context (大目录审查读文件读很多)
- 需要独立视角 (主 agent 刚写完代码, 让 reviewer 独立看)

**用户视角**: 通常不用直接调 agent — 主命令会自己判断什么时候 spawn。想手动调用看 [.claude/agents/README.md](../.claude/agents/README.md)。

---

## 🪝 自动化 Hooks (静默守护)

项目内置了 3 个 hooks (配置在 `.claude/settings.json`), 在后台自动运行, 不需要手动触发:

| Hook | 触发时机 | 做什么 | 为什么需要 |
|------|---------|--------|-----------|
| **P0 硬编码检测** | 每次编辑/创建 `.ts` `.tsx` 文件后 | 扫描文件中的中文文案, 发现未走 i18n 的立刻警告 | 不用等 `/review` 才发现违反 P0 禁止硬编码规则 |
| **未完成任务提醒** | 每次开启新会话时 | 扫描 `docs/tasks/` 下所有 tasks.json, 列出 `in-progress` 的任务 | 自动告诉你上次中断在哪, 不用自己翻 |
| **提交前状态检查** | 执行 `git commit` 前 | 检查是否有任务仍为 `in-progress` 但即将提交 | 防止忘记把完成的任务改为 `done` |

**你会看到的效果**:

```
# 开启会话时自动输出:
📋 发现未完成的任务:
  docs/tasks/tasks-login-2026-04-15.json: T005 T006

# 编辑文件后, 如果有中文硬编码:
⚠️ P0 硬编码检测: workspace/src/features/auth/LoginForm.tsx 中发现中文文案,请走 i18n
  42:    <Button>登录</Button>
  58:    message.success('登录成功');

# git commit 前, 如果有未更新的任务状态:
⚠️ 提交前检查: 以下任务仍为 in-progress,确认是否需要改为 done:
  docs/tasks/tasks-login-2026-04-15.json: T005
```

> Hooks 只提醒, 不阻断。看到警告后自己决定要不要处理。

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

<details>
<summary>展开: 构建 → 部署流水线</summary>

```
/build web,android              ← 构建 + 本地验证 (不上线)
    ↓
第一步: 构建 (按平台并行)
    ├── Web: pnpm build → dist/  → 🌐 http://localhost:4173
    └── Android: gradle → .apk   → 📱 adb install 命令
    ↓
用户本地验证 (浏览器看/手机装)
    ↓ 没问题
/deploy web,android --env staging  ← ��产物推到服务器 (不重新构建)
    ↓
第一步: 前置检查
    ├── deploy.config.ts 存在且字段合法
    ├── Git: 无未提交变更
    └── 产物存在且新鲜 (< 30 分钟, 否则提示重新 /build)
    ↓
第二步: 部署
    ├── Web: rsync → 服务器 → nginx reload → 🌐 https://staging.example.com
    └── Android: 上传蒲公英 → 📱 https://www.pgyer.com/xxxx
    ↓
第三步: 验证 (健康检查)
    ↓
第四步: 通知 (钉钉 + 飞书, 附访问/下载地址)
```

一步到位的快捷方式:
```
/deploy web --env staging --rebuild   ← 自动先 /build 再部署
```

</details>

---

## 📚 想深入了解时看哪些文件

| 想了解 | 看这里 |
|--------|--------|
| 整体规范 | [../CLAUDE.md](../CLAUDE.md) |
| PRD 怎么写 | [prds/_template.md](prds/_template.md) |
| PRD 怎么审 | [prds/REVIEW.md](prds/REVIEW.md) |
| 测试端 AI 测试对接 | [bug-reports/README.md](bug-reports/README.md) |
| Bug 报告模板 | [bug-reports/_template.md](bug-reports/_template.md) |
| GitHub 自动化 (可选启用) | [../.github/README.md](../.github/README.md) |
| OpenAPI 协作 | [../workspace/api-spec/README.md](../workspace/api-spec/README.md) |
| 代码注释规范 | [../.claude/rules/file-docs.md](../.claude/rules/file-docs.md) |
| 禁止硬编码 | [../.claude/rules/no-hardcode.md](../.claude/rules/no-hardcode.md) |
| 编码风格 | [../.claude/rules/coding-style.md](../.claude/rules/coding-style.md) |
| 测试规范 | [../.claude/rules/testing.md](../.claude/rules/testing.md) |
| 子代理约定 | [../.claude/agents/README.md](../.claude/agents/README.md) |
| .claude 总索引 | [../.claude/README.md](../.claude/README.md) |
| CI/CD Workflows | [../.github/workflows/](../.github/workflows/) — deploy-web / deploy-ios / deploy-android / deploy-harmony |
| 技术栈 | [../.claude/rules/tech-stack.md](../.claude/rules/tech-stack.md) |
| 全部命令 | 主流程 [`../.claude/commands/`](../.claude/commands/): `/prd` `/prd-check` `/plan` `/plan-check` `/code` `/test` `/review` `/bug-check` `/fix` `/release` `/build` `/deploy` `/start` |
| 扩展技能包 | [`../.claude/skills/`](../.claude/skills/) — `ext-perf-audit` / `ext-a11y-check` / `ext-dep-audit` / `ext-changelog` |
