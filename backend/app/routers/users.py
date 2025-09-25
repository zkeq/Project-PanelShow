from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List, Dict, Any
from app.models import BaseResponse, ListResponse
from app.services import UserService
from app.utils import UserNotFoundError, UserAlreadyExistsError

router = APIRouter()

# 注意：在实际项目中，这里应该添加 tinyauth 的认证装饰器
def get_current_admin():
    """获取当前管理员 - 预留给 tinyauth 集成"""
    # TODO: 集成 tinyauth 认证并验证管理员权限
    return {"username": "admin", "role": "admin"}

@router.post("/", response_model=BaseResponse)
async def create_user(
    user_data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    """创建新用户（管理员权限）"""
    try:
        # TODO: 添加管理员权限验证
        
        user = UserService.create_user(user_data)
        return BaseResponse(
            success=True,
            message="创建用户成功",
            data=user
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建用户失败: {str(e)}")

@router.get("/", response_model=ListResponse)
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    """获取所有用户列表（管理员权限）"""
    try:
        # TODO: 添加管理员权限验证
        
        users = UserService.get_all_users()
        return ListResponse(
            success=True,
            message="获取用户列表成功",
            data=list(users.values()),
            total=len(users)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户列表失败: {str(e)}")

@router.get("/public", response_model=ListResponse)
async def get_public_users():
    """获取公开用户列表"""
    try:
        public_users = UserService.get_public_users()
        users_info = []
        
        for username in public_users:
            user = UserService.get_user_by_username(username)
            if user:
                users_info.append({
                    "username": username,
                    "displayName": user.get('displayName', username),
                    "avatar": user.get('avatar', f'https://github.com/{username}.png'),
                    "bio": user.get('bio', ''),
                    "isActive": user.get('isActive', True)
                })
        
        return ListResponse(
            success=True,
            message="获取公开用户列表成功",
            data=users_info,
            total=len(users_info)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取公开用户列表失败: {str(e)}")

@router.get("/stats", response_model=BaseResponse)
async def get_user_stats(current_admin: dict = Depends(get_current_admin)):
    """获取用户统计信息（管理员权限）"""
    try:
        # TODO: 添加管理员权限验证
        
        stats = UserService.get_system_stats()
        return BaseResponse(
            success=True,
            message="获取用户统计成功",
            data=stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户统计失败: {str(e)}")

@router.get("/{username}", response_model=BaseResponse)
async def get_user(username: str = Path(..., description="用户名")):
    """根据用户名获取用户信息"""
    try:
        user = UserService.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="用户未找到")
        
        return BaseResponse(
            success=True,
            message="获取用户信息成功",
            data=user
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户信息失败: {str(e)}")

@router.put("/{username}", response_model=BaseResponse)
async def update_user(
    updates: dict,
    username: str = Path(..., description="用户名"),
    current_admin: dict = Depends(get_current_admin)
):
    """更新用户信息（管理员权限或用户本人）"""
    try:
        # TODO: 添加权限验证（管理员或用户本人）
        
        user = UserService.update_user(username, updates)
        return BaseResponse(
            success=True,
            message="更新用户信息成功",
            data=user
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新用户信息失败: {str(e)}")

@router.delete("/{username}", response_model=BaseResponse)
async def delete_user(
    username: str = Path(..., description="用户名"),
    current_admin: dict = Depends(get_current_admin)
):
    """删除用户（管理员权限）"""
    try:
        # TODO: 添加管理员权限验证
        
        success = UserService.delete_user(username)
        if success:
            return BaseResponse(
                success=True,
                message="删除用户成功"
            )
        else:
            raise HTTPException(status_code=500, detail="删除用户失败")
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除用户失败: {str(e)}")

@router.post("/{username}/public", response_model=BaseResponse)
async def set_user_public(
    is_public: bool,
    username: str = Path(..., description="用户名"),
    current_admin: dict = Depends(get_current_admin)
):
    """设置用户公开状态（管理员权限或用户本人）"""
    try:
        # TODO: 添加权限验证（管理员或用户本人）
        
        success = UserService.set_user_public_status(username, is_public)
        if success:
            status = "公开" if is_public else "私有"
            return BaseResponse(
                success=True,
                message=f"设置用户为{status}状态成功"
            )
        else:
            raise HTTPException(status_code=500, detail="设置用户状态失败")
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"设置用户状态失败: {str(e)}")