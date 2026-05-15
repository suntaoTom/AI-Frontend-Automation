# WCAG 2.1 AA Checklist

> Every match must be linked to its WCAG criterion number and specific code line number.

## 1. Semantic HTML

### 1.1 Overuse of div
**Standard**: WCAG 4.1.2 Name, Role, Value

```tsx
// ❌
<div onClick={handleClick}>Submit</div>
<div className="nav">...</div>

// ✅
<button onClick={handleClick}>Submit</button>
<nav>...</nav>
```

Replacement list:
- `<div onClick>` → `<button>` or add `role="button" tabIndex={0}` + keyDown handler
- Navigation → `<nav>`
- Main content → `<main>`
- Sidebar → `<aside>`
- Section → `<section>` / `<article>`
- Lists → `<ul>` / `<ol>` + `<li>`

### 1.2 Non-sequential heading levels
**Standard**: WCAG 1.3.1 Info and Relationships

- Don't skip from `<h1>` to `<h3>`
- Only one `<h1>` per page
- Heading levels must be sequential; no skipping

### 1.3 Form controls without labels
**Standard**: WCAG 3.3.2 Labels or Instructions

```tsx
// ❌
<input type="email" placeholder="Email" />

// ✅
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ or antd Form
<Form.Item label="Email" name="email">
  <Input />
</Form.Item>
```

## 2. ARIA Attributes

### 2.1 Icon buttons missing aria-label
**Standard**: WCAG 4.1.2 Name, Role, Value

```tsx
// ❌
<Button icon={<DeleteOutlined />} />

// ✅
<Button icon={<DeleteOutlined />} aria-label="Delete" />
```

Check rule: `<Button>` / `<a>` with only an icon and no text must have an `aria-label`.

### 2.2 Dynamic content not announcing via aria-live
**Standard**: WCAG 4.1.3 Status Messages

- Toast / message alerts should have `role="status"` or `aria-live="polite"`
- Error alerts should have `role="alert"` or `aria-live="assertive"`
- antd `message` / `notification` already handle this; watch out for custom toasts

### 2.3 Modal dialogs missing role
**Standard**: WCAG 4.1.2

- `<Modal>` should have `role="dialog"` + `aria-modal="true"` (antd Modal already handles this)
- Custom overlays need these added manually

### 2.4 ARIA overuse
```tsx
// ❌ native element already implies this — redundant
<button role="button">Submit</button>
<nav role="navigation">...</nav>

// ✅ use ARIA only when native semantics are insufficient
<div role="tablist">...</div>  // div has no tablist semantics natively
```

## 3. Keyboard Interaction

### 3.1 Interactive elements not reachable via Tab
**Standard**: WCAG 2.1.1 Keyboard

- All `onClick` elements must be focusable (native button/a/input are by default; divs need `tabIndex={0}`)
- Use `disabled` to disable elements — not `pointer-events: none` (which still allows Tab focus)

### 3.2 Missing keyboard event handlers
**Standard**: WCAG 2.1.1

```tsx
// ❌ responds to mouse only
<div onClick={handle} tabIndex={0}>...</div>

// ✅ add keyDown
<div
  onClick={handle}
  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handle()}
  tabIndex={0}
  role="button"
>...</div>
```

### 3.3 Modal missing focus trap
**Standard**: WCAG 2.4.3 Focus Order

- When a modal opens, focus should move into it; when it closes, focus should return to the trigger element
- Tab key should cycle within the modal and not reach background content
- antd Modal already handles this; custom overlays need to implement it

### 3.4 Missing Esc to close
- Modal / Drawer / Popover should support closing with Esc
- antd supports this by default; custom components need to add it

## 4. Visual

### 4.1 Insufficient contrast
**Standard**: WCAG 1.4.3 Contrast (Minimum)

- Body text: 4.5:1
- Large text (18pt or 14pt bold): 3:1
- Non-text elements (icons / borders): 3:1

How to check:
- Read color values from CSS / theme.ts
- Compare text color against background color
- Disabled state text is exempt from this rule (WCAG allows an exception), but should still be legible

### 4.2 Color as the only means of conveying information
**Standard**: WCAG 1.4.1 Use of Color

```tsx
// ❌ red = error — invisible to color-blind users
<span style={{ color: 'red' }}>Required</span>

// ✅ color + icon/text
<span style={{ color: 'red' }}>
  <ExclamationCircleOutlined /> Required
</span>
```

### 4.3 Missing alt text on images
**Standard**: WCAG 1.1.1 Non-text Content

```tsx
// ❌
<img src="/avatar.png" />

// ✅ meaningful image
<img src="/avatar.png" alt="Zhang San's avatar" />

// ✅ decorative image
<img src="/decoration.png" alt="" role="presentation" />
```

### 4.4 Text overflow at scaled sizes
**Standard**: WCAG 1.4.4 Resize text

- At 200% browser zoom, there should be no horizontal scrollbar and no text clipping
- Use rem/em instead of fixed px, or use clamp()

## 5. antd Component-specific Checks

See [antd-a11y-notes.md](antd-a11y-notes.md)
