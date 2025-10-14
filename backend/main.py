"""
极简JSON后端 - 所有API路由
"""
from fastapi import FastAPI, HTTPException, Depends, Body, Path, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Any, Dict, List, Optional, Tuple, Union
import math
from datetime import timedelta, datetime, timezone
import copy
import re
from pathlib import Path as FilePath
import uuid

from cos_client import (
    CosConfigError,
    CosUploadError,
    build_cos_key,
    upload_file_to_cos,
)
import db
import auth
import hashlib
import json

app = FastAPI(title="极简JSON后端", version="2.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JS 代码执行缓存（内存缓存）
js_execution_cache: Dict[str, Dict[str, Any]] = {}


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


def parse_order_value(value: Any, fallback: int) -> int:
    if isinstance(value, (int, float)):
        return int(value) if math.isfinite(value) else fallback

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return fallback
        try:
            numeric = float(stripped)
        except ValueError:
            return fallback
        return int(numeric) if math.isfinite(numeric) else fallback

    return fallback


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
    """创建项目 - 必须是字典类型（因为需要ID）

    ID 处理逻辑：
    - 如果用户提供了 id 字段，使用用户提供的 ID
    - 如果没有提供 id，则自动生成 ID
    """
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")

    # ID 处理：优先使用用户提供的 ID，否则生成新 ID
    user_provided_id = data.get("id")
    if isinstance(user_provided_id, str) and user_provided_id.strip():
        # 用户提供了 ID，使用用户提供的
        data["id"] = user_provided_id.strip()
    else:
        # 用户没有提供 ID，自动生成
        data["id"] = db.generate_id()

    # 处理 order
    existing_orders = [
        parse_order_value(project.get("order"), index)
        for index, project in enumerate(projects)
        if isinstance(project, dict)
    ]
    next_order = max(existing_orders, default=-1) + 1
    data["order"] = parse_order_value(data.get("order"), next_order)

    projects.append(data)

    db.write_json(username, "projects.json", projects)

    return {"message": "项目创建成功", "data": data}


@app.get("/api/projects/{username}", tags=["项目管理"])
async def get_projects(username: str):
    """获取项目列表"""
    raw_projects = db.read_json(username, "projects.json")

    ordered_records = []
    for index, project in enumerate(raw_projects):
        if isinstance(project, dict):
            order_value = parse_order_value(project.get("order"), index)
            project["order"] = order_value
            ordered_records.append((order_value, index, project))
        else:
            ordered_records.append((index, index, project))

    ordered_records.sort(key=lambda item: (item[0], item[1]))
    projects = [record[2] for record in ordered_records]

    # 为每个项目处理 projectInfos 分类
    for project in projects:
        if isinstance(project, dict):
            project_infos = project.get("projectInfos", [])
            home_attributes = []
            sidebar_attributes = []
            hero_attributes = []

            for info in project_infos:
                if isinstance(info, dict):
                    if info.get("showInHomepage"):
                        home_attributes.append(info)
                    if info.get("showInSidebar"):
                        sidebar_attributes.append(info)
                    if info.get("showInHero"):
                        hero_attributes.append(info)

            project["homeAttributes"] = home_attributes
            project["sidebarAttributes"] = sidebar_attributes
            project["heroAttributes"] = hero_attributes[:3]

    return {"success": True, "data": projects, "total": len(projects)}


@app.get("/api/tech-stacks/{username}", tags=["项目管理"])
async def get_tech_stack_configuration(username: str):
    """获取技术栈分类配置（公开接口）"""

    projects = get_user_projects_and_ids(username)
    valid_project_ids = extract_valid_project_ids(projects)

    raw_config = db.read_json(username, "settings_techStacks.json")
    normalized = normalize_tech_stack_config(raw_config, valid_project_ids)

    if not normalized.get("categories"):
        default_config = create_default_tech_stack_config(projects)
        normalized = normalize_tech_stack_config(default_config, valid_project_ids)

    project_assignments = normalized.get("projectAssignments", {})

    return {
        "success": True,
        "data": {
            "categories": normalized.get("categories", []),
            "updatedAt": normalized.get("updatedAt"),
            "projectAssignments": project_assignments,
        },
    }


@app.put("/api/tech-stacks/{username}", tags=["项目管理"])
async def update_tech_stack_configuration(
    username: str,
    payload: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth),
):
    """更新技术栈分类配置（需要认证）"""

    check_bound_username(current_user, username)

    projects = get_user_projects_and_ids(username)
    valid_project_ids = extract_valid_project_ids(projects)

    normalized = normalize_tech_stack_config(payload, valid_project_ids)
    normalized_assignments = normalized.get("projectAssignments", {})

    normalized["updatedAt"] = datetime.now(timezone.utc).isoformat()

    data_to_save = {
        "categories": normalized.get("categories", []),
        "updatedAt": normalized.get("updatedAt"),
    }
    db.write_json(username, "settings_techStacks.json", data_to_save)

    update_project_tech_stacks(username, projects, normalized_assignments)

    return {
        "success": True,
        "message": "技术栈设置更新成功",
        "data": {
            "categories": data_to_save["categories"],
            "updatedAt": data_to_save["updatedAt"],
            "projectAssignments": normalized_assignments,
        },
    }


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

    # 处理 projectInfos 分类
    project_infos = project.get("projectInfos", [])
    home_attributes = []
    sidebar_attributes = []
    hero_attributes = []

    for info in project_infos:
        if isinstance(info, dict):
            if info.get("showInHomepage"):
                home_attributes.append(info)
            if info.get("showInSidebar"):
                sidebar_attributes.append(info)
            if info.get("showInHero"):
                hero_attributes.append(info)

    project["homeAttributes"] = home_attributes
    project["sidebarAttributes"] = sidebar_attributes
    project["heroAttributes"] = hero_attributes[:3]

    return {"success": True, "data": project}


