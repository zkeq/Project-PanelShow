"""
极简JSON后端 - 所有API路由
"""
from fastapi import FastAPI, HTTPException, Depends, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict, List, Union
from datetime import timedelta
import db
import auth

app = FastAPI(title="极简JSON后端", version="2.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 辅助函数 ====================

def check_bound_username(current_user: dict, username: str):
    """检查用户是否绑定了用户名，以及是否匹配"""
    bound_username = current_user.get("bound_username")
    if not bound_username:
        raise HTTPException(status_code=400, detail="请先绑定用户名")

    if bound_username != username:
        raise HTTPException(status_code=403, detail="只能管理绑定的用户数据")

    return bound_username


# ==================== 认证接口 ====================

@app.post("/api/auth/login", tags=["认证系统"])
async def admin_login(username: str = Body(...), password: str = Body(...)):
    """管理员账号密码登录"""
    user = auth.authenticate_admin(username, password)

    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    access_token = auth.create_access_token(
        data={"auth_type": "admin"},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "role": "admin",
            "auth_type": "admin"
        }
    }


@app.get("/api/auth/github/login", tags=["认证系统"])
async def github_login():
    """GitHub OAuth 登录 - 返回授权URL"""
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={auth.GITHUB_CLIENT_ID}"
        f"&redirect_uri={auth.GITHUB_REDIRECT_URI}"
        f"&scope=read:user user:email"
    )
    return {"auth_url": github_auth_url}


@app.get("/api/auth/github/callback", tags=["认证系统"])
async def github_callback(code: str):
    """GitHub OAuth 回调"""
    # 获取 access_token
    access_token = await auth.github_get_access_token(code)

    # 获取用户信息
    github_user = await auth.github_get_user_info(access_token)

    # 创建 JWT token
    jwt_token = auth.create_access_token(
        data={
            "auth_type": "github",
            "github_id": github_user["id"],
            "github_username": github_user["login"]
        },
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "role": "user",
            "auth_type": "github",
            "github_id": github_user["id"],
            "github_username": github_user["login"]
        }
    }


@app.post("/api/auth/bind-username", tags=["认证系统"])
async def bind_username(
    username: str = Body(..., embed=True),
    current_user: dict = Depends(auth.require_auth)
):
    """绑定用户名"""
    # 检查用户是否存在
    # if not db.user_exists(username):
    #     raise HTTPException(status_code=404, detail="用户不存在")

    # 检查用户名是否已被绑定
    is_bound = auth.is_username_bound(username)

    if current_user["auth_type"] == "admin":
        # 管理员可以强制绑定
        auth.save_admin_binding(username)
        if is_bound:
            return {"message": f"管理员已绑定用户名: {username}（已覆盖之前的绑定）", "username": username}
        return {"message": f"管理员已绑定用户名: {username}", "username": username}

    elif current_user["auth_type"] == "github":
        # GitHub 用户不能绑定已被他人绑定的用户名
        if is_bound:
            # 检查是否是当前用户自己之前绑定的
            github_id = current_user["github_id"]
            current_binding = auth.get_user_binding(github_id)
            if current_binding == username:
                # 是自己之前绑定的，允许重新绑定
                auth.save_user_binding(github_id, username)
                return {"message": f"用户已绑定用户名: {username}", "username": username}
            else:
                # 是其他人绑定的，拒绝
                raise HTTPException(status_code=403, detail="该用户名已被他人绑定")

        # 用户名未被绑定，正常绑定
        github_id = current_user["github_id"]
        auth.save_user_binding(github_id, username)
        return {"message": f"用户已绑定用户名: {username}", "username": username}

    else:
        raise HTTPException(status_code=400, detail="无效的认证类型")


@app.get("/api/auth/me", tags=["认证系统"])
async def get_me(current_user: dict = Depends(auth.require_auth)):
    """获取当前用户信息（包含绑定的用户名）"""
    return current_user


