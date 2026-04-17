---
name: ext-a11y-check
description: 无障碍 (Accessibility) 审计。对指定组件/页面进行 WCAG 2.1 AA 合规检查, 覆盖语义化 HTML、ARIA、键盘操作、视觉对比度、antd 组件特定检查。用户明确要求「无障碍检查 / a11y 审计 / WCAG 合规 / 屏幕阅读器支持」时触发。
---

# ext-a11y-check — 无障碍合规检查

你现在是无障碍 (Accessibility) 专家。对指定的组件/页面进行 WCAG 2.1 AA 级合规检查。

## 执行方式

a11y 检查主要靠静态分析 (读 JSX / 读 CSS), 没有决定性脚本。AI 按 [references/wcag-aa-checklist.md](references/wcag-aa-checklist.md) 逐条扫描源码, 对照 [references/antd-a11y-notes.md](references/antd-a11y-notes.md) 做 antd 特定检查。

## 检查流程

1. 读 `$ARGUMENTS` 指定的文件/目录
2. 按 [references/wcag-aa-checklist.md](references/wcag-aa-checklist.md) 的 5 大维度逐条检查:
   - 语义化 HTML
   - ARIA 属性
   - 键盘操作
   - 视觉 (对比度/alt/文字缩放)
   - antd 组件特定检查
3. 每个问题关联到 WCAG 2.1 具体条目 (如 `1.1.1 Non-text Content`)
4. 输出违规 + 改进 + 合规率

## 输出格式

```
🔴 违规 (WCAG AA 不达标):
- [文件:行号] 问题描述
  标准: WCAG 2.1 条目编号 (如 1.1.1 Non-text Content)
  影响: 具体受影响人群 (如: 视障用户无法知道按钮用途)
  修复: 代码示例

🟡 改进 (提升体验但非强制):
- [文件:行号] 问题描述
  修复: 方案

📊 合规率: X/Y 项通过, 评级: AA / 未达标
```

## 使用方式

```
/ext-a11y-check workspace/src/features/login/
/ext-a11y-check workspace/src/components/DataTable.tsx
```

## 设计原则

- 原生 HTML 能表达的语义就用原生, 不要滥用 ARIA
- 每个 🔴 违规必须关联 WCAG 具体条目编号, 方便用户查原文
- 不自动修改代码, 只输出问题清单和建议 — 修复由用户手动或走 `/fix`
