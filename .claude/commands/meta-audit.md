---
description: 元审计协调员 — spawn meta-auditor 子代理扫描 .claude/ + docs/ + src/, 输出结构化报告
argument-hint: [--scope .claude|docs|src]
allowed-tools: Agent, Read
helper: true
---

你现在是元审计协调员。用户刚才输入了 `/meta-audit`, 你的唯一职责是**spawn meta-auditor 子代理**执行完整扫描, 然后把报告的关键发现展示给用户。

## 命令参数

用户可能传:
- `--focus=<维度>` — 只扫单一维度 (`rule-violations` / `doc-drift` / `internal-consistency` / `traceability` / `dead-links` / `orphaned-assets`)
- `--output=<路径>` — 覆盖默认报告位置

无参数 = 扫全部 6 个维度, 报告写到 `docs/retrospectives/<今天日期>-meta-audit.md`。

## 执行流程

### 1. 找上次报告 (用于趋势对比)

```
Glob(pattern="docs/retrospectives/*-meta-audit.md")
```

按文件名排序, 取最新那份 (排除今天可能已有的同日报告)。

### 2. Spawn meta-auditor agent

```
Agent(
  subagent_type="meta-auditor",
  description="工程元审计",
  prompt=<见下方 prompt 模板>
)
```

Prompt 模板 (你要填的变量在 <> 里):

```
请执行元审计, 输出报告到 docs/retrospectives/<today>-meta-audit.md。

扫描维度: <full | focus=<维度>>
上次报告 (用于趋势对比): <previousReportPath | 首次运行>

严格遵守:
- 只 Read / Grep / Glob 扫描
- 只 Write 到报告路径, 不碰任何其他文件
- 不提 git, 不改 .claude/, 不改 workspace/

按 .claude/agents/meta-auditor.md 的执行步骤和报告格式输出。
```

### 3. 接收 summary, 向用户展示

主 agent 收到 meta-auditor 返回的 summary 后, 在终端输出:

```markdown
## 📊 元审计完成

**报告**: [docs/retrospectives/<date>-meta-audit.md](docs/retrospectives/<date>-meta-audit.md)

### 本次发现
- 🔴 必修: X 条
- 🟡 建议修: Y 条
- 🔵 讨论: Z 条

### Top 3 必修 (优先处理)
1. <agent 返回的第 1 条>
2. <agent 返回的第 2 条>
3. <agent 返回的第 3 条>

### 趋势 (vs 上次)
- 已解决: A 条 ✅
- 新增: B 条
- 持续未处理: C 条 ⚠️

### 下一步
请 review 完整报告, 对采纳的建议走正常流程固化:
- 改规则 → 直接改 .claude/rules/
- 改代码 → 走 /fix 或正常开发
- 讨论项 → 开 GitHub issue 或团队讨论

本命令**不自动修复**, 所有改动需人工决定。
```

## 设计原则

- 命令只负责**调度 + 展示**, 所有实际扫描逻辑在 meta-auditor agent 里
- 不在主 context 里读任何被扫的文件 (让 agent 去读, 保护主 context)
- 不自动修复, 永远由用户决定
- 如果用户传了 `--focus`, 提醒用户这次只扫了部分维度, 不代表全面

## 使用方式

```
/meta-audit                          # 扫全部 6 维, 默认输出路径
/meta-audit --focus=traceability     # 只查追溯链断裂
/meta-audit --focus=dead-links       # 只查死引用
/meta-audit --output=/tmp/audit.md   # 自定义报告位置
```

请执行元审计:
$ARGUMENTS
