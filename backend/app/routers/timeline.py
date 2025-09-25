from fastapi import APIRouter, HTTPException, Query, Path, Depends, Request
from typing import List, Optional
from app.models import (
    TimelineItem, BaseResponse, ListResponse, 
    CreateTimelineRequest
)
from app.services import TimelineService, UserService
from app.utils import DataNotFoundError, DataValidationError, UserNotFoundError
from app.auth import require_auth, TokenData

router = APIRouter()

@router.get("/{username}/", response_model=ListResponse)
async def get_user_timeline_items(
    username: str = Path(..., description="用户名"),
    limit: Optional[int] = Query(None, description="返回数量限制"),
    offset: Optional[int] = Query(0, description="偏移量"),
    update_type: Optional[str] = Query(None, description="更新类型过滤")
):
    """获取指定用户的时间线列表"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        items = TimelineService.get_all_timeline_items(username)
        
        # 按更新类型过滤
        if update_type:
            items = [item for item in items if item.updateType == update_type]
        
        # 分页
        total = len(items)
        if limit:
            items = items[offset:offset + limit]
        
        return ListResponse(
            success=True,
            message="获取时间线成功",
            data=[item.dict() for item in items],
            total=total
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线失败: {str(e)}")

@router.get("/{username}/{item_id}", response_model=BaseResponse)
async def get_user_timeline_item(
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID")
):
    """根据用户名和ID获取时间线项"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        item = TimelineService.get_timeline_item_by_id(username, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        return BaseResponse(
            success=True,
            message="获取时间线项成功",
            data=item.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线项失败: {str(e)}")

# 以下是需要认证的管理接口
@router.post("/{username}/", response_model=BaseResponse)
async def create_user_timeline_item(
    request: Request,
    timeline_request: CreateTimelineRequest,
    username: str = Path(..., description="用户名"),
    current_user: TokenData = Depends(require_auth)
):
    """为指定用户创建新的时间线项（需要认证）"""
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

@router.put("/{username}/{item_id}", response_model=BaseResponse)
async def update_user_timeline_item(
    updates: dict,
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID"),
    current_user: TokenData = Depends(require_auth)
):
    """更新指定用户的时间线项（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # TODO: 添加认证检查
        
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

@router.delete("/{username}/{item_id}", response_model=BaseResponse)
async def delete_user_timeline_item(
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID"),
    current_user: TokenData = Depends(require_auth)
):
    """删除指定用户的时间线项（需要认证）"""
    try:
        # 检查权限：管理员或用户自身
        if current_user.role != "admin" and current_user.username != username:
            raise HTTPException(status_code=403, detail="只能管理自己的数据")
        
        # TODO: 添加认证检查
        
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

@router.post("/{username}/{item_id}/like", response_model=BaseResponse)
async def like_user_timeline_item(
    username: str = Path(..., description="用户名"),
    item_id: str = Path(..., description="时间线项ID")
):
    """点赞/取消点赞指定用户的时间线项"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        item = TimelineService.like_timeline_item(username, item_id)
        if not item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        action = "点赞" if item.isLiked else "取消点赞"
        return BaseResponse(
            success=True,
            message=f"{action}成功",
            data=item.dict()
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"操作失败: {str(e)}")

@router.get("/{username}/stats/overview", response_model=BaseResponse)
async def get_user_timeline_stats(username: str = Path(..., description="用户名")):
    """获取指定用户的时间线统计信息"""
    try:
        # 检查用户是否为公开用户
        public_users = UserService.get_public_users()
        if username not in public_users:
            raise HTTPException(status_code=404, detail="用户不存在或未公开")
        
        items = TimelineService.get_all_timeline_items(username)
        
        stats = {
            "total": len(items),
            "totalLikes": sum(item.likes for item in items),
            "totalComments": sum(item.comments for item in items),
            "updateTypes": {},
            "monthlyStats": {}
        }
        
        # 按更新类型统计
        for item in items:
            if item.updateType not in stats["updateTypes"]:
                stats["updateTypes"][item.updateType] = 0
            stats["updateTypes"][item.updateType] += 1
        
        # 按月份统计（最近6个月）
        from datetime import datetime, timedelta
        import calendar
        
        now = datetime.now()
        for i in range(6):
            month_date = now - timedelta(days=30 * i)
            month_key = month_date.strftime('%Y-%m')
            month_name = f"{month_date.year}年{month_date.month}月"
            
            month_items = [
                item for item in items 
                if datetime.fromisoformat(item.publishedAt.replace('Z', '+00:00')).strftime('%Y-%m') == month_key
            ]
            
            stats["monthlyStats"][month_name] = {
                "count": len(month_items),
                "likes": sum(item.likes for item in month_items)
            }
        
        return BaseResponse(
            success=True,
            message="获取时间线统计成功",
            data=stats
        )
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线统计失败: {str(e)}")

@router.get("/types/list", response_model=ListResponse)
async def get_update_types():
    """获取更新类型列表"""
    try:
        types = [
            {"id": "new", "name": "新项目", "description": "全新的项目发布", "color": "blue"},
            {"id": "feature", "name": "新功能", "description": "添加新功能或特性", "color": "green"},
            {"id": "fix", "name": "修复", "description": "修复bug和问题", "color": "red"},
            {"id": "refactor", "name": "重构", "description": "代码重构和优化", "color": "purple"}
        ]
        
        return ListResponse(
            success=True,
            message="获取更新类型成功",
            data=types,
            total=len(types)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取更新类型失败: {str(e)}")