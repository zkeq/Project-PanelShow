from fastapi import APIRouter, HTTPException, Query, Path, Depends
from typing import List, Optional
from app.models import (
    Project, ProjectDetail, BaseResponse, ListResponse, 
    CreateProjectRequest
)
from app.services import ProjectService, UserService
from app.utils import DataNotFoundError, DataValidationError, UserNotFoundError
from app.auth import require_auth, TokenData

router = APIRouter()

@router.get("/{username}/", response_model=ListResponse)
async def get_user_projects(
    username: str = Path(..., description="用户名"),
    category: Optional[str] = Query(None, description="项目分类"),
    status: Optional[str] = Query(None, description="项目状态"),
    limit: Optional[int] = Query(None, description="返回数量限制"),
    offset: Optional[int] = Query(0, description="偏移量")
):
    """获取指定用户的项目列表"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        if category:
            projects = ProjectService.get_projects_by_category(username, category)
        else:
            projects = ProjectService.get_projects_by_username(username)
        
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
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目列表失败: {str(e)}")

@router.get("/{username}/{project_id}", response_model=BaseResponse)
async def get_user_project(
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID")
):
    """根据用户名和项目ID获取项目信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        project = ProjectService.get_project_by_id(username, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目未找到")
        
        return BaseResponse(
            success=True,
            message="获取项目成功",
            data=project.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目失败: {str(e)}")

@router.get("/{username}/{project_id}/detail", response_model=BaseResponse)
async def get_user_project_detail(
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID")
):
    """获取指定用户的项目详情"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        project_detail = ProjectService.get_project_detail(username, project_id)
        if not project_detail:
            raise HTTPException(status_code=404, detail="项目详情未找到")
        
        return BaseResponse(
            success=True,
            message="获取项目详情成功",
            data=project_detail.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目详情失败: {str(e)}")

# 以下是需要认证的管理接口
@router.post("/{username}/", response_model=BaseResponse)
async def create_user_project(
    request: CreateProjectRequest,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建新项目（需要认证）"""
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

@router.put("/{username}/{project_id}", response_model=BaseResponse)
async def update_user_project(
    updates: dict,
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的项目信息（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # TODO: 添加认证检查
        
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

@router.delete("/{username}/{project_id}", response_model=BaseResponse)
async def delete_user_project(
    username: str = Path(..., description="用户名"),
    project_id: str = Path(..., description="项目ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的项目（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # TODO: 添加认证检查
        
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

@router.get("/{username}/categories/list", response_model=ListResponse)
async def get_user_project_categories(username: str = Path(..., description="用户名")):
    """获取指定用户的项目分类列表"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        # 从现有项目中提取分类
        projects = ProjectService.get_projects_by_username(username)
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
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目分类失败: {str(e)}")

@router.get("/{username}/stats/overview", response_model=BaseResponse)
async def get_user_project_stats(username: str = Path(..., description="用户名")):
    """获取指定用户的项目统计信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        projects = ProjectService.get_projects_by_username(username)
        
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
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目统计失败: {str(e)}")

# 公开用户列表接口
@router.get("/", response_model=ListResponse)
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
                    "projectCount": len(ProjectService.get_projects_by_username(username))
                })
        
        return ListResponse(
            success=True,
            message="获取公开用户列表成功",
            data=users_info,
            total=len(users_info)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取公开用户列表失败: {str(e)}")