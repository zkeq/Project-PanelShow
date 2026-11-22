"""Scoped Agent credentials and public portfolio submissions."""
from __future__ import annotations

import hashlib
import json
import os
import re
import secrets
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated, Literal
from urllib.parse import quote

from fastapi import APIRouter, BackgroundTasks, Depends, File, Header, HTTPException, Request, Response, UploadFile
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, StringConstraints, field_validator

import auth
import db
import notifications

router = APIRouter(prefix="/api/agent", tags=["Agent 发布"])
KEY_TTL = 60 * 60
MAX_ASSET_BYTES = 8 * 1024 * 1024
MAX_ASSETS = 48
OVERVIEW_SIZE = 24
HOMEPAGE_OVERVIEW_SIZE = 4
SIDEBAR_OVERVIEW_SIZE = 8
SITE_NAME = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}")
ShortText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Summary = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=400)]
AssetId = Annotated[str, StringConstraints(pattern=r"^[0-9a-f]{32}$")]


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class IssueKey(Input):
    project_id: str | None = Field(default=None, min_length=1, max_length=160)


class Screenshot(Input):
    asset_id: AssetId
    caption: Summary


class Highlight(Input):
    title: ShortText
    description: Summary
    technologies: list[ShortText] = Field(default_factory=list, max_length=6)
    screenshots: list[Screenshot] = Field(default_factory=list, max_length=8)
    demo_url: AnyHttpUrl | None = None


class ProjectInfo(Input):
    label: ShortText
    value: ShortText


class Submission(Input):
    slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=64)
    name: ShortText | None = None
    description: Summary | None = None
    introduction: str | None = Field(default=None, max_length=24000)
    tags: list[ShortText] | None = Field(default=None, max_length=8)
    status: Literal["active", "building", "iterated", "archived"] | None = None
    source_url: AnyHttpUrl | None = None
    demo_url: AnyHttpUrl | None = None
    is_open_source: bool | None = None
    screenshots: list[Screenshot] | None = Field(default=None, max_length=12)
    highlights: list[Highlight] | None = Field(default=None, max_length=8)
    overview: list[ProjectInfo] | None = Field(
        default=None, min_length=OVERVIEW_SIZE, max_length=OVERVIEW_SIZE
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
            id TEXT PRIMARY KEY, key_id TEXT NOT NULL, path TEXT NOT NULL
        )
    """)
    connection.execute("CREATE INDEX IF NOT EXISTS agent_assets_key ON agent_assets (key_id)")
    connection.execute("CREATE INDEX IF NOT EXISTS agent_keys_owner ON agent_keys (owner, site)")


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
    elif row["result"]:
        status = "published"
    elif row["expires_at"] <= time.time():
        status = "expired"
    else:
        status = "ready"
    return {
        "id": row["id"],
        "project_id": row["target"],
        "expires_at": row["expires_at"],
        "status": status,
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
    token = f"pps_sk_{secrets.token_urlsafe(32)}"
    expires_at = int(time.time()) + KEY_TTL
    target = payload.project_id
    with db.project_write() as connection:
        initialize(connection)
        recent = connection.execute(
            "SELECT COUNT(*) FROM agent_keys WHERE owner = ? AND expires_at > ?",
            (owner, expires_at - 3600),
        ).fetchone()[0]
        if recent >= 8:
            raise HTTPException(429, "一小时内最多生成 8 把发布密钥，请稍后重试")
        project = find_project(db.read_json(site, "projects.json"), target) if target else None
        if target and project is None:
            raise HTTPException(404, "项目不存在")
        connection.execute(
            """UPDATE agent_keys SET revoked = 1
               WHERE owner = ? AND site = ? AND target IS ? AND result IS NULL""",
            (owner, site, target),
        )
        connection.execute(
            """INSERT INTO agent_keys (id, digest, owner, site, target, revision, expires_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (key_id, digest(token), owner, site, target, revision(project) if project else None, expires_at),
        )
        connection.execute("INSERT OR IGNORE INTO agent_onboarding VALUES (?)", (owner,))
    response.headers["Cache-Control"] = "no-store"
    return {"id": key_id, "token": token, "expires_at": expires_at, "site": site}


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
            "method": "POST", "path": "/api/agent/v1/assets", "multipart_field": "file",
            "max_assets_per_key": MAX_ASSETS,
        },
        "publish": {
            "method": "POST",
            "path": "/api/agent/v1/publish",
            "idempotency_header": "Idempotency-Key",
            "create_required": ["name", "description", "introduction", "highlights", "overview"],
        },
        "overview_display": {
            "total": OVERVIEW_SIZE,
            "homepage": HOMEPAGE_OVERVIEW_SIZE,
            "sidebar": SIDEBAR_OVERVIEW_SIZE,
            "ordering": "First 4 on the homepage, first 8 in the sidebar, all 24 in the detail grid.",
        },
        "authorization": "Bearer <Agent SK>",
        "result_fields": ["project_id", "url", "operation"],
    }


def image_extension(content: bytes) -> str:
    if content.startswith(b"\x89PNG\r\n\x1a\n") and len(content) >= 33:
        return ".png"
    if content.startswith(b"\xff\xd8\xff") and content.endswith(b"\xff\xd9"):
        return ".jpg"
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return ".webp"
    raise HTTPException(415, "请上传 PNG、JPEG 或 WebP 图片")


