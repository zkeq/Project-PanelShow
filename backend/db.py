"""
极简JSON数据库工具
"""
import json
import os
import uuid
import shutil
from pathlib import Path
from typing import Any, Dict, List

DATA_DIR = Path(__file__).parent / "data"


def get_user_dir(username: str) -> Path:
    """获取用户数据目录"""
    return DATA_DIR / "users" / username


def ensure_user_dir(username: str):
    """确保用户目录存在"""
    user_dir = get_user_dir(username)
    user_dir.mkdir(parents=True, exist_ok=True)


def read_json(username: str, filename: str) -> Any:
    """读取用户的JSON文件"""
    file_path = get_user_dir(username) / filename

    if not file_path.exists():
        # 根据文件名返回默认值
        if filename in ['projects.json', 'timeline.json']:
            return []
        return {}

    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json(username: str, filename: str, data: Any):
    """写入用户的JSON文件"""
    ensure_user_dir(username)
    file_path = get_user_dir(username) / filename

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def generate_id() -> str:
    """生成唯一ID"""
    return str(uuid.uuid4())


def user_exists(username: str) -> bool:
    """检查用户是否存在"""
    return get_user_dir(username).exists()


def create_user(username: str):
    """创建用户（创建目录）"""
    ensure_user_dir(username)


def rename_user(old_username: str, new_username: str):
    """重命名用户（移动文件夹）"""
    old_dir = get_user_dir(old_username)
    new_dir = get_user_dir(new_username)

    if not old_dir.exists():
        raise FileNotFoundError(f"用户 {old_username} 不存在")

    if new_dir.exists():
        raise FileExistsError(f"用户 {new_username} 已存在")

    old_dir.rename(new_dir)


def delete_user(username: str):
    """删除用户（删除文件夹）"""
    user_dir = get_user_dir(username)

    if user_dir.exists():
        shutil.rmtree(user_dir)


def get_all_users() -> List[str]:
    """获取所有用户列表"""
    users_dir = DATA_DIR / "users"

    if not users_dir.exists():
        return []

    return [d.name for d in users_dir.iterdir() if d.is_dir()]
