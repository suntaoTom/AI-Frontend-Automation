# Umi 内置依赖清单

> 以下依赖由 `@umijs/max` 或 Umi 插件生态内置提供, **项目不应显式安装**。
> 显式安装会导致版本不一致、bundle 重复打包、插件拿不到正确实例等问题。

## 请求

| 包名 | 替代方案 |
|------|---------|
| axios | 用 `request` from `@umijs/max` (基于 umi-request) |

## 路由

| 包名 | 替代方案 |
|------|---------|
| react-router | Umi 内置约定式路由 |
| react-router-dom | `history` / `useNavigate` from `@umijs/max` |

## 构建工具

| 包名 | 替代方案 |
|------|---------|
| webpack | Umi 已内置 (config.ts 的 `mfsu` / chainWebpack) |
| vite | Umi 已内置 Vite 模式 (config.ts 的 `vite: {}`) |

## 代码规范

| 包名 | 替代方案 |
|------|---------|
| eslint | 用 `@umijs/lint` |
| prettier | 用 `@umijs/lint` |
| stylelint | 用 `@umijs/lint` |

## UI

| 包名 | 替代方案 |
|------|---------|
| antd | 通过 `@umijs/max` 集成, 从 `antd` 正常 import 即可 (不需要显式装) |
| @ant-design/icons | 已随 antd 一并提供 |

## 状态管理

| 包名 | 替代方案 |
|------|---------|
| - | Umi 自带 `@umijs/plugin-model` (useModel), 复杂场景才装 Zustand |

## 国际化

| 包名 | 替代方案 |
|------|---------|
| react-intl | 用 `@umijs/plugin-locale` (基于 react-intl 封装) |

## 如何验证

运行 `pnpm ls --depth 1 | grep <包名>` 查看实际依赖来源。
如果是从 `@umijs/max` 传递依赖, 就不需要自己装。
