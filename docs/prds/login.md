# 用户登录 PRD

> 写 PRD 的核心原则: **小标题即锚点**, 后续 `@prd docs/prds/login.md#<锚点>` 全靠这些标题定位。

## 元信息

| 项       | 值         |
| -------- | ---------- |
| 模块代号 | `login`    |
| 负责人   | [待填写]   |
| 创建日期 | 2026-04-15 |
| 最后更新 | 2026-04-15 |
| 状态     | draft      |

## 背景与目标

为后台管理系统提供统一的身份认证入口。用户通过账号密码登录后获得访问权限, 系统按角色 (管理员 / 普通用户) 控制可访问资源。未登录用户访问任何受保护页面都会被拦截并引导至登录页, 登录后跳转至首页。配套提供注册与忘记密码入口, 降低账号自助恢复的支持成本。

## 名词解释

| 术语            | 含义                                                             |
| --------------- | ---------------------------------------------------------------- |
| access token    | 访问令牌, 短期有效, 每次请求携带                                 |
| refresh token   | 刷新令牌, 长期有效, access token 过期后用于换取新的 access token |
| 管理员 (admin)  | 拥有系统全部功能权限的角色                                       |
| 普通用户 (user) | 拥有受限功能权限的角色                                           |

---

## 功能点 1: 账号密码登录

### 用户故事

作为已注册用户, 我希望通过账号和密码登录后台, 以便进入系统使用对应角色的功能。

### 字段定义

| 字段              | 类型    | 必填 | 校验规则                               | 默认值 |
| ----------------- | ------- | ---- | -------------------------------------- | ------ |
| 账号 (username)   | string  | 是   | [默认假设] 4-32 位, 字母/数字/下划线   | -      |
| 密码 (password)   | string  | 是   | [默认假设] 8-32 位, 必须包含字母和数字 | -      |
| 记住我 (remember) | boolean | 否   | -                                      | false  |

### 业务规则

1. 账号或密码为空时, 登录按钮禁用
2. 账号或密码格式不合法时, 表单 inline 显示错误提示, 登录按钮禁用
3. 账号或密码错误时, 显示「账号或密码错误」, 不区分具体是哪一项错误 (防止账号枚举)
4. 登录成功后, 固定跳转到首页 `/`
5. [默认假设] 勾选「记住我」时, refresh token 有效期延长 (例: 7 天 → 30 天); 不勾选则使用默认有效期
6. 登录成功后, 全局可访问当前用户信息 (至少包含 `userId` / `username` / `role`)
7. 不做图形验证码校验
8. 不做连续失败锁定

### 数据契约 (引用 OpenAPI)

> 字段细节以 OpenAPI 为准。登录相关接口在 `workspace/api-spec/openapi.json` 中暂不存在, 以下为前端基于 PRD 的提议稿。

#### 调用的接口

| 业务操作     | operationId      | 方法 | 路径                | 状态          |
| ------------ | ---------------- | ---- | ------------------- | ------------- |
| 登录         | `login`          | POST | `/api/auth/login`   | 🆕 待后端实现 |
| 获取当前用户 | `getCurrentUser` | GET  | `/api/auth/me`      | 🆕 待后端实现 |
| 刷新 token   | `refreshToken`   | POST | `/api/auth/refresh` | 🆕 待后端实现 |
| 登出         | `logout`         | POST | `/api/auth/logout`  | 🆕 待后端实现 |

#### 错误码映射

| code  | 含义               | 前端处理                                                               |
| ----- | ------------------ | ---------------------------------------------------------------------- |
| 0     | 成功               | -                                                                      |
| 40101 | 账号或密码错误     | 表单上方显示「账号或密码错误」                                         |
| 40102 | 账号已禁用         | 表单上方显示「账号已被禁用, 请联系管理员」                             |
| 40103 | access token 过期  | 静默调用 `refreshToken`, 成功则重发原请求; 失败则清空登录态跳 `/login` |
| 40104 | refresh token 过期 | 清空登录态, 跳 `/login`                                                |
| 50001 | 服务异常           | toast「服务异常, 请稍后重试」                                          |

#### Mock 数据约定

