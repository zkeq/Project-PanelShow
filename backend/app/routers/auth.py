"""
认证成功处理路由
"""
from fastapi import APIRouter, Request, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from app.models import BaseResponse
from app.auth import get_current_user, require_auth, TokenData

router = APIRouter(prefix="/auth", tags=["认证"])

@router.get("/success")
async def auth_success(request: Request):
    """认证成功后的处理页面"""

    # 获取认证用户信息
    auth_user = request.headers.get("X-Auth-User", "未知用户")
    auth_email = request.headers.get("X-Auth-Email", "")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>认证成功 - Portfolio Backend</title>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .success {{ color: #28a745; }}
            .info {{ background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .btn {{ display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px 0 0; }}
            .btn:hover {{ background: #0056b3; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="success">🎉 认证成功！</h1>
            <p>欢迎，{auth_user}！</p>

            <div class="info">
                <h3>认证信息</h3>
                <p><strong>用户名:</strong> {auth_user}</p>
                <p><strong>邮箱:</strong> {auth_email or '未提供'}</p>
                <p><strong>认证方式:</strong> 自定义认证</p>
            </div>

            <h3>现在你可以：</h3>
            <ul>
                <li>访问需要认证的API端点</li>
                <li>管理你的项目和时间线</li>
                <li>使用完整的后端功能</li>
            </ul>

            <h3>测试API接口：</h3>
            <div>
                <a href="/api/auth/me" class="btn">查看个人信息</a>
                <a href="/api/profile/zkeq/info" class="btn">查看用户资料</a>
                <a href="/api/projects/zkeq/" class="btn">查看项目列表</a>
                <a href="/api/admin/zkeq/dashboard" class="btn">管理后台</a>
                <a href="/docs" class="btn">API文档</a>
            </div>

            <div class="info">
                <h4>💡 开发提示</h4>
                <p>这个页面证明认证流程已经正常工作。在生产环境中，你可能希望：</p>
                <ul>
                    <li>重定向到前端应用</li>
                    <li>设置认证cookie</li>
                    <li>返回JWT token</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content)

@router.get("/status")
async def auth_status(request: Request):
    """检查当前认证状态"""

    user = await get_current_user(request)
    
    if user:
        return BaseResponse(
            success=True,
            message="已认证",
            data={
                "authenticated": True,
                "user": user.username,
                "email": user.email,
                "role": user.role,
                "method": user.auth_method
            }
        )
    else:
        return BaseResponse(
            success=False,
            message="未认证",
            data={
                "authenticated": False,
                "method": None
            }
        )

@router.get("/me")
async def get_current_user_info(current_user: TokenData = Depends(require_auth)):
    """获取当前用户的详细信息"""
    
    user_info = {
        "username": current_user.username,
        "email": current_user.email,
        "user_id": current_user.user_id,
        "role": current_user.role,
        "auth_method": current_user.auth_method,
        "permissions": {
            "can_manage_profile": True,
            "can_manage_projects": True,
            "can_access_admin": current_user.role == "admin",
            "can_upload_files": True
        },
        "account_info": {
            "status": "active",
            "created_via": current_user.auth_method,
            "last_login": "刚刚",
            "account_type": "认证用户"
        }
    }
    
    return BaseResponse(
        success=True,
        message="获取用户信息成功",
        data=user_info
    )

@router.get("/profile")
async def get_user_profile_summary(current_user: TokenData = Depends(require_auth)):
    """获取当前用户的资料摘要"""
    
    profile_summary = {
        "basic_info": {
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "display_name": current_user.username,
            "avatar_url": f"https://github.com/{current_user.username}.png" if current_user.auth_method == "github" else None
        },
        "account_status": {
            "verified": True,
            "active": True,
            "auth_method": current_user.auth_method,
            "last_activity": "刚刚"
        },
        "capabilities": {
            "can_create_projects": True,
            "can_manage_timeline": True,
            "can_upload_files": True,
            "admin_access": current_user.role == "admin"
        },
        "stats": {
            "login_count": "N/A",
            "projects_count": 0,
            "last_login": "刚刚"
        }
    }
    
    return BaseResponse(
        success=True,
        message="获取用户资料摘要成功",
        data=profile_summary
    )

@router.post("/refresh")
async def refresh_user_session(current_user: TokenData = Depends(require_auth)):
    """刷新用户会话信息"""
    
    return BaseResponse(
        success=True,
        message="会话刷新成功",
        data={
            "user": current_user.username,
            "refreshed_at": "刚刚",
            "expires_in": "24小时"
        }
    )

@router.get("/logout")
async def logout():
    """登出"""
    return BaseResponse(
        success=True,
        message="登出成功",
        data={"redirect_url": "/"}
    )