# 工作流操作手册

> 从一句话需求到测试上线的完整操作指南。
> 卡住时回来翻翻这份文档, 大部分场景都覆盖了。

---

## 🎬 第一次使用前 (一次性配置)

```bash
# 进入项目
cd /Users/sundaotao/Desktop/AI-Automation/AI-Frontend-Automation

# 启动 Claude Code
claude

# 让 Claude 熟悉项目 (首次必做)
/start
```

`/start` 会让 Claude 通读 [CLAUDE.md](../CLAUDE.md)、目录结构、技术栈, 建立项目认知。

---

## 📝 日常开发: 五步法

### Step 1 — 把口语需求变 PRD

```bash
/prd 我要做一个用户登录功能
```

**会发生什么**:
- AI 反问 3-5 个关键问题 (登录方式? 安全策略? token 方案?)
- 你一次性回答 (或说「按主流默认」)
- AI 生成草稿到 `docs/prds/login.md`
- 草稿里有 `[待确认]` / `[默认假设]` 标注

**你要做**:
- 打开 `docs/prds/login.md` 人工审
- 把 `[待确认]` 项填实 (这一步不能省, 否则下游全错)
- 检查「业务规则」章节, 每条都得是真规则

---

### Step 2 — PRD 拆任务

```bash
/plan @docs/prds/login.md
```

**会发生什么**:
- AI 读 PRD 的二级标题 (`## 登录表单` 这种) 作为锚点
- 拆成 `docs/tasks/tasks-login-2026-04-14.json`
- 每个任务带 `prdRef` + `businessRules` + `acceptanceCriteria`
- 按依赖排序 (api → store → hooks → components → page)

**你要做**:
- 看一眼任务清单是否合理
- 任务太多可以分批做

---

### Step 3 — 编码

```bash
> 请按 @docs/tasks/tasks-login-2026-04-14.json 的顺序实现, 从 T001 开始
```

**会发生什么**:
- AI 写代码 + 在每个文件 JSDoc 写 `@prd` / `@task` / `@rules`
- 每完成一个任务, 把 `tasks.json` 里的 `status` 改为 `done`
- 同步维护对应目录的 `README.md`

**你要做**:
- 跑 `pnpm dev` 在浏览器看效果
- 有问题随时让 AI 修

---

### Step 4 — 生成测试

```bash
/test src/features/login/
```

**会发生什么**:
- AI 读源码 JSDoc 的 `@rules`, 列出业务规则清单给你确认
- 按规则生成测试 (每条规则一个 `it()`)
- 自动跑测试
- 失败按四类分诊: 环境 / 测试代码 / 测试预期 / 源码 bug

**你要做**:
- 看规则清单, 确认没漏
- 测试红了看 AI 报告, 按提示决定改哪边

---

### Step 5 — 审查 & 提交

```bash
/review src/features/login/
```

**会发生什么**:
- AI 按六个维度审查 (可读性、性能、安全、规范、复用、业务规则覆盖)

**你要做**:
- 修掉 AI 指出的问题
- `git commit -m "feat(login): ..."`

---

## 🎯 决策树: 我现在该用哪个命令?

```
我有一个新想法
    ↓
是否已经有 PRD 文档?
    ├─ 否 → /prd <一句话需求>            (生成 PRD)
    └─ 是 ↓
        是否已经拆过任务?
            ├─ 否 → /plan @docs/prds/xxx.md  (拆任务)
            └─ 是 ↓
                是否还在写代码?
                    ├─ 是 → 直接跟 AI 对话编码
                    └─ 否 ↓
                        是否生成过测试?
                            ├─ 否 → /test src/.../xxx.tsx
                            └─ 是 ↓
                                是否审查过?
                                    ├─ 否 → /review
                                    └─ 是 → git commit + 提 PR
```

---

## 🛟 常见场景速查

| 场景 | 命令 |
|------|------|
| 改了 PRD, 要重新拆任务 | `/plan @docs/prds/xxx.md` (覆盖旧 tasks.json) |
| 改了源码, 要更新测试 | `/test <文件>` (自动识别哪些过期需重新生成) |
| 只想补缺失的测试 | `/test <目录> --only-missing` |
| 强制重新生成全部测试 | `/test <目录> --force` |
| 不知道项目里有哪些命令 | 输入 `/` 看自动补全 |
| 加新需求到现有模块 | 在 `docs/prds/xxx.md` 加新的 `## 二级标题`, 再跑 `/plan` |
| 修 bug, 不算新需求 | 直接跟 AI 说, 不用走完整流程 |
| CLAUDE.md 改了不生效 | 退出 (Ctrl+D) 重启 `claude` 会话 |

