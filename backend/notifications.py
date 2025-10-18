"""Utility helpers for sending WeCom notifications from backend events."""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import httpx

import db

logger = logging.getLogger(__name__)

NOTIFICATION_ENDPOINT = os.getenv(
    "WECHAT_NOTIFY_ENDPOINT", "http://127.0.0.1:6789/send_message/"
)
DEFAULT_TOUID = os.getenv("WECHAT_NOTIFY_TOUID", "@all")

LOCAL_TIMEZONE = timezone(timedelta(hours=8))
UPLOAD_LOG_PATH = Path(__file__).parent / "data" / "uploads_log.json"


def _iter_users() -> Iterable[str]:
    users = db.get_all_users()
    for username in users:
        if isinstance(username, str) and username:
            # 忽略系统用户目录
            if username.startswith("_"):
                continue
            yield username


def _count_records(username: Optional[str], filename: str) -> int:
    if username:
        data = db.read_json(username, filename)
        if isinstance(data, list):
            return sum(1 for item in data if isinstance(item, dict))
        return 0

    total = 0
    for user in _iter_users():
        total += _count_records(user, filename)
    return total


def get_user_project_count(username: str) -> int:
    return _count_records(username, "projects.json")


def get_total_project_count() -> int:
    return _count_records(None, "projects.json")


def get_user_timeline_count(username: str) -> int:
    return _count_records(username, "timeline.json")


def get_total_timeline_count() -> int:
    return _count_records(None, "timeline.json")


def get_total_user_count() -> int:
    return sum(1 for _ in _iter_users())


def _load_upload_log() -> List[Dict[str, Any]]:
    if not UPLOAD_LOG_PATH.exists():
        return []

    try:
        with UPLOAD_LOG_PATH.open("r", encoding="utf-8") as fp:
            data = json.load(fp)
            if isinstance(data, list):
                return [item for item in data if isinstance(item, dict)]
    except json.JSONDecodeError:
        logger.warning("Failed to decode uploads_log.json, resetting log.")
    except FileNotFoundError:
        return []

    return []


def _write_upload_log(entries: List[Dict[str, Any]]):
    UPLOAD_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with UPLOAD_LOG_PATH.open("w", encoding="utf-8") as fp:
        json.dump(entries, fp, ensure_ascii=False, indent=2)


