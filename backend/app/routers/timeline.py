from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models import (
    TimelineItem, BaseResponse, ListResponse, 
    CreateTimelineRequest
)
from app.services import TimelineService
from app.utils import DataNotFoundError, DataValidationError

router = APIRouter()

@router.get("/", response_model=ListResponse)
async def get_timeline_items(
    limit: Optional[int] = Query(None, description="返回数量限制"),
    offset: Optional[int] = Query(0, description="偏移量"),
    update_type: Optional[str] = Query(None, description="更新类型过滤")
):
    """获取时间线列表"""
    try:
        items = TimelineService.get_all_timeline_items()
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线失败: {str(e)}")

@router.get("/{item_id}", response_model=BaseResponse)
async def get_timeline_item(item_id: str):
    """根据ID获取时间线项"""
    try:
        item = TimelineService.get_timeline_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        return BaseResponse(
            success=True,
            message="获取时间线项成功",
            data=item.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取时间线项失败: {str(e)}")

@router.post("/", response_model=BaseResponse)
async def create_timeline_item(request: CreateTimelineRequest):
    """创建新的时间线项"""
    try:
        item = TimelineService.create_timeline_item(request)
        return BaseResponse(
            success=True,
            message="创建时间线项成功",
            data=item.dict()
        )
    except DataValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建时间线项失败: {str(e)}")

@router.put("/{item_id}", response_model=BaseResponse)
async def update_timeline_item(item_id: str, updates: dict):
    """更新时间线项"""
    try:
        # 验证时间线项是否存在
        existing_item = TimelineService.get_timeline_item_by_id(item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        item = TimelineService.update_timeline_item(item_id, updates)
        if not item:
            raise HTTPException(status_code=500, detail="更新时间线项失败")
        
        return BaseResponse(
            success=True,
            message="更新时间线项成功",
            data=item.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新时间线项失败: {str(e)}")

@router.delete("/{item_id}", response_model=BaseResponse)
async def delete_timeline_item(item_id: str):
    """删除时间线项"""
    try:
        # 验证时间线项是否存在
        existing_item = TimelineService.get_timeline_item_by_id(item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        success = TimelineService.delete_timeline_item(item_id)
        if not success:
            raise HTTPException(status_code=500, detail="删除时间线项失败")
        
        return BaseResponse(
            success=True,
            message="删除时间线项成功"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除时间线项失败: {str(e)}")

@router.post("/{item_id}/like", response_model=BaseResponse)
async def like_timeline_item(item_id: str):
    """点赞/取消点赞时间线项"""
    try:
        item = TimelineService.like_timeline_item(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="时间线项未找到")
        
        action = "点赞" if item.isLiked else "取消点赞"
        return BaseResponse(
            success=True,
            message=f"{action}成功",
            data=item.dict()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"操作失败: {str(e)}")

@router.get("/stats/summary", response_model=BaseResponse)
async def get_timeline_stats():
    """获取时间线统计信息"""
    try:
        items = TimelineService.get_all_timeline_items()
        
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