# 极简JSON后端 - API文档

## 基础信息

- **服务地址**: `http://localhost:8000`
- **API版本**: 2.0.0
- **认证方式**: JWT Bearer Token

## 目录

- [认证系统](#认证系统)
- [用户管理](#用户管理)
- [项目管理](#项目管理)
- [时间线管理](#时间线管理)
- [个人资料管理](#个人资料管理)
- [设置管理](#设置管理)
- [健康检查](#健康检查)

---

## 认证系统

### 1.1 管理员登录（账号密码）

**接口**: `POST /api/auth/login`

**描述**: 管理员使用账号密码登录

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "role": "admin",
    "auth_type": "admin"
  }
}
```

---

### 1.2 GitHub 登录 - 获取授权URL

**接口**: `GET /api/auth/github/login`

**描述**: 获取 GitHub OAuth 授权URL

**响应**:
```json
{
  "auth_url": "https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=xxx&scope=read:user user:email"
}
```

**使用方式**: 前端将用户重定向到返回的 `auth_url`

---

### 3. GitHub 登录回调

**接口**: `GET /api/auth/github/callback?code=xxx`

**描述**: GitHub OAuth 回调接口，处理授权

**查询参数**:
- `code`: GitHub 返回的授权码

**响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "role": "user",
    "auth_type": "github",
    "github_id": 12345678,
    "github_username": "octocat"
  }
}
```

---

### 4. 绑定用户名

**接口**: `POST /api/auth/bind-username`

**描述**: 登录后绑定一个用户名（管理员或GitHub用户都需要绑定）

**需要认证**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "username": "zkeq"
}
```

**响应**:
```json
{
  "message": "管理员已绑定用户名: zkeq",
  "username": "zkeq"
}
```

**说明**:
- 管理员绑定后，所有操作都针对绑定的用户名数据
- GitHub用户绑定后，只能操作绑定的用户名数据
- 用户名必须已存在（需要先用管理员创建用户）

---

### 5. 获取当前用户信息

**接口**: `GET /api/auth/me`

**描述**: 获取当前登录用户信息，包含绑定的用户名

**需要认证**: 是

**响应**（管理员）:
```json
{
  "role": "admin",
  "auth_type": "admin",
  "bound_username": "zkeq"
}
```

**响应**（GitHub用户）:
```json
{
  "role": "user",
  "auth_type": "github",
  "github_id": 12345678,
  "github_username": "octocat",
  "bound_username": "johndoe"
}
```

---

### 6. 检查用户名可用性

**接口**: `GET /api/auth/check-username/{username}`

**描述**: 检查用户名是否可用（无需认证）

**需要认证**: 否

**路径参数**:
- `username`: 要检查的用户名

**响应**（用户名可用 - 存在但未绑定）:
```json
{
  "username": "testuser",
  "exists": true,
  "is_bound": false,
  "available": true,
  "message": "用户名可用"
}
```

**响应**（用户名可用 - 不存在）:
```json
{
  "username": "newuser",
  "exists": false,
  "is_bound": false,
  "available": true,
  "message": "用户名可用"
}
```

**响应**（用户名不可用 - 已被绑定）:
```json
{
  "username": "zkeq",
  "exists": true,
  "is_bound": true,
  "available": false,
  "message": "用户名已被他人绑定"
}
```

**字段说明**:
- `exists`: 用户是否存在
- `is_bound`: 用户名是否已被绑定
- `available`: 用户名是否可用（只要未被绑定就可用）
- `message`: 友好的状态描述

**可用性规则**:
- ✅ 用户不存在 → **可用**（可以创建并绑定）
- ✅ 用户存在但未绑定 → **可用**（可以直接绑定）
- ❌ 用户存在且已被绑定 → **不可用**（被他人占用）

**使用场景**:
- GitHub 用户在绑定前检查用户名是否可用
- 前端实时验证用户名输入

---

## 用户管理

### 7. 创建用户

**接口**: `POST /api/users`

**描述**: 创建新用户（仅管理员）

**需要认证**: 是（管理员）

**请求体**:
```json
{
  "username": "zkeq"
}
```

**响应**:
```json
{
  "message": "用户 zkeq 创建成功"
}
```

---

### 7. 重命名用户

**接口**: `PUT /api/users/{username}/rename`

**描述**: 重命名用户（仅管理员）

**需要认证**: 是（管理员）

**请求体**:
```json
{
  "new_username": "new_zkeq"
}
```

**响应**:
```json
{
  "message": "用户已重命名: zkeq -> new_zkeq"
}
```

---

### 8. 删除用户

**接口**: `DELETE /api/users/{username}`

**描述**: 删除用户（仅管理员）

**需要认证**: 是（管理员）

**响应**:
```json
{
  "message": "用户 zkeq 已删除"
}
```

---

### 9. 获取所有用户列表

**接口**: `GET /api/users`

**描述**: 获取所有用户列表（无需认证）

**响应**:
```json
{
  "users": ["zkeq", "admin", "johndoe"],
  "total": 3
}
```

---

## 项目管理

### 10. 创建项目

**接口**: `POST /api/projects/{username}`

**描述**: 创建项目（必须是字典类型）

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体**:
```json
{
  "name": "我的项目",
  "description": "项目描述",
  "status": "active"
}
```

**响应**:
```json
{
  "message": "项目创建成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "我的项目",
    "description": "项目描述",
    "status": "active"
  }
}
```

---

### 11. 获取项目列表

**接口**: `GET /api/projects/{username}`

**描述**: 获取用户的所有项目

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "项目1"
    },
    {
      "id": "2",
      "name": "项目2"
    }
  ],
  "total": 2
}
```

---

### 12. 获取项目详情

**接口**: `GET /api/projects/{username}/{project_id}`

**描述**: 获取单个项目详情（自动包含关联的时间线）

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "2981e968-dd6e-4789-b2eb-2c9e3eaede52",
    "name": "测试项目",
    "description": "用于测试时间线关联",
    "timeline_items": [
      {
        "id": "0fdddebd-5b00-410e-8a84-65cd3b1fdccc",
        "title": "项目启动",
        "content": "开始开发测试项目",
        "date": "2025-10-02",
        "project_id": "2981e968-dd6e-4789-b2eb-2c9e3eaede52",
        "likes": 0
      },
      {
        "id": "63018db6-aa6c-4594-a1f6-d99ae681bb52",
        "title": "完成第一阶段",
        "content": "完成了基础功能开发",
        "date": "2025-10-05",
        "project_id": "2981e968-dd6e-4789-b2eb-2c9e3eaede52",
        "likes": 0
      }
    ]
  }
}
```

**说明**:
- 返回的项目数据会自动包含 `timeline_items` 字段
- `timeline_items` 是一个数组，包含所有 `project_id` 与该项目ID匹配的时间线
- 如果没有关联的时间线，`timeline_items` 将是空数组 `[]`

---

### 13. 更新项目

**接口**: `PUT /api/projects/{username}/{project_id}`

**描述**: 更新项目信息

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体**:
```json
{
  "name": "更新后的项目名",
  "description": "更新后的描述"
}
```

**响应**:
```json
{
  "message": "项目更新成功",
  "data": {
    "id": "1",
    "name": "更新后的项目名",
    "description": "更新后的描述"
  }
}
```

---

### 14. 删除项目

**接口**: `DELETE /api/projects/{username}/{project_id}`

**描述**: 删除项目

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**响应**:
```json
{
  "message": "项目删除成功"
}
```

---

## 时间线管理

### 15. 创建时间线

**接口**: `POST /api/timeline/{username}`

**描述**: 创建时间线项（必须是字典类型）

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体**:
```json
{
  "title": "完成了一个新功能",
  "content": "详细内容...",
  "date": "2025-10-02"
}
```

**响应**:
```json
{
  "message": "时间线创建成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "likes": 0,
    "title": "完成了一个新功能",
    "content": "详细内容...",
    "date": "2025-10-02"
  }
}
```

---

### 16. 获取时间线列表

**接口**: `GET /api/timeline/{username}`

**描述**: 获取用户的时间线，按发布时间倒序返回

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "likes": 5,
      "title": "完成项目"
    }
  ],
  "total": 1
}
```

