# 性能审计 checklist

> AI 读源码时按这个清单逐项检查, 命中即输出。

## 1. 包体积

### 整库 import
```typescript
// ❌ import _ from 'lodash'   → 打进整个 lodash (~70KB)
// ✅ import get from 'lodash/get'
// ✅ import { get } from 'lodash-es'  (配合 tree shake)
```

### 常见体积杀手

| 包 | 大小 | 替代方案 |
|----|------|---------|
| moment | 290KB | dayjs (7KB) |
| lodash (整包) | 70KB | lodash-es + tree shake 或单个 import |
| antd (整包) | - | 按需 import 已由 @umijs/max 自动处理, 确认 import 语句是 `from 'antd'` |
| @ant-design/icons (整包) | 900KB | 单个 import: `from '@ant-design/icons/lib/icons/PlusOutlined'` |
| echarts (整包) | 1MB | `echarts/core` + 按需 register |
| crypto-js | 200KB | 用原生 WebCrypto API |

### 重复依赖
- 同功能多个库: moment + dayjs, axios + umi-request, lodash + ramda
- 使用 `pnpm ls <包名>` 查是否有多版本

### 未懒加载
- 路由级 `dynamic(() => import('./Page'))`
- 大组件 (Chart / RichEditor / Map) 懒加载
- 非首屏 modal 懒加载

### 开发代码混入
- `console.log` / `console.debug`
- 测试工具如 `why-did-you-render`

## 2. 渲染性能

### 缺 memo
```typescript
// ❌ 纯展示组件, 每次父组件 render 都重渲
export function UserCard({ user }: Props) { ... }

// ✅
export const UserCard = React.memo(function UserCard({ user }: Props) { ... });
```

### 无 key / index 作 key
```typescript
// ❌ items.map((item, i) => <Row key={i} ... />)
// ✅ items.map(item => <Row key={item.id} ... />)
```

### 渲染路径新建引用
```typescript
// ❌ 每次渲染新建 style 对象
<Button style={{ marginLeft: 8 }} onClick={() => handle(id)} />

// ✅ 提升到外部常量或 useCallback
const BTN_STYLE = { marginLeft: 8 };
const handleClick = useCallback(() => handle(id), [id]);
```

### 状态提升过高
- 大列表里单个 item 的编辑态放 item 组件里, 不要放父组件
- 表单单个字段的值放字段组件里, 不要全塞父组件

### JS 做 CSS 的事
- 动画用 CSS transition, 不用 setInterval
- 显隐用 CSS `display` / `visibility`, 不用卸载组件

## 3. 网络性能

### 串行可并行
```typescript
// ❌
const user = await getUser();
const posts = await getPosts();

// ✅
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

### 缺请求缓存/去重
- 用 umi-request 的 useRequest hook 自带 cache
- 相同参数短时间内重复请求要去重

### 图片优化
- 格式: 优先 WebP, 回落 JPG
- 响应式: 用 `srcset` + `sizes`
- 懒加载: `loading="lazy"`
- 首屏关键图: `<link rel="preload" as="image">`

### 资源预加载
```html
<link rel="prefetch" href="/api/user/current">  <!-- 下一页面可能需要 -->
<link rel="preload" href="/fonts/xxx.woff2" as="font" crossorigin>  <!-- 关键字体 -->
```

## 4. 内存

### useEffect 缺 cleanup
```typescript
// ❌
useEffect(() => {
  window.addEventListener('scroll', handler);
}, []);

// ✅
useEffect(() => {
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []);
```

必查的 cleanup 场景:
- 事件监听 (addEventListener)
- 定时器 (setInterval / setTimeout)
- 订阅 (WebSocket / EventSource)
- RAF (requestAnimationFrame)
- IntersectionObserver / ResizeObserver / MutationObserver

### 闭包持有大对象
- 避免在 useCallback/useMemo 的依赖里捕获整个大 state, 只捕获用到的字段

### 无虚拟滚动
- 列表 > 100 条用 react-window / react-virtualized
- antd Table 大数据开 `virtual`

## 5. 首屏

### 阻塞关键路径
- 别在 App 根节点同步请求非必要数据
- 权限/用户信息用 `getInitialState`, 不要在每个页面各自请求

### 缺 Skeleton / Suspense
- 首屏 loading 用 antd Skeleton, 不要空白
- 路由级 lazy 加载用 `<Suspense fallback={<Skeleton />}>`

### 瀑布流请求
```typescript
// ❌ 串行但不依赖
const a = await getA();   // 200ms
const b = await getB();   // 200ms, 不依赖 a
// 总耗时 400ms

// ✅
const [a, b] = await Promise.all([getA(), getB()]);
// 总耗时 200ms
```
