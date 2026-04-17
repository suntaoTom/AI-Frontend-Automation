# skills/ — Claude Code 技能包

> 包形式的扩展技能。含 `SKILL.md` 主说明 + `scripts/` 确定性脚本 + `references/` 参考资料。
> 与 `commands/*.md` (单文件 prompt) 的区别: 包形式可以跑脚本拿真实数据, 减少 AI 猜测。

## 文件清单

| 技能 | 用途 | 触发场景 |
|------|------|---------|
| [ext-dep-audit/](ext-dep-audit/) | 依赖安全与健康度审计 | 依赖巡检 / 安全扫描 |
| [ext-perf-audit/](ext-perf-audit/) | 前端性能审计 | 页面卡顿分析 / 发版前优化 |
| [ext-a11y-check/](ext-a11y-check/) | 无障碍 WCAG 2.1 AA 合规检查 | 合规审计 / 键盘操作支持 |
| [ext-changelog/](ext-changelog/) | 按模块聚合的变更影响报告 | 周报 / 交接 / 复盘 |

## 目录结构约定

```
skills/<skill-name>/
├── SKILL.md              # 主说明, 含 frontmatter (name + description)
├── scripts/              # 确定性脚本 (可选)
│   └── xxx.sh            # bash 脚本, 负责跑真实命令拿数据
└── references/           # 参考资料 (可选)
    └── xxx.md            # 大块参考文档, 按需读取 (避免每次塞进 context)
```

## SKILL.md 格式

```markdown
---
name: <skill-name>           # 唯一标识, 与目录名一致
description: <一句话>         # 关键: 决定 AI 何时自动触发该技能, 要具体
---

# <skill-name>

<skill 的完整说明: 职责 / 执行流程 / 输出格式 / 设计原则>
```

### description 字段要怎么写

决定 AI 是否自动调用该技能的**唯一依据**, 要包含:
- **做什么** (一句话)
- **什么时候用** (具体关键词: 「用户明确要求『X / Y / Z』时触发」)

**反例** (太泛): `description: 性能相关`
**正例**: `description: 前端性能审计。分析包体积、React 渲染性能、网络瀑布、内存泄漏、首屏加载。用户明确要求「性能审计 / 页面卡顿分析 / 包体积优化 / 首屏优化」时触发。`

## 脚本规范

- 放在 `scripts/` 子目录, 命名 kebab-case
- 顶部注释写明用法和参数
- 统一路径解析: `ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"` 回到仓库根
- 失败不 exit 1, 输出提示让 AI 理解 (脚本是给 AI 用的数据源, 不是 CI 门禁)
- 加可执行权限: `chmod +x`

## references 规范

- 放在 `references/` 子目录, 都是 markdown
- **不要塞进 SKILL.md**, 要做按需加载 (SKILL.md 里用 `[链接](references/xxx.md)` 引用)
- 适合放什么: WCAG 规则清单、checklist、对照表、常见反模式
- 不适合放什么: 会变的业务规则 (那是 PRD 的事)

## 添加新技能

1. 创建 `skills/<新技能名>/` 目录
2. 写 `SKILL.md` (frontmatter + body)
3. 按需加 `scripts/` 和 `references/`
4. 脚本加可执行权限
5. 在本 README 的文件清单加一行
6. 如果是 `ext-` 前缀, 在 `docs/WORKFLOW.md` 的「扩展命令」章节登记

## skills/ vs commands/ 怎么选

| 场景 | 放哪里 |
|------|-------|
| 纯 prompt 工作流, 没有脚本可跑 (如 `/prd` `/plan` `/code`) | `commands/*.md` |
| 需要跑脚本拿真实数据 (体积/git log/pnpm 输出) | `skills/<name>/` 包形式 |
| 有大块参考资料, 不适合每次都灌进 context | `skills/<name>/references/` |
| 跨项目复用 (通用能力) | 可移到 `~/.claude/skills/` 全局 |

## 设计原则

- **脚本拿数据, AI 做解读** — 能确定性度量的就别让 AI 估算
- **渐进式加载** — 大参考文档放 references, SKILL.md 只引用, 不内嵌
- **description 要具体** — 含触发关键词, AI 才能正确识别
- **只读默认** — 分析类技能不直接改代码, 修复走 `/fix`