- 在 `workspace/mock/auth.ts` 中提供 `/api/auth/login` / `/api/auth/me` / `/api/auth/refresh` / `/api/auth/logout` 的假数据
- 内置两个测试账号: `admin/admin123` (role=admin), `user/user123` (role=user)
- Mock 返回结构必须 import `paths` 类型自 `@/types/api`, 保证与 OpenAPI 对齐

### 交互流程

```
进入 /login → 输入账号密码 → 前端校验 → 通过则启用登录按钮
→ 点击登录 → loading → 请求 POST /api/auth/login
  ├─ 成功 → 保存 access/refresh token + 用户信息 → 跳 /
  └─ 失败 → 表单上方显示错误信息
```

### 异常场景

| 场景           | 预期行为                               |
| -------------- | -------------------------------------- |
| 接口超时       | 显示「网络异常, 请重试」, 按钮恢复可点 |
| 账号或密码错误 | 表单上方显示错误文案, 密码字段清空     |
| 账号被禁用     | 表单上方显示「账号已被禁用」           |
| 服务端 5xx     | toast「服务异常, 请稍后重试」          |

---

## 功能点 2: 用户注册

### 用户故事

作为未注册的访客, 我希望通过注册入口自助创建账号, 以便登录使用系统。

### 字段定义

| 字段     | 类型   | 必填 | 校验规则                             | 默认值 |
| -------- | ------ | ---- | ------------------------------------ | ------ |
| 账号     | string | 是   | [默认假设] 4-32 位, 字母/数字/下划线 | -      |
| 密码     | string | 是   | [默认假设] 8-32 位, 含字母+数字      | -      |
| 确认密码 | string | 是   | 必须与密码一致                       | -      |

### 业务规则

1. 所有必填字段为空时, 注册按钮禁用
2. 密码与确认密码不一致时, inline 提示「两次密码输入不一致」
3. 账号已被占用时, 接口返回 40201, 表单在账号字段显示「该账号已被注册」
4. [默认假设] 注册成功后, 角色默认为普通用户 (role=user), 管理员由后台另行分配
5. 注册成功后, 跳转到登录页并 toast「注册成功, 请登录」

### 数据契约 (引用 OpenAPI)

#### 调用的接口

| 业务操作 | operationId | 方法 | 路径                 | 状态          |
| -------- | ----------- | ---- | -------------------- | ------------- |
| 注册     | `register`  | POST | `/api/auth/register` | 🆕 待后端实现 |

#### 错误码映射

| code  | 含义               | 前端处理                      |
| ----- | ------------------ | ----------------------------- |
| 0     | 成功               | 跳 `/login` + toast           |
| 40201 | 账号已存在         | 账号字段 inline 错误          |
| 40202 | 密码强度不符合要求 | 密码字段 inline 错误          |
| 50001 | 服务异常           | toast「服务异常, 请稍后重试」 |

### 异常场景

| 场景     | 预期行为                 |
| -------- | ------------------------ |
| 账号重复 | 账号字段 inline 报错     |
| 接口超时 | 按钮恢复可点, toast 提示 |

---

## 功能点 3: 忘记密码 (下迭代实现, 本版本不做)

> 📌 本功能下迭代启动, 待启动前需确认: 凭证载体 (邮箱/手机号) / 验证码策略 / 邮件或短信服务选型。
> 本版不参与 /plan 拆解, 具体字段/规则/接口/错误码待新 PRD 细化。

---

## 功能点 4: 路由守卫与角色权限

### 用户故事

作为系统运维者, 我希望未登录访客无法访问任何受保护页面, 并且不同角色只能看到自己权限范围内的功能。

### 业务规则

1. 除 `/login` / `/register` / `/forgot-password` 外, 所有页面均需登录态
2. 未登录用户访问受保护页面时, 跳转到 `/login`, 并通过 query 参数 `?redirect=<原路径>` 保留原访问目标
3. 登录成功后优先跳转到 `redirect` 指向的路径, 无则跳 `/`
4. 管理员 (role=admin) 可访问全部页面
5. 普通用户 (role=user) 访问管理员专属页面时, 跳转到 `/403`
6. 本 PRD 仅定义权限框架 (登录态校验 + 角色校验 + 跳转逻辑); 具体哪些页面属于「管理员专属」由各功能 PRD 在自己的权限章节声明, 本 PRD 不做列举
7. 用户信息通过 `@umijs/plugin-initial-state` 的 `getInitialState` 初始化, 在全局通过 `useModel('@@initialState')` 访问
8. 角色权限通过 `@umijs/plugin-access` 的 `workspace/src/access.ts` 定义, 页面通过 `wrappers` 或 `Access` 组件校验