---

## 🔌 前后端协作

### 核心理念: 契约先行

不要等后端写完才动手。流程:

```
1. PRD 评审 → 产出业务规则
2. 前后端一起评审 → 产出「数据契约」(字段/类型/错误码), 写进 PRD
3. 后端写实现, 前端写 mock 并行开发
4. 后端就绪 → 切 proxy 联调
```

### 数据契约写在哪

写在 `docs/prds/<模块>.md` 的「数据契约」章节 (模板见 [_template.md](prds/_template.md))。
这是前后端的「合同」, 任何字段变更必须双方同步更新。

### Mock 策略

| 场景 | 方案 |
|------|------|
| 后端没好 | 在 `mock/` 写假数据 (Umi 内置 mock), 严格遵守数据契约 |
| 后端联调中 | `config/proxy.ts` 切代理, 关掉 mock |
| 测试 | `vi.mock` 拦截 api 模块, 不发真实请求 |

### 错误处理统一

业务错误码不要散落各处, 在 [src/app.ts](../src/app.ts) 的 request 拦截器里集中处理 (按 PRD 错误码表分发)。

### OpenAPI 接入 (本项目已启用)

后端通过 OpenAPI 提供接口契约, 前端自动生成类型, 不再手写。

#### 关键文件

```
api-spec/
├── README.md       ← 协作流程 (必读)
└── openapi.yaml    ← 后端提供的 OpenAPI 3.x 文件
src/types/api.ts    ← 自动生成的 TS 类型 (不要手改)
```

#### 工作流

```bash
# 1. 后端发新版 → 前端拉取最新 openapi.yaml 替换到 api-spec/
# 2. 重新生成类型
pnpm gen:api

# 3. TS 编译报错告诉你哪些代码受影响
pnpm dev   # 或 pnpm lint

# 4. 修代码 + mock + 测试 → 全绿后提交
git add api-spec/openapi.yaml src/types/api.ts <受影响文件>
```

#### 强制规则

- ❌ 不要手写 request/response 类型, 一律 `import type { paths } from '@/types/api'`
- ❌ 不要手改 `src/types/api.ts` (会被 gen:api 覆盖)
- ❌ 不要手改 `api-spec/openapi.yaml` 字段 (推后端改)
- ✅ Mock 数据/测试断言用生成的类型标注, 让 TS 编译保证一致性
- ✅ 字段缺失或不对 → 推后端更新 OpenAPI, 不要前端绕过

详见 [api-spec/README.md](../api-spec/README.md)。

---

## ⚠️ 三条铁律

1. **PRD 是事实源头** — 没 PRD 不要直接 `/plan`, AI 会瞎编规则
2. **`[待确认]` 必须人工填** — AI 标了就是不知道, 你不填就成隐患
3. **测试红了先怀疑测试** — 顺序: 测试代码 → 环境 → 测试预期 → 最后才是源码

---

## 🔗 可追溯链 (理解原理)

```
PRD 锚点          →  任务条目         →  源文件 JSDoc       →  测试用例
docs/prds/x.md       docs/tasks/x.json    src/.../Foo.tsx      tests/.../Foo.test
## 搜索表单      →   prdRef           →  @prd / @rules     →   it('R1: ...')
                     businessRules
```

任何一环改了, 顺着链路检查下游是否需要更新。

---

## 📚 深入了解时看哪些文件

| 想了解 | 看这里 |
|--------|--------|
| 整体规范 | [../CLAUDE.md](../CLAUDE.md) |
| PRD 怎么写 | [prds/_template.md](prds/_template.md) |
| 代码注释规范 (含业务锚点) | [../.claude/rules/file-docs.md](../.claude/rules/file-docs.md) |
| 禁止硬编码规则 | [../.claude/rules/no-hardcode.md](../.claude/rules/no-hardcode.md) |
| 编码风格 | [../.claude/rules/coding-style.md](../.claude/rules/coding-style.md) |
| 技术栈与目录结构 | [../.claude/rules/tech-stack.md](../.claude/rules/tech-stack.md) |
| 各命令的细节 | [../.claude/commands/](../.claude/commands/) 下对应 `.md` 文件 |

---

## 🆘 卡住了怎么办

1. **不知道下一步** → 看上面的「决策树」
2. **AI 行为和预期不符** → 检查 CLAUDE.md / 对应 `.claude/rules/*.md` 是否说清楚了
3. **命令不存在/失效** → 检查 `.claude/commands/` 下文件名是否正确
4. **测试一直红** → 看 `/test` 第四步「自动运行并自愈」的分诊表
5. **完全卡死** → 退出会话重启, 90% 的玄学问题靠重启解决
