"""Scoped Agent credentials and public portfolio submissions."""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import re
import secrets
import sqlite3
import time
from base64 import urlsafe_b64encode
from datetime import datetime, timezone
from typing import Annotated, Literal
from urllib.parse import quote

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, Response
from fastapi.routing import APIRoute
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, StringConstraints, field_validator

import auth
import db
import notifications
from cos_client import CosConfigError, CosUploadError, build_cos_key, cos_upload_matches, public_cos_url, sign_cos_upload

KEY_TTL = 7 * 24 * 60 * 60
KEY_ISSUE_WINDOW = 60 * 60
UPLOAD_TTL = 15 * 60
MAX_ASSET_BYTES = 8 * 1024 * 1024
MAX_ASSETS = 48
OVERVIEW_SIZE = 24
HOMEPAGE_OVERVIEW_SIZE = 4
SIDEBAR_OVERVIEW_SIZE = 8
HERO_OVERVIEW_SIZE = 3
SITE_NAME = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}")
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Summary = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=400)]
AssetId = Annotated[str, StringConstraints(pattern=r"^[0-9a-f]{32}$")]
IconifyId = Annotated[str, StringConstraints(
    strip_whitespace=True, max_length=128, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$"
)]
IMAGE_EXTENSIONS = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}


class AgentRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()
        if self.path != "/api/agent/v1/assets" or "POST" not in self.methods:
            return handler

        async def metadata_only(request: Request) -> Response:
            media_type = request.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
            if media_type != "application/json":
                raise HTTPException(415, "此接口仅接收 JSON 上传信息，请按发布 schema 直传 COS")
            return await handler(request)

        return metadata_only


router = APIRouter(prefix="/api/agent", tags=["Agent 发布"], route_class=AgentRoute)


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class IssueKey(Input):
    project_id: str | None = Field(default=None, min_length=1, max_length=160)


class AssetUpload(Input):
    content_type: Literal["image/png", "image/jpeg", "image/webp"]
    size: int = Field(strict=True, ge=1, le=MAX_ASSET_BYTES, description="文件实际字节数。")


class Screenshot(Input):
    asset_id: AssetId = Field(description="由当前 SK 申请、直传 COS 并确认完成的 asset_id。")
    title: ShortText | None = Field(default=None, description="在图集中展示的简短图片标题。")
    caption: Summary = Field(description="说明画面中的具体功能、操作或状态。")


class Highlight(Input):
    title: ShortText = Field(description="亮点名称，按项目区分度从高到低排列。")
    description: Summary = Field(description="可快速扫读的关键机制和可见结果。")
    technologies: list[ShortText] = Field(default_factory=list, max_length=6, description="这一亮点实际用到的技术。")
    screenshots: list[Screenshot] = Field(default_factory=list, max_length=8, description="该亮点的图集。没有截图能力时可省略。")
    demo_url: AnyHttpUrl | None = Field(default=None, description="打开即可体验此功能的公开链接。")
    icon: IconifyId | None = Field(default=None, description="从 Iconify 官方目录选择的亮点图标。")


class ProjectInfo(Input):
    label: ShortText = Field(description="概览卡片的唯一短标题。", examples=["数据存储"])
    value: ShortText = Field(description="用于概览、首页及侧栏的简短静态文字。", examples=["MySQL"])
    icon: IconifyId = Field(
        description="概览、首页和侧栏共用的 Iconify 图标。先查官方目录，再填图标集:图标名。",
        examples=["lucide:database", "logos:vue"],
    )


