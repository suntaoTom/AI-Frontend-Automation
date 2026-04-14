你现在是架构师角色。请根据我提供的需求, 完成以下工作:

## 第零步: 定位 PRD (强制)

任务清单必须可追溯到 PRD 锚点, 否则后续 `/test` 命令无法基于业务规则生成测试。

1. **判断输入类型**:
   - 输入是 `@docs/prds/xxx.md` 路径 → 直接读取
   - 输入是文字描述 → **停下来询问用户**:
     - 是否已有对应 PRD? 路径在哪?
     - 没有的话, **建议先跑 `/prd <需求描述>` 生成 PRD 草稿**, 人工补齐 `[待确认]` 后再回来跑 `/plan`
   - 不要在没有 PRD 的情况下硬编需求, 那样产出的 acceptanceCriteria 是 AI 猜的, 测试也会跟着错

2. **提取 PRD 中所有功能点的二级标题**, 作为后续 `prdRef` 的锚点来源:
   ```
   docs/prds/user-list.md 提取到的功能锚点:
     - #搜索表单
     - #数据列表
     - #批量删除
   ```

3. **如果 PRD 缺少「业务规则」章节**, 提示用户补齐再继续 (没有规则就没法生成靠谱的测试)

## 分析步骤

1. **理解需求**: 通读 PRD, 列出所有功能点 + 业务规则
2. **提取数据契约**: 读 PRD 的「数据契约」章节, 拿到 operationId 列表 + 错误码映射
   - 如果 PRD 缺少数据契约 → **停下提醒用户先和后端对齐 OpenAPI**, 不要凭空编接口
   - 同时检查 `api-spec/openapi.yaml` 是否包含 PRD 提到的 operationId, 缺失则提醒用户拉最新版
3. **识别复用**: 检查 CLAUDE.md 中的已有组件库, 标注哪些可以复用
4. **拆解任务**: 将需求拆解为具体的开发任务, **每个任务必须关联到一个 PRD 锚点**

### 任务拆解的强制顺序

每个功能点必须按以下顺序产出任务 (依赖链清晰, 便于并行/分批):

```
gen:api    (跑一次, 确保类型最新)  ← 命令: pnpm gen:api, 产物: src/types/api.ts
   ↓
api        (请求函数)              ← 类型从 src/types/api.ts import, 不要手写
   ↓
mock       (假数据)                ← 类型从 src/types/api.ts import, 后端没好时用
   ↓
store/hook (状态管理)              ← 来源: PRD 业务规则
   ↓
component  (UI 组件)               ← 来源: PRD 业务规则
   ↓
page       (页面装配)              ← 来源: PRD 交互流程
```

### API 类型的硬性规则

- ❌ **不要手写** request/response 类型, 一律从 `@/types/api` 取
- ❌ **不要在任务里产出 `api-type` 类的手写类型文件**, 用 OpenAPI 生成的就够
- ✅ api 函数的入参/出参类型直接 `import type { paths } from '@/types/api'` 提取
- ✅ 如果发现 OpenAPI 缺字段, 在任务清单顶层加一条 `blocked` 任务: 「推动后端更新 OpenAPI: <缺什么>」, 不要硬编

## 输出格式

请以 JSON 格式输出任务清单:

```json
{
  "moduleName": "模块名称",
  "moduleCode": "user-list",
  "prdRef": "docs/prds/user-list.md",
  "summary": "一句话概括这个模块做什么",
  "createdAt": "生成日期",
  "tasks": [
    {
      "taskId": "T001",
      "type": "gen-api | api | mock | store | hook | component | page",
      "name": "文件名称",
      "filePath": "src/features/xxx/xxx.ts",
      "description": "具体实现要求",
      "prdRef": "docs/prds/user-list.md#搜索表单",
      "businessRules": [
        "手机号格式不合法时, 表单实时显示错误提示, 搜索按钮禁用",
        "所有字段为空时, 搜索按钮禁用",
        "重置按钮清空字段后, 自动触发一次查询"
      ],
      "props": {},
      "dependencies": ["依赖的其他 taskId"],
      "reuseComponents": ["可复用的已有组件"],
      "acceptanceCriteria": ["验收条件1", "验收条件2"],
      "status": "pending"
    }
  ],
  "routeConfig": {
    "path": "/xxx",
    "layout": "使用哪个布局"
  },
  "dataFlow": "简述数据流向"
}
```

### 字段说明

| 字段 | 必填 | 来源 | 用途 |
|------|------|------|------|
| `prdRef` (顶层) | ✅ | 输入的 PRD 路径 | 整个模块的 PRD 入口 |
| `task.prdRef` | ✅ | PRD 二级标题锚点 | 编码时写入源文件 `@prd` JSDoc |
| `task.businessRules` | ✅ | PRD「业务规则」章节原文 | 编码时写入源文件 `@rules` JSDoc, **必须照抄不要改述** |
| `task.acceptanceCriteria` | ✅ | businessRules 的具体化 (含技术细节) | 编码完成自检, 可包含 UI/性能/兼容性等技术要求 |

**businessRules vs acceptanceCriteria 的区别**:
- `businessRules` = 业务语义, 与实现无关 (例: "字段全空时按钮禁用")
- `acceptanceCriteria` = 技术验收, 含实现要求 (例: "禁用时按钮 disabled=true 且 className 含 ant-btn-disabled")

## 要求

- 按依赖顺序排列任务 (api → store → hooks → components → page)
- 每个组件必须明确 Props 接口
- 标注哪些已有组件可以复用
- 每个任务都要有 `prdRef` + `businessRules` + `acceptanceCriteria` 三件套
- 边界场景必须考虑: 空状态、加载中、错误、权限不足
- `businessRules` 必须从 PRD 原文摘抄, 不得自创

## 输出方式

1. 先在终端中输出完整的任务清单供我预览
2. 然后将任务清单保存到本地文件: docs/tasks/tasks-[模块代号]-[当天日期].json
3. 如果 docs/tasks/ 目录不存在, 请先创建
4. **额外提示**: 编码阶段需把 `prdRef` 写入源文件 `@prd`, 把 `businessRules` 写入源文件 `@rules` (见 `.claude/rules/file-docs.md`)

需求如下:
$ARGUMENTS