def _parse_timestamp(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        cleaned = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(cleaned)
    except ValueError:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _format_lines(title: str, body_lines: List[str]) -> str:
    timestamp = datetime.now(LOCAL_TIMEZONE).strftime("%Y-%m-%d %H:%M:%S")
    # 过滤掉空行，保证消息紧凑
    filtered_lines = [line for line in body_lines if line]
    return "\n".join([title, *filtered_lines, f"时间：{timestamp}"])


async def _post_notification(text: str, touid: Optional[str] = None) -> None:
    payload = {
        "text": text,
        "wecom_touid": touid or DEFAULT_TOUID,
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(NOTIFICATION_ENDPOINT, json=payload)
            response.raise_for_status()
    except Exception as exc:  # pragma: no cover - best effort logging
        logger.error("Failed to send notification to %s: %s", NOTIFICATION_ENDPOINT, exc)


def record_image_upload(
    *,
    username: str,
    original_filename: Optional[str],
    stored_filename: str,
    file_url: Optional[str],
    local_url: str,
    category: str,
    size: int,
) -> Dict[str, Any]:
    now_utc = datetime.now(timezone.utc)
    entries = _load_upload_log()

    entry = {
        "username": username,
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "url": file_url,
        "local_url": local_url,
        "category": category,
        "size": size,
        "uploaded_at": now_utc.isoformat(),
    }
    entries.append(entry)
    _write_upload_log(entries)

    now_local = now_utc.astimezone(LOCAL_TIMEZONE)
    today = now_local.date()
    iso_year, iso_week, _ = now_local.isocalendar()

    total_images = len(entries)
    user_total_images = sum(1 for item in entries if item.get("username") == username)

    today_count = 0
    week_count = 0
    for item in entries:
        uploaded_at = _parse_timestamp(item.get("uploaded_at"))
        if not uploaded_at:
            continue
        local_time = uploaded_at.astimezone(LOCAL_TIMEZONE)
        if local_time.date() == today:
            today_count += 1
        item_year, item_week, _ = local_time.isocalendar()
        if item_year == iso_year and item_week == iso_week:
            week_count += 1

    return {
        "entry": entry,
        "username": username,
        "original_filename": original_filename or stored_filename,
        "stored_filename": stored_filename,
        "file_url": file_url,
        "local_url": local_url,
        "category": category,
        "size": size,
        "total_images": total_images,
        "user_total_images": user_total_images,
        "today_upload_count": today_count,
        "week_upload_count": week_count,
    }


async def notify_image_uploaded(stats: Dict[str, Any]) -> None:
    size_kb = stats.get("size", 0) / 1024
    size_line = f"文件大小：{size_kb:.1f} KB" if size_kb else ""
    url = stats.get("file_url") or stats.get("local_url")
    lines = [
        f"用户 {stats.get('username')} 上传图片《{stats.get('original_filename')}》",
        f"访问链接：{url}",
        size_line,
        f"本站图片总数：{stats.get('user_total_images')}",
        f"今日上传次数：第 {stats.get('today_upload_count')} 张",
        f"本周上传次数：第 {stats.get('week_upload_count')} 张",
        f"全站图片总数：{stats.get('total_images')}",
    ]
    message = _format_lines("【图片上传】", lines)
    await _post_notification(message)


def _resolve_title(record: Dict[str, Any], *candidates: str) -> str:
    for key in candidates:
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    if isinstance(record.get("id"), str):
        return record["id"]
    return "未命名"


async def notify_site_initialized(username: str) -> None:
    lines = [
        f"用户 {username} 完成站点初始化",
        f"当前站点总数：{get_total_user_count()}",
    ]
    message = _format_lines("【站点初始化】", lines)
    await _post_notification(message)


async def notify_project_created(username: str, project: Dict[str, Any]) -> None:
    title = _resolve_title(project, "title", "name")
    lines = [
        f"用户 {username} 新建项目《{title}》",
        f"项目 ID：{project.get('id')}",
        f"当前站点项目数：{get_user_project_count(username)}",
        f"全站项目总数：{get_total_project_count()}",
    ]
    message = _format_lines("【项目创建】", lines)
    await _post_notification(message)


async def notify_project_updated(username: str, project: Dict[str, Any]) -> None:
    title = _resolve_title(project, "title", "name")
    lines = [
        f"用户 {username} 更新项目《{title}》",
        f"项目 ID：{project.get('id')}",
        f"当前站点项目数：{get_user_project_count(username)}",
        f"全站项目总数：{get_total_project_count()}",
    ]
    message = _format_lines("【项目更新】", lines)
    await _post_notification(message)


async def notify_timeline_created(username: str, item: Dict[str, Any]) -> None:
    title = _resolve_title(item, "title", "summary", "content")
    lines = [
        f"用户 {username} 新建动态《{title}》",
        f"动态 ID：{item.get('id')}",
        f"当前站点动态数：{get_user_timeline_count(username)}",
        f"全站动态总数：{get_total_timeline_count()}",
    ]
    message = _format_lines("【动态创建】", lines)
    await _post_notification(message)


async def notify_timeline_updated(username: str, item: Dict[str, Any]) -> None:
    title = _resolve_title(item, "title", "summary", "content")
    lines = [
        f"用户 {username} 更新动态《{title}》",
        f"动态 ID：{item.get('id')}",
        f"当前站点动态数：{get_user_timeline_count(username)}",
        f"全站动态总数：{get_total_timeline_count()}",
    ]
    message = _format_lines("【动态更新】", lines)
    await _post_notification(message)

