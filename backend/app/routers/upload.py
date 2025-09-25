from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import List, Optional
import os
import uuid
from datetime import datetime
from app.models import BaseResponse
from app.utils import sanitize_filename, ensure_upload_dir

router = APIRouter()

# 允许的文件类型
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.md'}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS

# 文件大小限制 (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

def validate_file(file: UploadFile) -> tuple[bool, str]:
    """验证上传的文件"""
    if not file.filename:
        return False, "文件名不能为空"
    
    # 检查文件扩展名
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"不支持的文件类型：{file_ext}"
    
    # 检查文件大小
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        return False, f"文件大小超过限制：{file.size / 1024 / 1024:.2f}MB"
    
    return True, ""

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    sanitized_name = sanitize_filename(original_filename)
    name, ext = os.path.splitext(sanitized_name)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f"{name}_{timestamp}_{unique_id}{ext}"

@router.post("/upload", response_model=BaseResponse)
async def upload_file(
    file: UploadFile = File(...),
    category: Optional[str] = Form(default="general"),
    description: Optional[str] = Form(default="")
):
    """上传单个文件"""
    try:
        # 验证文件
        is_valid, error_message = validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # 确保上传目录存在
        upload_dir = ensure_upload_dir()
        
        # 创建分类目录
        category_dir = os.path.join(upload_dir, category)
        os.makedirs(category_dir, exist_ok=True)
        
        # 生成唯一文件名
        unique_filename = generate_unique_filename(file.filename)
        file_path = os.path.join(category_dir, unique_filename)
        
        # 读取并保存文件
        content = await file.read()
        
        # 检查实际文件大小
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"文件大小超过限制：{len(content) / 1024 / 1024:.2f}MB"
            )
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # 生成访问URL
        relative_path = os.path.join(category, unique_filename).replace('\\', '/')
        file_url = f"/static/uploads/{relative_path}"
        
        # 文件信息
        file_info = {
            "originalName": file.filename,
            "filename": unique_filename,
            "url": file_url,
            "size": len(content),
            "type": file.content_type,
            "category": category,
            "description": description,
            "uploadTime": datetime.now().isoformat()
        }
        
        return BaseResponse(
            success=True,
            message="文件上传成功",
            data=file_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@router.post("/upload/multiple", response_model=BaseResponse)
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    category: Optional[str] = Form(default="general"),
    description: Optional[str] = Form(default="")
):
    """上传多个文件"""
    try:
        if len(files) > 10:  # 限制最多10个文件
            raise HTTPException(status_code=400, detail="一次最多只能上传10个文件")
        
        upload_results = []
        failed_files = []
        
        for file in files:
            try:
                # 验证文件
                is_valid, error_message = validate_file(file)
                if not is_valid:
                    failed_files.append({
                        "filename": file.filename,
                        "error": error_message
                    })
                    continue
                
                # 确保上传目录存在
                upload_dir = ensure_upload_dir()
                category_dir = os.path.join(upload_dir, category)
                os.makedirs(category_dir, exist_ok=True)
                
                # 生成唯一文件名
                unique_filename = generate_unique_filename(file.filename)
                file_path = os.path.join(category_dir, unique_filename)
                
                # 读取并保存文件
                content = await file.read()
                
                if len(content) > MAX_FILE_SIZE:
                    failed_files.append({
                        "filename": file.filename,
                        "error": f"文件大小超过限制：{len(content) / 1024 / 1024:.2f}MB"
                    })
                    continue
                
                with open(file_path, "wb") as f:
                    f.write(content)
                
                # 生成访问URL
                relative_path = os.path.join(category, unique_filename).replace('\\', '/')
                file_url = f"/static/uploads/{relative_path}"
                
                upload_results.append({
                    "originalName": file.filename,
                    "filename": unique_filename,
                    "url": file_url,
                    "size": len(content),
                    "type": file.content_type,
                    "category": category
                })
                
            except Exception as e:
                failed_files.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        result_data = {
            "successful": upload_results,
            "failed": failed_files,
            "summary": {
                "total": len(files),
                "successful": len(upload_results),
                "failed": len(failed_files)
            }
        }
        
        message = f"文件上传完成：成功 {len(upload_results)} 个，失败 {len(failed_files)} 个"
        
        return BaseResponse(
            success=len(upload_results) > 0,
            message=message,
            data=result_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量文件上传失败: {str(e)}")

@router.get("/list/{category}", response_model=BaseResponse)
async def list_files(category: str = "general"):
    """列出指定分类的文件"""
    try:
        upload_dir = ensure_upload_dir()
        category_dir = os.path.join(upload_dir, category)
        
        if not os.path.exists(category_dir):
            return BaseResponse(
                success=True,
                message="获取文件列表成功",
                data=[]
            )
        
        files = []
        for filename in os.listdir(category_dir):
            file_path = os.path.join(category_dir, filename)
            if os.path.isfile(file_path):
                stat = os.stat(file_path)
                file_url = f"/static/uploads/{category}/{filename}"
                
                files.append({
                    "filename": filename,
                    "url": file_url,
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "category": category
                })
        
        # 按修改时间倒序排序
        files.sort(key=lambda x: x["modified"], reverse=True)
        
        return BaseResponse(
            success=True,
            message="获取文件列表成功",
            data=files
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取文件列表失败: {str(e)}")

@router.delete("/{category}/{filename}", response_model=BaseResponse)
async def delete_file(category: str, filename: str):
    """删除指定文件"""
    try:
        upload_dir = ensure_upload_dir()
        file_path = os.path.join(upload_dir, category, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="文件未找到")
        
        os.remove(file_path)
        
        return BaseResponse(
            success=True,
            message="文件删除成功"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件删除失败: {str(e)}")

@router.get("/info", response_model=BaseResponse)
async def get_upload_info():
    """获取上传配置信息"""
    return BaseResponse(
        success=True,
        message="获取上传信息成功",
        data={
            "maxFileSize": MAX_FILE_SIZE,
            "maxFileSizeMB": MAX_FILE_SIZE / 1024 / 1024,
            "allowedExtensions": list(ALLOWED_EXTENSIONS),
            "imageExtensions": list(ALLOWED_IMAGE_EXTENSIONS),
            "documentExtensions": list(ALLOWED_DOCUMENT_EXTENSIONS),
            "maxFilesPerUpload": 10
        }
    )