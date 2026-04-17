---
name: ext-perf-audit
description: 前端性能审计。分析包体积、React 渲染性能、网络瀑布、内存泄漏、首屏加载。用户明确要求「性能审计 / 页面卡顿分析 / 包体积优化 / 首屏优化」时触发。
---

# ext-perf-audit — 性能审计

你现在是前端性能优化专家。对指定的组件/页面/模块进行性能审计。

## 执行方式

**先跑脚本拿数据, 再用 AI 做静态分析**。脚本负责度量, AI 负责识别模式。

### 第一步: 构建产物分析 (如有 dist)

```bash
bash .claude/skills/ext-perf-audit/scripts/bundle-size.sh
```

脚本输出:
- 总体积 + 按 chunk 排序
- 大于 100KB 的 JS 文件列表
- 大于 500KB 的资源文件列表 (图片/字体)

AI 识别:
- 单 chunk > 500KB 的警告
- 图片未压缩 / 未 WebP 化
- 未按路由 chunk 拆分 (如 `index.*.js` 超大)

### 第二步: 依赖体积速查

```bash
bash .claude/skills/ext-perf-audit/scripts/heavy-deps.sh
```

脚本列出 node_modules 中体积最大的前 20 个包, AI 对照 [references/perf-checklist.md](references/perf-checklist.md) 的「常见体积杀手」一节给建议。

### 第三步: 静态代码扫描 (AI 读源码)

按 [references/perf-checklist.md](references/perf-checklist.md) 的 5 大维度检查 `$ARGUMENTS` 指定的目录:

1. **包体积** — 整库 import / 重复依赖 / console.log / 未懒加载
2. **渲染性能** — 缺 memo/useMemo/useCallback / 无 key / 渲染路径新建引用 / 状态过高 / JS 做 CSS 的事
3. **网络性能** — 串行请求本可并行 / 缺缓存 / 图片格式 / 缺 prefetch
4. **内存** — useEffect 缺 cleanup / 闭包持有大对象 / 无虚拟滚动
5. **首屏** — 阻塞关键路径 / 缺 Skeleton / 瀑布流请求

## 输出格式

```
🔴 严重 (影响用户体验):
- [文件:行号] 问题描述
  影响: 预估影响 (如: 首屏多 800ms / bundle +400KB)
  修复: 具体方案 + 代码示例

🟡 中等 (可优化):
- [文件:行号] 问题描述
  修复: 方案

🔵 建议 (锦上添花):
- [文件:行号] 问题描述

📊 总评: X/10, 一句话总结
```

## 使用方式

```
/ext-perf-audit workspace/src/features/login/
/ext-perf-audit workspace/src/pages/dashboard/
/ext-perf-audit workspace/src/components/DataTable.tsx
```

## 设计原则

- 能用脚本度量的就别让 AI 估算 (体积/依赖大小)
- 所有建议必须给出**预估影响**, 没有数字的建议只放 🔵
- 不建议激进重构, 优先给最小修改收益最大的 fix
