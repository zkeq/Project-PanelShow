from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import timeline, projects, profile, admin, upload

app = FastAPI(
    title="Project Portfolio API",
    description="后端API服务，为Project-PanelShow前端提供数据支持",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(timeline.router, prefix="/api/timeline", tags=["时间线"])
app.include_router(projects.router, prefix="/api/projects", tags=["项目"])
app.include_router(profile.router, prefix="/api/profile", tags=["个人资料"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理"])
app.include_router(upload.router, prefix="/api/upload", tags=["文件上传"])

# 静态文件服务
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Project Portfolio API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}