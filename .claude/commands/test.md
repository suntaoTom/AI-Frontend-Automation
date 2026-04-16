你现在是测试工程师角色。请为指定的组件/函数生成完整的测试用例。

## 测试框架

- 单元测试: Vitest + @testing-library/react
- E2E 测试: Playwright (仅在明确要求时生成)

## 测试文件存放规则 (强制)

所有测试文件**统一存放在 `workspace/tests/` 下**, 镜像 `workspace/src/` 目录结构与源文件一一对应。
**禁止**把 `*.test.ts(x)` 放在源文件同目录或 `__tests__/` 子目录中。

映射关系示例:

<<<<<<< HEAD
| 源文件                                        | 测试文件                                             |
| --------------------------------------------- | ---------------------------------------------------- |
| `src/features/list/api/listApi.ts`            | `tests/features/list/api/listApi.test.ts`            |
| `src/features/list/components/SearchForm.tsx` | `tests/features/list/components/SearchForm.test.tsx` |
| `src/pages/list/index.tsx`                    | `tests/pages/list/index.test.tsx`                    |
=======
| 源文件 | 测试文件 |
|--------|----------|
| `workspace/src/features/list/api/listApi.ts` | `workspace/tests/features/list/api/listApi.test.ts` |
| `workspace/src/features/list/components/SearchForm.tsx` | `workspace/tests/features/list/components/SearchForm.test.tsx` |
| `workspace/src/pages/list/index.tsx` | `workspace/tests/pages/list/index.test.tsx` |
>>>>>>> feature

测试文件内引用业务代码**一律使用 `@/` 别名** (不要写 `../../../src/...`):

```ts
import SearchForm from '@/features/list/components/SearchForm';
vi.mock('@/features/list/api/listApi', () => ({ ... }));
```

## 执行流程

### 第零步: 读取业务锚点, 提炼业务规则 (强制)

测试预期必须来自**业务规则**, 而不是 AI 对源码行为的猜测。否则会出现「测试和源码都是 AI 写的, 互相印证」的假通过。

对每个目标源文件:

1. **提取头部 JSDoc 中的业务锚点** (见 `.claude/rules/file-docs.md`):
   - `@prd docs/prds/xxx.md#<锚点>` → PRD 原文位置
   - `@task docs/tasks/xxx.json#<taskId>` → 任务条目
   - `@rules` → 多行业务规则列表

2. **读取关联文档**:
   - 打开 `@prd` 指向的 PRD 片段, 读完整上下文
   - 打开 `@task` 指向的任务条目, 看验收标准 (acceptanceCriteria / 类似字段)
   - `@rules` 直接作为规则清单使用

3. **输出业务规则清单** (给用户看, 便于对齐):

   ```
   SearchForm.tsx 提取到的业务规则:
     R1. 手机号输入后必须通过 PHONE_REG 校验 (来源: @rules)
     R2. 搜索按钮禁用条件: 所有字段为空 (来源: PRD#搜索表单/规则2)
     R3. 重置按钮清空后自动触发一次查询 (来源: @task#task-003 验收标准)
   ```

4. **如果源文件缺少业务锚点**:
   - **停下告知用户**, 列出哪些文件缺 `@prd` / `@task` / `@rules`
   - 提供两种选择:
     - (推荐) 先补齐锚点再生成测试, 保证测试可追溯
     - (兜底) 允许基于源码签名/类型推测测试, 但在报告里明确标注「本测试基于代码推测, 非业务驱动, 存在偏差风险」
   - 不得擅自进入兜底模式。

### 第一步: 扫描目标文件, 分类处理

对 `$ARGUMENTS` 指定的目标（单文件 / 目录 / glob），按以下规则分类：

1. **定位测试文件**: 对每个源文件 `src/<path>/Foo.tsx`, 对应测试固定在 `tests/<path>/Foo.test.tsx`。
   - 若存在历史的同目录/`__tests__/` 旧测试, 视为遗留, 生成时迁移到 `tests/` 下并删除原文件。

2. **对比 git 最后提交时间** (方案: 源文件更新时间 > 测试文件更新时间 → 需重新生成):

   ```bash
   git log -1 --format=%ct -- <源文件路径>
   git log -1 --format=%ct -- <测试文件路径>
   ```

   - 源文件从未提交过 (新文件) → 归为「❌ 无测试」或「🔄 待重新生成」(若已有测试)
   - 测试文件从未提交过 → 视为最新, 跳过
   - 源文件提交时间 > 测试文件提交时间 → 归为「🔄 待重新生成」

3. **输出分类清单** (给用户确认):
   ```
   扫描结果:
     ✅ 已覆盖且最新 (跳过):
        - workspace/src/components/UserCard.tsx
     🔄 源码有更新 (建议重新生成):
        - workspace/src/components/UserProfile.tsx (源 2026-04-10 > 测试 2026-03-20)
     ❌ 无测试 (将生成):
        - workspace/src/components/Dashboard.tsx
   ```

### 第二步: 根据参数决定处理范围

- **默认** (无参数): 生成 `❌ 无测试` + `🔄 源码有更新` 两类
- `--only-missing`: 只生成 `❌ 无测试`
- `--force`: 全部重新生成 (包含 `✅`)

对 `🔄 待重新生成` 的文件, 读取旧测试文件内容作为参考, 保留仍然适用的用例, 补充/修改变更部分。

### 第三步: 生成测试 (以业务规则为骨架)

