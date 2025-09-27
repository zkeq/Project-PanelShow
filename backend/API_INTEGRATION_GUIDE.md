# Project-PanelShow 后端API集成指南

## 概述

这是一个简单而完整的后端API系统，使用FastAPI构建，采用JSON文件作为数据存储。支持项目管理、时间线管理、个人资料管理等功能。

## 快速启动

### 1. 启动后端服务

```bash
cd /workspace/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 访问API文档

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API端点说明

### 项目管理 API (`/api/projects/`)

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| GET | `/` | 获取项目列表 | `username`, `category`, `status`, `limit`, `offset` |
| GET | `/{project_id}` | 获取项目信息 | - |
| GET | `/{username}/{project_id}/detail` | 获取项目详情 | - |
| POST | `/` | 创建项目 | CreateProjectRequest |
| PUT | `/{project_id}` | 更新项目 | 更新字段 |
| DELETE | `/{project_id}` | 删除项目 | - |
| GET | `/categories/list` | 获取项目分类列表 | - |
| GET | `/stats/overview` | 获取项目统计信息 | - |

### 时间线管理 API (`/api/timeline/`)

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| GET | `/` | 获取时间线列表 | `limit`, `offset`, `update_type` |
| GET | `/{item_id}` | 获取时间线项 | - |
| POST | `/` | 创建时间线项 | CreateTimelineRequest |
| PUT | `/{item_id}` | 更新时间线项 | 更新字段 |
| DELETE | `/{item_id}` | 删除时间线项 | - |
| POST | `/{item_id}/like` | 点赞/取消点赞 | - |
| GET | `/stats/summary` | 获取时间线统计 | - |
| GET | `/types/list` | 获取更新类型列表 | - |

### 个人资料 API (`/api/profile/`)

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| GET | `/info` | 获取个人资料 | - |
| PUT | `/info` | 更新个人资料 | UpdateProfileRequest |
| GET | `/users/{username}` | 获取用户信息 | - |
| GET | `/experiences` | 获取工作经历 | - |
| GET | `/quick-links` | 获取快捷链接 | - |
| GET | `/summary` | 获取个人资料摘要 | - |
| GET | `/skills/categories` | 获取技能分类 | - |
| GET | `/contact` | 获取联系方式 | - |

### 管理后台 API (`/api/admin/`)

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| GET | `/dashboard` | 获取仪表板数据 | - |
| GET | `/settings` | 获取管理设置 | - |
| GET | `/settings/project-features` | 获取项目特性列表 | - |
| GET | `/settings/tech-stacks` | 获取技术栈配置 | - |
| GET | `/settings/project-categories` | 获取项目分类 | - |
| GET | `/settings/theme-colors` | 获取主题颜色 | - |
| GET | `/projects/management` | 获取项目管理列表 | - |
| GET | `/timeline/management` | 获取时间线管理列表 | - |
| GET | `/analytics/overview` | 获取分析概览 | - |

### 文件上传 API (`/api/upload/`)

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| POST | `/upload` | 上传单个文件 | `file`, `category`, `description` |
| POST | `/upload/multiple` | 上传多个文件 | `files`, `category`, `description` |
| GET | `/list/{category}` | 列出文件 | - |
| DELETE | `/{category}/{filename}` | 删除文件 | - |
| GET | `/info` | 获取上传配置信息 | - |

## 前端集成示例

### 1. 替换Zustand Store中的mock数据

```typescript
// 替换 frontend/src/store/useGlobalStore.ts 中的获取数据方法

const API_BASE_URL = 'http://localhost:8000/api';

