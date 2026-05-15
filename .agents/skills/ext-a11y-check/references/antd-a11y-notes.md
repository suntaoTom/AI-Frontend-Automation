# antd Component Accessibility Notes

> antd v5 has built-in a11y for most components. The following are easy-to-miss spots and pitfalls when customizing.

## Table

```tsx
// Recommended: add summary (screen readers will announce it)
<Table
  dataSource={data}
  columns={columns}
  summary={() => <Table.Summary>Total: X items</Table.Summary>}
  rowKey="id"
/>
```

- `rowKey` must be stable; never use index
- When customizing header render, ensure `th` semantics are preserved
- For complex headers, use the `title` prop on `Table.Column` — don't write raw JSX that breaks the `scope` attribute

## Modal

```tsx
<Modal
  title="Confirm Delete"  // required — screen readers need this
  open={open}
  onCancel={handleClose}
>
```

- `title` is required; don't pass `null` (unless you implement `aria-labelledby` yourself)
- `closable` defaults to true (keep the close button); don't disable it
- `keyboard` defaults to true (Esc to close); don't disable it
- Focus trapping is handled by antd

## Form

- `Form.Item`'s `label` is automatically associated by id — leave it as-is
- Error messages have `role="alert"` and will be announced by screen readers
- Custom components wired to `Form.Item` must implement `value` + `onChange`; don't rely solely on internal state

## Icon Buttons

```tsx
// ❌
<Button icon={<DeleteOutlined />} />
<Button icon={<SearchOutlined />} type="primary" />

// ✅
<Button icon={<DeleteOutlined />} aria-label="Delete" />

// ✅ or use Tooltip (title is linked via aria-describedby)
<Tooltip title="Delete">
  <Button icon={<DeleteOutlined />} />
</Tooltip>
```

## Tooltip / Popover

- `title` is required
- Purely visual tooltips are fine, **but never put important information only in a Tooltip** — keyboard and touch users may not be able to access it
- Critical information like form errors and required-field indicators must be visible in the DOM

## Select / DatePicker / Cascader

- Built-in keyboard support: ↑↓ to navigate, Enter to select, Esc to close
- `placeholder` is not a substitute for `label`; screen readers do not read placeholder text
- Custom `dropdownRender` must preserve `role="option"` on options

## Menu

- Built-in `role="menu"` + `role="menuitem"`
- Keyboard: ← → for sibling menus, ↑ ↓ for items in the same level, Enter to activate
- Keep `key` stable on custom `<Menu.Item>` elements

## Tabs

- Built-in `role="tablist"` + `role="tab"` + `role="tabpanel"`
- Keyboard: ← → to switch tabs
- Don't use `forceRender={false}` and then depend on refs inside the tab — refs are null when the tab hasn't rendered

## Drawer

- Same as Modal: `title` is required; focus trapping is already handled

## Upload

- Drag-and-drop areas must have clear text labels — icon alone is not sufficient
- The `accept` attribute helps screen readers announce which file types are supported

## Icon

```tsx
// Purely decorative icon — add aria-hidden
<CheckCircleOutlined aria-hidden />
<span>Success</span>

// Icon that carries meaning on its own — add aria-label
<LoadingOutlined aria-label="Loading" />
```

## Quick Checklist

| Scenario | What to check |
|----------|--------------|
| Icon buttons | Does it have `aria-label` or a Tooltip? |
| Modal | Is `title` provided? |
| Table | Is `rowKey` stable? |
| Tooltip | If info is only accessible on hover, how do keyboard users get it? |
| Custom interactions | Are `tabIndex` + `onKeyDown` both implemented? |
| Images | Is `alt` provided? Decorative images should use `alt=""` — not omit it entirely |
