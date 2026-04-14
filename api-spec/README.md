# API 契约 (OpenAPI)

> 后端接口的「事实源头」, 是前后端的合同, 也是前端类型自动生成的输入。

## 目录内容

```
api-spec/
├── README.md         ← 你正在看的这个文件
└── openapi.yaml      ← 后端提供的 OpenAPI 3.x 规范文件 (提交到 git)
```

## 协作流程

```
后端更新接口
    ↓
后端服务给出新的 openapi.yaml (或在 git 仓库更新)
    ↓
前端拉取最新文件, 替换 api-spec/openapi.yaml
    ↓
前端跑 pnpm gen:api → src/types/api.ts 自动更新
    ↓
TS 编译报错告诉你哪些代码受影响
    ↓
按报错修代码 + 改 mock + 改测试 → 全绿
    ↓
git commit (openapi.yaml + 生成的类型文件 + 受影响的代码 一起提交)
```

## 常见操作

```bash
# 拉取后端最新 openapi 后, 重新生成类型
pnpm gen:api

# 查看类型文件
cat src/types/api.ts
```

## 何时需要更新

| 触发场景 | 该做什么 |
|---------|---------|
| 后端发版前通知接口有变 | 拉新 yaml, 跑 gen:api, 修受影响代码 |
| 联调发现字段对不上 | 优先确认是 yaml 落后还是后端实现错, 不要直接改前端代码绕过 |
| 新增接口 | 后端先更新 yaml, 前端再开发 |

## 文件来源约定

- 主源: 后端服务的 OpenAPI 端点 (如 `https://api.dev.example.com/openapi.yaml`)
- 备份: git 仓库 `api-spec/openapi.yaml` (本目录文件)
- **以 git 仓库为准**: 主源可能因后端环境抖动不可用, 但 git 必然可访问

## 注意事项

- ❌ 不要手改 `src/types/api.ts` (会被 gen:api 覆盖)
- ❌ 不要手改 `api-spec/openapi.yaml` 字段定义 (这是后端的约定, 应推动后端改)
- ✅ 如发现 yaml 缺字段/类型错, 先和后端沟通, 由后端更新后再拉取
- ✅ 重大接口变更前, 前后端在 PR 里互相 review yaml 和受影响的代码
