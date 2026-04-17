# 项目配置 - AI 前端自动化知识库

> Claude Code 入职培训。详细规则拆分在 `.claude/rules/` 下，按需读取。
> 遇到具体场景时，先读对应规则文件再执行。

---

## 项目结构

本项目分两层:

| 层级 | 目录 | 职责 |
|------|------|------|
| **根目录** | `.claude/` / `docs/` / `CLAUDE.md` | AI 自动化框架 (命令/规则/PRD/任务) |
| **workspace/** | `workspace/src/` / `workspace/config/` / ... | 实际前端项目 (UmiJS 工程) |

根目录的 `pnpm dev` / `pnpm gen:api` 等命令会自动代理到 `workspace/` 执行, 用户无需手动 cd。

---

## P0 禁止硬编码（最高优先级）

一切可变值通过配置/常量/Design Token/国际化引入，严禁写死。配置本身不得重复，按层级复用。
涵盖：文案国际化、颜色样式、API 端点、业务枚举、尺寸间距、魔法数字。

详细规则与示例 → `.claude/rules/no-hardcode.md`

---

## 技术栈概要

UmiJS 4 + React 18 + TypeScript 5 + Ant Design 5 (@umijs/max)

- 路由: Umi 约定式路由 | 请求: @umijs/plugin-request | 状态: useModel + Zustand
- 构建: Umi + Vite 模式 | 规范: @umijs/lint | 包管理: pnpm
- 不要安装 Umi 已内置的依赖 (axios / react-router-dom / webpack 等)

完整技术栈与项目结构 → `.claude/rules/tech-stack.md`

---

## 编码规范概要

- 注释只写"为什么"，不复述代码；文件头 JSDoc 必写，注释掉的代码直接删
- 组件 PascalCase / hooks use 前缀 / 常量 UPPER_SNAKE_CASE / 类型不加 I 前缀
- 函数式组件 + Props interface 导出 + 逻辑抽 hooks + 组件只负责渲染
- 请求用 umi-request，拦截器在 app.ts，不用 axios
- 状态: useModel 优先 → Zustand 兜底 → 服务端数据不进 store
- 路由: 约定式优先，权限用 @umijs/plugin-access + wrappers
- Git: `type(scope): description`，分支 feature/fix/refactor

完整编码规范 → `.claude/rules/coding-style.md`

---

## 文件说明规范（必须遵守）

每次创建/修改代码文件时，必须同步维护：

1. 所在目录的 `README.md`（文件清单表格）
2. 文件顶部 JSDoc 注释（@description / @module / @dependencies / **@prd / @task / @design / @rules**）
3. 功能模块的模块级 `README.md`（业务流程 + 对外暴露）
4. `workspace/src/README.md` 全局索引

> **业务锚点 (@prd / @task / @design / @rules) 是「需求 → 设计 → 代码 → 测试」可追溯链的关键**, 让 `/test` 能根据业务规则而非源码行为生成测试, `/review` 能对照设计稿检查视觉一致性。详见 `.claude/rules/file-docs.md`。

详细格式与模板 → `.claude/rules/file-docs.md`

---

## 测试规范概要

- 测试断言的**唯一来源**是源文件 JSDoc 的 `@rules`, 不是 AI 推测
- 每条 `@rules` 一个 `it()`, `it` 名字完整引用规则原文
- 断言查询优先级: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Mock 策略: HTTP 用 MSW, 项目内部模块不 mock, 不断言 mock 调用次数
- 位置: 单元/组件测试与源文件同目录 (`<name>.test.tsx`), E2E 放 `workspace/tests/e2e/`
- 测试失败分诊顺序: 测试代码 → 环境 → 测试预期 → 源码 (源码是最后才怀疑的)

完整测试规范 → `.claude/rules/testing.md`

---

## 注意事项

- 不要使用 any 类型，必须明确类型定义
- 不要使用 inline style，用 CSS Modules 或 Ant Design 组件样式
- 图片资源放在 workspace/public/images/
- 环境变量以 UMI*APP* 开头
- 所有异步操作必须有 loading 和 error 状态处理
- 表单必须有验证和错误提示（antd Form 内置验证）
- 列表页必须处理空状态（antd Empty）
- 页面组件放 workspace/src/pages/，业务逻辑放 workspace/src/features/，不要混在一起
- mock 数据放 workspace/mock/ 目录，使用 Umi 内置 mock 功能

---

## 项目工作流文档

### docs/ 目录结构

- docs/WORKFLOW.md — **新人/用户必读**, 从一句话需求到上线的八步法操作手册
- docs/tasks/ — 存放 /plan 命令生成的 JSON 任务清单, 每个文件对应一个功能模块
- docs/prds/ — 存放产品需求文档 (.md 格式), 模板见 docs/prds/_template.md
- workspace/api-spec/ — OpenAPI 契约文件 (后端提供), 通过 `pnpm gen:api` 生成 workspace/src/types/api.ts
- 详细说明见 docs/README.md 和 workspace/api-spec/README.md

### API 类型铁律

- API 类型**必须**从 `@/types/api` 导入, **禁止**手写 request/response 类型
- `workspace/src/types/api.ts` 是 `pnpm gen:api` 生成的产物, 不要手改
- OpenAPI 字段不对要推后端改 `workspace/api-spec/openapi.json`, 不要前端绕过

### 任务清单使用方式

- 编码前先读取对应的任务清单: @docs/tasks/tasks-xxx.json
- 按 taskId 顺序和 dependencies 依赖关系执行任务
- 每完成一个任务, 将其 status 更新为 "done"
- status 取值: pending (待开发) | in-progress (开发中) | done (已完成) | blocked (被阻塞)
