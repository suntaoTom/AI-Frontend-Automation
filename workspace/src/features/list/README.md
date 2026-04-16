# list - 通用列表模块

> 支持条件查询、分页浏览和空状态展示的通用列表页

## 子目录结构

| 目录 | 说明 |
|------|------|
| components/ | 模块专属 UI 组件 (SearchForm, DataTable) |
| hooks/ | 数据逻辑 hooks (useListData) |
| api/ | 后端接口请求封装 (getList) |
| types/ | TypeScript 类型定义 |

## 核心业务流程

用户输入查询条件 → SearchForm.onSearch → useListData 合并参数调用 getList API → 更新 data/loading/error → DataTable 响应式渲染；分页切换通过 onPageChange 同理触发请求

## 对外暴露

| 导出 | 类型 | 说明 |
|------|------|------|
| useListData | hook | 列表数据逻辑，含 data/loading/error/onSearch/onPageChange/onReset |
| SearchForm | component | 查询表单组件 |
| DataTable | component | 数据表格组件 |
| ListItem / ListQueryParams / ListResponse | type | 列表模块类型 |
