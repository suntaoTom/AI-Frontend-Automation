# 设计截图规范

> 本目录存放设计稿参考截图（`reference/`）和 Visual QA 产出（`actual/`）。
> `/visual-qa` 命令会读取本目录，将模拟器/真机/浏览器截图与设计稿像素对比，输出 P0/P1/P2 报告。

---

## 目录结构

```
docs/designs/screenshots/
├── README.md                  ← 本文件
├── run-visual-qa.sh           ← 截图对比脚本（/visual-qa 调用）
├── reference/                 ← 设计稿参考图（手动放入，按功能分类）
│   ├── <功能模块>/
│   │   ├── 01_xxx.png              ← 默认态
│   │   ├── 01_xxx_error.png        ← 错误态
│   │   └── 01_xxx_loading.png      ← Loading 态
│   └── ...
└── actual/                    ← 自动生成，镜像 reference 结构
    └── <功能模块>/
        └── 01_xxx/
            ├── actual.png
            ├── diff.png
            ├── side-by-side.png
            └── qa-result.json
```

---

## 截图类型：截什么，不截什么

### ✅ 需要截图的状态

| 类型 | 说明 | 示例后缀 |
|------|------|---------|
| **默认态** | 页面首次打开时的样子 | （无后缀）|
| **表单错误态** | 用户输入不合法时的错误提示 | `_error` |
| **空状态** | 列表/内容为空时的占位视图 | `_empty` |
| **Loading 态** | 异步操作进行中（按钮禁用+spinner） | `_loading` |
| **成功/失败结果** | 操作完成后的结果页 | `_success` / `_fail` |
| **选中/切换态** | Tab 切换、选项选中后的差异视图 | `_tab_xxx` |

### ❌ 不需要截图的状态

| 类型 | 原因 |
|------|------|
| 按钮点击水波纹 | 瞬时动画，无法稳定复现 |
| 页面切换过渡动画 | 同上 |
| 输入框获焦光标 | 闪烁状态，截图随机 |
| 键盘弹出/收起 | 系统行为，与业务 UI 无关 |

**选截原则**：`businessRules` 里有明确规则的状态就值得截图——规则能测，截图才有意义。

---

## 命名规范

### 文件名格式

```
<序号>_<页面标识>[_<状态后缀>].<扩展名>
```

- **序号**：2 位数字，与设计稿顺序对应，便于排序
- **页面标识**：snake_case，与页面/功能名称对应
- **状态后缀**（可选）：`_error` / `_loading` / `_empty` / `_success` / `_tab_xxx`
- **扩展名**：`.png` 或 `.jpg`

### 示例

```
01_login.png                      ← 登录页默认态
01_login_error.png                ← 登录失败错误态
01_login_loading.png              ← 点击登录 loading 态
02_home.png                       ← 首页默认态
02_home_empty.png                 ← 首页空数据态
03_form.png                       ← 表单默认态
03_form_validation_error.png      ← 表单校验错误态
04_result_success.png             ← 操作成功结果
04_result_fail.png                ← 操作失败结果
```

---

## 截图尺寸说明

截图尺寸无强制要求，脚本会自动将实际截图缩放到与参考图相同尺寸后再对比。

**推荐做法**：从设计工具（Figma / Sketch）直接导出，保持原始分辨率，不要手动缩放。

- **Web**：建议导出 1440×900（对应脚本默认 viewport）
- **移动端**：保持设计稿原始尺寸即可

---

## 与 tasks.json 的关联：designRef 字段

每个 screen/widget 任务的 `designRef` 字段应引用**所有相关状态**的截图，用逗号分隔：

```json
{
  "taskId": "T003",
  "type": "screen",
  "name": "LoginPage",
  "designRef": "docs/designs/screenshots/reference/账号/01_login.png, docs/designs/screenshots/reference/账号/01_login_error.png",
  "businessRules": [
    "账号或密码错误时显示「账号或密码不正确」",
    "登录中禁用登录按钮并显示 loading"
  ]
}
```

**为什么引用多张**：`/code` 执行时会 Read 所有 `designRef` 图片，AI 能同时看到默认态和错误态，实现时就不会漏掉错误提示的样式和布局。

---

## /visual-qa 使用方式

### 对比默认态（最常用）

```bash
# Web 项目（自动启动 dev server）
/visual-qa docs/designs/screenshots/reference/账号/01_login.png web

# 移动端（自动检测设备）
/visual-qa docs/designs/screenshots/reference/账号/01_login.png android
/visual-qa docs/designs/screenshots/reference/账号/01_login.png ohos

# 自动检测平台（有 adb/hdc 设备→移动端，否则→web）
/visual-qa docs/designs/screenshots/reference/账号/01_login.png
```

### 对比交互态（需先手动触发）

交互态没有自动触发机制，需要**先把应用操作到目标状态**，再运行命令：

```bash
# 步骤示例（登录错误态）：
# 1. 打开 App/浏览器，导航到登录页
# 2. 输入一个错误的账号密码，点击登录，等错误提示出现
# 3. 不要做其他操作，保持错误态在屏幕上
# 4. 执行：
/visual-qa docs/designs/screenshots/reference/账号/01_login_error.png
```

### 指定设备 ID（多设备时）

```bash
adb devices        # 查询 Android 设备
hdc list targets   # 查询鸿蒙设备

/visual-qa reference/01_login.png android R3CR40XXXXX
/visual-qa reference/01_login.png ohos 127.0.0.1:5555
```

---

## 评分标准

| 级别 | RMSE 阈值 | 含义 | 不通过时 |
|------|-----------|------|---------|
| **P0 结构** | < 0.20 | 整体布局必须对 | 阻塞，必须修复 |
| **P1 视觉 Token** | < 0.10 | 颜色/间距/字体（≥90% 相似） | 建议修复 |
| **P2 像素级** | < 0.05 | 像素精确（≥95% 相似） | 记录，不阻塞 |

**注意**：
- 移动端系统状态栏（时间、信号、电量）会拉高 RMSE，以 `side-by-side.png` 肉眼判断为准
- Web 端若有动态内容（轮播图、实时数据），RMSE 会偏高，同样以肉眼为准

---

## 哪些差异可以接受，不必修复

| 差异类型 | 处置 |
|---------|------|
| 移动端系统状态栏内容不同（时间/信号） | 接受，P2 级别记录 |
| 字体渲染微差（抗锯齿、浏览器差异） | 接受，P2 级别记录 |
| 空列表 vs 设计稿有数据 | 接受，报告里注明 |
| 设计稿与 PRD 规则矛盾 | 让用户决定以哪个为准 |
| 3 轮修复后仍未收敛 | 停下，人工介入 |
