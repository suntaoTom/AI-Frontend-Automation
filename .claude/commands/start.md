你刚刚加入这个项目, 请按以下步骤了解项目情况:

> 注意: CLAUDE.md 及 .claude/rules/ 下的项目规范已自动加载, 无需重复阅读。

## 第一步: 了解项目现状

1. 扫描 workspace/src/ 目录结构, 了解已有的代码模块和文件布局
2. 检查 workspace/package.json 确认已安装的依赖和可用脚本
3. 检查 workspace/config/ 目录了解项目配置 (路由/主题/代理等)

## 第二步: 检查当前任务进度

请扫描 docs/tasks/ 目录下所有 JSON 文件, 汇总输出:

1. **进行中的模块**: 列出所有包含非 done 任务的模块
2. **待办任务**: 列出所有 status 为 pending 或 in-progress 的任务, 按模块分组
3. **已完成**: 统计已完成任务数 / 总任务数

输出格式:
```
📋 项目当前状态
━━━━━━━━━━━━━━

[模块名1] (3/5 已完成)
  ✅ T001 - userApi (done)
  ✅ T002 - useUserStore (done)
  ✅ T003 - UserTable (done)
  ⏳ T004 - UserForm (in-progress)
  ⬜ T005 - UserPage (pending, 依赖 T004)

[模块名2] (0/3 已完成)
  ⬜ T001 - orderApi (pending)
  ⬜ T002 - useOrderStore (pending, 依赖 T001)
  ⬜ T003 - OrderList (pending, 依赖 T002)

━━━━━━━━━━━━━━
总计: X 个模块, Y/Z 任务已完成
```

## 第三步: 等待指令

汇报完成后, 等待我的下一步指令。不要主动开始编码。
