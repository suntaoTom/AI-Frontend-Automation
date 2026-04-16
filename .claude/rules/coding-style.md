# 编码规范

## 命名规则

- 组件: PascalCase (UserProfile.tsx)
- hooks: camelCase, use 前缀 (useUserData.ts)
- 工具函数: camelCase (formatDate.ts)
- 类型/接口: PascalCase, 不加 I 前缀 (UserProfile, not IUserProfile)
- 常量: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- 页面文件: 放在 pages/ 下, 遵循 Umi 约定式路由规则
- CSS: 使用 CSS Modules (.module.less) 或 Ant Design token 定制, 不写全局样式污染

## 注释规范

### 原则：注释解释"为什么"，代码本身说明"是什么"

好的命名和类型就是最好的文档，不需要注释来复述代码在做什么。

### 必须写注释的场景

1. **文件头部 JSDoc** — 每个文件必须有（见 file-docs.md），这是给 AI 和新人的入口
2. **业务规则 / 领域逻辑** — 代码背后的"为什么"，不写就没人知道
   ```typescript
   // 风控要求：单日提现不超过 5 万，超过需人工审核
   if (amount > DAILY_WITHDRAW_LIMIT) { ... }
   ```
3. **非直觉的技术决策** — 绕过、兼容、性能 hack
   ```typescript
   // antd DatePicker 在 Safari 下 onChange 会触发两次，手动去抖
   const debouncedOnChange = useMemo(() => debounce(onChange, 0), [onChange]);
   ```
4. **TODO / FIXME / HACK** — 标记已知的技术债，必须带原因
   ```typescript
   // TODO(2026-Q2): 后端 v2 接口上线后移除此兼容逻辑
   // FIXME: 并发场景下有竞态问题，暂用 lock 规避
   ```
5. **正则表达式 / 复杂计算** — 不注释就是谜语
   ```typescript
   // 匹配中国大陆手机号：1 开头，第二位 3-9，共 11 位
   const PHONE_REG = /^1[3-9]\d{9}$/;
   ```

### 禁止写注释的场景

1. **复述代码** — 代码已经说清楚了
   ```typescript
   // ❌ 设置用户名
   setUserName(name);

   // ❌ 如果是管理员
   if (role === ROLE.ADMIN) { ... }
   ```
2. **注释掉的代码** — 直接删除，Git 有历史记录
3. **分隔线注释** — 用函数拆分代替 `// ========= 分割线 =========`
4. **修改日志** — 不要写 `// 2026-03-30 张三修改了xxx`，用 Git log

### 注释格式

- 单行用 `//`，与代码之间空一行
- 多行用 `/** */` JSDoc 风格
- 中文项目用中文注释，保持一致
- 注释跟随代码更新，过期注释比没有注释更有害

## 组件规范

- 所有组件使用 TypeScript 函数式组件
- Props 必须定义 interface 并导出
- 复杂逻辑抽取到自定义 hooks
- 组件只负责渲染, 不包含业务逻辑
- 使用 React.memo 包裹纯展示组件

## API 规范

- 请求统一使用 @umijs/plugin-request (umi-request), 不要引入 axios
- 全局请求/响应拦截在 workspace/src/app.ts 的 request 配置中定义
- 请求函数放在 workspace/src/features/[module]/api/ 或 workspace/src/services/ 目录
- 类型定义与后端 API 文档保持一致
- 错误码统一处理, 通过 errorHandler 配置

## 状态管理规范

- 全局共享状态优先用 @umijs/plugin-model (useModel), 文件放 workspace/src/models/
- 初始化数据 (用户信息/权限等) 用 getInitialState + useModel('@@initialState')
- 复杂独立状态用 Zustand, Store 文件以 use 开头 (useAuthStore.ts)
- 组件局部状态用 useState/useReducer
- 不要把服务端缓存数据放进全局 store

## 路由规范

- 优先使用 Umi 约定式路由 (pages/ 目录结构即路由)
- 需要布局嵌套时使用 _layout.tsx
- 路由级权限通过 @umijs/plugin-access + wrappers 控制
- 动态路由使用 [id].tsx 命名约定

## Git 规范

- 提交信息格式: `type(scope): description`
- type: feat | fix | refactor | style | test | docs | chore
- 分支命名: feature/xxx, fix/xxx, refactor/xxx