---

### 16.1 更新时间线

**接口**: `PUT /api/timeline/{username}/{timeline_id}`

**描述**: 更新指定的时间线项内容

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体示例**:
```json
{
  "project_id": "project-1",
  "publishedAt": "2024-08-22T10:30:00Z",
  "updateType": "feature",
  "updateTypeMeta": {
    "id": "feature",
    "label": "新功能",
    "color": "#22c55e"
  },
  "changelog": "更新了主要功能模块",
  "assets": {
    "images": [
      { "id": "image-1", "url": "/uploads/demo.png" }
    ]
  }
}
```

**响应**:
```json
{
  "message": "时间线更新成功",
  "data": {
    "id": "timeline-1",
    "project_id": "project-1",
    "publishedAt": "2024-08-22T10:30:00Z",
    "updateType": "feature",
    "changelog": "更新了主要功能模块"
  }
}
```

---

### 17. 点赞时间线

**接口**: `POST /api/timeline/{username}/{timeline_id}/like`

**描述**: 给时间线点赞（递增）

**响应**:
```json
{
  "message": "点赞成功",
  "likes": 6
}
```

---

### 18. 删除时间线

**接口**: `DELETE /api/timeline/{username}/{timeline_id}`

**描述**: 删除时间线项

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**响应**:
```json
{
  "message": "时间线删除成功"
}
```

