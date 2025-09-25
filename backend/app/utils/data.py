import json
import os
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import uuid
import shutil

# 数据文件路径
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
STATIC_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'static')

def get_data_path(filename: str) -> str:
    """获取数据文件路径"""
    return os.path.join(DATA_DIR, filename)

def load_json_data(filename: str, username: str = None) -> Union[Dict, List]:
    """加载JSON数据文件
    Args:
        filename: 文件名
        username: 用户名，如果提供则加载用户特定数据
    """
    if username:
        # 用户特定数据文件
        user_data_dir = os.path.join(DATA_DIR, 'users', username)
        file_path = os.path.join(user_data_dir, filename)
    else:
        # 系统级数据文件
        file_path = get_data_path(filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # 如果文件不存在，返回空数据结构
        if filename.endswith('.json'):
            basename = filename[:-5]  # 移除.json后缀
            if basename.endswith('s') or basename in ['timeline', 'profile']:
                return [] if basename == 'timeline' else {}
        return {}
    except json.JSONDecodeError as e:
        print(f"JSON解码错误 {filename}: {e}")
        return {}

def save_json_data(filename: str, data: Union[Dict, List], username: str = None) -> bool:
    """保存数据到JSON文件
    Args:
        filename: 文件名
        data: 要保存的数据
        username: 用户名，如果提供则保存到用户特定目录
    """
    if username:
        # 用户特定数据文件
        user_data_dir = os.path.join(DATA_DIR, 'users', username)
        os.makedirs(user_data_dir, exist_ok=True)
        file_path = os.path.join(user_data_dir, filename)
    else:
        # 系统级数据文件
        file_path = get_data_path(filename)
        # 确保目录存在
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    try:
        # 先写入临时文件，再重命名，确保原子操作
        temp_path = file_path + '.tmp'
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 原子性地移动临时文件到目标位置
        shutil.move(temp_path, file_path)
        return True
    except Exception as e:
        print(f"保存数据错误 {filename}: {e}")
        # 清理临时文件
        temp_path = file_path + '.tmp'
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

def generate_id() -> str:
    """生成唯一ID"""
    return str(uuid.uuid4())

def generate_timeline_id() -> str:
    """生成时间线ID"""
    return f"timeline-{int(datetime.now().timestamp())}"

def current_datetime() -> str:
    """获取当前时间的ISO格式字符串"""
    return datetime.now().isoformat()

def current_date() -> str:
    """获取当前日期字符串"""
    return datetime.now().strftime('%Y-%m-%d')

def backup_data_file(filename: str) -> bool:
    """备份数据文件"""
    file_path = get_data_path(filename)
    if not os.path.exists(file_path):
        return False
    
    backup_path = file_path + f'.backup.{int(datetime.now().timestamp())}'
    try:
        shutil.copy2(file_path, backup_path)
        return True
    except Exception as e:
        print(f"备份文件错误 {filename}: {e}")
        return False

def validate_required_fields(data: Dict, required_fields: List[str]) -> List[str]:
    """验证必需字段"""
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)
    return missing_fields

def sanitize_filename(filename: str) -> str:
    """清理文件名，移除非法字符"""
    import re
    # 移除非法字符
    sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
    # 替换空格为下划线
    sanitized = sanitized.replace(' ', '_')
    # 限制长度
    if len(sanitized) > 100:
        sanitized = sanitized[:100]
    return sanitized

def ensure_upload_dir() -> str:
    """确保上传目录存在"""
    upload_dir = os.path.join(STATIC_DIR, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir

def ensure_user_data_dir(username: str) -> str:
    """确保用户数据目录存在"""
    user_data_dir = os.path.join(DATA_DIR, 'users', username)
    os.makedirs(user_data_dir, exist_ok=True)
    return user_data_dir

def create_user_data_structure(username: str) -> bool:
    """为新用户创建数据文件结构"""
    try:
        user_data_dir = ensure_user_data_dir(username)
        
        # 创建空的数据文件
        empty_files = {
            'projects.json': [],
            'project_details.json': {},
            'timeline.json': [],
            'profile.json': {
                'profile': {
                    'username': username,
                    'name': username,
                    'title': '开发者',
                    'email': f'{username}@example.com',
                    'github': username,
                    'website': f'https://{username}.dev',
                    'bio': f'{username}的个人作品集',
                    'skills': {
                        'frontend': [],
                        'backend': []
                    },
                    'interests': []
                },
                'users': {
                    username: {
                        'username': username,
                        'name': username,
                        'avatar': f'https://github.com/{username}.png',
                        'bio': f'{username}的个人作品集',
                        'location': '地球',
                        'website': f'https://{username}.dev',
                        'githubUrl': f'https://github.com/{username}',
                        'twitterUrl': f'https://twitter.com/{username}'
                    }
                },
                'experiences': [],
                'quickLinks': []
            }
        }
        
        for filename, content in empty_files.items():
            filepath = os.path.join(user_data_dir, filename)
            if not os.path.exists(filepath):
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(content, f, ensure_ascii=False, indent=2)
        
        return True
    except Exception as e:
        print(f"创建用户数据结构失败 {username}: {e}")
        return False

def rename_user_directory(old_username: str, new_username: str) -> bool:
    """重命名用户目录（用于修改用户名）"""
    try:
        old_dir = os.path.join(DATA_DIR, 'users', old_username)
        new_dir = os.path.join(DATA_DIR, 'users', new_username)
        
        if not os.path.exists(old_dir):
            return False
        
        if os.path.exists(new_dir):
            return False  # 新用户名已存在
        
        shutil.move(old_dir, new_dir)
        return True
    except Exception as e:
        print(f"重命名用户目录失败 {old_username} -> {new_username}: {e}")
        return False

def delete_user_directory(username: str) -> bool:
    """删除用户目录"""
    try:
        user_dir = os.path.join(DATA_DIR, 'users', username)
        if os.path.exists(user_dir):
            shutil.rmtree(user_dir)
        return True
    except Exception as e:
        print(f"删除用户目录失败 {username}: {e}")
        return False

class DataValidationError(Exception):
    """数据验证错误"""
    pass

class DataNotFoundError(Exception):
    """数据未找到错误"""
    pass

class UserNotFoundError(Exception):
    """用户未找到错误"""
    pass

class UserAlreadyExistsError(Exception):
    """用户已存在错误"""
    pass