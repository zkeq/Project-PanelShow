from typing import Dict, List, Optional
from app.models import (
    Project, ProjectDetail, TimelineItem, ProfileInfo, 
    Experience, QuickLink, User, CreateProjectRequest, 
    CreateTimelineRequest, UpdateProfileRequest
)
from app.utils import (
    load_json_data, save_json_data, generate_id, 
    generate_timeline_id, current_datetime, current_date,
    DataNotFoundError, DataValidationError, backup_data_file
)

class ProjectService:
    """项目数据服务"""
    
    @staticmethod
    def get_all_projects() -> List[Project]:
        """获取所有项目"""
        data = load_json_data('projects.json')
        return [Project(**item) for item in data]
    
    @staticmethod
    def get_projects_by_username(username: str) -> List[Project]:
        """根据用户名获取项目列表"""
        # 在简化版本中，我们假设所有项目都属于指定用户
        return ProjectService.get_all_projects()
    
    @staticmethod
    def get_projects_by_category(category: str) -> List[Project]:
        """根据分类获取项目"""
        projects = ProjectService.get_all_projects()
        return [p for p in projects if p.category == category]
    
    @staticmethod
    def get_project_by_id(project_id: str) -> Optional[Project]:
        """根据ID获取项目"""
        projects = ProjectService.get_all_projects()
        return next((p for p in projects if p.id == project_id), None)
    
    @staticmethod
    def get_project_detail(username: str, project_id: str) -> Optional[ProjectDetail]:
        """获取项目详情"""
        data = load_json_data('project_details.json')
        key = f"{username}-{project_id}"
        if key in data:
            return ProjectDetail(**data[key])
        return None
    
    @staticmethod
    def create_project(request: CreateProjectRequest) -> Project:
        """创建项目"""
        # 备份数据
        backup_data_file('projects.json')
        
        # 生成新项目
        project_data = {
            "id": generate_id(),
            "name": request.name,
            "description": request.description,
            "status": request.status,
            "category": request.category,
            "previewImage": request.previewImage,
            "updatedAt": current_date(),
            "attributes": [attr.dict() for attr in request.attributes],
            "themeColor": request.themeColor.dict()
        }
        
        # 加载现有数据
        projects = load_json_data('projects.json')
        projects.append(project_data)
        
        # 保存数据
        if not save_json_data('projects.json', projects):
            raise DataValidationError("保存项目数据失败")
        
        # 创建项目详情
        if request.longDescription or request.displayData or request.features:
            ProjectService._create_project_detail(
                "zkeq",  # 默认用户名
                project_data["id"], 
                request
            )
        
        return Project(**project_data)
    
    @staticmethod
    def _create_project_detail(username: str, project_id: str, request: CreateProjectRequest):
        """创建项目详情"""
        backup_data_file('project_details.json')
        
        detail_data = {
            "id": project_id,
            "name": request.name,
            "description": request.description,
            "status": request.status,
            "previewImage": request.previewImage,
            "previewUrl": f"http://localhost:3000/project/{username}/{project_id}/demo",
            "longDescription": request.longDescription,
            "displayData": [item.dict() for item in request.displayData],
            "images": [img.dict() for img in request.images],
            "features": [feat.dict() for feat in request.features],
            "timeline": {},
            "themeColor": request.themeColor.dict()
        }
        
        details = load_json_data('project_details.json')
        key = f"{username}-{project_id}"
        details[key] = detail_data
        
        save_json_data('project_details.json', details)
    
    @staticmethod
    def update_project(project_id: str, updates: Dict) -> Optional[Project]:
        """更新项目"""
        backup_data_file('projects.json')
        
        projects = load_json_data('projects.json')
        for i, project in enumerate(projects):
            if project["id"] == project_id:
                projects[i].update(updates)
                projects[i]["updatedAt"] = current_date()
                
                if save_json_data('projects.json', projects):
                    return Project(**projects[i])
                break
        return None
    
    @staticmethod
    def delete_project(project_id: str) -> bool:
        """删除项目"""
        backup_data_file('projects.json')
        backup_data_file('project_details.json')
        
        # 删除项目
        projects = load_json_data('projects.json')
        projects = [p for p in projects if p["id"] != project_id]
        
        # 删除项目详情
        details = load_json_data('project_details.json')
        details = {k: v for k, v in details.items() if not k.endswith(f"-{project_id}")}
        
        return (save_json_data('projects.json', projects) and 
                save_json_data('project_details.json', details))