@app.put("/api/projects/{username}/{project_id}", tags=["项目管理"])
async def update_project(
    username: str,
    project_id: str,
    data: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """更新项目 - 必须是字典类型（因为需要ID）

    ID 处理逻辑：
    - 优先使用 data 中提供的 id（用户可能通过 JSON 导入修改了 ID）
    - 如果 data 中没有 id，则使用 URL 中的 project_id
    """
    # 检查绑定的用户名
    check_bound_username(current_user, username)

    projects = db.read_json(username, "projects.json")
    project_index = next((i for i, p in enumerate(projects) if p.get("id") == project_id), None)

    if project_index is None:
        raise HTTPException(status_code=404, detail="项目不存在")

    # ID 处理：优先使用用户提供的 ID（如果有的话），否则保持原 ID
    user_provided_id = data.get("id")
    if isinstance(user_provided_id, str) and user_provided_id.strip():
        # 用户提供了新的 ID
        final_id = user_provided_id.strip()
    else:
        # 用户没有提供 ID，使用 URL 中的 project_id
        final_id = project_id

    # 处理 order
    existing_project = projects[project_index] if isinstance(projects[project_index], dict) else {}
    existing_order = parse_order_value(existing_project.get("order"), project_index)
    if "order" in data:
        data["order"] = parse_order_value(data.get("order"), existing_order)
    else:
        data["order"] = existing_order

    data["id"] = final_id
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

    for index, project in enumerate(projects):
        if isinstance(project, dict):
            project["order"] = index

    db.write_json(username, "projects.json", projects)
    return {"message": "项目删除成功"}


@app.post("/api/projects/{username}/reorder", tags=["项目管理"])
async def reorder_projects(
    username: str,
    payload: Dict[str, Any] = Body(...),
    current_user: dict = Depends(auth.require_auth)
):
    """批量更新项目排序"""
    check_bound_username(current_user, username)

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="请求格式错误")

    entries = payload.get("order")
    if not isinstance(entries, list) or len(entries) == 0:
        raise HTTPException(status_code=400, detail="请提供有效的排序数据")

    sanitized: List[Tuple[str, int]] = []
    seen_ids: set[str] = set()

    for index, item in enumerate(entries):
        project_id: Optional[str] = None
        if isinstance(item, str):
            project_id = item.strip()
            order_value = index
        elif isinstance(item, dict):
            raw_id = item.get("id")
            if isinstance(raw_id, str):
                project_id = raw_id.strip()
            order_value = parse_order_value(item.get("order"), index)
        else:
            continue

        if not project_id or project_id in seen_ids:
            continue

        seen_ids.add(project_id)
        sanitized.append((project_id, order_value))

    if not sanitized:
        raise HTTPException(status_code=400, detail="未提供有效的项目ID")

    projects = db.read_json(username, "projects.json")
    project_map: Dict[str, Dict[str, Any]] = {
        project.get("id"): project
        for project in projects
        if isinstance(project, dict) and isinstance(project.get("id"), str)
    }

    missing = [project_id for project_id, _ in sanitized if project_id not in project_map]
    if missing:
        raise HTTPException(status_code=404, detail=f"项目不存在: {', '.join(missing)}")

    sorted_entries = sorted(sanitized, key=lambda item: item[1])
    specified_ids = {project_id for project_id, _ in sanitized}
    ordered_projects: List[Dict[str, Any]] = []

    for position, (project_id, _) in enumerate(sorted_entries):
        project = project_map[project_id]
        project["order"] = position
        ordered_projects.append(project)

    remaining_projects = [
        project for project in projects
        if isinstance(project, dict) and project.get("id") not in specified_ids
    ]

    remaining_with_index = [
        (parse_order_value(project.get("order"), len(ordered_projects) + idx), idx, project)
        for idx, project in enumerate(remaining_projects)
    ]
    remaining_with_index.sort(key=lambda item: (item[0], item[1]))

    for offset, (_, _, project) in enumerate(remaining_with_index, start=len(ordered_projects)):
        project["order"] = offset
        ordered_projects.append(project)

    db.write_json(username, "projects.json", ordered_projects)
    return {"success": True, "data": ordered_projects}


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
    """获取时间线列表，按时间倒序返回"""
    timeline = db.read_json(username, "timeline.json")
    if not isinstance(timeline, list):
        timeline = []

    reversed_timeline = list(reversed(timeline))
    return {"success": True, "data": reversed_timeline, "total": len(reversed_timeline)}


