---
name: ext-changelog
description: 生成人类可读的代码变更影响报告, 按模块聚合 commit, 识别风险点, 关联 PRD / 任务 / Bug。用于周报、交接、复盘。不同于 /release (结构化 changelog for 发版 tag)。用户明确要求「变更报告 / 周报 / 看看最近改了什么 / 交接文档」时触发。
---

# ext-changelog — 变更影响报告

你现在是代码变更分析师。对指定文件/目录在指定时间范围内的 git 变更生成可读的影响报告。

## 与 /release 的区别

- `/release` — 面向**发布**, 输出结构化 changelog, 用于 tag/发版
- `/ext-changelog` — 面向**理解**, 输出人可读的变更故事, 用于周报/交接/复盘

## 执行方式

**git log 用脚本跑, AI 做分组和解读**, 不要让 AI 凭记忆拼 commit。

### 第一步: 拿 commit 列表

```bash
bash .claude/skills/ext-changelog/scripts/range-commits.sh [since] [scope] [author]
```

参数 (全部可选):
- `since` — 起始日期, 默认 `7 days ago`, 也可 `2026-04-01`
- `scope` — 路径范围, 默认 `.` (全仓库)
- `author` — 作者过滤, 默认空

输出每行: `hash|date|author|subject`

### 第二步: 拿变更文件统计

```bash
bash .claude/skills/ext-changelog/scripts/changed-files.sh [since] [scope]
```

输出: 每个文件的 A/M/D 状态 + 所在模块目录。

### 第三步: AI 按模块聚合

读脚本输出后:
1. 按 `workspace/src/features/<模块>/` 前缀分组
2. 解析 commit message 的 `type(scope): description`
3. 关联 `docs/prds/` / `docs/tasks/` / `docs/bug-reports/` 引用
4. 识别风险点:
   - 大面积修改 (单 commit 改 > 10 文件)
   - 模块交叉修改 (一个 commit 跨多个 feature)
   - commit message 里有 `WIP` / `TODO` / `FIXME`
   - 未关联 PRD / 任务的功能性 commit

## 输出格式

```markdown
# 变更报告: 2026-04-10 → 2026-04-17

## 概要
本周主要完成了登录模块开发, 修复了 3 个 bug, 重构了鉴权逻辑。

## 按模块拆解

### login (12 commits, 5 文件新增, 3 文件修改)
- 新增账号密码登录 + 记住我功能
- 新增登录表单组件、鉴权 hook、API 封装
- PRD: docs/prds/login.md

### auth (3 commits, 2 文件修改)
- 重构: 提取公共鉴权逻辑到 useAuth hook
- 影响范围: login, register 模块都在用

## Bug 修复
- 修复 Dashboard 白屏 (login token 过期未跳转)
- 修复记住我 token 未延长有效期

## 风险点
- auth 模块重构后, register 页面还没回归测试
- login.md PRD 中 [待确认] 项仍有 2 处

## 统计
- 总 commit: 18
- 新增文件: 7
- 修改文件: 11
- 活跃贡献者: 2 (alice, bob)
```

## 使用方式

```
/ext-changelog                                    # 本周变更
/ext-changelog --since 2026-04-01                  # 本月变更
/ext-changelog workspace/src/features/login/       # 登录模块变更
/ext-changelog --author alice --since 2026-04-14   # Alice 最近 3 天的产出
```

## 设计原则

- git 命令一律走脚本, 不让 AI 手拼 `git log` 参数
- 报告要有「故事感」, 不是 commit 列表的堆砌
- 风险点要具体 (指到文件/模块), 不说「建议多测试」这种废话
- 只读 git, 不改代码
