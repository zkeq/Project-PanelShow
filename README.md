<p align="center">
  <h1 align="center">Project-PanelShow</h1>
  <p align="center">现代化个人作品集系统 · 支持多用户、时间线展示与后台管理</p>

  <p align="center">
    <img src="https://img.shields.io/badge/FastAPI-0.115-green" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
  </p>
</p>

---

## ✨ 功能特性

- **多用户作品集** — 每个用户拥有独立的项目主页、时间线与技能标签
- **可视化编辑器** — 拖拽排序项目卡片、Markdown 富文本编辑、代码高亮
- **多种登录方式** — 用户名密码 / GitHub OAuth / TDP OIDC
- **文件上传** — 腾讯云 COS 对象存储集成
- **通知系统** — 项目变更实时推送
- **Docker 一键部署** — Nginx + FastAPI + Next.js + Redis 全套容器化
- **暗色模式** — 完整的亮色/暗色主题切换
- **响应式设计** — 移动端自适应布局

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | [Next.js 15](https://nextjs.org/) (App Router) + React 19 |
| **开发语言** | TypeScript 5 |
| **UI 方案** | Tailwind CSS v4 + Radix UI + shadcn/ui |
| **状态管理** | Zustand |
| **后端框架** | [FastAPI](https://fastapi.tiangolo.com/) |
| **数据存储** | JSON 文件 + Redis 缓存 |
| **认证方案** | JWT + Passlib (bcrypt) + OAuth/OIDC |
| **反向代理** | Nginx |
| **容器化** | Docker Compose |

## 📁 项目结构

```
├── backend/                  # FastAPI 后端服务
│   ├── main.py              # API 路由入口 (~1770 行)
│   ├── auth.py              # 认证模块 (JWT / OAuth / OIDC)
│   ├── db.py                # JSON 文件数据抽象层
│   ├── cos_client.py        # 腾讯云 COS 上传客户端
│   ├── notifications.py     # 通知推送服务
│   ├── config.example.yaml  # ⭐ 配置文件模板
│   ├── requirements.txt     # Python 依赖
│   └── data/                # 业务数据目录 (运行时生成)
│
├── frontend/                 # Next.js 前端应用
│   └── src/
│       ├── app/             # 页面路由 (首页 / 管理 / 分享)
│       ├── components/      # 可复用组件 (ProjectCard, TimelineCard...)
│       ├── store/           # Zustand 状态容器
│       ├── hooks/           # 自定义 Hooks
│       ├── lib/             # 工具函数 & API 客户端
│       └── types/           # TypeScript 类型定义
│
├── nginx/nginx.conf         # Nginx 反向代理配置
├── docker-compose.yml       # 编排全部服务
├── .env.example             # 环境变量示例
└── test_auth.sh             # 认证流程测试脚本
```

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Python](https://www.python.org/) >= 3.10
- [Docker](https://docker.com/) (可选，推荐)

### 方式一：Docker 一键部署（推荐）

```bash
# 1. 克隆仓库
git clone https://cnb.cool/onmicrosoft/Project-PanelShow.git
cd portfolio

# 2. 准备环境变量
cp .env.example .env
cp backend/config.example.yaml backend/config.yaml
# 编辑 .env 和 config.yaml 填入你的密钥和配置

# 3. 启动全部服务
docker compose up -d --build

# 4. 访问
open http://localhost          # 前端页面
open http://localhost/api/docs # API 文档 (Swagger UI)
```

### 方式二：本地开发

```bash
# --- 后端 ---
cd backend
cp config.example.yaml config.yaml
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# --- 新开终端，前端 ---
cd frontend
npm install
npm run dev
# 浏览器打开 http://localhost:3000
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `cd backend && uvicorn main:app --reload --port 8000` | 启动后端 API（热重载） |
| `cd frontend && npm run dev` | 启动前端开发服务器 |
| `cd frontend && npm run dev:turbo` | 使用 Turbopack 加速启动 |
| `npm run build && npm run lint` | 构建生产包 + ESLint 检查 |
| `bash test_auth.sh` | 运行认证流程测试 |
| `docker compose up --build` | Docker 全量构建启动 |

## 🔧 配置说明

### 敏感配置（不入库）

| 文件 | 用途 | 必填 |
|------|------|------|
| `backend/config.yaml` | 密码 / OAuth / JWT / COS 密钥 | 是 |
| `.env` | Redis 地址 / CORS / 开发开关 | 否 |

> ⚠️ **安全提示**：这两个文件已加入 `.gitignore`，绝不要将含真实密钥的版本提交到仓库。部署时通过环境变量或挂载卷注入。

### 配置模板

```bash
cp backend/config.example.yaml backend/config.yaml
vim backend/config.yaml   # 按注释填写各字段
```

## 📋 API 接口概览

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 公开资料 | `/api/{user}/info` | 获取用户公开信息、项目、时间线等 |
| 认证 | `/api/auth/*` | 登录 / 登出 / OAuth 回调 / Token 刷新 |
| 项目管理 | `/api/projects/*` | CRUD + 排序 + 导入导出 |
| 时间线 | `/api/timeline/*` | 经历节点增删改查 |
| 个人设置 | `/api/profile/*` | 技能 / 链接 / 联系方式 |
| 文件上传 | `/api/upload/*` | 图片上传至 COS |
| 通知 | `/api/notifications/*` | 消息推送与读取 |

完整文档启动后访问：`http://localhost:8000/docs`

## 🤝 参与贡献

我们欢迎任何形式的贡献！请遵循以下流程：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

**提交规范**遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 格式调整（不影响功能）
- `refactor:` 重构
- `test:` 测试补充
- `chore:` 构建/工具链变更

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 开源。

---

<p align="center">
  Made with ❤️ by zkeq · <a href="./LICENSE">MIT Licensed</a>
</p>
