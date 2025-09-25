from typing import Dict, List, Optional
from app.models import User, BaseResponse
from app.utils import (
    load_json_data, save_json_data, current_datetime,
    create_user_data_structure, rename_user_directory, 
    delete_user_directory, UserNotFoundError, UserAlreadyExistsError
)

class UserService:
    """用户管理服务"""
    
    @staticmethod
    def get_all_users() -> Dict[str, dict]:
        """获取所有用户"""
        users_data = load_json_data('users.json')
        return users_data.get('users', {})
    
    @staticmethod
    def get_public_users() -> List[str]:
        """获取公开用户列表"""
        users_data = load_json_data('users.json')
        return users_data.get('publicUsers', [])
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[dict]:
        """根据用户名获取用户信息"""
        users = UserService.get_all_users()
        return users.get(username)
    
    @staticmethod
    def user_exists(username: str) -> bool:
        """检查用户是否存在"""
        return UserService.get_user_by_username(username) is not None
    
    @staticmethod
    def create_user(user_data: dict) -> dict:
        """创建新用户"""
        username = user_data.get('username')
        if not username:
            raise ValueError("用户名不能为空")
        
        if UserService.user_exists(username):
            raise UserAlreadyExistsError(f"用户 {username} 已存在")
        
        # 创建用户数据结构
        if not create_user_data_structure(username):
            raise Exception("创建用户数据结构失败")
        
        # 更新用户管理文件
        users_data = load_json_data('users.json')
        
        new_user = {
            'username': username,
            'displayName': user_data.get('displayName', username),
            'email': user_data.get('email', f'{username}@example.com'),
            'avatar': user_data.get('avatar', f'https://github.com/{username}.png'),
            'bio': user_data.get('bio', f'{username}的个人作品集'),
            'location': user_data.get('location', '地球'),
            'website': user_data.get('website', f'https://{username}.dev'),
            'githubUrl': user_data.get('githubUrl', f'https://github.com/{username}'),
            'twitterUrl': user_data.get('twitterUrl', f'https://twitter.com/{username}'),
            'createdAt': current_datetime(),
            'updatedAt': current_datetime(),
            'isActive': True,
            'role': user_data.get('role', 'user')
        }
        
        users_data['users'][username] = new_user
        users_data['systemStats']['totalUsers'] = len(users_data['users'])
        users_data['systemStats']['activeUsers'] = len([u for u in users_data['users'].values() if u.get('isActive', True)])
        users_data['lastUpdated'] = current_datetime()
        
        # 如果是公开用户，添加到公开列表
        if user_data.get('isPublic', True):
            if username not in users_data.get('publicUsers', []):
                users_data.setdefault('publicUsers', []).append(username)
        
        if not save_json_data('users.json', users_data):
            raise Exception("保存用户数据失败")
        
        return new_user
    
    @staticmethod
    def update_user(username: str, updates: dict) -> dict:
        """更新用户信息"""
        if not UserService.user_exists(username):
            raise UserNotFoundError(f"用户 {username} 不存在")
        
        users_data = load_json_data('users.json')
        user = users_data['users'][username]
        
        # 处理用户名修改
        new_username = updates.get('username')
        if new_username and new_username != username:
            # 检查新用户名是否已存在
            if UserService.user_exists(new_username):
                raise UserAlreadyExistsError(f"用户名 {new_username} 已存在")
            
            # 重命名用户目录
            if not rename_user_directory(username, new_username):
                raise Exception("重命名用户目录失败")
            
            # 更新用户数据
            users_data['users'][new_username] = users_data['users'].pop(username)
            
            # 更新公开用户列表
            if username in users_data.get('publicUsers', []):
                public_users = users_data.get('publicUsers', [])
                public_users[public_users.index(username)] = new_username
                users_data['publicUsers'] = public_users
            
            user = users_data['users'][new_username]
            username = new_username
        
        # 更新其他字段
        for key, value in updates.items():
            if key in user and key != 'createdAt':  # 不允许修改创建时间
                user[key] = value
        
        user['updatedAt'] = current_datetime()
        users_data['lastUpdated'] = current_datetime()
        
        if not save_json_data('users.json', users_data):
            raise Exception("保存用户数据失败")
        
        return user
    
    @staticmethod
    def delete_user(username: str) -> bool:
        """删除用户"""
        if not UserService.user_exists(username):
            raise UserNotFoundError(f"用户 {username} 不存在")
        
        # 删除用户目录
        if not delete_user_directory(username):
            raise Exception("删除用户目录失败")
        
        # 更新用户管理文件
        users_data = load_json_data('users.json')
        del users_data['users'][username]
        
        # 从公开用户列表中移除
        if username in users_data.get('publicUsers', []):
            users_data['publicUsers'].remove(username)
        
        # 更新统计信息
        users_data['systemStats']['totalUsers'] = len(users_data['users'])
        users_data['systemStats']['activeUsers'] = len([u for u in users_data['users'].values() if u.get('isActive', True)])
        users_data['lastUpdated'] = current_datetime()
        
        if not save_json_data('users.json', users_data):
            raise Exception("保存用户数据失败")
        
        return True
    
    @staticmethod
    def set_user_public_status(username: str, is_public: bool) -> bool:
        """设置用户公开状态"""
        if not UserService.user_exists(username):
            raise UserNotFoundError(f"用户 {username} 不存在")
        
        users_data = load_json_data('users.json')
        public_users = users_data.setdefault('publicUsers', [])
        
        if is_public:
            if username not in public_users:
                public_users.append(username)
        else:
            if username in public_users:
                public_users.remove(username)
        
        users_data['lastUpdated'] = current_datetime()
        
        return save_json_data('users.json', users_data)
    
    @staticmethod
    def get_system_stats() -> dict:
        """获取系统统计信息"""
        users_data = load_json_data('users.json')
        return users_data.get('systemStats', {
            'totalUsers': 0,
            'activeUsers': 0,
            'totalProjects': 0,
            'totalTimeline': 0
        })