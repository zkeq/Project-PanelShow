"""
简单认证模块

提供基本的认证功能，支持开发模式的模拟用户。
"""
import os
from typing import Optional
from fastapi import HTTPException, Request
from pydantic import BaseModel

# 认证配置
class AuthConfig:
    # 开发模式：设置为True时使用模拟认证
    DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# 用户数据模型
class TokenData(BaseModel):
    username: str
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: str = "user"  # user 或 admin
    auth_method: Optional[str] = "mock"

class SimpleAuthClient:
    def __init__(self):
        pass

    async def verify_request(self, request: Request) -> Optional[TokenData]:
        """
        验证请求认证信息
        """
        try:
            # 开发模式：使用模拟用户
            if AuthConfig.DEV_MODE:
                # 检查请求头中的模拟用户信息
                mock_user = request.headers.get("X-Mock-User", "admin")
                mock_email = request.headers.get("X-Mock-Email", "admin@example.com")
                mock_role = request.headers.get("X-Mock-Role", "admin")

                return TokenData(
                    username=mock_user,
                    email=mock_email,
                    user_id=mock_email,
                    role=mock_role,
                    auth_method="dev_mode"
                )

            # 生产环境：检查认证头
            auth_user = request.headers.get("X-Auth-User")
            auth_email = request.headers.get("X-Auth-Email")
            auth_method = request.headers.get("X-Auth-Method", "custom")

            if auth_user:
                # 确定用户角色
                role = "admin" if auth_user.lower() in ["admin", "administrator"] else "user"
                
                return TokenData(
                    username=auth_user,
                    email=auth_email or f"{auth_user}@example.com",
                    user_id=auth_email or auth_user,
                    role=role,
                    auth_method=auth_method
                )

            return None

        except Exception as e:
            print(f"认证验证失败: {e}")
            return None

# 全局认证客户端实例
auth_client = SimpleAuthClient()

async def get_current_user(request: Request) -> Optional[TokenData]:
    """获取当前认证用户"""
    return await auth_client.verify_request(request)

async def require_auth(request: Request) -> TokenData:
    """要求用户认证"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="未认证，请先登录",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

async def require_admin(request: Request) -> TokenData:
    """要求管理员权限"""
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="需要管理员权限"
        )
    return user

def can_manage_user(target_username: str):
    """检查是否可以管理指定用户（管理员或用户自身）"""
    async def check_permission(request: Request) -> TokenData:
        user = await require_auth(request)
        if user.role != "admin" and user.username != target_username:
            raise HTTPException(
                status_code=403, 
                detail="只能管理自己的数据"
            )
        return user
    return check_permission