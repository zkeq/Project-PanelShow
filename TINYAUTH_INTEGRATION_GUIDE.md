# TinyAuth + Traefik 集成配置指南

## 1. 添加本地域名解析

在你的 `/etc/hosts` 文件中添加以下行：

```
127.0.0.1 auth.localhost
127.0.0.1 api.localhost
```

### Windows用户：
编辑 `C:\Windows\System32\drivers\etc\hosts`

### macOS/Linux用户：
```bash
sudo nano /etc/hosts
```

## 2. 更新GitHub OAuth应用设置

在GitHub OAuth应用配置中，将Authorization callback URL修改为：
```
http://auth.localhost/api/oauth/callback/github
```

## 3. 重新启动所有服务

```bash
docker compose down
docker compose up -d
```

## 4. 测试完整的认证流程

### 步骤1：访问认证页面
```
http://auth.localhost
```

### 步骤2：GitHub OAuth登录
- 点击GitHub登录按钮
- 完成GitHub授权

### 步骤3：测试受保护的API
登录成功后，访问：
- `http://api.localhost/auth/success` - 查看认证状态
- `http://api.localhost/api/admin/zkeq/dashboard` - 需要认证的管理接口

### 步骤4：测试公开API（无需认证）
- `http://api.localhost/api/profile/zkeq/info` - 公开用户资料
- `http://api.localhost/api/projects/zkeq/` - 公开项目列表

## 5. 工作原理

1. **用户访问** `http://auth.localhost` → TinyAuth登录页面
2. **GitHub OAuth** → 用户通过GitHub认证
3. **TinyAuth设置cookie** → 在 `.localhost` 域下设置认证cookie
4. **访问受保护的API** → Traefik通过TinyAuth中间件验证认证状态
5. **Forward Auth** → TinyAuth返回用户信息头(`X-Forwarded-User`, `X-Forwarded-Email`)
6. **后端API** → 接收认证头信息，识别登录用户

## 6. 服务地址

- **TinyAuth认证**: http://auth.localhost
- **后端API**: http://api.localhost
- **Traefik Dashboard**: http://localhost:8080

## 故障排除

如果遇到问题：
1. 检查hosts文件是否正确配置
2. 确认GitHub OAuth callback URL已更新
3. 检查Docker服务状态：`docker compose ps`
4. 查看服务日志：`docker compose logs tinyauth`