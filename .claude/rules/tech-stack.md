# 技术栈与 Umi 约定

## 技术栈

- 框架: UmiJS 4.x + React 18 + TypeScript 5.x
- UI 组件库: Ant Design 5.x (通过 @umijs/max 集成)
- 状态管理: @umijs/plugin-model (轻量场景) / Zustand (复杂场景)
- 路由: Umi 约定式路由 (基于文件系统自动生成)
- 请求: @umijs/plugin-request (内置 umi-request, 基于 fetch)
- 数据流: @umijs/plugin-initial-state + useModel
- 构建工具: Umi Vite 模式 (workspace/config/config.ts 中配置 vite: {})
- 测试: Vitest + Playwright
- 代码规范: @umijs/lint (内置 ESLint + Prettier + Stylelint)
- 包管理: pnpm
- 国际化: @umijs/plugin-locale (按需启用)

## 项目结构

```
workspace/                   # 前端项目根 (UmiJS 工程)
├── config/
│   ├── config.ts            # Umi 主配置
│   ├── routes.ts            # 路由配置 (如不用约定式路由)
│   ├── proxy.ts             # 开发环境代理配置
│   └── theme.ts             # Ant Design 主题定制
├── src/
│   ├── pages/               # 页面组件 (Umi 约定式路由)
│   │   ├── index.tsx        # 首页 /
│   │   ├── login/           # /login
│   │   │   └── index.tsx
│   │   └── [module]/        # 功能模块页面
│   │       └── index.tsx
│   ├── features/            # 按功能模块组织业务逻辑
│   │   └── [module]/
│   │       ├── components/  # 模块专属组件
│   │       ├── hooks/       # 模块专属 hooks
│   │       ├── api/         # 模块 API 请求封装 (基于 umi-request)
│   │       ├── models/      # 模块 useModel 数据模型
│   │       ├── stores/      # 模块 Zustand store (复杂状态)
│   │       ├── types/       # 模块类型定义
│   │       └── utils/       # 模块工具函数
│   ├── models/              # 全局数据模型 (@umijs/plugin-model)
│   ├── components/          # 全局通用组件
│   ├── hooks/               # 全局通用 hooks
│   ├── services/            # 全局 API 请求封装
│   ├── utils/               # 全局工具函数
│   ├── styles/              # 全局样式
│   ├── types/               # 全局类型定义
│   ├── access.ts            # 权限配置 (@umijs/plugin-access)
│   ├── app.ts               # 运行时配置 (getInitialState, layout, request)
│   └── global.less          # 全局样式入口
├── mock/                    # Mock 数据 (Umi 内置 mock 支持)
├── public/                  # 静态资源
├── api-spec/                # OpenAPI 契约文件
├── scripts/                 # 构建/生成脚本
├── tests/                   # 测试文件
├── package.json
└── tsconfig.json
```

## Ant Design 组件库

Ant Design 5.x 已通过 @umijs/max 集成, 以下组件直接从 antd 导入, 不要重复封装:

- Button, Input, Select, Checkbox, Radio, Switch, DatePicker
- Modal, Drawer, Popover, Tooltip, Popconfirm
- Table (支持排序/分页/筛选), ProTable (高级表格)
- Form + Form.Item (内置验证), ProForm (高级表单)
- message / notification (全局提示)
- Card, Badge, Tag, Avatar, Descriptions
- Skeleton, Spin, Empty, Result
- Layout, Menu, Breadcrumb, Tabs
- Upload, Tree, Transfer, Cascader

如需二次封装, 放在 workspace/src/components/ 下并在目录 README.md 中说明封装原因。
