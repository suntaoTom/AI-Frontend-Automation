# .github/ — GitHub 自动化配置

本目录存放 GitHub 平台相关的自动化配置。**目前写好但未启用**, 需要手动完成下方清单才会生效。

## 文件清单

| 文件 | 作用 | 状态 |
|------|------|------|
| [workflows/claude-fix.yml](workflows/claude-fix.yml) | 触发 AI 自动修 bug + 开 draft PR | 🟡 脚本已写, 待启用 |
| [workflows/deploy-web.yml](workflows/deploy-web.yml) | Web 平台构建 + CDN 部署 + 灰度 | 🟡 脚本已写, 需配置 secrets/vars |
| [workflows/deploy-ios.yml](workflows/deploy-ios.yml) | iOS 构建 + TestFlight/App Store | 🟡 脚本已写, 需配置证书和 API Key |
| [workflows/deploy-android.yml](workflows/deploy-android.yml) | Android 构建 + 内部分发/Google Play | 🟡 脚本已写, 需配置 keystore |
| [workflows/deploy-harmony.yml](workflows/deploy-harmony.yml) | HarmonyOS 构建 + AppGallery | 🟡 脚本已写, 需配置签名和 API |
| [pull_request_template.md](pull_request_template.md) | 统一 PR 格式, 强制关联 PRD/task | ✅ 创建 PR 时 GitHub 自动应用, 无需启用 |

---

## Claude Fix 启用步骤

**全部在仓库 `Settings` 页面操作, 不改代码。**

### 1. 添加 Anthropic API Key (必须)

