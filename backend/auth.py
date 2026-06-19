"""
JWT认证系统 + GitHub OAuth + TDP OIDC + 用户名绑定
"""
import yaml
import httpx
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
import db

# 加载配置文件
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# JWT配置
SECRET_KEY = config['jwt']['secret_key']
ALGORITHM = config['jwt']['algorithm']
ACCESS_TOKEN_EXPIRE_MINUTES = config['jwt']['access_token_expire_minutes']

# GitHub OAuth 配置
GITHUB_CLIENT_ID = config['github']['client_id']
GITHUB_CLIENT_SECRET = config['github']['client_secret']
GITHUB_REDIRECT_URI = config['github']['redirect_uri']

# TDP OIDC 配置
TDP_CLIENT_ID = config['tdp']['client_id']
TDP_CLIENT_SECRET = config['tdp']['client_secret']
TDP_REDIRECT_URI = config['tdp']['redirect_uri']
TDP_ISSUER = config['tdp']['issuer']
TDP_AUTH_ENDPOINT = f"{TDP_ISSUER}/authorize"
TDP_TOKEN_ENDPOINT = f"{TDP_ISSUER}/oauth/token"
TDP_USERINFO_ENDPOINT = f"{TDP_ISSUER}/userinfo"
TDP_FRONTEND_CALLBACK = config['tdp']['frontend_callback']

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer认证
security = HTTPBearer()

# 管理员账号（从配置文件读取）
ADMIN_USERNAME = config['admin']['username']
ADMIN_PASSWORD_HASH = pwd_context.hash(config['admin']['password'])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """加密密码"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建JWT token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def decode_token(token: str) -> dict:
    """解码JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _build_user_from_payload(payload: dict) -> dict:
    auth_type = payload.get("auth_type")

    if auth_type == "admin":
        return {
            "role": "admin",
            "auth_type": "admin",
            "bound_username": get_admin_binding()
        }
    elif auth_type == "github":
        github_id = payload.get("github_id")
        github_username = payload.get("github_username")

        if not github_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭证"
            )

        return {
            "role": "user",
            "auth_type": "github",
            "github_id": github_id,
            "github_username": github_username,
            "bound_username": get_user_binding(github_id)
        }
    elif auth_type == "tdp":
        tdp_id = payload.get("tdp_id")
        tdp_username = payload.get("tdp_username")

        if not tdp_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭证"
            )

        return {
            "role": "user",
            "auth_type": "tdp",
            "tdp_id": tdp_id,
            "tdp_username": tdp_username,
            "bound_username": get_user_binding(tdp_id)
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证"
        )


def resolve_user_from_token(token: str) -> dict:
    payload = decode_token(token)
    return _build_user_from_payload(payload)


def try_resolve_user_from_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    try:
        return resolve_user_from_token(token)
    except HTTPException:
        return None


def authenticate_admin(username: str, password: str):
    """验证管理员（账号密码登录）"""
    if username != ADMIN_USERNAME:
        return False

    if not verify_password(password, ADMIN_PASSWORD_HASH):
        return False

    return {"username": username, "role": "admin", "auth_type": "password"}


async def github_get_access_token(code: str) -> str:
    """通过 GitHub code 获取 access_token"""
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
        try:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": GITHUB_REDIRECT_URI,
                },
                headers={"Accept": "application/json"}
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="GitHub 授权请求超时，请检查网络后重试")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="GitHub 授权请求失败，请稍后重试")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="GitHub 授权失败")

        data = response.json()
        access_token = data.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="未获取到 access_token")

        return access_token


async def github_get_user_info(access_token: str) -> dict:
    """通过 access_token 获取 GitHub 用户信息"""
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
        try:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="获取 GitHub 用户信息超时，请检查网络后重试")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="获取 GitHub 用户信息失败，请稍后重试")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="获取 GitHub 用户信息失败")

        return response.json()


