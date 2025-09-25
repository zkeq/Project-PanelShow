"""
TinyAuth 认证集成模块

TinyAuth 通过 Forward Auth 模式工作，在请求到达应用之前进行认证验证。
本模块提供与 TinyAuth 的集成功能。
"""
import os
import httpx
from typing import Optional
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel

# 认证配置
class AuthConfig:
    TINYAUTH_URL = os.getenv("TINYAUTH_URL", "http://localhost:3002")
    SECRET = os.getenv("SECRET", "your-secret-key-here-change-in-production-32-chars")
    # 开发模式：设置为True时跳过认证检查
    DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# 用户数据模型
class TokenData(BaseModel):
    username: str
    user_id: Optional[str] = None
    role: str = "user"  # user 或 admin

# 安全方案
security = HTTPBearer(auto_error=False)

class TinyAuthClient:
    def __init__(self):
        self.tinyauth_url = AuthConfig.TINYAUTH_URL
        self.secret = AuthConfig.SECRET

    async def verify_request(self, request: Request) -> Optional[TokenData]:
        """
        验证请求是否已通过 TinyAuth 认证
        在生产环境中，TinyAuth 会在请求头中添加用户信息
        """
        try:
            # 开发模式：跳过认证检查
            if AuthConfig.DEV_MODE:
                # 检查是否有模拟用户头信息
                mock_user = request.headers.get("X-Mock-User", "admin")
                mock_role = request.headers.get("X-Mock-Role", "admin")

                return TokenData(
                    username=mock_user,
                    user_id=f"{mock_user}@example.com",
                    role=mock_role
                )

            # 在生产环境中，TinyAuth 通过代理添加认证头信息
            # 开发环境中，我们模拟这个过程或直接验证cookie

            # 检查是否有TinyAuth设置的认证头
            auth_user = request.headers.get("X-Forwarded-User")
            auth_email = request.headers.get("X-Forwarded-Email")

            if auth_user:
                # 从TinyAuth头信息创建TokenData
                return TokenData(
                    username=auth_user,
                    user_id=auth_email or auth_user,
                    role="admin" if auth_user == "admin" else "user"
                )

            # 开发模式：检查cookie或简化认证
            cookies = request.cookies
            if "tinyauth" in cookies:
                # 简化处理：假设cookie存在就是已认证
                # 在实际部署中，TinyAuth会处理cookie验证
                return TokenData(
                    username="admin",  # 默认用户
                    user_id="admin@example.com",
                    role="admin"
                )

        except Exception as e:
            print(f"认证验证失败: {e}")
            return None

        return None

# 全局认证客户端实例
auth_client = TinyAuthClient()

async def get_current_user(request: Request) -> Optional[TokenData]:
    """获取当前认证用户"""
    return await auth_client.verify_request(request)

async def require_auth(request: Request) -> TokenData:
    """要求用户认证"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="未认证")
    return user

async def require_admin(request: Request) -> TokenData:
    """要求管理员权限"""
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user

def can_manage_user(target_username: str):
    """检查是否可以管理指定用户（管理员或用户自身）"""
    async def check_permission(request: Request) -> TokenData:
        user = await require_auth(request)
        if user.role != "admin" and user.username != target_username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        return user
    return check_permission