---

## 个人资料管理

### 19. 获取个人资料板块

**接口**: `GET /api/profile/{username}/{section}`

**描述**: 获取指定板块的个人资料

**支持的板块**: `profile`, `users`, `experiences`, `quickLinks`

**响应**:
```json
{
  "success": true,
  "data": {
    "name": "张三",
    "bio": "全栈开发工程师"
  }
}
```

---

### 20. 更新个人资料板块

**接口**: `PUT /api/profile/{username}/{section}`

**描述**: 更新指定板块（支持任意JSON类型：字典或列表）

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体**（字典类型）:
```json
{
  "name": "张三",
  "bio": "全栈开发工程师"
}
```

**请求体**（列表类型）:
```json
[
  {
    "company": "公司A",
    "position": "工程师"
  },
  {
    "company": "公司B",
    "position": "高级工程师"
  }
]
```

**响应**:
```json
{
  "message": "profile 更新成功",
  "data": { ... }
}
```

---

## 设置管理

### 21. 获取设置

**接口**: `GET /api/settings/{username}/{setting_type}`

**描述**: 获取指定类型的设置

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**说明**: 每个类型对应一个独立文件 `settings_{type}.json`

**响应**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 22. 更新设置

**接口**: `PUT /api/settings/{username}/{setting_type}`

**描述**: 更新指定类型的设置（支持任意JSON类型）

**需要认证**: 是

**权限要求**: 只能操作绑定的用户名数据

**请求体**（字典）:
```json
{
  "theme": "dark",
  "language": "zh-CN"
}
```

**请求体**（列表）:
```json
[
  {"name": "功能A", "enabled": true},
  {"name": "功能B", "enabled": false}
]
```

**响应**:
```json
{
  "message": "设置 projectFeatures 更新成功",
  "data": [ ... ]
}
```

---

## 健康检查

### 23. 健康检查

**接口**: `GET /health`

**描述**: 服务健康检查

**响应**:
```json
{
  "status": "ok"
}
```

---

## 错误响应

所有接口在发生错误时都会返回统一格式：

**400 Bad Request** - 请求参数错误
```json
{
  "detail": "请先绑定用户名"
}
```

**401 Unauthorized** - 未认证或认证失败
```json
{
  "detail": "无效的认证凭证"
}
```

**403 Forbidden** - 权限不足
```json
{
  "detail": "只能管理绑定的用户数据"
}
```

**404 Not Found** - 资源不存在
```json
{
  "detail": "项目不存在"
}
```

---

## 认证流程说明

### 管理员流程

1. **登录**: `POST /api/auth/login` - 使用 admin/admin123
2. **绑定用户名**: `POST /api/auth/bind-username` - 绑定要管理的用户名（如 zkeq）
3. **操作数据**: 使用绑定的用户名进行所有操作

### GitHub用户流程

1. **获取授权URL**: `GET /api/auth/github/login`
2. **用户授权**: 跳转到 GitHub 授权页面
3. **回调处理**: GitHub 回调 `/api/auth/github/callback?code=xxx`
4. **绑定用户名**: `POST /api/auth/bind-username` - 绑定一个用户名
5. **操作数据**: 只能操作绑定的用户名数据

---

## 配置文件

配置文件位于 `config.yaml`:

```yaml
# 管理员配置
admin:
  username: "admin"
  password: "admin123"

# GitHub OAuth 配置
github:
  client_id: "Iv23limIJjAfoyycBZvr"
  client_secret: "b8919e68186a2375b90a6831f3fbb2a9f4ee601e"
  redirect_uri: "http://localhost:8000/api/auth/github/callback"

# JWT 配置
jwt:
  secret_key: "your-secret-key-change-in-production"
  algorithm: "HS256"
  access_token_expire_minutes: 1440  # 24小时
```

---

## 数据存储

- 用户数据存储在 `data/users/{username}/` 目录下
- 每个用户有独立的 JSON 文件：
  - `projects.json` - 项目数据
  - `timeline.json` - 时间线数据
  - `profile.json` - 个人资料（包含多个板块）
  - `settings_{type}.json` - 各类型设置

- 系统数据存储在 `data/users/_system/` 目录下：
  - `user_bindings.json` - GitHub用户绑定关系
  - `admin_binding.json` - 管理员绑定关系