**核心原则**: 每条业务规则 → 一个 `it()` 用例。规则来自第零步提炼的清单, 不得凭源码猜测补充断言。

- 测试描述 (`it('...')`) 直接引用业务规则原文
- 用注释标注规则来源, 便于追溯:

  ```typescript
  describe('SearchForm', () => {
    // R1: 手机号输入后必须通过 PHONE_REG 校验 (PRD#搜索表单/规则1)
    it('手机号格式不合法时应显示错误提示', () => { ... });

    // R2: 搜索按钮禁用条件: 所有字段为空
    it('所有字段为空时搜索按钮应禁用', () => { ... });
  });
  ```

- 规则未覆盖但源码有的分支 (如边界场景、异常路径), 允许补充, 但必须在测试描述里标注 `[推测]`, 提示后续需人工确认是否符合业务预期
- 测试要求的 7 类场景 (见下文) 是**补充维度**, 以业务规则为主干, 不要反过来

## 测试要求

### 必须覆盖的场景:

1. **正常渲染**: 组件能否正常挂载和渲染
2. **Props 传递**: 不同 props 组合下的渲染结果
3. **用户交互**: 点击、输入、选择等操作
4. **状态变化**: 交互后状态是否正确更新
5. **异步操作**: API 请求的 loading / success / error 状态
6. **边界场景**: 空数据、超长文本、特殊字符
7. **错误处理**: 网络错误、数据格式错误

### 代码规范:

- 使用 describe / it 组织测试
- 测试描述用中文, 清晰表达测试意图
- 每个 it 只测试一个行为
- 使用 @testing-library/react 的 screen 和 userEvent
- Mock API 请求使用 vi.mock 或 msw
- 不测试实现细节, 只测试行为和输出
- **禁止发真实网络请求** (CI 一断网全红), 所有 API 调用都要 mock

### API 测试分层规范

| 层级                     | 测什么                           | 怎么 mock                                             |
| ------------------------ | -------------------------------- | ----------------------------------------------------- |
| `api/*.ts` (请求函数)    | 请求参数拼装、响应解析、错误处理 | `vi.mock('umi-request')` 或 msw, 验证调用参数和返回值 |
| `hooks/*.ts` (业务 hook) | 状态流转、loading/error 处理     | `vi.mock('../api/xxx')`, 不关心网络细节               |
| `components/*.tsx`       | 业务规则、UI 行为                | `vi.mock('../api/xxx')` 整个 api 模块, 只验业务行为   |

**断言数据形状要对齐 OpenAPI 类型**: mock 返回值必须用 `@/types/api` 生成的类型标注, 让 TS 编译器保证一致性, 不要手写字段。

```typescript
// ✅ 正确: 用生成的类型, 字段错了 TS 直接报错
import type { paths } from '@/types/api';
type SearchResp = paths['/api/users/search']['get']['responses']['200']['content']['application/json'];
const mockResp: SearchResp = { code: 0, message: 'ok', data: { total: 1, list: [...] } };
vi.mocked(searchUsers).mockResolvedValue(mockResp);

// ❌ 错误: 手写类型, 后端字段变了测试还能通过, 但联调炸
vi.mocked(searchUsers).mockResolvedValue({ code: 0, data: { items: [...] } });
```

## 输出格式

- 新文件: 在镜像路径 `tests/<path>/[组件名].test.tsx` 生成 (路径不存在时一并创建目录)
- 重新生成: 覆盖 `tests/` 下同名测试, 在回复中简要说明「相比旧版本, 新增/修改/删除了哪些用例, 原因是什么」
- 若发现源目录仍残留旧测试文件, 迁移后删除原文件

### 第四步: 自动运行并自愈 (强制)

生成/更新测试文件后, **必须主动执行** 验证其可运行且通过, 不得把未验证的测试交给用户。

1. **运行测试** (只跑本轮涉及的文件, 避免噪音):

   ```bash
   pnpm test --run tests/<path>/Foo.test.tsx tests/<path>/Bar.test.tsx
   ```

2. **错误分诊与修复**, 按来源归类处理:

   | 错误类型                                                                                        | 处理原则                                                                                                                                                       |
   | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | 测试环境未就绪 (缺 `@testing-library/react` / `jsdom` / `vitest.config.ts` / `@/` 别名未解析等) | **先停下来告知用户**, 列出需补齐的依赖和配置, 让用户确认后再安装, 不得擅自 `pnpm add`                                                                          |
   | 测试用例本身写错 (selector 不存在, mock 数据结构错, 异步 await 漏写)                            | **修改测试文件**, 重新运行                                                                                                                                     |
   | 测试暴露源码真实 bug (行为与业务规则不符)                                                       | **停下来告知用户**, 指出违反的是第零步哪条规则 (如「违反 R2: 搜索按钮应在所有字段为空时禁用, 但源码未做此判断」), 由用户决定改源码还是修规则, 不得自行修改源码 |
   | 依赖缺失或 TS 类型错误                                                                          | 先判断是环境问题还是测试问题, 按上面两类分别处理                                                                                                               |

3. **循环直到全绿**: 修复测试 → 重跑 → 修复 → 重跑。单轮最多 3 次自动修复, 仍未通过则停下汇报现状, 不要无限循环。

4. **最终汇报**, 包含:
   - 本轮生成/更新的文件清单
   - 测试执行结果 (通过数 / 失败数)
   - 修复过程 (做了哪些调整、原因)
   - 仍未解决的问题和建议

请对以下目标执行上述流程:
$ARGUMENTS
