# antd 组件无障碍注意点

> antd v5 大部分组件已内置 a11y, 以下是易漏点和自定义时的陷阱。

## Table

```tsx
// 推荐补 summary (屏幕阅读器会读)
<Table
  dataSource={data}
  columns={columns}
  summary={() => <Table.Summary>总计 X 条</Table.Summary>}
  rowKey="id"
/>
```

- `rowKey` 必须稳定, 不要用 index
- 自定义 header render 时确保 th 语义保留
- 复杂表头用 `Table.Column` 的 `title` 属性, 别自己写 JSX 破坏 scope

## Modal

```tsx
<Modal
  title="确认删除"  // 必填, 屏幕阅读器需要
  open={open}
  onCancel={handleClose}
>
```

- `title` 必填, 不要传 `null` (除非自己实现 aria-labelledby)
- `closable` 默认开 (保留关闭按钮), 别关
- `keyboard` 默认开 (Esc 关闭), 别关
- 焦点陷阱 antd 已处理

## Form

- `Form.Item` 的 `label` 会自动关联 id, 保持不动
- 错误信息有 `role="alert"`, 会被屏幕阅读器宣告
- 自定义组件接 `Form.Item` 要实现 `value` + `onChange`, 不要只用内部 state

## Button 图标按钮

```tsx
// ❌
<Button icon={<DeleteOutlined />} />
<Button icon={<SearchOutlined />} type="primary" />

// ✅
<Button icon={<DeleteOutlined />} aria-label="删除" />

// ✅ 或用 Tooltip (title 会被 aria-describedby 关联)
<Tooltip title="删除">
  <Button icon={<DeleteOutlined />} />
</Tooltip>
```

## Tooltip / Popover

- `title` 必填
- 纯视觉提示可以, **但重要信息不要只放 Tooltip** — 键盘用户和触摸设备用户可能看不到
- 表单错误、必填标识等关键信息要在 DOM 里可见

## Select / DatePicker / Cascader

- 内置键盘支持: ↑↓ 移动, Enter 选中, Esc 关闭
- `placeholder` 不能代替 `label`, 搜屏阅读器不读 placeholder
- 自定义 `dropdownRender` 要保留选项的 role=option

## Menu

- 内置 `role="menu"` + `role="menuitem"`
- 键盘: ← → 兄弟菜单, ↑ ↓ 同级菜单, Enter 激活
- 自定义 `<Menu.Item>` 时保留 key 稳定

## Tabs

- 内置 `role="tablist"` + `role="tab"` + `role="tabpanel"`
- 键盘: ← → 切换 tab
- 别用 `forceRender={false}` 后还依赖 tab 内的 ref — 未渲染时 ref 为 null

## Drawer

- 同 Modal, `title` 必填, 焦点陷阱已处理

## Upload

- 拖拽上传区要有明确的文字说明, 不能只有图标
- `accept` 属性帮助屏幕阅读器告知支持的文件类型

## Icon

```tsx
// 纯装饰图标, 加 aria-hidden
<CheckCircleOutlined aria-hidden />
<span>成功</span>

// 独立承担意义的图标, 加 aria-label
<LoadingOutlined aria-label="加载中" />
```

## 快捷检查清单

| 场景 | 看什么 |
|------|-------|
| 图标按钮 | 有 `aria-label` 或 Tooltip 吗 |
| Modal | `title` 传了吗 |
| Table | `rowKey` 稳定吗 |
| Tooltip | 只靠 hover 能传达的信息, 键盘用户怎么办 |
| 自定义交互 | `tabIndex` + `onKeyDown` 补全了吗 |
| 图片 | `alt` 传了吗, 装饰图用 `alt=""` 还是漏了 |
