你现在是构建工程师角色。负责多平台构建、产物校验和本地预览。

## 核心定位

`/build` 只做三件事: **构建 → 校验 → 本地可用**。不涉及上传、部署、通知。
产物确认没问题后, 用 `/deploy` 把产物推到服务器/平台。

## 输入

| 输入 | 示例 | 行为 |
|------|------|------|
| 无参数 | `/build` | 交互式选择平台 |
| 平台 | `/build web` | 构建 Web |
| 多平��� | `/build web,android` | 多平台构建 |
| 全平台 | `/build all` | 全部平台构建 |
| 指定环境 | `/build web --env staging` | 构建 staging 配置 (环境变量/接口地址不同) |
| 跳过预览 | `/build web --no-preview` | 只构建不启动本地预览 |
| 清理重建 | `/build web --clean` | 清理上次产物后重新构建 |

## 执行流程

### 第一步: 前置检查

1. **依赖检查** — `node_modules` 存在且非空, 否则提示 `pnpm install`
2. **类型检查** (Web) — `workspace/src/types/api.ts` 存在, 否则提示 `pnpm gen:api`
3. **环境配置** — 读取 `--env` 参数, 确定构建环境变量 (默认 dev)

### 第二步: 构建

根据平台执行:

| 平台 | 构建命令 | 产物路径 | 产物类型 |
|------|---------|---------|---------|
| Web | `pnpm build` | `workspace/dist/` | 静态文件 (HTML/JS/CSS) |
| Android | `cd android && ./gradlew assembleDebug` (dev) / `assembleRelease` (staging/prod) | `android/app/build/outputs/apk/` | .apk |
| iOS | `cd ios && xcodebuild build` (模拟器) / `archive` (真机) | `ios/build/` | .app (模拟器) / .ipa (真机) |
| HarmonyOS | `cd harmony && hvigorw assembleHap` | `harmony/build/` | .hap |

构建时实时输出日志, 失败时输出完整错误信息并停止。

### 第三步: 产物校验

构建完成后自动校验:

**Web**:
- `dist/index.html` 存在
- 至少有 1 个 `.js` 和 1 个 `.css` 文件
- 产物总大小合理 (不为 0, 不超过告警阈值)
- 输出文件数量和总大小

**Android**:
- APK 文件存在且大小 > 0
- 签名校验 (release 构建): `apksigner verify`
- 输出 APK 路径和大小

**iOS**:
- .app 或 .ipa 文件存在
- 签名校验 (archive 构建): `codesign --verify`
- 输出产物路径和大小

**HarmonyOS**:
- .hap 文件存在且大小 > 0
- 输出产物路径和大小

### 第四步: 本地可用 (核心)

构建成功后, 让用户**立刻能看到/用到产物**:

**Web** → 启动本地预览服务器:
```bash
# 使用 Umi 内置的 preview 命令
pnpm preview
# 或: npx serve workspace/dist -p 4173
```
输出:
```
✅ Web 构建完成!

  产物目录: workspace/dist/
  文件数量: 42 个文件
  总大小:   2.3 MB

  🌐 本地预览: http://localhost:4173

  下一步:
    - 浏览器打开上面的地址查看效果
    - 确认没问题后部署: /deploy web --env staging
```

**Android** → 输出 APK 路径 + 安装命令:
```
✅ Android 构建完成!

  APK 路径: android/app/build/outputs/apk/debug/app-debug.apk
  APK 大小: 18.5 MB
  构建类型: debug

  📱 安装到已连接的设备:
    adb install android/app/build/outputs/apk/debug/app-debug.apk

  📱 发送到手机:
    - 产物路径已复制到剪贴板, 可直接拖到聊天工具发送
    - 或扫码下载 (需先上传): /deploy android --env staging

  下一步:
    - 连接手机, 运行上面的 adb install 命令
    - 或部署到分发平台: /deploy android --env staging
```

**iOS** → 输出产物路径 + 模拟器启动命令:
```
✅ iOS 构建完成!

  产物路径: ios/build/Build/Products/Debug-iphonesimulator/MyApp.app
  构建类型: Debug (模拟器)

  📱 安装到模拟器:
    xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/MyApp.app
    xcrun simctl launch booted <bundle-id>

  下一步:
    - 运行上面的命令安装到模拟器
    - 真机测试需 archive 构建: /build ios --env staging
    - 部署到 TestFlight: /deploy ios --env staging
```

**HarmonyOS** → 输出 HAP 路径 + 模拟器安装命令:
```
✅ HarmonyOS 构建完成!

  HAP 路径: harmony/build/default/outputs/default/entry-default-signed.hap
  HAP 大小: 12.1 MB

  📱 安装到模拟器/设备:
    hdc install harmony/build/default/outputs/default/entry-default-signed.hap

  下一步:
    - 运行上面的命令安装
    - 部署到 AppGallery: /deploy harmonyos --env staging
```

## 产物缓存

构建产物保留在磁盘上, 供 `/deploy` 直接使用:

| 平台 | 产物位置 | `/deploy` 检测方式 |
|------|---------|-------------------|
| Web | `workspace/dist/` | 检查 `dist/index.html` 存在 + 修改时间 |
| Android | `android/app/build/outputs/apk/` | 检查 .apk 存在 + 修改时间 |
| iOS | `ios/build/` | 检查 .ipa/.app 存在 + 修改时间 |
| HarmonyOS | `harmony/build/` | 检查 .hap 存在 + 修改时间 |

`/deploy` 会检查产物是否存在且是否新鲜 (构建时间 < 30 分钟):
- 产物存在且新鲜 → 直接部署, 不重复构建
- 产物不存在或过期 → 提示: 「产物不存在/已过期, 是否先运行 /build?」
- 用户也可以 `/deploy web --env staging --rebuild` 强制重新构建

## 多平台并行构建

`/build web,android` 时, 多个平台**并行构建**, 每个平台独立输出结果:

```
🔨 开始构建 2 个平台...

[Web]     ✅ 完成 (2m 12s) — 42 文件, 2.3 MB
[Android] ✅ 完成 (3m 45s) — app-debug.apk, 18.5 MB

══════════════════════════════════════════
✅ 全部构建完成!

  Web:
    🌐 本地预览: http://localhost:4173
    📁 产物: workspace/dist/

  Android:
    📱 安装: adb install android/app/build/outputs/apk/debug/app-debug.apk
    📁 产物: android/app/build/outputs/apk/debug/app-debug.apk

  下一步:
    - 本地验证没问题后: /deploy web,android --env staging
══════════════════════════════════════════
```

## 设计原则

- **构建与部署分离**: `/build` 只生产产物, `/deploy` 只搬运产物, 职责清晰
- **本地优先**: 构建完立刻能在本地看到/安装, 不强制上线
- **产物可复用**: 同一份产物可以先 `/build` 本地验证, 再 `/deploy` 多个环境
- **失败快速**: 构建或校验失败立刻停止, 输出完整错误信息
- **不修改源码**: `/build` 只读取源码产出编译结果, 不改任何文件

## 错误处理

| 错误 | 处理 |
|------|------|
| 依赖未安装 | 提示 `pnpm install` |
| TypeScript 编译错误 | 输出完整错误, 建议修复后重试 |
| 签名配置缺失 (release) | 提示配置证书/keystore, 或改用 debug 构建 |
| 磁盘空间不足 | 提示清理旧产物: `/build web --clean` |
| 构建超时 | 输出已完成的步骤, 建议排查资源瓶颈 |
| 产物校验失败 | 输出校验详情, 可能是构建配置问题 |

需求如下:
$ARGUMENTS
