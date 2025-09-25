from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models import (
    Project, ProjectDetail, BaseResponse, ListResponse, 
    CreateProjectRequest
)
from app.services import ProjectService
from app.utils import DataNotFoundError, DataValidationError

router = APIRouter()

@router.get("/", response_model=ListResponse)
async def get_projects(
    username: Optional[str] = Query(None, description="用户名"),
    category: Optional[str] = Query(None, description="项目分类"),
    status: Optional[str] = Query(None, description="项目状态"),
    limit: Optional[int] = Query(None, description="返回数量限制"),
    offset: Optional[int] = Query(0, description="偏移量")
):
    """获取项目列表"""
    try:
        if username:
            projects = ProjectService.get_projects_by_username(username)
        elif category:
            projects = ProjectService.get_projects_by_category(category)
        else:
            projects = ProjectService.get_all_projects()
        
        # 按状态过滤
        if status:
            projects = [p for p in projects if p.status == status]
        
        # 分页
        total = len(projects)
        if limit:
            projects = projects[offset:offset + limit]
        
        return ListResponse(
            success=True,
            message="获取项目列表成功",
            data=[p.dict() for p in projects],
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目列表失败: {str(e)}")

@router.get("/{project_id}", response_model=BaseResponse)
async def get_project(project_id: str):
    """根据ID获取项目信息"""
    try:
        project = ProjectService.get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        return BaseResponse(
            success=True,
            message="获取项目成功",
            data=project.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目失败: {str(e)}")

@router.get("/{username}/{project_id}/detail", response_model=BaseResponse)
async def get_project_detail(username: str, project_id: str):
    """获取项目详情"""
    try:
        project_detail = ProjectService.get_project_detail(username, project_id)
        if not project_detail:
            raise HTTPException(status_code=404, detail="项目详情未找到")
        
        return BaseResponse(
            success=True,
            message="获取项目详情成功",
            data=project_detail.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目详情失败: {str(e)}")

@router.post("/", response_model=BaseResponse)
async def create_project(request: CreateProjectRequest):
    """创建新项目"""
    try:
        project = ProjectService.create_project(request)
        return BaseResponse(
            success=True,
            message="创建项目成功",
            data=project.dict()
        )
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建项目失败: {str(e)}")

@router.put("/{project_id}", response_model=BaseResponse)
async def update_project(project_id: str, updates: dict):
    """更新项目信息"""
    try:
        # 验证项目是否存在
        existing_project = ProjectService.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        project = ProjectService.update_project(project_id, updates)
        if not project:
            raise HTTPException(status_code=500, detail="更新项目失败")
        
        return BaseResponse(
            success=True,
            message="更新项目成功",
            data=project.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新项目失败: {str(e)}")

@router.delete("/{project_id}", response_model=BaseResponse)
async def delete_project(project_id: str):
    """删除项目"""
    try:
        # 验证项目是否存在
        existing_project = ProjectService.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        success = ProjectService.delete_project(project_id)
        if not success:
            raise HTTPException(status_code=500, detail="删除项目失败")
        
        return BaseResponse(
            success=True,
            message="删除项目成功"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除项目失败: {str(e)}")

@router.get("/categories/list", response_model=ListResponse)
async def get_project_categories():
    """获取项目分类列表"""
    try:
        # 从现有项目中提取分类
        projects = ProjectService.get_all_projects()
        categories = {}
        
        for project in projects:
            if project.category not in categories:
                categories[project.category] = {
                    "id": project.category,
                    "name": project.category,
                    "count": 0
                }
            categories[project.category]["count"] += 1
        
        return ListResponse(
            success=True,
            message="获取项目分类成功",
            data=list(categories.values()),
            total=len(categories)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目分类失败: {str(e)}")

@router.get("/stats/overview", response_model=BaseResponse)
async def get_project_stats():
    """获取项目统计信息"""
    try:
        projects = ProjectService.get_all_projects()
        
        stats = {
            "total": len(projects),
            "active": len([p for p in projects if p.status == "active"]),
            "maintained": len([p for p in projects if p.status == "maintained"]),
            "archived": len([p for p in projects if p.status == "archived"]),
            "categories": {}
        }
        
        for project in projects:
            if project.category not in stats["categories"]:
                stats["categories"][project.category] = 0
            stats["categories"][project.category] += 1
        
        return BaseResponse(
            success=True,
            message="获取项目统计成功",
            data=stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目统计失败: {str(e)}")