@app.get("/api/auth/check-username/{username}", tags=["认证系统"])
async def check_username(username: str):
    """检查用户名是否可用（无需认证）"""
    # 检查用户是否存在
    user_exists = db.user_exists(username)

    # 检查用户名是否已被绑定
    is_bound = auth.is_username_bound(username)

    # 只要未被绑定就可用（不存在或存在但未绑定）
    available = not is_bound

    return {
        "username": username,
        "exists": user_exists,
        "is_bound": is_bound,
        "available": available,
        "message": (
            "用户名已被他人绑定" if is_bound
            else "用户名可用"
        )
    }


# ==================== 用户管理 ====================

@app.post("/api/users", tags=["用户管理"])
async def create_user(
    username: str = Body(..., embed=True),
    current_user: dict = Depends(auth.require_admin)
):
    """创建用户（管理员）"""
    if db.user_exists(username):
        raise HTTPException(status_code=400, detail="用户已存在")

    db.create_user(username)
    return {"message": f"用户 {username} 创建成功"}


@app.put("/api/users/{username}/rename", tags=["用户管理"])
async def rename_user(
    username: str,
    new_username: str = Body(..., embed=True),
    current_user: dict = Depends(auth.require_admin)
):
    """重命名用户（管理员）"""
    try:
        db.rename_user(username, new_username)
        return {"message": f"用户已重命名: {username} -> {new_username}"}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="用户不存在")
    except FileExistsError:
        raise HTTPException(status_code=400, detail="新用户名已存在")


@app.delete("/api/users/{username}", tags=["用户管理"])
async def delete_user(
    username: str,
    current_user: dict = Depends(auth.require_admin)
):
    """删除用户（管理员）"""
    db.delete_user(username)
    return {"message": f"用户 {username} 已删除"}


@app.get("/api/users", tags=["用户管理"])
async def get_users():
    """获取所有用户列表"""
    users = db.get_all_users()
    return {"users": users, "total": len(users)}


# ==================== 项目管理 ====================