1. 进入 [Anthropic Console](https://console.anthropic.com/) 申请 API Key
2. 仓库 `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
3. 名称: `ANTHROPIC_API_KEY`, 值: 刚申请的 key

### 2. 授予 Actions 写权限 (必须)

`Settings` → `Actions` → `General` → 拉到底部 `Workflow permissions`:

- ✅ 选中 **Read and write permissions**
- ✅ 勾选 **Allow GitHub Actions to create and approve pull requests**

不勾就无法 push 分支 / 开 PR, 会在 workflow 日志里报 `permission denied`。

### 3. (可选) 限制触发者

默认只允许 repo 成员 (OWNER / MEMBER / COLLABORATOR) 评论 `@claude fix` 触发, 防止外部人员滥用 API 额度消耗。

如需放宽 / 收紧, 编辑 [workflows/claude-fix.yml](workflows/claude-fix.yml) 里的 `author_association` 判断。

### 4. (可选) 设置 API 预算告警

Anthropic Console → `Billing` → 设 Monthly budget + 告警阈值, 避免 workflow 失控消耗。

---

## 使用方式 (启用后)

### 方式 A: 在 issue 下评论触发 (推荐)

1. 新建 issue, 正文描述 bug (现象 + 复现步骤 + 报错堆栈)
2. 在评论里写:
   ```
   @claude fix 补充说明 (可选)
   ```
3. Workflow 自动跑, 全程在 issue 评论里汇报进度:
   - 🤖 启动通知
   - ✅ 完成, 附 draft PR 链接
   - ❌ 失败/被阻塞, 附日志链接和常见原因
4. draft PR 人工 review 后转 ready-for-review, 再走正常合并流程

### 方式 B: Actions 页面手动触发 (测试用)

1. 仓库 `Actions` → `Claude Fix` → `Run workflow`
2. 填 `bug_description` (必填, 多行文本)
3. `allow_pr` 勾选决定是否自动开 PR

---

## 工作原理

本 workflow 本身**只做翻译**, 不包含修 bug 的逻辑:

```
GitHub 事件 (issue comment / workflow_dispatch)
    ↓
claude-fix.yml 提取 bug 描述 + 拼参数
    ↓
调用 /fix --pr --headless (定义在 .claude/commands/fix.md)
    ↓
Claude 按 fix.md 的 6 步流程执行:
  复现 → 定位 → 修复 → 验证 → 提交 → 开 PR
    ↓
workflow 把结果回评论到原 issue
```

修改 `/fix` 逻辑 → 改 [.claude/commands/fix.md](../.claude/commands/fix.md), 不用动本 workflow。
修改触发条件 / 白名单工具 → 改 [workflows/claude-fix.yml](workflows/claude-fix.yml)。

---

## 安全边界

workflow 在调用 Claude 时硬性限制:

- `allowed_tools` 白名单: 只允许 `Read` / `Edit` / `Write` / `Glob` / `Grep` + 特定 `Bash` 子命令
- `disallowed_tools` 黑名单: `git push --force` / `git reset --hard` / `git checkout main` / `rm -rf` 一律拒绝
- `timeout-minutes: 15`: 单次运行最多 15 分钟
- `concurrency`: 同 issue 同时只能跑一个, 不会并发乱改
- PR 强制 `--draft`, **绝不自动 merge** (需人工转 ready + 人工 merge)

即使 Claude 失控也改不了 `main`、改不了 `package.json` 核心字段、动不了 `.github/` 和 `workspace/api-spec/`。

---

## 故障排查

| 症状 | 可能原因 | 解决 |
|------|---------|------|
| workflow 没触发 | 评论者不是 repo 成员 | 邀请为 collaborator 或改 `author_association` 配置 |
| workflow 跑了但没开 PR | `/fix` 进入了 `[BLOCKED]` 状态 | 看日志, 常见是"根因在 PRD 层"或"多种方案需人工决定" |
| workflow 报 `permission denied` on push | Actions 权限没开 | 回到步骤 2 勾选 Read and write |
| workflow 报 `ANTHROPIC_API_KEY` 为空 | secret 没配 | 回到步骤 1 添加 |
| API 额度告警 / 跑崩 | 触发频率过高 / 单次消耗大 | 在 fix.md 限制复杂度, 或在 workflow 加 `if` 条件限制触发 |

---

## Deploy Workflows 启用步骤

部署 workflow 通过 `/deploy` 命令触发, 也可在 GitHub Actions 页面手动触发。

### 通用配置 (所有平台)

1. **通知渠道** (可选):
   - `Settings` → `Variables` → `Actions` → 添加:
     - `DINGTALK_WEBHOOK`: 钉钉机器人 webhook URL
     - `FEISHU_WEBHOOK`: 飞书机器人 webhook URL

2. **环境保护** (production 必须):
   - `Settings` → `Environments` → 创建 `production` 环境
   - 添加 `Required reviewers` (至少 1 人审批)

### Web 平台

`Settings` → `Variables` → 添加:
- `STAGING_URL`: 测试环境地址
- `PRODUCTION_URL`: 生产环境地址

CDN 上传需在 workflow 里替换 TODO 为实际命令 (阿里云 OSS / AWS S3 / 腾讯云 COS)。

### iOS 平台

`Settings` → `Secrets` → 添加:
- `IOS_CERTIFICATE_P12`: 证书 base64
- `IOS_CERTIFICATE_PASSWORD`: 证书密码
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect API Issuer ID
- `APP_STORE_CONNECT_KEY_ID`: API Key ID
- `APP_STORE_CONNECT_PRIVATE_KEY`: API Private Key (.p8 内容)

`Settings` → `Variables` → 添加:
- `IOS_BUNDLE_ID`: Bundle Identifier
- `IOS_SCHEME`: Xcode Scheme 名

### Android 平台

`Settings` → `Secrets` → 添加:
- `ANDROID_KEYSTORE_BASE64`: release.keystore 的 base64
- `ANDROID_KEYSTORE_PASSWORD`: keystore 密码
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key 密码
- `GOOGLE_PLAY_SERVICE_ACCOUNT`: Google Play Service Account JSON (production)
- `PGYER_API_KEY`: 蒲公英 API Key (staging, 可选)

`Settings` → `Variables` → 添加:
- `ANDROID_PACKAGE_NAME`: 包名

### HarmonyOS 平台

`Settings` → `Secrets` → 添加:
- `HARMONY_KEY_ALIAS`: 签名 key alias
- `HARMONY_KEY_PASSWORD`: key 密码
- `HARMONY_KEYSTORE_PASSWORD`: keystore 密码
- `HUAWEI_CLIENT_ID`: AppGallery Connect Client ID (production)
- `HUAWEI_ACCESS_TOKEN`: AppGallery Connect Access Token (production)

> HarmonyOS CI 环境搭建较复杂 (华为暂无官方 GitHub Action), 建议使用 Docker 镜像或自托管 runner。

---

## 未来可扩展

本 workflow 跑通后, 后续可以平行加:

- `claude-review.yml` — PR 评论触发 `/review` 自动审查
- `claude-test.yml` — push 到 feature 分支自动跑 `/test` 补齐测试
- Sentry webhook → 把错误自动灌进 `/fix`

新 workflow 只是换个触发源 + 换个命令, `/fix.md` / `/review.md` / `/test.md` 本身不用改。