@app.put("/api/timeline/{username}/{timeline_id}", tags=["时间线管理"])
async def update_timeline(
    username: str,
    timeline_id: str,
    data: Dict[str, Any],
    current_user: dict = Depends(auth.require_auth),
):
    """更新指定的时间线项"""
    check_bound_username(current_user, username)

    timeline = db.read_json(username, "timeline.json")
    if not isinstance(timeline, list):
        timeline = []

    for index, item in enumerate(timeline):
        if item.get("id") == timeline_id:
            updated_item = {**item, **data}
            updated_item["id"] = item.get("id", timeline_id)
            if "likes" not in data:
                updated_item["likes"] = item.get("likes", 0)
            timeline[index] = updated_item
            db.write_json(username, "timeline.json", timeline)
            return {"message": "时间线更新成功", "data": updated_item}

    raise HTTPException(status_code=404, detail="时间线项不存在")


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

    try:
        cos_key = build_cos_key(username, safe_category, unique_name)
        cos_url = upload_file_to_cos(
            local_path=str(destination),
            key=cos_key,
            content_type=file.content_type,
        )
    except CosConfigError as exc:
        raise HTTPException(status_code=500, detail=f"COS 配置错误: {exc}")
    except CosUploadError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "success": True,
        "filename": unique_name,
        "url": cos_url,
        "cos_key": cos_key,
        "local_url": relative_url,
        "content_type": file.content_type,
        "size": len(contents)
    }


# ==================== JS 代码执行 ====================

