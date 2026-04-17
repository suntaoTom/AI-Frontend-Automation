# WCAG 2.1 AA 检查清单

> 每条命中都要关联 WCAG 条目编号和具体代码行号。

## 1. 语义化 HTML

### 1.1 滥用 div
**标准**: WCAG 4.1.2 Name, Role, Value

```tsx
// ❌
<div onClick={handleClick}>提交</div>
<div className="nav">...</div>

// ✅
<button onClick={handleClick}>提交</button>
<nav>...</nav>
```

可替换清单:
- `<div onClick>` → `<button>` 或加 `role="button" tabIndex={0}` + keyDown 处理
- 导航 → `<nav>`
- 主内容 → `<main>`
- 侧边 → `<aside>`
- 节 → `<section>` / `<article>`
- 列表 → `<ul>` / `<ol>` + `<li>`

### 1.2 标题层级不连续
**标准**: WCAG 1.3.1 Info and Relationships

- 不能从 `<h1>` 跳到 `<h3>`
- 一个页面只能有一个 `<h1>`
- 层级必须递进, 不能跳级

### 1.3 表单控件无 label
**标准**: WCAG 3.3.2 Labels or Instructions

```tsx
// ❌
<input type="email" placeholder="邮箱" />

// ✅
<label htmlFor="email">邮箱</label>
<input id="email" type="email" />

// ✅ 或 antd Form
<Form.Item label="邮箱" name="email">
  <Input />
</Form.Item>
```

## 2. ARIA 属性

### 2.1 图标按钮缺 aria-label
**标准**: WCAG 4.1.2 Name, Role, Value

```tsx
// ❌
<Button icon={<DeleteOutlined />} />

// ✅
<Button icon={<DeleteOutlined />} aria-label="删除" />
```

检查规则: `<Button>` / `<a>` 如果只有 icon 没有 text, 必须有 `aria-label`。

### 2.2 动态内容未声明 aria-live
**标准**: WCAG 4.1.3 Status Messages

- Toast / message 提示应有 `role="status"` 或 `aria-live="polite"`
- 错误提示应有 `role="alert"` 或 `aria-live="assertive"`
- antd `message` / `notification` 已处理, 自定义 toast 需注意

### 2.3 模态框缺 role
**标准**: WCAG 4.1.2

- `<Modal>` 应有 `role="dialog"` + `aria-modal="true"` (antd Modal 已处理)
- 自定义弹层要手动加

### 2.4 ARIA 滥用
```tsx
// ❌ 原生已表达, 不需要
<button role="button">提交</button>
<nav role="navigation">...</nav>

// ✅ 只在原生不够时用
<div role="tablist">...</div>  // div 没有 tablist 语义
```

## 3. 键盘操作

### 3.1 交互元素无法 Tab 聚焦
**标准**: WCAG 2.1.1 Keyboard

- 所有 `onClick` 元素必须可聚焦 (原生 button/a/input 自带, div 需要 `tabIndex={0}`)
- 禁用元素用 `disabled` 而非 `pointer-events: none` (后者仍可被 Tab 到)

### 3.2 键盘事件缺失
**标准**: WCAG 2.1.1

```tsx
// ❌ 只响应鼠标
<div onClick={handle} tabIndex={0}>...</div>

// ✅ 补 keyDown
<div
  onClick={handle}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handle()}
  tabIndex={0}
  role="button"
>...</div>
```

### 3.3 模态框缺焦点陷阱
**标准**: WCAG 2.4.3 Focus Order

- Modal 打开时焦点应进入 Modal, 关闭时返回触发元素
- Tab 键在 Modal 内循环, 不应跳到背景页
- antd Modal 已处理; 自定义弹层要注意

### 3.4 Esc 关闭缺失
- Modal / Drawer / Popover 应支持 Esc 关闭
- antd 默认支持, 自定义组件要加

## 4. 视觉

### 4.1 对比度不足
**标准**: WCAG 1.4.3 Contrast (Minimum)

- 正文文字: 4.5:1
- 大文字 (18pt 或 14pt 加粗): 3:1
- 非文本元素 (图标/边框): 3:1

检查方法:
- 读 CSS/theme.ts 中的颜色值
- 对比文字颜色 vs 背景颜色
- 禁用态文字不强制 (WCAG 允许例外), 但应仍可识别

### 4.2 仅颜色传达信息
**标准**: WCAG 1.4.1 Use of Color

```tsx
// ❌ 红色 = 错误, 色盲看不懂
<span style={{ color: 'red' }}>必填</span>

// ✅ 颜色 + 图标/文字
<span style={{ color: 'red' }}>
  <ExclamationCircleOutlined /> 必填
</span>
```

### 4.3 图片 alt 缺失
**标准**: WCAG 1.1.1 Non-text Content

```tsx
// ❌
<img src="/avatar.png" />

// ✅ 有意义的图
<img src="/avatar.png" alt="张三的头像" />

// ✅ 装饰图
<img src="/decoration.png" alt="" role="presentation" />
```

### 4.4 文字缩放溢出
**标准**: WCAG 1.4.4 Resize text

- 浏览器缩放到 200% 时不应出现水平滚动条或文字被截断
- 用 rem/em 而非固定 px, 或用 clamp()

## 5. antd 组件特定检查

参见 [antd-a11y-notes.md](antd-a11y-notes.md)
