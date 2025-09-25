from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models import BaseResponse, ListResponse
from app.services import ProjectService, TimelineService, ProfileService, SettingsService
from app.utils import DataValidationError

router = APIRouter()

# 注意：在实际项目中，这里应该添加 tinyauth 的认证装饰器
# 由于用户提到会使用 tinyauth，这里预留了认证接口

def get_current_user():
    """获取当前用户 - 预留给 tinyauth 集成"""
    # TODO: 集成 tinyauth 认证
    return {"username": "admin", "role": "admin"}

@router.get("/dashboard", response_model=BaseResponse)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """获取管理后台仪表板统计数据"""
    try:
        # 项目统计
        projects = ProjectService.get_all_projects()
        project_stats = {
            "total": len(projects),
            "active": len([p for p in projects if p.status == "active"]),
            "maintained": len([p for p in projects if p.status == "maintained"]),
            "archived": len([p for p in projects if p.status == "archived"])
        }
        
        # 时间线统计
        timeline_items = TimelineService.get_all_timeline_items()
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取仪表板数据失败: {str(e)}")

@router.get("/settings", response_model=BaseResponse)
async def get_admin_settings(current_user: dict = Depends(get_current_user)):
    """获取管理设置"""
    try:
        settings = SettingsService.get_settings()
        return BaseResponse(
            success=True,
            message="获取设置成功",
            data=settings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取设置失败: {str(e)}")

@router.get("/settings/project-features", response_model=ListResponse)
async def get_project_features(current_user: dict = Depends(get_current_user)):
    """获取项目特性列表"""
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

@router.get("/settings/tech-stacks", response_model=BaseResponse)
async def get_tech_stacks(current_user: dict = Depends(get_current_user)):
    """获取技术栈配置"""
    try:
        tech_stacks = SettingsService.get_tech_stacks()
        return BaseResponse(
            success=True,
            message="获取技术栈配置成功",
            data=tech_stacks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取技术栈配置失败: {str(e)}")

@router.get("/settings/project-categories", response_model=ListResponse)
async def get_project_categories(current_user: dict = Depends(get_current_user)):
    """获取项目分类"""
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

@router.get("/settings/theme-colors", response_model=ListResponse)
async def get_theme_colors(current_user: dict = Depends(get_current_user)):
    """获取主题颜色配置"""
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

@router.get("/projects/management", response_model=ListResponse)
async def get_projects_for_management(current_user: dict = Depends(get_current_user)):
    """获取项目管理列表（包含额外的管理信息）"""
    try:
        projects = ProjectService.get_all_projects()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目管理列表失败: {str(e)}")

@router.get("/timeline/management", response_model=ListResponse)
async def get_timeline_for_management(current_user: dict = Depends(get_current_user)):
    """获取时间线管理列表（包含额外的管理信息）"""
    try:
        items = TimelineService.get_all_timeline_items()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线管理列表失败: {str(e)}")

@router.get("/analytics/overview", response_model=BaseResponse)
async def get_analytics_overview(current_user: dict = Depends(get_current_user)):
    """获取分析概览数据"""
    try:
        projects = ProjectService.get_all_projects()
        timeline_items = TimelineService.get_all_timeline_items()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分析概览失败: {str(e)}")