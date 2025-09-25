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

def load_json_data(filename: str) -> Union[Dict, List]:
    """加载JSON数据文件"""
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

def save_json_data(filename: str, data: Union[Dict, List]) -> bool:
    """保存数据到JSON文件"""
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

class DataValidationError(Exception):
    """数据验证错误"""
    pass

class DataNotFoundError(Exception):
    """数据未找到错误"""
    pass