# Performance Audit Checklist

> AI reads source code and checks each item in this list — flag it if it matches.

## 1. Bundle Size

### Full-library imports
```typescript
// ❌ import _ from 'lodash'   → bundles the entire lodash (~70KB)
// ✅ import get from 'lodash/get'
// ✅ import { get } from 'lodash-es'  (works with tree shaking)
```

### Common bundle killers

| Package | Size | Alternative |
|---------|------|-------------|
| moment | 290KB | dayjs (7KB) |
| lodash (full) | 70KB | lodash-es + tree shake, or individual imports |
| antd (full) | — | Per-component import is handled automatically by @umijs/max; verify import statements use `from 'antd'` |
| @ant-design/icons (full) | 900KB | Single import: `from '@ant-design/icons/lib/icons/PlusOutlined'` |
| echarts (full) | 1MB | `echarts/core` + register on demand |
| crypto-js | 200KB | Use the native WebCrypto API |

### Duplicate dependencies
- Multiple libraries serving the same purpose: moment + dayjs, axios + umi-request, lodash + ramda
- Run `pnpm ls <package>` to check for multiple installed versions

### Missing lazy loading
- Route-level: `dynamic(() => import('./Page'))`
- Large components (Chart / RichEditor / Map) should be lazy-loaded
- Off-screen modals should be lazy-loaded

### Dev code leaking into production
- `console.log` / `console.debug`
- Dev tools like `why-did-you-render`

## 2. Rendering Performance

### Missing memo
```typescript
// ❌ Pure display component re-renders on every parent render
export function UserCard({ user }: Props) { ... }

// ✅
export const UserCard = React.memo(function UserCard({ user }: Props) { ... });
```

### Missing key / using index as key
```typescript
// ❌ items.map((item, i) => <Row key={i} ... />)
// ✅ items.map(item => <Row key={item.id} ... />)
```

### New references created in the render path
```typescript
// ❌ Creates a new style object on every render
<Button style={{ marginLeft: 8 }} onClick={() => handle(id)} />

// ✅ Lift to an outer constant or useCallback
const BTN_STYLE = { marginLeft: 8 };
const handleClick = useCallback(() => handle(id), [id]);
```

### State hoisted too high
- Edit state for a single item in a large list should live in the item component, not the parent
- Individual field values in a form should live in the field component, not all crammed into the parent

### JS doing CSS's job
- Use CSS `transition` for animations, not `setInterval`
- Use CSS `display` / `visibility` for show/hide, don't unmount the component

## 3. Network Performance

### Serial requests that could be parallel
```typescript
// ❌
const user = await getUser();
const posts = await getPosts();

// ✅
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

### Missing request caching / deduplication
- umi-request's `useRequest` hook has built-in caching
- Duplicate requests with the same parameters within a short window should be deduplicated

### Image optimization
- Format: prefer WebP, fall back to JPG
- Responsive: use `srcset` + `sizes`
- Lazy loading: `loading="lazy"`
- Critical above-the-fold images: `<link rel="preload" as="image">`

### Resource preloading
```html
<link rel="prefetch" href="/api/user/current">  <!-- may be needed on the next page -->
<link rel="preload" href="/fonts/xxx.woff2" as="font" crossorigin>  <!-- critical font -->
```

## 4. Memory

### useEffect missing cleanup
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

Scenarios that always require cleanup:
- Event listeners (`addEventListener`)
- Timers (`setInterval` / `setTimeout`)
- Subscriptions (WebSocket / EventSource)
- RAF (`requestAnimationFrame`)
- `IntersectionObserver` / `ResizeObserver` / `MutationObserver`

### Closures holding large objects
- Avoid capturing an entire large state object in `useCallback`/`useMemo` dependencies — capture only the fields actually used

### No virtual scrolling
- Lists with > 100 items should use `react-window` / `react-virtualized`
- antd Table with large datasets should enable `virtual`

## 5. Initial Load

### Blocking the critical path
- Don't make synchronous requests for non-essential data at the App root
- Auth / user info should use `getInitialState`; don't fetch them individually on every page

### Missing Skeleton / Suspense
- Use antd `Skeleton` for initial load — don't show a blank screen
- Route-level lazy loading should use `<Suspense fallback={<Skeleton />}>`

### Waterfall requests
```typescript
// ❌ Serial but not dependent
const a = await getA();   // 200ms
const b = await getB();   // 200ms, doesn't depend on a
// total: 400ms

// ✅
const [a, b] = await Promise.all([getA(), getB()]);
// total: 200ms
```