@router.post("/v1/assets", status_code=201)
async def upload_asset(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> dict:
    contents = await file.read(MAX_ASSET_BYTES + 1)
    if len(contents) > MAX_ASSET_BYTES:
        raise HTTPException(413, "图片大小不能超过 8 MB")
    extension = image_extension(contents)
    asset_id = secrets.token_hex(16)
    with db.project_write() as connection:
        initialize(connection)
        key = authorized_key(connection, credentials.credentials)
        if key["result"]:
            raise HTTPException(409, "本次密钥已完成发布")
        count = connection.execute(
            "SELECT COUNT(*) FROM agent_assets WHERE key_id = ?", (key["id"],)
        ).fetchone()[0]
        if count >= MAX_ASSETS:
            raise HTTPException(409, "此密钥的图片上传额度已用完")
        relative_path = Path(key["site"]) / "agent-projects" / f"{asset_id}{extension}"
        destination = db.DATA_DIR / "uploads" / relative_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(contents)
        connection.execute(
            "INSERT INTO agent_assets VALUES (?, ?, ?)",
            (asset_id, key["id"], f"/uploads/{relative_path.as_posix()}"),
        )
    return {"asset_id": asset_id}


STATUS_LABELS = {
    "active": ("活跃项目", "bg-green-500"),
    "building": ("施工中", "bg-yellow-500"),
    "iterated": ("已迭代", "bg-blue-500"),
    "archived": ("已归档", "bg-gray-500"),
}


def project_fields(payload: Submission, assets: dict[str, str], api_origin: str) -> dict:
    def screenshots(items: list[Screenshot]) -> list[dict]:
        result = []
        for item in items:
            path = assets.get(item.asset_id)
            if path is None:
                raise HTTPException(422, "截图必须由本次发布密钥上传")
            result.append({
                "id": item.asset_id,
                "name": Path(path).name,
                "description": item.caption,
                "url": f"{api_origin}{path}",
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
                "previewUrl": str(item.demo_url) if item.demo_url else "",
                "techStack": [{"id": f"tech-{i}", "name": name} for i, name in enumerate(item.technologies)],
                "screenshots": screenshots(item.screenshots),
            })
        fields["featureHighlights"] = highlights
    if payload.overview is not None:
        fields["projectInfos"] = [
            {
                "id": f"info-{index}", "label": item.label, "value": item.value,
                "valueCode": "", "icon": "lucide:info", "order": index,
                "showInHomepage": index < HOMEPAGE_OVERVIEW_SIZE,
                "showInSidebar": index < SIDEBAR_OVERVIEW_SIZE,
                "showInHero": index < 3,
            }
            for index, item in enumerate(payload.overview)
        ]
    return fields


def public_url(site: str, project_id: str) -> str:
    return f"{notifications.FRONTEND_BASE_URL.rstrip('/')}/project/{quote(site, safe='')}/{quote(project_id, safe='')}"


@router.post("/v1/publish")
async def publish(
    payload: Submission,
    request: Request,
    background: BackgroundTasks,
    request_key: Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=128)],
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
) -> dict:
    request_digest = digest(payload.model_dump_json(exclude_unset=True))
    with db.project_write() as connection:
        initialize(connection)
        key = authorized_key(connection, credentials.credentials)
        if key["result"]:
            if (key["request_key"], key["request_digest"]) != (request_key, request_digest):
                raise HTTPException(409, "此密钥已发布，重试需要原来的请求内容和幂等键")
            return json.loads(key["result"])

        site, target = key["site"], key["target"]
        if target and payload.slug:
            raise HTTPException(422, "编辑作品时不能修改地址")
        if not target and not all(
            (payload.name, payload.description, payload.introduction, payload.highlights, payload.overview)
        ):
            raise HTTPException(422, "创建作品需要名称、简介、正文、至少一个亮点和 24 项概览")
        asset_paths = dict(connection.execute(
            "SELECT id, path FROM agent_assets WHERE key_id = ?", (key["id"],)
        ).fetchall())
        api_origin = os.getenv("AGENT_API_ORIGIN") or str(request.base_url)
        fields = project_fields(payload, asset_paths, api_origin.rstrip("/"))
        if not fields:
            raise HTTPException(422, "请提供需要更新的字段")
        projects = db.read_json(site, "projects.json")
        # A stable ID makes a retry safe if the process stops between the JSON write and the receipt commit.
        project_id = target or f"{payload.slug or 'project'}-{key['id'][:12]}"
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
                highest = max(
                    (db.parse_order_value(p.get("order"), i) for i, p in enumerate(projects) if isinstance(p, dict)),
                    default=-1,
                )
                project.update(createdAt=now, order=highest + 1)
                projects.append(project)
            db.write_json(site, "projects.json", projects)

        result = {"project_id": project_id, "url": public_url(site, project_id), "operation": "update" if target else "create"}
        connection.execute(
            "UPDATE agent_keys SET request_key = ?, request_digest = ?, result = ? WHERE id = ?",
            (request_key, request_digest, json.dumps(result), key["id"]),
        )

    if not already_written:
        notify = notifications.notify_project_updated if target else notifications.notify_project_created
        background.add_task(notify, site, project)
    return result