@app.post("/api/projects/{username}", tags=["项目管理"])
async def create_project(
    username: str,
    data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """创建项目 - 必须是字典类型（因为需要ID）"""
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")

    # 添加ID
    data["id"] = db.generate_id()
    projects.append(data)

    db.write_json(username, "projects.json", projects)

    return {"message": "项目创建成功", "data": data}


@app.get("/api/projects/{username}", tags=["项目管理"])
async def get_projects(username: str):
    """获取项目列表"""
    projects = db.read_json(username, "projects.json")
    return {"success": True, "data": projects, "total": len(projects)}


@app.get("/api/projects/{username}/{project_id}", tags=["项目管理"])
async def get_project(username: str, project_id: str):
    """获取项目详情（包含关联的时间线）"""
    projects = db.read_json(username, "projects.json")
    project = next((p for p in projects if p.get("id") == project_id), None)

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    # 获取该项目相关的时间线
    timeline = db.read_json(username, "timeline.json")
    project_timeline = [t for t in timeline if t.get("project_id") == project_id]

    # 将时间线添加到项目数据中
    project["timeline_items"] = project_timeline

    return {"success": True, "data": project}


@app.put("/api/projects/{username}/{project_id}", tags=["项目管理"])
async def update_project(
    username: str,
    project_id: str,
    data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """更新项目 - 必须是字典类型（因为需要ID）"""
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")
    project_index = next((i for i, p in enumerate(projects) if p.get("id") == project_id), None)

    if project_index is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    # 保留ID
    data["id"] = project_id
    projects[project_index] = data

    db.write_json(username, "projects.json", projects)
    return {"message": "项目更新成功", "data": data}


@app.delete("/api/projects/{username}/{project_id}", tags=["项目管理"])
async def delete_project(
    username: str,
    project_id: str,
    current_user: dict = Depends(auth.require_auth)
):
    """删除项目"""
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")
    projects = [p for p in projects if p.get("id") != project_id]

    db.write_json(username, "projects.json", projects)
    return {"message": "项目删除成功"}


# ==================== 时间线管理 ====================

@app.post("/api/timeline/{username}", tags=["时间线管理"])
async def create_timeline(
    username: str,
    data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """创建时间线项 - 必须是字典类型（因为需要ID和likes）"""
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    timeline = db.read_json(username, "timeline.json")

    # 添加ID和likes
    data["id"] = db.generate_id()
    data["likes"] = 0
    timeline.append(data)

    db.write_json(username, "timeline.json", timeline)

    return {"message": "时间线创建成功", "data": data}


@app.get("/api/timeline/{username}", tags=["时间线管理"])
async def get_timeline(username: str):
    """获取时间线列表"""
    timeline = db.read_json(username, "timeline.json")
    return {"success": True, "data": timeline, "total": len(timeline)}


@app.post("/api/timeline/{username}/{timeline_id}/like", tags=["时间线管理"])
async def like_timeline(username: str, timeline_id: str):
    """点赞时间线（递增）"""
    timeline = db.read_json(username, "timeline.json")
    item = next((t for t in timeline if t.get("id") == timeline_id), None)

    if not item:
        raise HTTPException(status_code=404, detail="时间线项不存在")

    # 递增点赞数
    item["likes"] = item.get("likes", 0) + 1

    db.write_json(username, "timeline.json", timeline)
    return {"message": "点赞成功", "likes": item["likes"]}


@app.delete("/api/timeline/{username}/{timeline_id}", tags=["时间线管理"])
async def delete_timeline(
    username: str,
    timeline_id: str,
    current_user: dict = Depends(auth.require_auth)
):
    """删除时间线项"""
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    timeline = db.read_json(username, "timeline.json")
    timeline = [t for t in timeline if t.get("id") != timeline_id]

    db.write_json(username, "timeline.json", timeline)
    return {"message": "时间线删除成功"}


# ==================== 个人资料（分板块） ====================

@app.get("/api/profile/{username}/{section}", tags=["个人资料管理"])
async def get_profile_section(username: str, section: str):
    """获取个人资料的某个板块

    支持的板块：profile, users, experiences, quickLinks
    """
    # 读取完整的profile数据
    profile_data = db.read_json(username, "profile.json")

    # 获取指定板块
    section_data = profile_data.get(section, {} if section in ['profile', 'users'] else [])

    return {"success": True, "data": section_data}


@app.put("/api/profile/{username}/{section}", tags=["个人资料管理"])
async def update_profile_section(
    username: str,
    section: str,
    data: Any = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """更新个人资料的某个板块

    支持的板块：profile, users, experiences, quickLinks
    支持任意JSON类型：字典、列表等
    """
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    # 读取完整的profile数据
    profile_data = db.read_json(username, "profile.json")

    # 更新指定板块（支持任意类型）
    profile_data[section] = data

    # 保存
    db.write_json(username, "profile.json", profile_data)

    return {"message": f"{section} 更新成功", "data": data}


# ==================== 用户设置（按类型） ====================

@app.get("/api/settings/{username}/{setting_type}", tags=["设置管理"])
async def get_settings_by_type(
    username: str,
    setting_type: str,
    current_user: dict = Depends(auth.require_auth)
):
    """获取指定类型的设置

    每个类型对应一个独立的JSON文件: settings_{type}.json
    """
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    # 读取指定类型的设置文件
    settings = db.read_json(username, f"settings_{setting_type}.json")

    return {"success": True, "data": settings}


@app.put("/api/settings/{username}/{setting_type}", tags=["设置管理"])
async def update_settings_by_type(
    username: str,
    setting_type: str,
    data: Any = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """更新指定类型的设置

    每个类型对应一个独立的JSON文件: settings_{type}.json
    支持任意JSON类型：可以是字典、列表等
    """
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    # 保存到指定类型的设置文件（支持任意JSON类型）
    db.write_json(username, f"settings_{setting_type}.json", data)

    return {"message": f"设置 {setting_type} 更新成功", "data": data}


# ==================== 根路径 ====================

@app.get("/", tags=["系统"])
async def root():
    """API根路径"""
    return {
        "name": "极简JSON后端",
        "version": "2.0.0",
        "description": "前端传什么JSON就存什么JSON",
        "features": [
            "无数据验证",
            "自由字段",
            "JWT认证",
            "时间线点赞",
            "用户改名"
        ]
    }


@app.get("/health", tags=["系统"])
async def health():
    """健康检查"""
    return {"status": "ok"}
