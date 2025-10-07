"""
极简JSON后端 - 所有API路由
"""
from fastapi import FastAPI, HTTPException, Depends, Body, Path, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Any, Dict, List, Union
from datetime import timedelta, datetime, timezone
from pathlib import Path as FilePath
import uuid
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

FILE_UPLOAD_ROOT = (FilePath(__file__).parent / "data" / "uploads")
FILE_UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(FILE_UPLOAD_ROOT)), name="uploads")

ALLOWED_IMAGE_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp"
}


def parse_datetime(value: Union[str, None]) -> Union[datetime, None]:
    """尝试解析日期/时间字符串"""
    if not value:
        return None

    if isinstance(value, str):
        cleaned = value.strip()
        if not cleaned:
            return None

        if cleaned.endswith("Z"):
            cleaned = cleaned[:-1] + "+00:00"

        try:
            return datetime.fromisoformat(cleaned)
        except ValueError:
            pass

        for fmt in ("%Y-%m-%d", "%Y/%m/%d"):
            try:
                return datetime.strptime(cleaned, fmt)
            except ValueError:
                continue

    return None


def normalize_datetime(value: datetime) -> datetime:
    """将日期时间转换为无时区的UTC基准，便于比较"""
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


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
async def check_username(username: str, request: Request):
    """检查用户名是否可用（无需认证）"""
    auth_header = request.headers.get("Authorization")
    current_user = None
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        current_user = auth.try_resolve_user_from_token(token)

    if current_user and current_user.get("bound_username") == username:
        return {
            "username": username,
            "exists": True,
            "is_bound": False,
            "available": True,
            "message": "当前账号已绑定该用户名，可继续使用"
        }

    user_exists = db.user_exists(username)
    is_bound = auth.is_username_bound(username)
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
    current_user: dict = Depends(auth.require_auth)
):
    """重命名用户

    - 普通用户：只能重命名自己绑定的用户名
    - 管理员：可以重命名所有用户
    """
    # 检查权限
    if current_user["auth_type"] == "admin":
        # 管理员可以重命名任何用户
        pass
    else:
        # 普通用户只能重命名自己绑定的用户名
        bound_username = current_user.get("bound_username")
        if not bound_username:
            raise HTTPException(status_code=400, detail="请先绑定用户名")
        if bound_username != username:
            raise HTTPException(status_code=403, detail="只能重命名自己绑定的用户名")

    try:
        db.rename_user(username, new_username)

        # 更新绑定关系
        if current_user["auth_type"] == "admin":
            # 更新管理员绑定
            admin_binding = auth.get_admin_binding()
            if admin_binding == username:
                auth.save_admin_binding(new_username)
        else:
            # 更新GitHub用户绑定
            github_id = current_user["github_id"]
            auth.save_user_binding(github_id, new_username)

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


@app.get("/api/projects/{username}/stats/overview", tags=["项目管理"])
async def get_project_stats_overview(
    username: str,
    current_user: dict = Depends(auth.require_auth)
):
    """获取项目与时间线的统计信息"""

    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")
    timeline_items = db.read_json(username, "timeline.json")

    projects = projects if isinstance(projects, list) else []
    timeline_items = timeline_items if isinstance(timeline_items, list) else []

    status_distribution: Dict[str, int] = {}
    latest_project_updated_at: Union[datetime, None] = None

    for project in projects:
        status = str(project.get("status", "unknown") or "unknown")
        status_distribution[status] = status_distribution.get(status, 0) + 1

        updated_at_value = project.get("updatedAt") or project.get("updated_at")
        parsed_updated_at = parse_datetime(updated_at_value)
        if parsed_updated_at and (
            latest_project_updated_at is None
            or normalize_datetime(parsed_updated_at) > normalize_datetime(latest_project_updated_at)
        ):
            latest_project_updated_at = parsed_updated_at

    total_timeline = len(timeline_items)
    this_month_timeline = 0
    latest_timeline_entry: Union[datetime, None] = None

    now_utc = datetime.utcnow()
    for item in timeline_items:
        published_value = (
            item.get("publishedAt")
            or item.get("published_at")
            or item.get("date")
        )
        published_at = parse_datetime(published_value)
        if not published_at:
            continue

        normalized_published = normalize_datetime(published_at)

        if normalized_published.year == now_utc.year and normalized_published.month == now_utc.month:
            this_month_timeline += 1

        if (
            latest_timeline_entry is None
            or normalize_datetime(published_at) > normalize_datetime(latest_timeline_entry)
        ):
            latest_timeline_entry = published_at

    return {
        "success": True,
        "data": {
            "totalProjects": len(projects),
            "statusDistribution": status_distribution,
            "activeProjects": status_distribution.get("active", 0),
            "maintainedProjects": status_distribution.get("maintained", 0),
            "archivedProjects": status_distribution.get("archived", 0),
            "totalTimeline": total_timeline,
            "thisMonthTimeline": this_month_timeline,
            "latestProjectUpdatedAt": normalize_datetime(latest_project_updated_at).isoformat() if latest_project_updated_at else None,
            "latestTimelinePublishedAt": normalize_datetime(latest_timeline_entry).isoformat() if latest_timeline_entry else None,
        }
    }


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