async def github_fetch_user_summary(github_username: str) -> dict:
    """直接通过用户名获取 GitHub 用户概要信息及星标统计"""
    username = github_username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub 用户名不能为空")

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Project-PanelShow",
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
        try:
            user_resp = await client.get(
                f"https://api.github.com/users/{username}",
                headers=headers,
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="获取 GitHub 用户信息超时，请检查网络后重试")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="获取 GitHub 用户信息失败，请稍后重试")

        if user_resp.status_code == 404:
            raise HTTPException(status_code=404, detail="GitHub 用户不存在")

        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="获取 GitHub 用户信息失败")

        user_data = user_resp.json()

        total_stars = 0
        per_page = 100
        page = 1

        while True:
            try:
                repo_resp = await client.get(
                    f"https://api.github.com/users/{username}/repos",
                    headers=headers,
                    params={"per_page": per_page, "page": page, "type": "owner", "sort": "updated"},
                )
            except httpx.TimeoutException:
                raise HTTPException(status_code=504, detail="获取 GitHub 仓库列表超时，请检查网络后重试")
            except httpx.RequestError:
                raise HTTPException(status_code=503, detail="获取 GitHub 仓库列表失败，请稍后重试")

            if repo_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="获取 GitHub 仓库列表失败")

            repos = repo_resp.json()
            if not isinstance(repos, list):
                break

            total_stars += sum(
                repo.get("stargazers_count", 0)
                for repo in repos
                if isinstance(repo, dict)
            )

            if len(repos) < per_page:
                break

            page += 1
            if page > 10:  # 安全限制，避免大量请求
                break

    return {
        "user": user_data,
        "total_stars": total_stars,
    }


def save_user_binding(github_id: str, username: str):
    """保存用户绑定关系（GitHub ID -> username）"""
    bindings = db.read_json("_system", "user_bindings.json")
    bindings[str(github_id)] = username
    db.write_json("_system", "user_bindings.json", bindings)


def get_user_binding(github_id: str) -> Optional[str]:
    """获取用户绑定的用户名"""
    bindings = db.read_json("_system", "user_bindings.json")
    return bindings.get(str(github_id))


def is_username_bound(username: str) -> bool:
    """检查用户名是否已被绑定"""
    # 检查GitHub用户绑定
    user_bindings = db.read_json("_system", "user_bindings.json")
    if username in user_bindings.values():
        return True

    # 检查管理员绑定
    admin_binding = db.read_json("_system", "admin_binding.json")
    if admin_binding.get("admin_username") == username:
        return True

    return False


def save_admin_binding(username: str):
    """保存管理员绑定的用户名"""
    bindings = db.read_json("_system", "admin_binding.json")
    bindings["admin_username"] = username
    db.write_json("_system", "admin_binding.json", bindings)


def get_admin_binding() -> Optional[str]:
    """获取管理员绑定的用户名"""
    bindings = db.read_json("_system", "admin_binding.json")
    return bindings.get("admin_username")


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前登录用户"""
    token = credentials.credentials
    return resolve_user_from_token(token)


def require_auth(current_user: dict = Depends(get_current_user)):
    """需要认证"""
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)):
    """需要管理员权限"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user


async def tdp_get_access_token(code: str) -> str:
    """通过 TDP code 换取 access_token"""
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
        try:
            response = await client.post(
                TDP_TOKEN_ENDPOINT,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": TDP_REDIRECT_URI,
                    "client_id": TDP_CLIENT_ID,
                    "client_secret": TDP_CLIENT_SECRET,
                },
                headers={"Accept": "application/json"},
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="TDP 授权请求超时，请检查网络后重试")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="TDP 授权请求失败，请稍后重试")

        if response.status_code != 200:
            print(f"[TDP] token exchange failed, status={response.status_code}, body={response.text}")
            raise HTTPException(status_code=400, detail="TDP 授权失败")

        data = response.json()
        print(f"[TDP] token exchange success, data={data}")
        access_token = data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="未获取到 TDP access_token")

        return access_token


async def tdp_get_user_info(access_token: str) -> dict:
    """通过 access_token 获取 TDP 用户信息"""
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
        try:
            response = await client.get(
                TDP_USERINFO_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="获取 TDP 用户信息超时，请检查网络后重试")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="获取 TDP 用户信息失败，请稍后重试")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="获取 TDP 用户信息失败")

        return response.json()