### 数据契约

- 页面加载时, `getInitialState` 调用 `getCurrentUser` 获取当前用户; 未登录 (40101 / 40104) 视为无登录态
- 访问令牌 (access token) 过期时, 全局 request 拦截器自动调用 `refreshToken` 续期一次; 失败则清空登录态并跳 `/login`

---

## 功能点 5: 登出

### 用户故事

作为已登录用户, 我希望主动登出, 以便在公共设备上保护账号安全。

### 业务规则

1. 点击登出后, 调用 `/api/auth/logout` 使服务端 token 失效
2. 无论接口是否成功, 前端都清空本地 access/refresh token 与用户信息
3. 登出后跳转到 `/login`

### 数据契约

| 业务操作 | operationId | 方法 | 路径               | 状态          |
| -------- | ----------- | ---- | ------------------ | ------------- |
| 登出     | `logout`    | POST | `/api/auth/logout` | 🆕 待后端实现 |

---

## 接口提议 (OpenAPI stub)

> 以下为前端基于本 PRD 推断的 OpenAPI 草稿, 评审通过后由后端合并进 `workspace/api-spec/openapi.json` (或临时进 `workspace/api-spec/openapi.local.json`)。字段类型待后端最终确认。

```yaml
paths:
  /api/auth/login:
    post:
      operationId: login
      summary: 账号密码登录
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username: { type: string }
                password: { type: string, format: password }
                remember: { type: boolean }
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  code: { type: integer }
                  data:
                    type: object
                    properties:
                      accessToken: { type: string }
                      refreshToken: { type: string }
                      expiresIn:
                        { type: integer, description: access token 有效期秒数 }

  /api/auth/me:
    get:
      operationId: getCurrentUser
      summary: 获取当前登录用户
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  userId: { type: string }
                  username: { type: string }
                  role: { type: string, enum: [admin, user] }
                  avatar: { type: string }

  /api/auth/refresh:
    post:
      operationId: refreshToken
      summary: 用 refresh token 换取新的 access token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken: { type: string }
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  expiresIn: { type: integer }

  /api/auth/logout:
    post:
      operationId: logout
      summary: 登出, 使服务端 token 失效
      responses:
        "200": { description: 成功 }

  /api/auth/register:
    post:
      operationId: register
      summary: 用户注册
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username: { type: string }
                password: { type: string, format: password }
                email: { type: string, format: email }
                phone: { type: string }
      responses:
        "200": { description: 成功 }

```

---

## 验收清单

- [ ] 未登录访问任意受保护页面 → 跳 `/login?redirect=<原路径>`
- [ ] 登录成功 → 跳 `redirect` 或 `/`
- [ ] 登出 → token 清空 + 跳 `/login`
- [ ] access token 过期 → 静默 refresh, 对用户无感
- [ ] refresh token 过期 → 清空登录态 + 跳 `/login`
- [ ] 管理员能访问管理员专属页面, 普通用户会被拦截到 `/403`
- [ ] 所有表单在空 / 格式错误时, 提交按钮禁用或显示 inline 错误
- [ ] 登录 / 注册两个页面在 Chrome / Safari 表现一致
- [ ] 文案全部通过国际化引入, 无硬编码

## 默认假设汇总 (评审会需确认)

> 以下为 AI 按主流方案给出的默认值, 请在评审会上逐条确认接受或修改。评审通过后视为正式规则, 无需回到正文修改标注。

- 账号: 4-32 位字母/数字/下划线
- 密码: 8-32 位, 必须含字母和数字
- 注册后默认角色为普通用户 (role=user), 管理员由后台另行分配
- 「记住我」影响 refresh token 有效期 (7 天 → 30 天)
- 未登录一律跳 `/login`, 使用 `?redirect=<原路径>` 保留原访问目标
- access token 过期时, 全局 request 拦截器静默 refresh 一次, 失败则清登录态跳 `/login`

## 变更记录

| 日期       | 变更内容 | 变更人   |
| ---------- | -------- | -------- |
| 2026-04-15 | 初版, 忘记密码下迭代再做 | [待填写] |
