from fastapi import APIRouter, HTTPException, Path, Depends
from typing import List
from app.models import (
    ProfileInfo, Experience, QuickLink, User, 
    BaseResponse, ListResponse, UpdateProfileRequest
)
from app.services import ProfileService, UserService
from app.utils import DataValidationError, UserNotFoundError
from app.auth import require_auth, can_manage_user, TokenData

router = APIRouter()

@router.get("/{username}/info", response_model=BaseResponse)
async def get_user_profile_info(username: str = Path(..., description="用户名")):
    """获取指定用户的个人资料信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        profile = ProfileService.get_profile_info(username)
        return BaseResponse(
            success=True,
            message="获取个人资料成功",
            data=profile.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取个人资料失败: {str(e)}")

# 以下是需要认证的管理接口
@router.put("/{username}/info", response_model=BaseResponse)
async def update_user_profile_info(
    request: UpdateProfileRequest,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的个人资料信息（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        profile = ProfileService.update_profile_info(username, request)
        return BaseResponse(
            success=True,
            message="更新个人资料成功",
            data=profile.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新个人资料失败: {str(e)}")

@router.get("/{username}", response_model=BaseResponse)
async def get_user_by_username(username: str = Path(..., description="用户名")):
    """根据用户名获取用户信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        user = ProfileService.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="用户未找到")
        
        return BaseResponse(
            success=True,
            message="获取用户信息成功",
            data=user.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户信息失败: {str(e)}")

@router.get("/{username}/experiences", response_model=ListResponse)
async def get_user_experiences(username: str = Path(..., description="用户名")):
    """获取指定用户的工作经历列表"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        experiences = ProfileService.get_experiences(username)
        return ListResponse(
            success=True,
            message="获取工作经历成功",
            data=[exp.dict() for exp in experiences],
            total=len(experiences)
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工作经历失败: {str(e)}")

@router.get("/{username}/quick-links", response_model=ListResponse)
async def get_user_quick_links(username: str = Path(..., description="用户名")):
    """获取指定用户的快捷链接列表"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        links = ProfileService.get_quick_links(username)
        return ListResponse(
            success=True,
            message="获取快捷链接成功",
            data=[link.dict() for link in links],
            total=len(links)
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取快捷链接失败: {str(e)}")

@router.get("/{username}/summary", response_model=BaseResponse)
async def get_user_profile_summary(username: str = Path(..., description="用户名")):
    """获取指定用户的个人资料摘要（包含所有信息）"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        profile = ProfileService.get_profile_info(username)
        experiences = ProfileService.get_experiences(username)
        quick_links = ProfileService.get_quick_links(username)
        
        summary = {
            "profile": profile.dict(),
            "experiences": [exp.dict() for exp in experiences],
            "quickLinks": [link.dict() for link in quick_links],
            "stats": {
                "totalExperience": len(experiences),
                "skillsCount": {
                    "frontend": len(profile.skills.frontend),
                    "backend": len(profile.skills.backend)
                },
                "totalInterests": len(profile.interests),
                "totalLinks": len(quick_links)
            }
        }
        
        return BaseResponse(
            success=True,
            message="获取个人资料摘要成功",
            data=summary
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取个人资料摘要失败: {str(e)}")

@router.get("/{username}/skills/categories", response_model=BaseResponse)
async def get_user_skills_categories(username: str = Path(..., description="用户名")):
    """获取指定用户的技能分类统计"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        profile = ProfileService.get_profile_info(username)
        
        categories = {
            "frontend": {
                "name": "前端技术",
                "skills": profile.skills.frontend,
                "count": len(profile.skills.frontend)
            },
            "backend": {
                "name": "后端技术",
                "skills": profile.skills.backend,
                "count": len(profile.skills.backend)
            }
        }
        
        return BaseResponse(
            success=True,
            message="获取技能分类成功",
            data=categories
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取技能分类失败: {str(e)}")

@router.get("/{username}/contact", response_model=BaseResponse)
async def get_user_contact_info(username: str = Path(..., description="用户名")):
    """获取指定用户的联系方式信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        profile = ProfileService.get_profile_info(username)
        quick_links = ProfileService.get_quick_links(username)
        
        contact_info = {
            "email": profile.email,
            "github": profile.github,
            "website": profile.website,
            "socialLinks": [
                link.dict() for link in quick_links 
                if link.name.lower() in ['github', 'linkedin', 'twitter', 'email']
            ]
        }
        
        return BaseResponse(
            success=True,
            message="获取联系方式成功",
            data=contact_info
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取联系方式失败: {str(e)}")

# 管理接口（需要认证）
@router.post("/{username}/experiences", response_model=BaseResponse)
async def create_user_experience(
    experience_data: dict,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建工作经历（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现创建经历逻辑
        return BaseResponse(
            success=True,
            message="创建工作经历成功",
            data=experience_data
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建工作经历失败: {str(e)}")

@router.put("/{username}/experiences/{exp_id}", response_model=BaseResponse)
async def update_user_experience(
    experience_data: dict,
    username: str = Path(..., description="用户名"),
    exp_id: str = Path(..., description="经历ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的工作经历（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现更新经历逻辑
        return BaseResponse(
            success=True,
            message="更新工作经历成功",
            data=experience_data
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新工作经历失败: {str(e)}")

@router.delete("/{username}/experiences/{exp_id}", response_model=BaseResponse)
async def delete_user_experience(
    username: str = Path(..., description="用户名"),
    exp_id: str = Path(..., description="经历ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的工作经历（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现删除经历逻辑
        return BaseResponse(
            success=True,
            message="删除工作经历成功"
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除工作经历失败: {str(e)}")

@router.post("/{username}/quick-links", response_model=BaseResponse)
async def create_user_quick_link(
    link_data: dict,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建快捷链接（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现创建链接逻辑
        return BaseResponse(
            success=True,
            message="创建快捷链接成功",
            data=link_data
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建快捷链接失败: {str(e)}")

@router.put("/{username}/quick-links/{link_id}", response_model=BaseResponse)
async def update_user_quick_link(
    link_data: dict,
    username: str = Path(..., description="用户名"),
    link_id: str = Path(..., description="链接ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的快捷链接（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现更新链接逻辑
        return BaseResponse(
            success=True,
            message="更新快捷链接成功",
            data=link_data
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新快捷链接失败: {str(e)}")

@router.delete("/{username}/quick-links/{link_id}", response_model=BaseResponse)
async def delete_user_quick_link(
    username: str = Path(..., description="用户名"),
    link_id: str = Path(..., description="链接ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的快捷链接（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # TODO: 实现删除链接逻辑
        return BaseResponse(
            success=True,
            message="删除快捷链接成功"
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除快捷链接失败: {str(e)}")