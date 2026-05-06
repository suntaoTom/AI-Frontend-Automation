---
description: Visual QA — 截取当前应用截图，与设计稿像素对比，输出 P0/P1/P2 报告
argument-hint: [@docs/designs/screenshots/reference/xxx.png]
allowed-tools: Bash, Read
helper: true
---

你现在是视觉 QA 工程师。执行截图对比，输出结构化的差异报告。

## 执行步骤

### 第一步: 运行对比脚本

```bash
bash docs/designs/screenshots/run-visual-qa.sh $ARGUMENTS
```

脚本会自动完成：
- 检测 dev server 是否在 port 8000 运行 → 直接截图
- 未运行 → 自动 `pnpm dev` 启动，截图后自动关闭
- ImageMagick 像素对比，生成差值图 + 左右拼接对比图
- 结果写入 `docs/designs/screenshots/actual/qa-result.json`

### 第二步: 读取结果并视觉分析

1. 读取量化指标：
   ```bash
   cat docs/designs/screenshots/actual/qa-result.json
   ```
2. 用 Read 工具读取以下图像做视觉判断：
   - `docs/designs/screenshots/actual/side-by-side.png`（左右拼接对比图）
   - `docs/designs/screenshots/actual/diff.png`（红色=差异区域）

### 第三步: 输出报告

严格按以下格式输出：

```
📸 Visual QA 报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
模式: web (localhost:8000)
参考: docs/designs/screenshots/reference/xiaoguotu.png
实际: docs/designs/screenshots/actual/actual-web.png

P0 结构 (必须 100% 通过)
  ✅/❌ TopBar       RMSE=x.xxx
  ✅/❌ Pipeline     RMSE=x.xxx

P1 视觉 Token (≥ 95% 合格)
  ✅/⚠️  整体相似度   RMSE=x.xxx
  差异项:
    - [ ] 区域/元素: 期望 xx, 实际 xx

P2 像素级 (≥ 75% 合格, 不阻塞)
  ✅/📌 精确度       RMSE=x.xxx

产出文件:
  差值图:  docs/designs/screenshots/actual/diff.png
  对比图:  docs/designs/screenshots/actual/side-by-side.png
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
结论: ✅ 通过 | ❌ P0 失败，必须修复后重跑 | ⚠️ P1 有差异，建议修复
下一步: /code --only <taskId> 修复差异 | 或确认接受差异继续
```

### 第四步: P0/P1 差异自动定位

如果有 P0 或 P1 差异：
- 读 `diff.png` 定位红色高亮的差异区域
- 找到对应的 `.less` / `.module.css` 或 `.tsx` 文件
- 对比设计稿的颜色/间距/圆角值（参考 PRD 或设计稿原文）
- 用 Edit 工具直接修复，修完重新执行本命令验证，最多 3 轮

## 注意事项

- **RMSE 阈值仅供参考**：页面有动态内容或未登录状态会拉高 RMSE，需结合视觉判断
- **参考图放哪**：把设计稿截图放入 `docs/designs/screenshots/reference/` 即可
- **dev server 端口**：默认 8000 (UmiJS)，如项目用其他端口修改脚本里的 `PORT` 变量

$ARGUMENTS
