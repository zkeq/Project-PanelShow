# Repository Guidelines

## 项目结构与模块组织
- **`backend/`**：FastAPI 服务，`main.py` 汇总路由，`auth.py` 负责 JWT/GitHub OAuth，`db.py` 抽象 JSON 存储，业务数据放在 `data/`。部署前请同步 `config.yaml` 中的密钥与白名单配置。
- **`frontend/`**：Next.js 15 + TypeScript 代码位于 `src/`。页面在 `src/app`，复用组件存放 `src/components`，状态容器在 `src/store`，类型定义集中 `src/types`。Tailwind 与 Radix UI 支撑设计体系。
- **基础设施**：`docker-compose.yml` 联动 Nginx、Redis、后端与前端，`nginx/nginx.conf` 处理反向代理和静态资源。脚本 `test_auth.sh` 提供后端认证巡检。

## 构建、测试与开发命令
- `cd backend && python -m uvicorn main:app --reload --port 8000`：本地启动 API，开启热加载调试。
- `cd frontend && npm install && npm run dev`：启动前端开发服务器（默认 3000 端口），可用 `npm run dev:turbo` 试验 Turbopack。
- `docker compose up --build`：按照 Docker 流程同时构建并拉起前后端与 Redis，统一入口为 `http://localhost`。
- `cd frontend && npm run build && npm run lint`：提交前执行构建与 ESLint，确保打包和静态检查通过。
- `cd frontend && npm run start`：在构建后以生产模式验证路由、国际化与 API 代理配置。

## 编码风格与命名规范
- **Python**：遵循 PEP 8，四空格缩进，接口参数与返回值补充类型注解，函数与模块命名使用 `snake_case`，异常使用 `HTTPException` 给出明确提示，提交前可用 `black`/`ruff` 校准格式。
- **TypeScript/React**：组件文件采用 PascalCase，hooks 以 `use` 开头，共享工具保持 `camelCase`。Tailwind 类名按布局 → 间距 → 颜色排序，减少 diff 噪声；复杂组件拆分到 `components/` 的子目录便于维护。
- **配置与数据**：JSON 键维持蛇形命名，环境变量使用大写蛇形（如 `DEV_MODE`、`NEXT_PUBLIC_API_URL`），避免硬编码到仓库。

## 测试指引
- 后端在 8002 端口启动后运行 `bash test_auth.sh`，验证未授权阻断、管理员模拟头等关键流程；新增逻辑时在 `backend/tests/` 补充 `pytest` 用例。
- 前端至少保证 `npm run build`、`npm run lint` 均通过。涉及交互的模块可在 `src/__tests__/` 编写 Playwright 或 Jest 断言，更新快照前先人工确认截图。
- 修改 `backend/data/` 中 JSON 时分支备份，确认与 Redis 缓存一致，可通过 `curl` 或管理界面抽样巡检。
- 提交重要特性前建议补充端到端检查或截图回归记录，覆盖权限边界、国际化与缓存命中等关键路径。

## 提交与 PR 规范
- 提交信息遵循 Conventional Commits，例如 `feat(frontend): 新增项目画廊`、`fix(backend): 调整角色权限`，如使用 emoji 须保持语义清晰。
- Pull Request 需说明动机、主要改动、影响范围，并关联 Issue 或需求链接。前端改动附上关键界面截图，后端改动提供示例请求或响应；请求评审前确认测试和构建状态为绿。

## 安全与配置提示
- 生产环境通过环境变量注入敏感信息，覆盖 `backend/config.yaml` 中默认值；避免将真实密钥、OAuth Client ID 直接提交。
- `backend/data/` 承载线上展示内容，批量编辑前先做备份，必要时逐文件提交，防止 JSON 半成品影响页面；Redis 缓存与文件数据不一致时优先刷新缓存。
