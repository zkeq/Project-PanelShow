from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List, Dict, Any, Optional
from app.models import BaseResponse, ListResponse, CreateProjectRequest, CreateTimelineRequest
from app.services import ProjectService, TimelineService, ProfileService, SettingsService, UserService
from app.utils import DataValidationError, UserNotFoundError
from app.auth import require_admin, require_auth, can_manage_user, TokenData

router = APIRouter()

# 系统设置相关接口（管理员专用）
@router.get("/settings", response_model=BaseResponse)
async def get_admin_settings(current_user: TokenData = Depends(require_admin)):
    """获取管理设置（管理员权限）"""
    try:
        settings = SettingsService.get_settings()
        return BaseResponse(
            success=True,
            message="获取设置成功",
            data=settings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取设置失败: {str(e)}")

@router.put("/settings", response_model=BaseResponse)
async def update_admin_settings(
    settings_data: dict,
    current_user: TokenData = Depends(require_admin)
):
    """更新管理设置（管理员权限）"""
    try:
        # TODO: 实现设置更新逻辑
        return BaseResponse(
            success=True,
            message="更新设置成功",
            data=settings_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新设置失败: {str(e)}")

# 设置子项管理接口
@router.get("/settings/project-features", response_model=ListResponse)
async def get_project_features(current_user: TokenData = Depends(require_admin)):
    """获取项目特性列表（管理员权限）"""
    try:
        features = SettingsService.get_project_features()
        return ListResponse(
            success=True,
            message="获取项目特性成功",
            data=features,
            total=len(features)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目特性失败: {str(e)}")

@router.post("/settings/project-features", response_model=BaseResponse)
async def add_project_feature(
    feature_data: dict,
    current_user: TokenData = Depends(require_admin)
):
    """添加项目特性（管理员权限）"""
    try:
        # TODO: 实现添加项目特性逻辑
        return BaseResponse(
            success=True,
            message="添加项目特性成功",
            data=feature_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加项目特性失败: {str(e)}")

@router.get("/settings/tech-stacks", response_model=BaseResponse)
async def get_tech_stacks(current_user: TokenData = Depends(require_admin)):
    """获取技术栈配置（管理员权限）"""
    try:
        tech_stacks = SettingsService.get_tech_stacks()
        return BaseResponse(
            success=True,
            message="获取技术栈配置成功",
            data=tech_stacks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取技术栈配置失败: {str(e)}")

@router.put("/settings/tech-stacks", response_model=BaseResponse)
async def update_tech_stacks(
    tech_stacks_data: dict,
    current_user: TokenData = Depends(require_admin)
):
    """更新技术栈配置（管理员权限）"""
    try:
        # TODO: 实现更新技术栈逻辑
        return BaseResponse(
            success=True,
            message="更新技术栈配置成功",
            data=tech_stacks_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新技术栈配置失败: {str(e)}")

@router.get("/settings/project-categories", response_model=ListResponse)
async def get_project_categories(current_user: TokenData = Depends(require_admin)):
    """获取项目分类（管理员权限）"""
    try:
        categories = SettingsService.get_project_categories()
        return ListResponse(
            success=True,
            message="获取项目分类成功",
            data=categories,
            total=len(categories)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目分类失败: {str(e)}")

@router.post("/settings/project-categories", response_model=BaseResponse)
async def add_project_category(
    category_data: dict,
    current_user: TokenData = Depends(require_admin)
):
    """添加项目分类（管理员权限）"""
    try:
        # TODO: 实现添加项目分类逻辑
        return BaseResponse(
            success=True,
            message="添加项目分类成功",
            data=category_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加项目分类失败: {str(e)}")

@router.get("/settings/theme-colors", response_model=ListResponse)
async def get_theme_colors(current_user: TokenData = Depends(require_admin)):
    """获取主题颜色配置（管理员权限）"""
    try:
        colors = SettingsService.get_theme_colors()
        return ListResponse(
            success=True,
            message="获取主题颜色成功",
            data=colors,
            total=len(colors)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取主题颜色失败: {str(e)}")

@router.post("/settings/theme-colors", response_model=BaseResponse)
async def add_theme_color(
    color_data: dict,
    current_user: TokenData = Depends(require_admin)
):
    """添加主题颜色（管理员权限）"""
    try:
        # TODO: 实现添加主题颜色逻辑
        return BaseResponse(
            success=True,
            message="添加主题颜色成功",
            data=color_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加主题颜色失败: {str(e)}")

# 用户数据管理接口
@router.get("/{username}/dashboard", response_model=BaseResponse)
async def get_user_dashboard_stats(
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """获取指定用户的管理后台仪表板统计数据（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        # 项目统计
        projects = ProjectService.get_all_projects(username)
        project_stats = {
            "total": len(projects),
            "active": len([p for p in projects if p.status == "active"]),
            "maintained": len([p for p in projects if p.status == "maintained"]),
            "archived": len([p for p in projects if p.status == "archived"])
        }
        
        # 时间线统计
        timeline_items = TimelineService.get_all_timeline_items(username)
        timeline_stats = {
            "total": len(timeline_items),
            "thisMonth": len([
                item for item in timeline_items 
                if item.publishedAt.startswith("2024-08")  # 简化的月份过滤
            ]),
            "totalLikes": sum(item.likes for item in timeline_items),
            "totalComments": sum(item.comments for item in timeline_items)
        }
        
        # 按分类统计项目
        category_stats = {}
        for project in projects:
            if project.category not in category_stats:
                category_stats[project.category] = 0
            category_stats[project.category] += 1
        
        dashboard_data = {
            "projects": project_stats,
            "timeline": timeline_stats,
            "categories": category_stats,
            "recentActivity": [item.dict() for item in timeline_items[:5]]  # 最近5条动态
        }
        
        return BaseResponse(
            success=True,
            message="获取仪表板数据成功",
            data=dashboard_data
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取仪表板数据失败: {str(e)}")

# 项目管理接口
@router.get("/{username}/projects/management", response_model=ListResponse)
async def get_user_projects_for_management(
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """获取指定用户的项目管理列表（包含额外的管理信息）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        projects = ProjectService.get_all_projects(username)
        
        # 为每个项目添加管理相关的统计信息
        management_projects = []
        for project in projects:
            project_dict = project.dict()
            
            # 添加管理统计
            project_dict["managementStats"] = {
                "createdAt": project.updatedAt,  # 简化处理
                "lastModified": project.updatedAt,
                "viewCount": 0,  # 预留字段
                "status": project.status
            }
            
            management_projects.append(project_dict)
        
        return ListResponse(
            success=True,
            message="获取项目管理列表成功",
            data=management_projects,
            total=len(management_projects)
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目管理列表失败: {str(e)}")

@router.post("/{username}/projects", response_model=BaseResponse)
async def create_project_for_user(
    request: CreateProjectRequest,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建项目（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        project = ProjectService.create_project(username, request)
        return BaseResponse(
            success=True,
            message="创建项目成功",
            data=project.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建项目失败: {str(e)}")

@router.put("/{username}/projects/{project_id}", response_model=BaseResponse)
async def update_project_for_user(
    updates: dict,
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的项目（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        # 验证项目是否存在
        existing_project = ProjectService.get_project_by_id(username, project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        project = ProjectService.update_project(username, project_id, updates)
        if not project:
            raise HTTPException(status_code=500, detail="更新项目失败")
        
        return BaseResponse(
            success=True,
            message="更新项目成功",
            data=project.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新项目失败: {str(e)}")

@router.delete("/{username}/projects/{project_id}", response_model=BaseResponse)
async def delete_project_for_user(
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的项目（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        # 验证项目是否存在
        existing_project = ProjectService.get_project_by_id(username, project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        success = ProjectService.delete_project(username, project_id)
        if not success:
            raise HTTPException(status_code=500, detail="删除项目失败")
        
        return BaseResponse(
            success=True,
            message="删除项目成功"
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除项目失败: {str(e)}")

# 时间线管理接口
@router.get("/{username}/timeline/management", response_model=ListResponse)
async def get_user_timeline_for_management(
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """获取指定用户的时间线管理列表（包含额外的管理信息）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        items = TimelineService.get_all_timeline_items(username)
        
        # 为每个时间线项添加管理相关的统计信息
        management_items = []
        for item in items:
            item_dict = item.dict()
            
            # 添加管理统计
            item_dict["managementStats"] = {
                "engagementRate": item.likes / max(1, item.comments) if item.comments > 0 else item.likes,
                "isPopular": item.likes > 20,
                "needsAttention": item.comments > item.likes
            }
            
            management_items.append(item_dict)
        
        return ListResponse(
            success=True,
            message="获取时间线管理列表成功",
            data=management_items,
            total=len(management_items)
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线管理列表失败: {str(e)}")

@router.post("/{username}/timeline", response_model=BaseResponse)
async def create_timeline_for_user(
    request: CreateTimelineRequest,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建时间线项（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        item = TimelineService.create_timeline_item(username, request)
        return BaseResponse(
            success=True,
            message="创建时间线项成功",
            data=item.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建时间线项失败: {str(e)}")

@router.put("/{username}/timeline/{item_id}", response_model=BaseResponse)
async def update_timeline_for_user(
    updates: dict,
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的时间线项（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        # 验证时间线项是否存在
        existing_item = TimelineService.get_timeline_item_by_id(username, item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        item = TimelineService.update_timeline_item(username, item_id, updates)
        if not item:
            raise HTTPException(status_code=500, detail="更新时间线项失败")
        
        return BaseResponse(
            success=True,
            message="更新时间线项成功",
            data=item.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新时间线项失败: {str(e)}")

@router.delete("/{username}/timeline/{item_id}", response_model=BaseResponse)
async def delete_timeline_for_user(
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的时间线项（管理权限）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        # 验证时间线项是否存在
        existing_item = TimelineService.get_timeline_item_by_id(username, item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        success = TimelineService.delete_timeline_item(username, item_id)
        if not success:
            raise HTTPException(status_code=500, detail="删除时间线项失败")
        
        return BaseResponse(
            success=True,
            message="删除时间线项成功"
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除时间线项失败: {str(e)}")

# 分析接口
@router.get("/{username}/analytics/overview", response_model=BaseResponse)
async def get_user_analytics_overview(
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """获取指定用户的分析概览数据"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # 检查用户是否存在
        if not UserService.user_exists(username):
            raise HTTPException(status_code=404, detail="用户不存在")
        
        projects = ProjectService.get_all_projects(username)
        timeline_items = TimelineService.get_all_timeline_items(username)
        
        # 计算各种分析指标
        analytics = {
            "contentMetrics": {
                "totalProjects": len(projects),
                "totalTimeline": len(timeline_items),
                "totalLikes": sum(item.likes for item in timeline_items),
                "averageLikesPerPost": sum(item.likes for item in timeline_items) / max(1, len(timeline_items))
            },
            "engagementMetrics": {
                "highEngagementPosts": len([item for item in timeline_items if item.likes > 20]),
                "mostLikedPost": max(timeline_items, key=lambda x: x.likes).changelog if timeline_items else None,
                "recentActivity": len([item for item in timeline_items if item.publishedAt.startswith("2024-08")])
            },
            "projectMetrics": {
                "activeProjects": len([p for p in projects if p.status == "active"]),
                "completionRate": len([p for p in projects if p.status == "archived"]) / max(1, len(projects)) * 100,
                "categoryDistribution": {}
            }
        }
        
        # 项目分类分布
        for project in projects:
            if project.category not in analytics["projectMetrics"]["categoryDistribution"]:
                analytics["projectMetrics"]["categoryDistribution"][project.category] = 0
            analytics["projectMetrics"]["categoryDistribution"][project.category] += 1
        
        return BaseResponse(
            success=True,
            message="获取分析概览成功",
            data=analytics
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分析概览失败: {str(e)}")