export const useGlobalStore = create<GlobalState>((set, get) => ({
  // ... 现有状态

  // 替换获取项目列表的方法
  getProjectsByUsername: async (username: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?username=${username}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  },

  // 替换获取项目详情的方法
  getProjectDetail: async (username: string, projectId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${username}/${projectId}/detail`);
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error('获取项目详情失败:', error);
      return null;
    }
  },

  // 替换获取时间线的方法
  getTimelineItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('获取时间线失败:', error);
      return [];
    }
  },

  // 替换创建项目的方法
  createProject: async (projectData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      const result = await response.json();
      if (result.success) {
        // 更新本地状态
        set((state) => ({
          projects: [...state.projects, result.data]
        }));
        return result.data;
      }
      throw new Error(result.message);
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    }
  },

  // 点赞时间线项
  likeTimelineItem: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeline/${id}/like`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        // 更新本地状态
        set((state) => ({
          timelineItems: state.timelineItems.map(item =>
            item.id === id ? result.data : item
          )
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  }
}));
```

### 2. 创建API工具类

```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async uploadFile(file: File, category: string = 'general', description: string = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description);

    const response = await fetch(`${this.baseUrl}/upload/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// 具体的API方法
export const projectsApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/projects/${query}`);
  },
  getDetail: (username: string, projectId: string) =>
    apiClient.get(`/projects/${username}/${projectId}/detail`),
  create: (data: any) => apiClient.post('/projects/', data),
  update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`)
};

export const timelineApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiClient.get(`/timeline/${query}`);
  },
  create: (data: any) => apiClient.post('/timeline/', data),
  like: (id: string) => apiClient.post(`/timeline/${id}/like`, {}),
  update: (id: string, data: any) => apiClient.put(`/timeline/${id}`, data),
  delete: (id: string) => apiClient.delete(`/timeline/${id}`)
};

export const profileApi = {
  getInfo: () => apiClient.get('/profile/info'),
  updateInfo: (data: any) => apiClient.put('/profile/info', data),
  getUser: (username: string) => apiClient.get(`/profile/users/${username}`),
  getExperiences: () => apiClient.get('/profile/experiences'),
  getQuickLinks: () => apiClient.get('/profile/quick-links')
};

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getSettings: () => apiClient.get('/admin/settings'),
  getProjectsForManagement: () => apiClient.get('/admin/projects/management'),
  getTimelineForManagement: () => apiClient.get('/admin/timeline/management')
};
```

### 3. 在组件中使用API

```typescript
// 在组件中使用API的示例
import { useEffect, useState } from 'react';
import { projectsApi, timelineApi } from '@/lib/api';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const result = await projectsApi.getAll({ username: 'zkeq' });
        setProjects(result.data);
      } catch (error) {
        console.error('获取项目失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## 数据结构说明

### 项目数据结构
```json
{
  "id": "1",
  "name": "项目名称",
  "description": "项目描述",
  "status": "active|maintained|archived",
  "category": "backend-python",
  "previewImage": "/path/to/image.png",
  "updatedAt": "2024-08-20",
  "attributes": [
    {
      "key": "techStack",
      "label": "技术栈",
      "value": "Vue + Python",
      "icon": "Code"
    }
  ],
  "themeColor": {
    "primary": "from-blue-600 to-purple-600",
    "secondary": "from-blue-50 to-purple-50",
    "background": "bg-gradient-to-r from-blue-50/50 to-purple-50/50",
    "text": "text-blue-700",
    "border": "border-blue-200"
  }
}
```

### 时间线数据结构
```json
{
  "id": "timeline-1",
  "publishedAt": "2024-08-22T10:30:00Z",
  "author": {
    "name": "作者名",
    "avatar": "头像URL",
    "username": "用户名"
  },
  "project": {
    "name": "项目名",
    "logo": "Logo URL",
    "description": "更新描述",
    "techStack": ["React", "TypeScript"],
    "readme": "详细说明...",
    "previewImages": ["/image1.png"],
    "repositoryUrl": "GitHub URL"
  },
  "updateType": "feature",
  "changelog": "更新日志",
  "likes": 24,
  "comments": 3,
  "isLiked": false
}
```

## 认证集成

后端API在管理路由中提供了认证接口，支持自定义认证系统：

```python
# 在 app/routers/admin.py 中使用认证函数
from app.auth import require_admin

@router.get("/dashboard")
async def get_dashboard(request: Request, current_user = Depends(require_admin)):
    # 已通过认证的管理员用户
    pass

# 所有管理接口都会自动应用认证
```

## 部署建议

### 开发环境
```bash
# 后端
cd /workspace/backend
uvicorn app.main:app --reload --port 8000

# 前端  
cd /workspace/frontend
npm run dev
```

### 生产环境
```bash
# 使用Gunicorn + Uvicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 使用Nginx反向代理
# 配置静态文件服务和API代理
```

## 扩展说明

当前实现是一个简单但完整的系统，可以根据需要进行以下扩展：

1. **数据库迁移**: 将JSON文件替换为PostgreSQL或MongoDB
2. **缓存系统**: 添加Redis缓存以提升性能
3. **搜索功能**: 集成Elasticsearch进行全文搜索
4. **文件存储**: 使用云存储服务（如AWS S3）
5. **日志系统**: 添加结构化日志和监控
6. **API限流**: 添加rate limiting保护API
7. **用户系统**: 扩展多用户支持和权限管理

## 总结

这个后端实现提供了：
- ✅ 完整的RESTful API
- ✅ 简单的JSON数据存储
- ✅ 文件上传功能  
- ✅ 管理后台接口
- ✅ 扁平化项目管理
- ✅ 易于扩展的架构

可以立即投入使用，也可以作为原型快速迭代开发。