class Submission(Input):
    slug: str | None = Field(
        default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=64,
        description="仅新建可用的链接前缀，服务会补上唯一后缀。",
    )
    name: ShortText | None = Field(default=None, description="公开作品名称。")
    description: Summary | None = Field(default=None, description="首页卡片上的一句话项目简介。")
    introduction: str | None = Field(
        default=None, max_length=24000, description="详情页的 Markdown 项目说明，便于扫读关键技术、机制和亮点。"
    )
    tags: list[ShortText] | None = Field(default=None, max_length=8, description="项目分类标签。")
    status: Literal["active", "building", "iterated", "archived"] | None = Field(
        default=None, description="项目状态，按实际进展填写。"
    )
    source_url: AnyHttpUrl | None = Field(default=None, description="可公开访问的源代码地址。")
    demo_url: AnyHttpUrl | None = Field(default=None, description="项目的主要公开演示入口。")
    is_open_source: bool | None = Field(default=None, description="为 true 时需要公开源码地址。")
    screenshots: list[Screenshot] | None = Field(
        default=None, max_length=12, description="项目主图集，首张为封面。没有截图能力时可省略。"
    )
    highlights: list[Highlight] | None = Field(
        default=None, max_length=8, description="特色功能卡片，可各自提供演示链接和图集。"
    )
    overview: list[ProjectInfo] | None = Field(
        default=None, min_length=OVERVIEW_SIZE, max_length=OVERVIEW_SIZE,
        description="依展示优先级排列的 24 个概览项，每项包含标题、静态值和图标。",
    )

    @field_validator("overview")
    @classmethod
    def unique_overview_labels(cls, value: list[ProjectInfo] | None) -> list[ProjectInfo] | None:
        if value is not None and len({item.label.casefold() for item in value}) != len(value):
            raise ValueError("Overview labels must be unique")
        return value

    @field_validator("introduction")
    @classmethod
    def validate_markdown(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Introduction must contain text")
        if re.search(r"<\s*/?\s*[a-z][a-z0-9-]*(?:\s|/?>)", value, re.I):
            raise ValueError("Use Markdown without raw HTML")
        return value


def initialize(connection: sqlite3.Connection) -> None:
    # Execute each DDL statement inside the caller's transaction.
    connection.execute("""
        CREATE TABLE IF NOT EXISTS agent_keys (
            id TEXT PRIMARY KEY, digest TEXT NOT NULL UNIQUE, owner TEXT NOT NULL,
            site TEXT NOT NULL, target TEXT, revision TEXT, expires_at INTEGER NOT NULL,
            revoked INTEGER NOT NULL DEFAULT 0, request_key TEXT, request_digest TEXT,
            result TEXT
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS agent_onboarding (
            owner TEXT PRIMARY KEY
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS agent_assets (
            id TEXT PRIMARY KEY, key_id TEXT NOT NULL, path TEXT NOT NULL,
            committed INTEGER NOT NULL DEFAULT 0
        )
    """)
    connection.execute("""
        CREATE TABLE IF NOT EXISTS agent_submissions (
            key_id TEXT NOT NULL, request_key TEXT NOT NULL, request_digest TEXT NOT NULL,
            result TEXT NOT NULL, PRIMARY KEY (key_id, request_key)
        )
    """)
    connection.execute("CREATE INDEX IF NOT EXISTS agent_assets_key ON agent_assets (key_id)")
    connection.execute("CREATE INDEX IF NOT EXISTS agent_keys_owner ON agent_keys (owner, site)")

    version = connection.execute("PRAGMA user_version").fetchone()[0]
    if version < 1:
        asset_fields = {row["name"] for row in connection.execute("PRAGMA table_info(agent_assets)")}
        if "committed" not in asset_fields:
            connection.execute("ALTER TABLE agent_assets ADD COLUMN committed INTEGER NOT NULL DEFAULT 0")
            connection.execute("UPDATE agent_assets SET committed = 1 WHERE key_id IN (SELECT id FROM agent_keys WHERE result IS NOT NULL)")
        connection.execute("""
            INSERT OR IGNORE INTO agent_submissions
            SELECT id, request_key, request_digest, result FROM agent_keys
            WHERE result IS NOT NULL AND request_key IS NOT NULL AND request_digest IS NOT NULL
        """)
        connection.execute(
            "UPDATE agent_keys SET expires_at = expires_at + ? WHERE revoked = 0 AND expires_at > ?",
            (KEY_TTL - KEY_ISSUE_WINDOW, int(time.time())),
        )
    if version < 2:
        connection.execute("ALTER TABLE agent_assets ADD COLUMN cos_key TEXT")
        connection.execute("ALTER TABLE agent_assets ADD COLUMN content_type TEXT")
        connection.execute("ALTER TABLE agent_assets ADD COLUMN byte_count INTEGER")
        connection.execute("ALTER TABLE agent_assets ADD COLUMN verified INTEGER NOT NULL DEFAULT 0")
        connection.execute("UPDATE agent_assets SET verified = 1 WHERE cos_key IS NULL")
        connection.execute("PRAGMA user_version = 2")


def owner_from_session(user: dict) -> tuple[str, str]:
    auth_type = user["auth_type"]
    site = user.get("bound_username")
    if not isinstance(site, str) or not SITE_NAME.fullmatch(site):
        raise HTTPException(403, "请先绑定有效的作品集站点")
    identity = "admin" if auth_type == "admin" else user[f"{auth_type}_id"]
    return f"{auth_type}:{identity}", site


def current_site(owner: str) -> str | None:
    provider, _, identity = owner.partition(":")
    return auth.get_admin_binding() if provider == "admin" else auth.get_user_binding(identity)


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def agent_secret(key_id: str) -> str:
    context = f"panelshow:agent-key:v1:{key_id}".encode()
    secret = hmac.digest(auth.SECRET_KEY.encode(), context, "sha256")
    return f"pps_sk_{urlsafe_b64encode(secret).decode().rstrip('=')}"


def recover_agent_secret(row: sqlite3.Row) -> str | None:
    secret = agent_secret(row["id"])
    return secret if hmac.compare_digest(digest(secret), row["digest"]) else None


def revision(project: dict) -> str:
    return digest(json.dumps(project, sort_keys=True, ensure_ascii=False))


def find_project(projects: list, project_id: str) -> dict | None:
    return next(
        (item for item in projects if isinstance(item, dict) and item.get("id") == project_id),
        None,
    )


def key_info(row: sqlite3.Row) -> dict:
    if row["revoked"]:
        status = "revoked"
    elif row["expires_at"] <= time.time():
        status = "expired"
    else:
        status = "ready"
    return {
        "id": row["id"],
        "project_id": row["target"],
        "expires_at": row["expires_at"],
        "status": status,
        "recoverable": status == "ready" and recover_agent_secret(row) is not None,
        "result": json.loads(row["result"]) if row["result"] else None,
    }


@router.get("/onboarding")
async def onboarding(user: dict = Depends(auth.require_auth)) -> dict:
    owner, site = owner_from_session(user)
    with db.project_write() as connection:
        initialize(connection)
        seen = connection.execute(
            "SELECT 1 FROM agent_onboarding WHERE owner = ?", (owner,)
        ).fetchone()
        has_projects = bool(db.read_json(site, "projects.json"))
    return {"show": not seen and not has_projects}


@router.post("/onboarding/dismiss", status_code=204, response_class=Response)
async def dismiss_onboarding(user: dict = Depends(auth.require_auth)) -> Response:
    owner, _ = owner_from_session(user)
    with db.project_write() as connection:
        initialize(connection)
        connection.execute("INSERT OR IGNORE INTO agent_onboarding VALUES (?)", (owner,))
    return Response(status_code=204)


@router.get("/keys")
async def list_keys(user: dict = Depends(auth.require_auth)) -> dict:
    owner, site = owner_from_session(user)
    with db.project_write() as connection:
        initialize(connection)
        rows = connection.execute(
            """SELECT * FROM agent_keys WHERE owner = ? AND site = ?
               ORDER BY rowid DESC LIMIT 10""",
            (owner, site),
        ).fetchall()
    return {"keys": [key_info(row) for row in rows], "site": site}


@router.post("/keys", status_code=201)
async def issue_key(payload: IssueKey, response: Response, user: dict = Depends(auth.require_auth)) -> dict:
    owner, site = owner_from_session(user)
    key_id = secrets.token_hex(16)
    token = agent_secret(key_id)
    expires_at = int(time.time()) + KEY_TTL
    target = payload.project_id
    with db.project_write() as connection:
        initialize(connection)
        recent = connection.execute(
            "SELECT COUNT(*) FROM agent_keys WHERE owner = ? AND expires_at > ?",
            (owner, expires_at - KEY_ISSUE_WINDOW),
        ).fetchone()[0]
        if recent >= 8:
            raise HTTPException(429, "一小时内最多生成 8 把发布密钥，请稍后重试")
        project = find_project(db.read_json(site, "projects.json"), target) if target else None
        if target and project is None:
            raise HTTPException(404, "项目不存在")
        connection.execute(
            """UPDATE agent_keys SET revoked = 1
               WHERE owner = ? AND site = ? AND target IS ? AND expires_at > ? AND revoked = 0""",
            (owner, site, target, int(time.time())),
        )
        connection.execute(
            """INSERT INTO agent_keys (id, digest, owner, site, target, revision, expires_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (key_id, digest(token), owner, site, target, revision(project) if project else None, expires_at),
        )
        connection.execute("INSERT OR IGNORE INTO agent_onboarding VALUES (?)", (owner,))
    response.headers["Cache-Control"] = "no-store"
    return {"id": key_id, "token": token, "expires_at": expires_at, "site": site}


@router.get("/keys/{key_id}/secret")
async def read_key_secret(key_id: str, response: Response, user: dict = Depends(auth.require_auth)) -> dict:
    owner, site = owner_from_session(user)
    with db.project_write() as connection:
        initialize(connection)
        row = connection.execute(
            "SELECT * FROM agent_keys WHERE id = ? AND owner = ? AND site = ?",
            (key_id, owner, site),
        ).fetchone()
        if not row or row["revoked"] or row["expires_at"] <= time.time():
            raise HTTPException(404, "密钥不存在、已过期或已撤销")
        secret = recover_agent_secret(row)
        if not secret:
            raise HTTPException(409, "旧版密钥请重新生成一次")
    response.headers["Cache-Control"] = "no-store"
    return {"id": key_id, "token": secret}


@router.delete("/keys/{key_id}", status_code=204, response_class=Response)
async def revoke_key(key_id: str, user: dict = Depends(auth.require_auth)) -> Response:
    owner, site = owner_from_session(user)
    with db.project_write() as connection:
        initialize(connection)
        cursor = connection.execute(
            "UPDATE agent_keys SET revoked = 1 WHERE id = ? AND owner = ? AND site = ?",
            (key_id, owner, site),
        )
        if not cursor.rowcount:
            raise HTTPException(404, "密钥不存在")
    return Response(status_code=204)


def authorized_key(connection: sqlite3.Connection, token: str) -> sqlite3.Row:
    if not token.startswith("pps_sk_"):
        raise HTTPException(401, "需要 Agent 发布密钥")
    key = connection.execute(
        "SELECT * FROM agent_keys WHERE digest = ?", (digest(token),)
    ).fetchone()
    if not key or key["revoked"] or key["expires_at"] <= time.time():
        raise HTTPException(401, "Agent 密钥无效、已撤销或已过期")
    if current_site(key["owner"]) != key["site"]:
        raise HTTPException(403, "密钥所属站点的绑定已变更")
    return key


@router.get("/v1/schema")
async def publication_schema() -> dict:
    return {
        "schema": Submission.model_json_schema(),
        "asset_upload": {
            "reserve": {
                "method": "POST", "path": "/api/agent/v1/assets", "json_schema": AssetUpload.model_json_schema(),
                "response_fields": ["asset_id", "upload"],
            },
            "transfer": {
                "method": "PUT", "url_field": "upload.url", "headers_field": "upload.headers",
                "body": "图片原始字节，直接发送到 COS。使用签名返回的请求头，不发送 Agent SK。",
                "expires_in": UPLOAD_TTL,
            },
            "complete": {"method": "POST", "path": "/api/agent/v1/assets/{asset_id}/complete"},
            "max_pending_assets_per_key": MAX_ASSETS,
            "max_bytes": MAX_ASSET_BYTES,
            "formats": ["PNG", "JPEG", "WebP"],
            "desktop_capture": {"width": 2560, "height": 1440},
        },
        "publish": {
            "method": "POST",
            "path": "/api/agent/v1/publish",
            "idempotency_header": "Idempotency-Key",
            "create_required": ["name", "description", "introduction", "highlights", "overview"],
            "ordering": "新建排在作品集最前；定向更新保留原有位置。",
        },
        "overview_display": {
            "total": OVERVIEW_SIZE,
            "homepage": HOMEPAGE_OVERVIEW_SIZE,
            "sidebar": SIDEBAR_OVERVIEW_SIZE,
            "hero": HERO_OVERVIEW_SIZE,
            "ordering": "First 4 on the homepage, first 8 in the sidebar, all 24 in the detail grid.",
        },
        "icons": {
            "library": "Iconify",
            "format": "prefix:name",
            "documentation": "https://iconify.design/docs/api/queries.html",
            "collections_url": "https://api.iconify.design/collections",
            "collection_url_template": "https://api.iconify.design/collection?prefix={prefix}",
            "search_url_template": "https://api.iconify.design/search?query={keyword}",
        },
        "authorization": "Bearer <Agent SK>",
        "key": {"valid_days": KEY_TTL // 86400, "reusable": True},
        "result_fields": ["project_id", "url", "operation"],
    }


@router.post("/v1/assets", status_code=201)
async def reserve_asset(
    payload: AssetUpload,
    response: Response,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> dict:
    asset_id = secrets.token_hex(16)
    with db.project_write() as connection:
        initialize(connection)
        key = authorized_key(connection, credentials.credentials)
        count = connection.execute(
            "SELECT COUNT(*) FROM agent_assets WHERE key_id = ? AND committed = 0", (key["id"],)
        ).fetchone()[0]
        if count >= MAX_ASSETS:
            raise HTTPException(409, "此密钥待提交的图片已达到上限")
        try:
            cos_key = build_cos_key(key["site"], "agent-projects", f"{asset_id}{IMAGE_EXTENSIONS[payload.content_type]}")
            url = public_cos_url(cos_key)
            upload = sign_cos_upload(cos_key, payload.content_type, payload.size, UPLOAD_TTL)
        except CosConfigError as exc:
            raise HTTPException(503, "作品集 COS 上传暂不可用") from exc
        connection.execute(
            """INSERT INTO agent_assets (id, key_id, path, cos_key, content_type, byte_count)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (asset_id, key["id"], url, cos_key, payload.content_type, payload.size),
        )
    response.headers["Cache-Control"] = "no-store"
    return {"asset_id": asset_id, "upload": upload}


@router.post("/v1/assets/{asset_id}/complete")
async def complete_asset(
    asset_id: AssetId,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> dict:
    with db.project_write() as connection:
        initialize(connection)
        key = authorized_key(connection, credentials.credentials)
        asset = connection.execute(
            "SELECT * FROM agent_assets WHERE id = ? AND key_id = ? AND cos_key IS NOT NULL",
            (asset_id, key["id"]),
        ).fetchone()
    if asset is None:
        raise HTTPException(404, "图片上传记录不存在")
    if not asset["verified"]:
        try:
            matches = await asyncio.to_thread(cos_upload_matches, asset["cos_key"], asset["content_type"], asset["byte_count"])
        except (CosConfigError, CosUploadError) as exc:
            raise HTTPException(503, "暂时无法核验 COS 图片，请重试确认") from exc
        if not matches:
            raise HTTPException(409, "COS 图片尚未上传或大小与类型不符")
        with db.project_write() as connection:
            authorized_key(connection, credentials.credentials)
            connection.execute("UPDATE agent_assets SET verified = 1 WHERE id = ?", (asset_id,))
    return {"asset_id": asset_id}


STATUS_LABELS = {
    "active": ("活跃项目", "bg-green-500"),
    "building": ("施工中", "bg-yellow-500"),
    "iterated": ("已迭代", "bg-blue-500"),
    "archived": ("已归档", "bg-gray-500"),
}


def project_fields(payload: Submission, assets: dict[str, str]) -> tuple[dict, set[str]]:
    used_assets: set[str] = set()

    def screenshots(items: list[Screenshot]) -> list[dict]:
        result = []
        for index, item in enumerate(items, 1):
            path = assets.get(item.asset_id)
            if path is None:
                raise HTTPException(422, "截图必须由当前密钥上传到 COS 并确认完成")
            used_assets.add(item.asset_id)
            result.append({
                "id": item.asset_id,
                "name": item.title or f"截图 {index}",
                "description": item.caption,
                "url": path,
            })
        return result

    fields = payload.model_dump(include={"name", "description", "tags", "is_open_source"}, exclude_none=True)
    if payload.is_open_source is not None:
        fields["isOpenSource"] = fields.pop("is_open_source")
    for input_field, output_field in (("source_url", "sourceUrl"), ("demo_url", "previewUrl")):
        if input_field in payload.model_fields_set:
            url = getattr(payload, input_field)
            if url and (url.username or url.password):
                raise HTTPException(422, "公开链接不能包含凭证")
            fields[output_field] = str(url) if url else ""
    if payload.introduction is not None:
        fields.update(projectIntroduction=payload.introduction, longDescription=payload.introduction)
    if payload.status is not None:
        label, color = STATUS_LABELS[payload.status]
        fields.update(statusId=payload.status, status={"id": payload.status, "label": label, "color": color})
    if payload.screenshots is not None:
        images = screenshots(payload.screenshots)
        fields.update(screenshots=images, previewImage=images[0]["url"] if images else "")
    if payload.highlights is not None:
        highlights = []
        for index, item in enumerate(payload.highlights, 1):
            if item.demo_url and (item.demo_url.username or item.demo_url.password):
                raise HTTPException(422, "公开链接不能包含凭证")
            highlights.append({
                "id": f"feature-{index}",
                "title": item.title,
                "description": item.description,
                **({"icon": item.icon} if item.icon else {}),
                "previewUrl": str(item.demo_url) if item.demo_url else "",
                "techStack": [{"id": f"tech-{i}", "name": name} for i, name in enumerate(item.technologies)],
                "screenshots": screenshots(item.screenshots),
            })
        fields["featureHighlights"] = highlights
    if payload.overview is not None:
        fields["projectInfos"] = [
            {
                "id": f"info-{index}", "label": item.label, "value": item.value,
                "valueCode": "", "icon": item.icon, "order": index,
                "showInHomepage": index < HOMEPAGE_OVERVIEW_SIZE,
                "showInSidebar": index < SIDEBAR_OVERVIEW_SIZE,
                "showInHero": index < HERO_OVERVIEW_SIZE,
            }
            for index, item in enumerate(payload.overview)
        ]
    return fields, used_assets


def public_url(site: str, project_id: str) -> str:
    return f"{notifications.FRONTEND_BASE_URL.rstrip('/')}/project/{quote(site, safe='')}/{quote(project_id, safe='')}"


@router.post("/v1/publish")
async def publish(
    payload: Submission,
    background: BackgroundTasks,
    request_key: Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=128)],
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> dict:
    request_digest = digest(payload.model_dump_json(exclude_unset=True))
    with db.project_write() as connection:
        initialize(connection)
        key = authorized_key(connection, credentials.credentials)
        receipt = connection.execute(
            "SELECT request_digest, result FROM agent_submissions WHERE key_id = ? AND request_key = ?",
            (key["id"], request_key),
        ).fetchone()
        if receipt:
            if receipt["request_digest"] != request_digest:
                raise HTTPException(409, "此幂等键已用于另一份提交内容")
            return json.loads(receipt["result"])

        site, target = key["site"], key["target"]
        if target and payload.slug:
            raise HTTPException(422, "编辑作品时不能修改地址")
        if not target and not all(
            (payload.name, payload.description, payload.introduction, payload.highlights, payload.overview)
        ):
            raise HTTPException(422, "创建作品需要名称、简介、正文、至少一个亮点和 24 项概览")
        asset_paths = {}
        redirects = db.read_json("_system", "agent_cos_redirects.json")
        for asset in connection.execute(
            "SELECT id, path, cos_key FROM agent_assets WHERE key_id = ? AND verified = 1", (key["id"],)
        ):
            url = asset["path"] if asset["cos_key"] else redirects.get(asset["path"])
            if url:
                asset_paths[asset["id"]] = url
        fields, used_assets = project_fields(payload, asset_paths)
        if not fields:
            raise HTTPException(422, "请提供需要更新的字段")
        projects = db.read_json(site, "projects.json")
        # A stable ID makes a retry safe if the process stops between the JSON write and the receipt commit.
        submission_id = digest(f"{key['id']}:{request_key}")[:12]
        project_id = target or f"{payload.slug or 'project'}-{submission_id}"
        existing = find_project(projects, project_id)
        already_written = existing is not None and all(existing.get(name) == value for name, value in fields.items())
        if target and existing is None:
            raise HTTPException(404, "项目不存在")
        if target and not already_written and revision(existing) != key["revision"]:
            raise HTTPException(409, "作品内容已变更，请重新生成编辑密钥")
        if not target and existing and not already_written:
            raise HTTPException(409, "作品已存在，请重新生成密钥")

        project = {**(existing or {}), **fields}
        if project.get("isOpenSource") and not project.get("sourceUrl"):
            raise HTTPException(422, "开源作品须提供源码地址")
        if not already_written:
            now = datetime.now(timezone.utc).isoformat()
            project.update(id=project_id, updatedAt=now)
            if target:
                projects[projects.index(existing)] = project
            else:
                first_order = min(
                    (db.parse_order_value(p.get("order"), i) for i, p in enumerate(projects) if isinstance(p, dict)),
                    default=1,
                )
                project.update(createdAt=now, order=first_order - 1)
                projects.append(project)
            db.write_json(site, "projects.json", projects)

        result = {"project_id": project_id, "url": public_url(site, project_id), "operation": "update" if target else "create"}
        serialized_result = json.dumps(result)
        connection.execute(
            "INSERT INTO agent_submissions VALUES (?, ?, ?, ?)",
            (key["id"], request_key, request_digest, serialized_result),
        )
        connection.execute(
            "UPDATE agent_keys SET request_key = ?, request_digest = ?, result = ?, revision = ? WHERE id = ?",
            (request_key, request_digest, serialized_result, revision(project) if target else None, key["id"]),
        )
        connection.executemany(
            "UPDATE agent_assets SET committed = 1 WHERE key_id = ? AND id = ?",
            ((key["id"], asset_id) for asset_id in used_assets),
        )

    if not already_written:
        notify = notifications.notify_project_updated if target else notifications.notify_project_created
        background.add_task(notify, site, project)
    return result