@app.post("/api/profile/{username}/github-sync", tags=["个人资料管理"])
async def sync_github_profile(
    username: str,
    github_username: str = Body(..., embed=True),
    current_user: dict = Depends(auth.require_auth)
):
    """根据 GitHub 用户名同步头像和社交数据"""

    check_bound_username(current_user, username)

    summary = await auth.github_fetch_user_summary(github_username)
    user_data = summary.get("user", {})
    total_stars = summary.get("total_stars", 0)

    profile_data = db.read_json(username, "profile.json")
    profile_section = profile_data.get("profile", {})

    profile_section.update({
        "github": github_username,
        "github_username": github_username,
        "github_avatar_url": user_data.get("avatar_url"),
        "github_profile_url": user_data.get("html_url"),
        "github_followers": user_data.get("followers", 0),
        "github_following": user_data.get("following", 0),
        "github_public_repos": user_data.get("public_repos", 0),
        "github_public_gists": user_data.get("public_gists", 0),
        "github_total_stars": total_stars,
        "github_company": user_data.get("company"),
        "github_location": user_data.get("location"),
        "github_blog": user_data.get("blog"),
        "github_bio": user_data.get("bio"),
        "github_updated_at": datetime.utcnow().isoformat(),
    })

    # 如果没有自定义头像或希望覆盖，则更新头像
    if not profile_section.get("avatar") and user_data.get("avatar_url"):
        profile_section["avatar"] = user_data.get("avatar_url")

    # 如果缺少作者名称，尝试从 GitHub 昵称同步
    if not profile_section.get("name") and user_data.get("name"):
        profile_section["name"] = user_data.get("name")

    profile_data["profile"] = profile_section
    db.write_json(username, "profile.json", profile_data)

    return {
        "success": True,
        "message": "GitHub 信息同步成功",
        "data": profile_section,
        "github_user": user_data,
        "total_stars": total_stars,
    }


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


# ==================== 文件上传 ====================


@app.post("/api/uploads/{username}/images", tags=["文件上传"])
async def upload_image(
    username: str,
    file: UploadFile = File(...),
    category: str = Query("images", description="上传分类，例如 images、covers 等"),
    current_user: dict = Depends(auth.require_auth)
):
    """上传图片文件并返回存储信息"""

    check_bound_username(current_user, username)

    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="仅支持上传 PNG/JPEG/GIF/WEBP 图片")

    contents = await file.read()
    max_size_bytes = 5 * 1024 * 1024  # 5MB
    if len(contents) > max_size_bytes:
        raise HTTPException(status_code=400, detail="文件大小不能超过 5MB")

    original_suffix = FilePath(str(file.filename)).suffix if file.filename else ""
    fallback_suffix = ALLOWED_IMAGE_TYPES[file.content_type]
    file_extension = original_suffix or fallback_suffix

    unique_name = f"{uuid.uuid4().hex}{file_extension}"
    raw_category = category.strip()
    safe_category = "".join(ch for ch in raw_category if ch.isalnum() or ch in {"-", "_"})
    if not safe_category:
        safe_category = "images"

    user_upload_dir = FILE_UPLOAD_ROOT / username / safe_category
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    destination = user_upload_dir / unique_name
    with destination.open("wb") as buffer:
        buffer.write(contents)

    relative_url = f"/uploads/{username}/{safe_category}/{unique_name}"

    return {
        "success": True,
        "filename": unique_name,
        "url": relative_url,
        "content_type": file.content_type,
        "size": len(contents)
    }


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
