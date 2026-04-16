# components - 列表模块组件

> 列表模块专属 UI 组件

## 文件清单

| 文件名 | 说明 | 依赖 | 最后更新 |
|--------|------|------|----------|
| SearchForm.tsx | 查询表单：关键词输入、状态下拉、查询/重置按钮 | antd Form/Input/Select/Button, STATUS_OPTIONS | 2026-04-07 |
| DataTable.tsx | 数据表格：antd Table + 受控分页 + 空状态 + loading | antd Table/Tag/Empty, TABLE_COLUMNS, STATUS | 2026-04-07 |

## 模块关系

- SearchForm 和 DataTable 均依赖 `../constants.ts` 中的常量和 `../types/types.ts` 中的类型
- 由 `src/pages/list/index.tsx` 组合使用
