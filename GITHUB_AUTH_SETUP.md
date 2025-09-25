# TinyAuth GitHub OAuth 配置指南

## 概述

本项目集成了 TinyAuth 认证服务，支持 GitHub OAuth 登录功能。用户可以通过 GitHub 账户直接登录系统。

## GitHub OAuth 应用设置

### 1. 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**: `http://localhost:3000` (或你的前端域名)
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
   - **Description**: 应用描述（可选）

### 2. 获取客户端凭证

创建应用后，你将获得：
- **Client ID**: GitHub OAuth 客户端 ID
- **Client Secret**: GitHub OAuth 客户端密钥（需要生成）

## 环境配置

### 1. 创建 .env 文件

```bash
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的 GitHub OAuth 凭证：

```env
# GitHub OAuth 配置
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret

# TinyAuth 配置
TINYAUTH_SECRET=your-secure-jwt-secret-change-this
SECRET_KEY=your-secure-secret-key-change-this
```

## 启动服务

```bash
# 使用 docker-compose 启动所有服务
docker-compose up -d

# 或者分别启动
docker-compose up tinyauth redis -d  # 启动认证和缓存服务
docker-compose up backend -d         # 启动后端服务
```

## 认证流程

### 1. GitHub OAuth 登录流程

1. 前端重定向用户到: `GET /auth/github/login`
2. 用户授权后，GitHub 重定向到: `/auth/github/callback?code=xxx`
3. TinyAuth 交换 code 获取 access_token
4. 使用 access_token 获取用户 GitHub 信息
5. 创建或更新用户账户
6. 返回 JWT token 给前端

### 2. API 认证

所有需要认证的 API 请求都需要在 Header 中包含：

```http
Authorization: Bearer <jwt_token>
```

### 3. 权限级别

- **普通用户**: 只能管理自己的数据
- **管理员**: 可以管理所有用户的数据

## API 端点示例

### 公开端点（无需认证）
- `GET /api/profile/{username}/info` - 获取用户公开资料
- `GET /api/projects/{username}` - 获取用户公开项目
- `GET /api/timeline/{username}` - 获取用户公开时间线

### 认证端点（需要 JWT Token）
- `PUT /api/profile/{username}/info` - 更新用户资料
- `POST /api/admin/{username}/projects` - 创建项目
- `DELETE /api/admin/{username}/projects/{id}` - 删除项目

## 前端集成示例

### React/Next.js 示例

```javascript
// GitHub 登录
const handleGitHubLogin = () => {
  window.location.href = 'http://localhost:3001/auth/github/login';
};

// 处理回调并存储 token
const handleAuthCallback = (token) => {
  localStorage.setItem('authToken', token);
  // 重定向到应用主页
};

// 发送认证请求
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
```

## 安全注意事项

1. **生产环境**：
   - 更改所有默认密钥
   - 使用 HTTPS
   - 配置正确的 CORS origins

2. **GitHub OAuth**：
   - 在生产环境中使用正确的回调 URL
   - 定期轮换客户端密钥

3. **JWT Token**：
   - 合理设置过期时间
   - 实现 refresh token 机制（可选）

## 故障排除

### 1. GitHub 登录失败
- 检查 Client ID 和 Secret 是否正确
- 确认回调 URL 配置正确
- 检查 CORS 设置

### 2. 认证失败
- 确认 JWT_SECRET 在所有服务中一致
- 检查 token 格式是否为 `Bearer <token>`
- 验证 token 是否过期

### 3. 权限不足
- 确认用户角色设置正确
- 检查接口权限配置

## 开发调试

```bash
# 查看 TinyAuth 日志
docker-compose logs tinyauth

# 查看后端日志
docker-compose logs backend

# 查看所有服务状态
docker-compose ps
```