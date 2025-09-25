from fastapi import APIRouter, HTTPException
from typing import List
from app.models import (
    ProfileInfo, Experience, QuickLink, User, 
    BaseResponse, ListResponse, UpdateProfileRequest
)
from app.services import ProfileService
from app.utils import DataValidationError

router = APIRouter()

@router.get("/info", response_model=BaseResponse)
async def get_profile_info():
    """获取个人资料信息"""
    try:
        profile = ProfileService.get_profile_info()
        return BaseResponse(
            success=True,
            message="获取个人资料成功",
            data=profile.dict()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取个人资料失败: {str(e)}")

@router.put("/info", response_model=BaseResponse)
async def update_profile_info(request: UpdateProfileRequest):
    """更新个人资料信息"""
    try:
        profile = ProfileService.update_profile_info(request)
        return BaseResponse(
            success=True,
            message="更新个人资料成功",
            data=profile.dict()
        )
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新个人资料失败: {str(e)}")

@router.get("/users/{username}", response_model=BaseResponse)
async def get_user_by_username(username: str):
    """根据用户名获取用户信息"""
    try:
        user = ProfileService.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="用户未找到")
        
        return BaseResponse(
            success=True,
            message="获取用户信息成功",
            data=user.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取用户信息失败: {str(e)}")

@router.get("/experiences", response_model=ListResponse)
async def get_experiences():
    """获取工作经历列表"""
    try:
        experiences = ProfileService.get_experiences()
        return ListResponse(
            success=True,
            message="获取工作经历成功",
            data=[exp.dict() for exp in experiences],
            total=len(experiences)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工作经历失败: {str(e)}")

@router.get("/quick-links", response_model=ListResponse)
async def get_quick_links():
    """获取快捷链接列表"""
    try:
        links = ProfileService.get_quick_links()
        return ListResponse(
            success=True,
            message="获取快捷链接成功",
            data=[link.dict() for link in links],
            total=len(links)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取快捷链接失败: {str(e)}")

@router.get("/summary", response_model=BaseResponse)
async def get_profile_summary():
    """获取个人资料摘要（包含所有信息）"""
    try:
        profile = ProfileService.get_profile_info()
        experiences = ProfileService.get_experiences()
        quick_links = ProfileService.get_quick_links()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取个人资料摘要失败: {str(e)}")

@router.get("/skills/categories", response_model=BaseResponse)
async def get_skills_categories():
    """获取技能分类统计"""
    try:
        profile = ProfileService.get_profile_info()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取技能分类失败: {str(e)}")

@router.get("/contact", response_model=BaseResponse)
async def get_contact_info():
    """获取联系方式信息"""
    try:
        profile = ProfileService.get_profile_info()
        quick_links = ProfileService.get_quick_links()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取联系方式失败: {str(e)}")