# 测试规范

> 本文件规定**测试写什么、怎么写**, 不涉及具体执行流程 (那是 `/test` 命令的事)。

## 核心原则

**测试断言的唯一来源是源文件 JSDoc 的 `@rules`, 不是 AI 读源码的推测**。

```
PRD 业务规则  →  @rules (JSDoc)  →  测试 it() 断言
    一一对应, 不跳跃, 不扩展
```

违反这条 = 测试会「测试源码现状」而不是「验证业务规则」, 源码有 bug 时测试会跟着错。

---

## 测试工具分工

| 工具 | 用途 | 位置 |
|------|------|-----|
| Vitest | 单元测试 / 组件测试 (JSDOM) | `<文件>.test.ts(x)` 与源文件同目录 |
| Playwright | E2E 测试 / 真实浏览器交互 | `workspace/tests/e2e/*.spec.ts` |
| @testing-library/react | 组件渲染 + 用户交互模拟 | 配合 Vitest 使用 |
| MSW (Mock Service Worker) | 拦截 HTTP 请求 mock | `workspace/tests/mocks/` |

**怎么选**:

| 场景 | 用什么 |
|------|-------|
| 纯函数逻辑 (utils/) | Vitest 单测 |
| 组件渲染 + 点击/输入 | Vitest + testing-library |
| 跨组件交互 / 路由跳转 | Vitest + testing-library (仍在 JSDOM 里) |
| 涉及真实浏览器 API (localStorage/IDB 等) | Vitest (JSDOM 够用) 或 Playwright |
| 跨页面流程 (登录 → 跳首页 → 下单) | Playwright E2E |
| 视觉回归 | Playwright screenshot (按需) |

---

## 测试文件位置

```
workspace/src/features/login/components/LoginForm.tsx
workspace/src/features/login/components/LoginForm.test.tsx   ← 与源文件同目录

workspace/src/features/login/hooks/useLogin.ts
workspace/src/features/login/hooks/useLogin.test.ts

workspace/tests/e2e/login-flow.spec.ts                       ← E2E 单独目录
workspace/tests/mocks/handlers.ts                            ← MSW handlers 集中
```

**规则**:
- 单元/组件测试与源文件**同目录**, 文件名 `<源文件>.test.ts(x)`
- E2E 统一放 `workspace/tests/e2e/`, 文件名 `<流程>.spec.ts`
- MSW handlers 集中在 `workspace/tests/mocks/`, 按模块拆文件

---

## Mock 策略

### 优先级: 真 > 假, 少 > 多

能用真的就别 mock (jsdom 自带 localStorage/URL 等 Web API)。能不 mock 就不 mock (函数签名对的就直接跑)。

### 分类

| 场景 | 工具 | 原因 |
|------|------|-----|
| HTTP 请求 | **MSW** | 统一拦截网络层, 测试代码不感知 |
| 第三方模块 (如 `umi`, `antd`) | **不 mock** | 集成测试要测真实行为, mock 掉等于白测 |
| 项目内部模块 (如工具函数) | **不 mock** | 真跑就好, 除非真的有副作用 |
| 时间 (new Date / setTimeout) | `vi.useFakeTimers()` | 确定性控制时间 |
| 随机数 / UUID | `vi.spyOn(Math, 'random')` | 确定性 |
| window.open / location.href | `vi.stubGlobal()` | JSDOM 对这些支持弱 |

### 禁止

- ❌ 手写 `jest.mock('./xxx')` 整个模块 — 要么用 MSW, 要么真跑
- ❌ Mock 后又去断言 mock 被调用几次 — 大部分时候这是在测 mock 而不是业务
- ❌ 为了让测试通过去 mock — 说明测试设计错了, 不是 mock 不够

---

## 断言规范

### 每条 `@rules` 一个 `it()`

```typescript
/**
 * @rules
 *   - R1: 手机号格式不合法时, 搜索按钮禁用
 *   - R2: 所有字段为空时, 搜索按钮禁用
 *   - R3: 重置按钮清空字段后, 自动触发一次查询
 */

// 测试文件
describe('SearchForm', () => {
  it('R1: 手机号格式不合法时, 搜索按钮禁用', () => { ... });
  it('R2: 所有字段为空时, 搜索按钮禁用', () => { ... });
  it('R3: 重置按钮清空字段后, 自动触发一次查询', () => { ... });
});
```

- `it()` 名字**完整引用规则原文**, 带 R1/R2 编号对上
- 每条规则独立一个 it, 不合并, 不拆碎
- 断言是规则的**技术化翻译**, 不是规则的改写

### 断言要「用户可见」

```typescript
// ❌ 测内部实现 (状态名/变量名一变就挂)
expect(wrapper.instance().state.submitDisabled).toBe(true);

// ✅ 测用户看到的
expect(screen.getByRole('button', { name: '搜索' })).toBeDisabled();
```

### 优先级: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`

- 用 role 查询符合 a11y 语义, 写测试顺便检查了 a11y
- `getByTestId` 是最后兜底, 源码要加 `data-testid`

---

## 不要测什么

- ❌ **TypeScript 类型** — tsc 会报错, 不用测
- ❌ **框架内部行为** — 别测 React 的 useState 有没有触发重渲, 那是 React 的事
- ❌ **第三方库行为** — 别测 antd Button 点击会不会触发 onClick
- ❌ **实现细节** — 组件内部用 useState 还是 useReducer 不应该影响测试
- ❌ **纯样式** — CSS 对不对靠视觉回归或人眼看, 不靠断言

---

## 覆盖率目标

**不追求行覆盖率 %, 追求 `@rules` 覆盖率 100%**。

```
所有 @rules 是否都有对应 it() ← 这是 /test 命令的验收标准
```

行覆盖率只是副产品:
- 组件类通常 70-80% 行覆盖率 (分支/边界覆盖是硬仗)
- 工具函数类应该 ~100% 行覆盖率

---

## 测试失败的分诊

红的时候按这个顺序看, 不要第一反应改源码:

| 失败类型 | 现象 | 处理 |
|---------|------|-----|
| **1. 测试代码错** | selector 找不到 / async 未 await | 改测试代码 |
| **2. 环境缺配置** | 缺 `@testing-library/jest-dom` / 缺 MSW handler | 补环境 |
| **3. 测试预期错** | AI 之前猜的预期, 和规则对不上 | 改预期 (对照 @rules 原文) |
| **4. 源码真有 bug** | 规则要求 X, 代码做了 Y | **改源码** (这时才动) |

80% 的红是 1-3, 不是 4。

---

## 和其他规则的关系

- 禁止硬编码 ([no-hardcode.md](no-hardcode.md)): 测试文件同样适用, 不要硬编文案 (用 i18n key 或 constants)
- 文件说明规范 ([file-docs.md](file-docs.md)): `.test.ts(x)` 也要有文件头 JSDoc, `@rules` 可省略 (测试本身不承载业务规则, 断言来源是被测文件的 @rules)
