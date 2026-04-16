# P0: 禁止硬编码 — 详细规则

> 权重: P0 — 此规则优先级高于所有其他编码规范。任何违反此规则的代码不得提交。

## 核心原则

所有可能变化的值，必须通过配置、常量、token 或国际化引入，严禁在代码中直接写死。
配置项本身不得大量重复，必须通过分层复用减少冗余。

## 禁止硬编码的范围

### 1. 文案与国际化
```typescript
// ❌ 禁止
<Button>提交</Button>
<span>暂无数据</span>
message.success('操作成功');

// ✅ 正确 — 通过 @umijs/plugin-locale 国际化
<Button>{intl.formatMessage({ id: 'common.submit' })}</Button>
<span>{intl.formatMessage({ id: 'common.empty' })}</span>
message.success(intl.formatMessage({ id: 'common.success' }));
```

### 2. 颜色与样式
```typescript
// ❌ 禁止
<div style={{ color: '#1890ff', fontSize: '14px' }} />
<Tag color="#f50">错误</Tag>

// ✅ 正确 — 通过 Ant Design Design Token
// workspace/config/theme.ts 中统一定义 token
export const theme = {
  token: {
    colorPrimary: '#1890ff',
    fontSize: 14,
  },
};

// 组件中使用 token
const { token } = theme.useToken();
<div style={{ color: token.colorPrimary, fontSize: token.fontSize }} />
<Tag color={token.colorError}>错误</Tag>
```

### 3. API 地址与端点
```typescript
// ❌ 禁止
fetch('/api/v1/users');
const BASE_URL = 'https://api.example.com';

// ✅ 正确 — 通过配置文件 + 环境变量
// workspace/config/api.ts
export const API_ENDPOINTS = {
  USER_LIST: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
} as const;

// 环境变量控制 baseURL，在 workspace/config/config.ts 中通过 proxy 或 define 注入
```

### 4. 业务常量与枚举
```typescript
// ❌ 禁止
if (status === 1) { /* ... */ }
<Select options={[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]} />

// ✅ 正确 — 通过常量 + 映射表
// features/[module]/constants.ts
export const STATUS = { ENABLED: 1, DISABLED: 0 } as const;
export const STATUS_OPTIONS = [
  { label: 'status.enabled', value: STATUS.ENABLED },
  { label: 'status.disabled', value: STATUS.DISABLED },
] as const;
```

### 5. 尺寸、间距、断点
```typescript
// ❌ 禁止
<div style={{ padding: '16px 24px', maxWidth: '1200px' }} />

// ✅ 正确 — 通过 Design Token 或 CSS 变量
// workspace/config/theme.ts 中定义
token: { padding: 16, paddingLG: 24, screenXL: 1200 }
```

### 6. 时间、数量等魔法数字
```typescript
// ❌ 禁止
setTimeout(fn, 3000);
if (list.length > 10) { /* 分页 */ }

// ✅ 正确 — 提取为有意义的常量
const TOAST_DURATION_MS = 3000;
const PAGE_SIZE = 10;
```

## 配置防重复规则

配置本身也必须遵循 DRY 原则，避免大量重复：

```
workspace/config/
├── theme.ts             # 唯一的主题 token 定义源 (颜色/字体/间距)
├── constants/
│   ├── common.ts        # 全局共享常量 (分页大小/超时时间/正则等)
│   └── enums.ts         # 全局共享枚举 + 映射表
├── api.ts               # API 端点集中管理
└── config.ts            # Umi 主配置

workspace/src/features/[module]/
├── constants.ts         # 模块专属常量 (仅模块内使用的值)
└── ...
```

### 分层复用原则

| 层级 | 定义位置 | 示例 |
|------|---------|------|
| 主题 token | workspace/config/theme.ts | 颜色、字体、圆角、间距 |
| 全局常量 | workspace/config/constants/ | 分页大小、日期格式、正则 |
| 全局国际化 | workspace/src/locales/common.ts | 通用文案 (提交/取消/确认) |
| 模块常量 | workspace/src/features/[module]/constants.ts | 业务状态码、下拉选项 |
| 模块国际化 | workspace/src/locales/[module].ts | 模块专属文案 |

### 禁止

- 多个模块各自定义相同的常量值 → 提取到 workspace/config/constants/
- 多个国际化文件重复相同文案 → 提取到 workspace/src/locales/common.ts
- 多处重复定义相同的 token/颜色值 → 统一在 workspace/config/theme.ts
