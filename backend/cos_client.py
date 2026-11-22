"""Tencent COS 上传客户端封装"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import yaml
from qcloud_cos import CosConfig, CosS3Client, CosServiceError, CosClientError


class CosConfigError(RuntimeError):
    """表示 COS 配置错误或缺失"""


class CosUploadError(RuntimeError):
    """表示 COS 上传失败"""


_CONFIG_PATH = Path(__file__).parent / "config.yaml"
_cached_client: Optional[CosS3Client] = None
_cached_settings: Optional[dict] = None


def _load_settings() -> dict:
    global _cached_settings
    if _cached_settings is None:
        if not _CONFIG_PATH.exists():
            raise CosConfigError("COS 配置文件不存在")

        with _CONFIG_PATH.open("r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}

        cos_settings = config.get("cos")
        if not cos_settings:
            raise CosConfigError("未在配置文件中找到 COS 配置信息")

        required_fields = ["secret_id", "secret_key", "bucket", "region", "folder_prefix"]
        missing = [field for field in required_fields if not cos_settings.get(field)]
        if missing:
            raise CosConfigError(f"COS 配置缺失字段: {', '.join(missing)}")

        _cached_settings = cos_settings

    return _cached_settings


def _get_client() -> CosS3Client:
    global _cached_client
    if _cached_client is None:
        settings = _load_settings()
        cos_config = CosConfig(
            Region=settings["region"],
            SecretId=settings["secret_id"],
            SecretKey=settings["secret_key"],
            Scheme="https",
        )
        _cached_client = CosS3Client(cos_config)

    return _cached_client


def build_cos_key(*parts: str) -> str:
    """根据配置的前缀构建 COS 对象键"""

    settings = _load_settings()
    prefix = settings.get("folder_prefix", "")
    normalized_prefix = prefix.strip()
    if normalized_prefix.startswith("/"):
        normalized_prefix = normalized_prefix[1:]
    if normalized_prefix and not normalized_prefix.endswith("/"):
        normalized_prefix += "/"

    sanitized_parts = []
    for part in parts:
        sanitized = part.strip("/")
        if sanitized:
            sanitized_parts.append(sanitized)

    key = "/".join(sanitized_parts)
    if normalized_prefix:
        return f"{normalized_prefix}{key}" if key else normalized_prefix.rstrip("/")
    return key


def upload_file_to_cos(*, local_path: str, key: str, content_type: Optional[str] = None) -> str:
    """上传文件到 COS 并返回最终访问 URL"""

    settings = _load_settings()
    client = _get_client()

    try:
        client.put_object_from_local_file(
            Bucket=settings["bucket"],
            LocalFilePath=local_path,
            Key=key,
            ContentType=content_type,
        )
    except (CosServiceError, CosClientError) as exc:
        raise CosUploadError(f"上传到 COS 失败: {exc}") from exc

    return public_cos_url(key)


def public_cos_url(key: str) -> str:
    settings = _load_settings()
    base_url = settings.get("public_base_url") or settings.get("bucket_base_url")
    if not base_url:
        raise CosConfigError("COS 配置缺少可用的访问域名")

    return f"{base_url.rstrip('/')}/{key}"


def sign_cos_upload(key: str, content_type: str, size: int, expires_in: int) -> dict:
    headers = {
        "Content-Type": content_type,
        "Content-Length": str(size),
        "x-cos-forbid-overwrite": "true",
    }
    url = _get_client().get_presigned_url(
        Bucket=_load_settings()["bucket"], Key=key, Method="PUT", Expired=expires_in, Headers=headers,
    )
    return {"method": "PUT", "url": url, "headers": headers, "expires_in": expires_in}


def cos_upload_matches(key: str, content_type: str, size: int) -> bool:
    try:
        metadata = _get_client().head_object(Bucket=_load_settings()["bucket"], Key=key)
    except CosServiceError as exc:
        if str(exc.get_status_code()) == "404":
            return False
        raise CosUploadError("无法核验 COS 对象") from exc
    except CosClientError as exc:
        raise CosUploadError("无法核验 COS 对象") from exc
    headers = {name.lower(): value for name, value in metadata.items()}
    return headers.get("content-type") == content_type and headers.get("content-length") == str(size)

