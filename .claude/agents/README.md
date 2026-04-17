# agents/ — 子代理 (sub-agent) 定义

> 主命令用 `Agent` 工具 spawn 的专项代理, 各自跑在**独立 context**, 支持并行, 不污染主会话。

## 文件清单

| 代理 | 职责 | 被谁 spawn |
|------|------|-----------|
| [test-writer.md](test-writer.md) | 为指定源文件生成测试 (读 `@rules` → 按条写 `it()`) | `/code` 完成后 / `/test` 多模块并行 |
| [code-reviewer.md](code-reviewer.md) | 只读审查一个文件/目录, 输出问题清单 | `/review` 大目录拆分 / 提 PR 前自检 |
| [bug-fixer.md](bug-fixer.md) | 修复单个 bug (来自 bug-report) | `/fix` 处理多 bug 报告时并行 |

## 子代理 vs 斜杠命令

| | 斜杠命令 (commands/) | 子代理 (agents/) |
|---|---|---|
| 跑在 | **主 context** | **独立 context** (spawn 时创建) |
| 并行 | 否, 串行执行 | 是, 多个 agent 可并发 |
| 记忆 | 全主会话可见 | 只看到被传入的 prompt |
| 输出 | 直接写入主对话 | 返回一个 summary 给主 agent |
| 适合 | 用户手动触发的工作流 | 主命令内部 spawn 的独立子任务 |

**为什么需要子代理**:

1. **并行加速** — 测试端报了 5 个独立 bug, spawn 5 个 `bug-fixer` 并行修, 比串行快 5 倍
2. **保护主 context** — 一个大目录的 review 会读很多文件, 塞进主 context 会很快爆, 让子代理跑完返回 summary 就够了
3. **职责隔离** — 子代理只看到**被传入的 prompt**, 不受主会话污染, 输出更聚焦

## agent md 文件格式

```markdown
---
name: <agent-name>                    # 唯一标识, 与文件名一致
description: <一句话> — 何时 spawn    # 主 agent 看这个决定要不要用
tools: [Read, Edit, Write, Bash, Grep, Glob]  # 可选, 默认继承
---

# <agent-name>

<完整的 system prompt: 角色 / 输入 / 执行步骤 / 输出格式 / 边界>
```

### 关键字段

| 字段 | 说明 |
|------|-----|
| `name` | 主 agent 调用 Agent 工具时用 `subagent_type: "test-writer"` |
| `description` | 影响主 agent 是否选择该 agent 的关键, 要含触发场景关键词 |
| `tools` | 限制 agent 可用工具。只读 agent (如 reviewer) 应剔除 Edit/Write |
| body | 完整 prompt, 会成为子 agent 的 system prompt |

## 什么时候该写一个新 agent

✅ **适合的场景**:
- 可并行的独立子任务 (多个 bug 并行修)
- 重型只读任务, 怕把主 context 塞满 (大目录扫描)
- 需要独立视角的二次审查 (主 agent 已经写了代码, 让 reviewer 独立看)
- 同一类任务在多个主命令里重复出现 (test-writer 既被 /code 用也被 /test 用)

❌ **不适合的场景**:
- 用户直接触发的完整工作流 → 用 commands/
- 需要跑脚本拿确定性数据 → 用 skills/ 包形式
- 事件触发的自动检查 → 用 hooks/
- 一次性的简单任务 → 主 agent 直接做, 不要过度设计

## 写 agent 的原则

- **prompt 要自包含** — 子 agent 看不到主会话历史, 输入要写全
- **输出要结构化** — 子 agent 的返回是一个 message, 格式一致才好被主 agent 解析
- **工具权限最小化** — reviewer 不该有 Edit 权限, test-writer 不该有删除权限
- **避免深嵌套** — 子 agent 原则上不再 spawn 子代理, 保持简单
