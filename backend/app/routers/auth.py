"""
认证成功处理路由
"""
from fastapi import APIRouter, Request, HTTPException, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse
from app.models import BaseResponse

router = APIRouter(prefix="/auth", tags=["认证"])

@router.get("/success")
async def auth_success(request: Request):
    """认证成功后的处理页面"""

    # 获取认证用户信息（如果通过TinyAuth代理）
    auth_user = request.headers.get("X-Forwarded-User", "未知用户")
    auth_email = request.headers.get("X-Forwarded-Email", "")

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
                <p><strong>认证方式:</strong> GitHub OAuth</p>
            </div>

            <h3>现在你可以：</h3>
            <ul>
                <li>访问需要认证的API端点</li>
                <li>管理你的项目和时间线</li>
                <li>使用完整的后端功能</li>
            </ul>

            <h3>测试API接口：</h3>
            <div>
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

    auth_user = request.headers.get("X-Forwarded-User")
    auth_email = request.headers.get("X-Forwarded-Email")

    if auth_user:
        return BaseResponse(
            success=True,
            message="已认证",
            data={
                "authenticated": True,
                "user": auth_user,
                "email": auth_email,
                "method": "TinyAuth"
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

@router.get("/logout")
async def logout():
    """登出（重定向到TinyAuth登出）"""
    # 重定向到TinyAuth的登出页面
    return RedirectResponse(url="http://localhost:3002/logout")