---
name: ext-dep-audit
description: 依赖安全与健康度审计。扫描 pnpm 漏洞、过时依赖、冗余功能包、许可证风险、Umi 内置依赖冲突。用户明确要求「依赖审计 / 依赖巡检 / 安全扫描 / 检查过时包」时触发。
---

# ext-dep-audit — 依赖审计

你现在是依赖安全与健康度审计专家。对 `workspace/package.json` 进行全面体检。

## 执行方式

**优先跑脚本拿确定性结果, 再用 AI 做解读**, 不要靠自己猜 `pnpm audit` 的输出。

### 第一步: 安全漏洞扫描

```bash
bash .claude/skills/ext-dep-audit/scripts/pnpm-audit.sh
```

脚本输出 JSON, 解读时按严重程度分类:

| 级别 | 处理方式 |
|------|---------|
| critical / high | 必须立即修复, 给出 `pnpm update <包>@<安全版本>` |
| moderate | 评估影响范围, 建议修复时间 |
| low | 记录, 下次迭代处理 |

### 第二步: Umi 内置依赖冲突

```bash
bash .claude/skills/ext-dep-audit/scripts/check-umi-conflict.sh
```

脚本对照 [references/umi-builtin-deps.md](references/umi-builtin-deps.md) 检查, 命中的依赖标 🔴。

### 第三步: 过时依赖检查

```bash
bash .claude/skills/ext-dep-audit/scripts/check-outdated.sh
```

对比当前版本与最新版本, 标注**大版本落后**的 (major version 差异)。

### 第四步: 依赖树健康度 (AI 分析)

脚本跑完后, AI 读 `workspace/package.json` 额外检查:

1. **废弃包** — 查找 `deprecated` 字段
2. **重复功能** — 如 moment + dayjs, lodash + ramda, axios + umi-request
3. **体积异常** — 大体积但只用一小部分的包 (如 full `lodash` 而非 `lodash/get`)
4. **许可证风险** — GPL / AGPL 等强制开源许可证 (商业项目需注意)
5. **直接依赖过多** — 超过 30 个需要审视
6. **devDependencies 误放 dependencies** — 如 `@types/*`, `eslint`, `vitest`

## 输出格式

```
🔴 安全漏洞 (必须修复):
- [包名@版本] 漏洞描述 (CVE-xxx)
  修复: pnpm update <包名>@<安全版本>

🟡 健康问题 (建议修复):
- [包名] 问题描述
  建议: 处理方案

🔵 优化建议:
- [包名] 建议描述

📊 总结:
  直接依赖: X 个
  安全漏洞: X critical / X high / X moderate
  过时依赖: X 个 (大版本落后)
  冗余依赖: X 个
  许可证风险: X 个
```

## 模式

| 调用方式 | 行为 |
|---------|------|
| `/ext-dep-audit` | 只审计, 输出报告 |
| `/ext-dep-audit --fix` | 审计后**询问用户**是否执行可安全升级 (patch + minor), major 版本升级一律不自动做 |

## 设计原则

- 脚本负责拿数据, AI 负责解读和建议 — 不要让 AI 凭记忆推测版本/CVE
- 所有修复建议都要给出具体命令, 用户复制即可执行
- major 升级、废弃包替换等破坏性操作只建议, 不自动执行