class TimelineService:
    """时间线数据服务"""
    
    @staticmethod
    def get_all_timeline_items() -> List[TimelineItem]:
        """获取所有时间线项"""
        data = load_json_data('timeline.json')
        return [TimelineItem(**item) for item in data]
    
    @staticmethod
    def get_timeline_item_by_id(item_id: str) -> Optional[TimelineItem]:
        """根据ID获取时间线项"""
        items = TimelineService.get_all_timeline_items()
        return next((item for item in items if item.id == item_id), None)
    
    @staticmethod
    def create_timeline_item(request: CreateTimelineRequest) -> TimelineItem:
        """创建时间线项"""
        backup_data_file('timeline.json')
        
        item_data = {
            "id": generate_timeline_id(),
            "publishedAt": current_datetime(),
            "author": request.author.dict(),
            "project": request.project.dict(),
            "updateType": request.updateType,
            "changelog": request.changelog,
            "likes": 0,
            "comments": 0,
            "isLiked": False
        }
        
        timeline = load_json_data('timeline.json')
        timeline.insert(0, item_data)  # 插入到开头
        
        if not save_json_data('timeline.json', timeline):
            raise DataValidationError("保存时间线数据失败")
        
        return TimelineItem(**item_data)
    
    @staticmethod
    def update_timeline_item(item_id: str, updates: Dict) -> Optional[TimelineItem]:
        """更新时间线项"""
        backup_data_file('timeline.json')
        
        timeline = load_json_data('timeline.json')
        for i, item in enumerate(timeline):
            if item["id"] == item_id:
                timeline[i].update(updates)
                
                if save_json_data('timeline.json', timeline):
                    return TimelineItem(**timeline[i])
                break
        return None
    
    @staticmethod
    def delete_timeline_item(item_id: str) -> bool:
        """删除时间线项"""
        backup_data_file('timeline.json')
        
        timeline = load_json_data('timeline.json')
        original_count = len(timeline)
        timeline = [item for item in timeline if item["id"] != item_id]
        
        if len(timeline) < original_count:
            return save_json_data('timeline.json', timeline)
        return False
    
    @staticmethod
    def like_timeline_item(item_id: str) -> Optional[TimelineItem]:
        """点赞/取消点赞时间线项"""
        timeline = load_json_data('timeline.json')
        for i, item in enumerate(timeline):
            if item["id"] == item_id:
                item["isLiked"] = not item["isLiked"]
                item["likes"] = item["likes"] + (1 if item["isLiked"] else -1)
                
                if save_json_data('timeline.json', timeline):
                    return TimelineItem(**timeline[i])
                break
        return None

class ProfileService:
    """个人资料数据服务"""
    
    @staticmethod
    def get_profile_info() -> ProfileInfo:
        """获取个人资料信息"""
        data = load_json_data('profile.json')
        profile_data = data.get('profile', {})
        return ProfileInfo(**profile_data)
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[User]:
        """根据用户名获取用户信息"""
        data = load_json_data('profile.json')
        users = data.get('users', {})
        if username in users:
            return User(**users[username])
        return None
    
    @staticmethod
    def get_experiences() -> List[Experience]:
        """获取工作经历"""
        data = load_json_data('profile.json')
        experiences_data = data.get('experiences', [])
        return [Experience(**exp) for exp in experiences_data]
    
    @staticmethod
    def get_quick_links() -> List[QuickLink]:
        """获取快捷链接"""
        data = load_json_data('profile.json')
        links_data = data.get('quickLinks', [])
        return [QuickLink(**link) for link in links_data]
    
    @staticmethod
    def update_profile_info(request: UpdateProfileRequest) -> ProfileInfo:
        """更新个人资料信息"""
        backup_data_file('profile.json')
        
        data = load_json_data('profile.json')
        data['profile'] = {
            "username": data['profile'].get('username', 'zkeq'),  # 保持原用户名
            **request.dict()
        }
        
        if not save_json_data('profile.json', data):
            raise DataValidationError("保存个人资料失败")
        
        return ProfileInfo(**data['profile'])

class SettingsService:
    """系统设置数据服务"""
    
    @staticmethod
    def get_settings() -> Dict:
        """获取系统设置"""
        return load_json_data('settings.json')
    
    @staticmethod
    def get_project_features() -> List[Dict]:
        """获取项目特性列表"""
        settings = SettingsService.get_settings()
        return settings.get('projectFeatures', [])
    
    @staticmethod
    def get_tech_stacks() -> Dict:
        """获取技术栈配置"""
        settings = SettingsService.get_settings()
        return settings.get('techStacks', {})
    
    @staticmethod
    def get_project_categories() -> List[Dict]:
        """获取项目分类"""
        settings = SettingsService.get_settings()
        return settings.get('projectCategories', [])
    
    @staticmethod
    def get_theme_colors() -> List[Dict]:
        """获取主题色彩"""
        settings = SettingsService.get_settings()
        return settings.get('themeColors', [])