@app.post("/api/execute-js", tags=["工具"])
async def execute_js_code(code: str = Body(..., embed=True)):
    """执行 JS 代码片段并返回结果（带 6 小时缓存）

    安全说明：
    - 使用 Node.js 的 vm 模块执行代码
    - 代码在沙箱环境中运行
    - 限制执行时间为 24 秒
    - 允许访问网络（可以使用 fetch、axios 等）
    - 禁止访问文件系统
    """
    import subprocess
    import tempfile

    # 生成代码的哈希作为缓存 key
    code_hash = hashlib.sha256(code.encode()).hexdigest()

    # 检查缓存
    now = datetime.utcnow()
    if code_hash in js_execution_cache:
        cache_entry = js_execution_cache[code_hash]
        cache_time = cache_entry.get("cached_at")
        if cache_time and (now - cache_time).total_seconds() < 21600:  # 6 小时 = 21600 秒
            return {
                "success": True,
                "result": cache_entry.get("result"),
                "cached": True,
                "cached_at": cache_time.isoformat()
            }

    # 创建临时文件执行代码
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as f:
            # 使用 vm2 模块（如果可用）或 vm 模块执行代码
            # vm2 更安全但需要额外安装，vm 是 Node.js 内置的
            js_code = f'''
const vm = require('vm');

const userCode = `{code}`;

(async () => {{
    try {{
        const sandbox = {{
            console: console,
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval,
            Promise: Promise,
            fetch: typeof fetch !== 'undefined' ? fetch : undefined,
        }};

        const context = vm.createContext(sandbox);

        // 简单包装：将用户代码放在 async 函数中，使用 eval 获取最后的表达式值
        const wrappedCode = `
            (async () => {{
                ${{userCode}}
            }})()
        `;

        const result = await vm.runInContext(wrappedCode, context, {{
            timeout: 24000,
            displayErrors: true
        }});

        console.log(JSON.stringify({{ success: true, result: result }}));
    }} catch (error) {{
        console.log(JSON.stringify({{ success: false, error: error.message }}));
    }}
}})();
'''
            f.write(js_code)
            temp_file = f.name

        # 执行 Node.js
        result = subprocess.run(
            ['node', temp_file],
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=30  # 30 秒总超时（留一些余量）
        )

        # 删除临时文件
        FilePath(temp_file).unlink()

        # 解析结果
        if result.returncode == 0:
            try:
                output = json.loads(result.stdout.strip())
                if output.get("success"):
                    # 缓存结果
                    js_execution_cache[code_hash] = {
                        "result": output.get("result"),
                        "cached_at": now
                    }
                    return {
                        "success": True,
                        "result": output.get("result"),
                        "cached": False
                    }
                else:
                    raise HTTPException(status_code=400, detail=f"执行错误: {output.get('error')}")
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail=f"输出解析失败: {result.stdout}")
        else:
            raise HTTPException(status_code=500, detail=f"执行失败: {result.stderr}")

    except subprocess.TimeoutExpired:
        FilePath(temp_file).unlink()
        raise HTTPException(status_code=408, detail="代码执行超时（24秒）")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Node.js 未安装")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"执行错误: {str(e)}")


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
def slugify(value: str) -> str:
    """将任意字符串转换为安全的 slug."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-")


def create_default_tech_stack_config(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
    """基于默认模板和已有项目生成技术栈配置."""

    template = [
        {
            "id": "backend",
            "label": "技术栈 - 后端",
            "icon": "lucide:cpu",
            "children": [
                {"id": "backend-python", "label": "Python", "icon": "lucide:code-2", "projectIds": []},
                {"id": "backend-go", "label": "Go", "icon": "lucide:code-2", "projectIds": []},
            ],
        },
        {
            "id": "frontend",
            "label": "技术栈 - 前端",
            "icon": "lucide:layers",
            "children": [
                {"id": "frontend-vue", "label": "Vue", "icon": "lucide:code-2", "projectIds": []},
                {"id": "frontend-nextjs", "label": "Next.js", "icon": "lucide:code-2", "projectIds": []},
            ],
        },
    ]

    # 复制模板，避免修改原始数据
    config = {"categories": copy.deepcopy(template), "updatedAt": None}

    # 基于项目已有的 techStacks 字段预填充默认配置
    project_lookup = {}
    for project in projects:
        if isinstance(project, dict):
            project_id = project.get("id")
            if isinstance(project_id, str):
                project_lookup[project_id] = project

    id_to_child = {}
    for category in config["categories"]:
        for child in category.get("children", []):
            id_to_child[child["id"]] = child

    for project_id, project in project_lookup.items():
        tech_stack_ids = project.get("techStacks")
        if isinstance(tech_stack_ids, list):
            for stack_id in tech_stack_ids:
                if isinstance(stack_id, str) and stack_id in id_to_child:
                    child = id_to_child[stack_id]
                    if project_id not in child["projectIds"]:
                        child["projectIds"].append(project_id)

    return config


def normalize_tech_stack_config(
    data: Any,
    valid_project_ids: List[str],
) -> Dict[str, Any]:
    """校验并规范化技术栈配置数据."""

    valid_project_set = set(pid for pid in valid_project_ids if isinstance(pid, str))

    if not isinstance(data, dict):
        data = {}

    categories_input = data.get("categories")
    if not isinstance(categories_input, list):
        categories_input = []

    categories: List[Dict[str, Any]] = []
    seen_category_ids: set[str] = set()
    seen_child_ids: set[str] = set()

    for index, item in enumerate(categories_input):
        if not isinstance(item, dict):
            continue

        raw_label = item.get("label") or item.get("title")
        label = str(raw_label).strip() if raw_label else ""
        if not label:
            label = f"分类 {index + 1}"

        raw_category_id = item.get("id")
        if isinstance(raw_category_id, str) and raw_category_id.strip():
            category_id = raw_category_id.strip()
        else:
            candidate = slugify(label) or f"category-{index + 1}"
            category_id = candidate
        suffix = 1
        base_category_id = category_id
        while category_id in seen_category_ids or not category_id:
            category_id = f"{base_category_id}-{suffix}"
            suffix += 1
        seen_category_ids.add(category_id)

        icon = item.get("icon")
        icon_value = icon if isinstance(icon, str) and icon.strip() else None

        children_input = item.get("children")
        children: List[Dict[str, Any]] = []
        if isinstance(children_input, list):
            for child_index, child_item in enumerate(children_input):
                if not isinstance(child_item, dict):
                    continue

                raw_child_label = child_item.get("label") or child_item.get("title")
                child_label = str(raw_child_label).strip() if raw_child_label else ""
                if not child_label:
                    child_label = f"子分类 {child_index + 1}"

                raw_child_id = child_item.get("id")
                if isinstance(raw_child_id, str) and raw_child_id.strip():
                    child_id = raw_child_id.strip()
                else:
                    candidate_child = slugify(f"{category_id}-{child_label}") or f"{category_id}-{child_index + 1}"
                    child_id = candidate_child
                child_suffix = 1
                base_child_id = child_id
                while child_id in seen_child_ids or not child_id:
                    child_id = f"{base_child_id}-{child_suffix}"
                    child_suffix += 1
                seen_child_ids.add(child_id)

                child_icon = child_item.get("icon")
                child_icon_value = child_icon if isinstance(child_icon, str) and child_icon.strip() else None

                project_ids_value = child_item.get("projectIds")
                normalized_project_ids: List[str] = []
                if isinstance(project_ids_value, list):
                    for raw_project_id in project_ids_value:
                        if isinstance(raw_project_id, str) and raw_project_id in valid_project_set:
                            if raw_project_id not in normalized_project_ids:
                                normalized_project_ids.append(raw_project_id)

                children.append(
                    {
                        "id": child_id,
                        "label": child_label,
                        "icon": child_icon_value,
                        "projectIds": normalized_project_ids,
                    }
                )

        categories.append(
            {
                "id": category_id,
                "label": label,
                "icon": icon_value,
                "children": children,
            }
        )

    # 构建项目与子分类的映射关系
    project_assignments: Dict[str, List[str]] = {}
    for category in categories:
        for child in category.get("children", []):
            for project_id in child.get("projectIds", []):
                project_assignments.setdefault(project_id, []).append(child["id"])

    updated_at = data.get("updatedAt") if isinstance(data.get("updatedAt"), str) else None

    return {"categories": categories, "updatedAt": updated_at, "projectAssignments": project_assignments}


def get_user_projects_and_ids(username: str) -> List[Dict[str, Any]]:
    """获取用户所有项目列表（确保为列表类型）"""

    projects = db.read_json(username, "projects.json")
    if not isinstance(projects, list):
        return []
    return projects


def extract_valid_project_ids(projects: List[Dict[str, Any]]) -> List[str]:
    """从项目列表中提取有效的项目ID"""

    ids: List[str] = []
    for project in projects:
        if isinstance(project, dict):
            project_id = project.get("id")
            if isinstance(project_id, str) and project_id:
                ids.append(project_id)
    return ids


def update_project_tech_stacks(
    username: str,
    projects: List[Dict[str, Any]],
    assignments: Dict[str, List[str]],
):
    """根据分配结果更新项目中的 techStacks 字段"""

    updated = False
    for project in projects:
        if not isinstance(project, dict):
            continue
        project_id = project.get("id")
        if not isinstance(project_id, str):
            continue

        assigned = assignments.get(project_id, [])
        normalized_assigned = sorted(set(assigned))
        existing = project.get("techStacks")

        if normalized_assigned:
            if existing != normalized_assigned:
                project["techStacks"] = normalized_assigned
                updated = True
        else:
            if existing:
                project["techStacks"] = []
                updated = True

    if updated:
        db.write_json(username, "projects.json", projects)

