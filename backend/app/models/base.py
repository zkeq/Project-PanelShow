from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union, Literal
from datetime import datetime

# 主题颜色配置
class ThemeColor(BaseModel):
    primary: str
    secondary: str
    background: str
    text: str
    border: str

# 项目属性
class ProjectAttribute(BaseModel):
    key: str
    label: str
    value: str
    icon: str

# 显示数据项
class DisplayDataItem(BaseModel):
    key: str
    label: str
    value: str
    icon: str
    type: Literal["badge", "text", "progress"] = "text"

# 技术栈标签
class TechStackTag(BaseModel):
    name: str
    color: str
    bgColor: str
    textColor: str
    borderColor: str

# 图片信息
class ImageInfo(BaseModel):
    src: str
    alt: str
    label: str
    description: str

# 项目特性
class ProjectFeature(BaseModel):
    title: str
    description: str
    icon: str
    techStack: List[TechStackTag] = []
    images: List[ImageInfo] = []

# 时间线节点
class TimelineNode(BaseModel):
    title: str
    date: str
    status: Literal["completed", "in_progress", "planned"] = "planned"

# 作者信息
class Author(BaseModel):
    name: str
    avatar: str
    username: str

# 项目信息（用于时间线）
class TimelineProject(BaseModel):
    name: str
    logo: str
    description: str
    techStack: List[str] = []
    readme: str = ""
    previewImages: List[str] = []
    repositoryUrl: Optional[str] = None
    liveUrl: Optional[str] = None

# 基础项目模型
class BaseProject(BaseModel):
    id: str
    name: str
    description: str
    status: Literal["active", "maintained", "archived"] = "active"
    previewImage: str
    updatedAt: str

# 项目列表项
class Project(BaseProject):
    category: str
    attributes: List[ProjectAttribute] = []
    themeColor: ThemeColor

# 项目详情
class ProjectDetail(BaseProject):
    previewUrl: Optional[str] = None
    longDescription: str = ""
    displayData: List[DisplayDataItem] = []
    images: List[ImageInfo] = []
    features: List[ProjectFeature] = []
    timeline: Dict[str, Dict[str, List[TimelineNode]]] = {}
    themeColor: ThemeColor

# 时间线项
class TimelineItem(BaseModel):
    id: str
    publishedAt: str
    author: Author
    project: TimelineProject
    updateType: Literal["new", "feature", "fix", "refactor"] = "new"
    changelog: str
    likes: int = 0
    comments: int = 0
    isLiked: bool = False

# 用户信息
class User(BaseModel):
    username: str
    name: str
    avatar: str
    bio: str
    location: str
    website: Optional[str] = None
    githubUrl: Optional[str] = None
    twitterUrl: Optional[str] = None

# 个人技能
class Skills(BaseModel):
    frontend: List[str] = []
    backend: List[str] = []

# 个人资料
class ProfileInfo(BaseModel):
    username: str
    name: str
    title: str
    email: str
    github: str
    website: str
    bio: str
    skills: Skills
    interests: List[str] = []

# 工作经历
class Experience(BaseModel):
    id: str
    title: str
    company: str
    location: str
    period: str
    responsibilities: List[str] = []

# 快捷链接
class QuickLink(BaseModel):
    id: str
    name: str
    url: str
    icon: str
    description: str

# Demo项目
class DemoProject(BaseModel):
    id: int
    title: str
    description: str
    longDescription: str
    image: str
    images: List[str] = []
    technologies: List[str] = []
    status: Literal["Live", "In Development", "Planned"] = "Live"
    demoUrl: Optional[str] = None
    embedUrl: Optional[str] = None
    allowIframe: bool = True
    githubUrl: Optional[str] = None
    category: str = "Web 开发"
    featured: bool = False
    completedDate: str
    stars: int = 0
    views: int = 0
    challenges: List[str] = []
    solutions: List[str] = []
    features: List[str] = []

# 时间线阶段
class TimelinePhase(BaseModel):
    phase: str
    duration: str
    description: str

# 响应模型
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "操作成功"
    data: Optional[Any] = None

class ListResponse(BaseResponse):
    data: List[Any] = []
    total: int = 0

# 创建/更新请求模型
class CreateProjectRequest(BaseModel):
    name: str
    description: str
    status: Literal["active", "maintained", "archived"] = "active"
    category: str
    previewImage: str
    attributes: List[ProjectAttribute] = []
    themeColor: ThemeColor
    longDescription: str = ""
    displayData: List[DisplayDataItem] = []
    images: List[ImageInfo] = []
    features: List[ProjectFeature] = []

class CreateTimelineRequest(BaseModel):
    author: Author
    project: TimelineProject
    updateType: Literal["new", "feature", "fix", "refactor"] = "new"
    changelog: str

class UpdateProfileRequest(BaseModel):
    name: str
    title: str
    email: str
    github: str
    website: str
    bio: str
    skills: Skills
    interests: List[str] = []