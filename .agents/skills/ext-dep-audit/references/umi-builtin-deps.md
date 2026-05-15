# Umi Built-in Dependency List

> The following dependencies are provided by `@umijs/max` or the Umi plugin ecosystem and **should not be explicitly installed** in the project.
> Explicit installation causes version mismatches, duplicate bundle entries, and plugins failing to obtain the correct instance.

## Requests

| Package | Alternative |
|---------|-------------|
| axios | Use `request` from `@umijs/max` (based on umi-request) |

## Routing

| Package | Alternative |
|---------|-------------|
| react-router | Umi's built-in convention-based routing |
| react-router-dom | `history` / `useNavigate` from `@umijs/max` |

## Build Tools

| Package | Alternative |
|---------|-------------|
| webpack | Built into Umi (`mfsu` / `chainWebpack` in config.ts) |
| vite | Umi has built-in Vite mode (`vite: {}` in config.ts) |

## Code Quality

| Package | Alternative |
|---------|-------------|
| eslint | Use `@umijs/lint` |
| prettier | Use `@umijs/lint` |
| stylelint | Use `@umijs/lint` |

## UI

| Package | Alternative |
|---------|-------------|
| antd | Integrated via `@umijs/max`; import normally from `antd` (no explicit install needed) |
| @ant-design/icons | Bundled with antd |

## State Management

| Package | Alternative |
|---------|-------------|
| — | Umi includes `@umijs/plugin-model` (useModel); only install Zustand for complex scenarios |

## Internationalization

| Package | Alternative |
|---------|-------------|
| react-intl | Use `@umijs/plugin-locale` (a wrapper around react-intl) |

## How to Verify

Run `pnpm ls --depth 1 | grep <package>` to check the actual source of a dependency.
If it is a transitive dependency from `@umijs/max`, you do not need to install it yourself.
