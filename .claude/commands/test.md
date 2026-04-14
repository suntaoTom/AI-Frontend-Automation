你现在是测试工程师角色。请为指定的组件/函数生成完整的测试用例。

## 测试框架

- 单元测试: Vitest + @testing-library/react
- E2E 测试: Playwright (仅在明确要求时生成)

## 测试文件存放规则 (强制)

所有测试文件**统一存放在项目根目录的 `tests/` 下**, 镜像 `src/` 目录结构与源文件一一对应。
**禁止**把 `*.test.ts(x)` 放在源文件同目录或 `__tests__/` 子目录中。

映射关系示例:

| 源文件 | 测试文件 |
|--------|----------|
| `src/features/list/api/listApi.ts` | `tests/features/list/api/listApi.test.ts` |
| `src/features/list/components/SearchForm.tsx` | `tests/features/list/components/SearchForm.test.tsx` |
| `src/pages/list/index.tsx` | `tests/pages/list/index.test.tsx` |

测试文件内引用业务代码**一律使用 `@/` 别名** (不要写 `../../../src/...`):

```ts
import SearchForm from '@/features/list/components/SearchForm';
vi.mock('@/features/list/api/listApi', () => ({ ... }));
```

## 执行流程

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
        - src/components/UserCard.tsx
     🔄 源码有更新 (建议重新生成):
        - src/components/UserProfile.tsx (源 2026-04-10 > 测试 2026-03-20)
     ❌ 无测试 (将生成):
        - src/components/Dashboard.tsx
   ```

### 第二步: 根据参数决定处理范围

- **默认** (无参数): 生成 `❌ 无测试` + `🔄 源码有更新` 两类
- `--only-missing`: 只生成 `❌ 无测试`
- `--force`: 全部重新生成 (包含 `✅`)

对 `🔄 待重新生成` 的文件, 读取旧测试文件内容作为参考, 保留仍然适用的用例, 补充/修改变更部分。

### 第三步: 生成测试

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

   | 错误类型 | 处理原则 |
   |---------|---------|
   | 测试环境未就绪 (缺 `@testing-library/react` / `jsdom` / `vitest.config.ts` / `@/` 别名未解析等) | **先停下来告知用户**, 列出需补齐的依赖和配置, 让用户确认后再安装, 不得擅自 `pnpm add` |
   | 测试用例本身写错 (selector 不存在, mock 数据结构错, 异步 await 漏写) | **修改测试文件**, 重新运行 |
   | 测试暴露源码真实 bug (行为与预期不符) | **停下来告知用户**, 列出 bug 位置与复现用例, 由用户决定改源码还是改预期, 不得自行修改源码 |
   | 依赖缺失或 TS 类型错误 | 先判断是环境问题还是测试问题, 按上面两类分别处理 |

3. **循环直到全绿**: 修复测试 → 重跑 → 修复 → 重跑。单轮最多 3 次自动修复, 仍未通过则停下汇报现状, 不要无限循环。

4. **最终汇报**, 包含:
   - 本轮生成/更新的文件清单
   - 测试执行结果 (通过数 / 失败数)
   - 修复过程 (做了哪些调整、原因)
   - 仍未解决的问题和建议

请对以下目标执行上述流程:
$ARGUMENTS
