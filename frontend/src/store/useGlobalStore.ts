import { create } from 'zustand'
import { GlobalState, TimelineItem, Project, ProjectDetail, DemoProject, User, ProfileInfo, Experience, QuickLink } from '@/types/store'

// Mock 用户数据
const mockUsers: Record<string, User> = {
  'zkeq': {
    username: 'zkeq',
    name: 'Zkeq',
    avatar: 'https://avatars.githubusercontent.com/u/62864752',
    bio: '全栈开发者，专注于现代 Web 技术',
    location: '中国',
    website: 'https://icodeq.com',
    githubUrl: 'https://github.com/zkeq',
    twitterUrl: 'https://twitter.com/zkeq_'
  }
}

// Mock 时间线数据
const mockTimelineItems: TimelineItem[] = [
  {
    id: 'timeline-1',
    publishedAt: '2024-08-22T10:30:00Z',
    author: {
      name: 'Zkeq',
      avatar: 'https://avatars.githubusercontent.com/u/62864752',
      username: 'zkeq'
    },
    project: {
      name: 'sparkai-frontend',
      logo: 'https://avatars.githubusercontent.com/u/62864752',
      description: '更新了头像选择组件，优化了用户体验。重新设计了上传流程，支持拖拽上传和图片裁剪功能。修复了在移动端显示异常的问题。',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      readme: `## 更新内容

### 🎨 头像选择组件优化
- 支持拖拽上传功能
- 新增图片裁剪和预览
- 优化移动端显示效果
- 增加上传进度提示

### 🐛 问题修复
- 修复移动端头像显示异常
- 解决图片上传失败的边界情况
- 优化内存使用，防止大图片造成的性能问题

### 📱 移动端适配
- 重新设计了移动端的上传界面
- 优化触摸操作体验
- 适配不同屏幕尺寸`,
      previewImages: [
        '/Snipaste_2025-08-23_22-52-13.png',
        '/Snipaste_2025-08-23_22-52-25.png',
      ],
      repositoryUrl: 'https://github.com/zkeq/sparkai-frontend',
      liveUrl: 'https://sparkai-frontend.vercel.app'
    },
    updateType: 'feature',
    changelog: '新增头像选择组件，优化用户体验',
    likes: 24,
    comments: 3,
    isLiked: false
  },
  {
    id: 'timeline-2', 
    publishedAt: '2024-08-20T15:45:00Z',
    author: {
      name: 'Zkeq',
      avatar: 'https://avatars.githubusercontent.com/u/62864752',
      username: 'zkeq'
    },
    project: {
      name: 'e-commerce-platform',
      logo: 'https://avatars.githubusercontent.com/u/62864752',
      description: '电商平台后端API重构完成，提升了系统性能和稳定性。重新设计了订单处理流程，优化了支付接口。',
      techStack: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
      readme: `## 🔄 系统重构

### 后端架构优化
- 重构订单处理模块
- 优化数据库查询性能
- 实现分布式缓存策略

### 🚀 性能提升
- 接口响应时间提升 60%
- 支持更高并发访问
- 优化内存使用

### 🔧 技术改进  
- 升级 Django 到最新版本
- 引入 Celery 异步任务处理
- 完善单元测试覆盖率`,
      previewImages: [
        '/Snipaste_2025-08-23_22-52-25.png'
      ],
      repositoryUrl: 'https://github.com/zkeq/e-commerce-platform',
      liveUrl: 'https://demo.ecommerce.example.com'
    },
    updateType: 'refactor',
    changelog: '重构后端架构，提升性能',
    likes: 15,
    comments: 7,
    isLiked: true
  },
  {
    id: 'timeline-3',
    publishedAt: '2024-08-18T09:15:00Z', 
    author: {
      name: 'Zkeq',
      avatar: 'https://avatars.githubusercontent.com/u/62864752',
      username: 'zkeq'
    },
    project: {
      name: 'microservices-api',
      logo: 'https://avatars.githubusercontent.com/u/62864752',
      description: '微服务API网关项目启动！使用Go语言开发高性能网关，支持服务发现、负载均衡等功能。',
      techStack: ['Go', 'gRPC', 'Docker', 'Kubernetes', 'Redis'],
      readme: `## 🎉 新项目启动

### 项目介绍
这是一个基于Go语言开发的高性能微服务API网关项目。

### ✨ 核心功能
- 服务发现与注册
- 智能负载均衡 
- 熔断器和限流
- 请求路由和转发
- 监控和日志

### 🛠 技术栈
- Go 1.21
- gRPC 协议
- Docker 容器化
- Kubernetes 编排
- Redis 缓存

### 📋 开发计划
- [x] 基础架构搭建
- [ ] 服务发现实现
- [ ] 负载均衡算法
- [ ] 监控系统集成`,
      previewImages: [
        '/Snipaste_2025-08-23_22-52-13.png',
        '/Snipaste_2025-08-23_22-52-25.png'
      ],
      repositoryUrl: 'https://github.com/zkeq/microservices-api',
    },
    updateType: 'new',
    changelog: '新项目：微服务API网关', 
    likes: 32,
    comments: 12,
    isLiked: false
  }
]

// Mock 项目列表数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: '现代化的全栈电商解决方案，具有实时库存管理和支付集成。该项目采用微服务架构，支持高并发访问，集成了第三方支付、物流追踪、用户评价等功能模块。前端采用响应式设计，提供了优秀的用户体验，后端使用Django框架构建RESTful API，数据库采用PostgreSQL和Redis缓存方案，确保了系统的稳定性和性能。',
    status: 'active' as const,
    category: 'backend-python',
    previewImage: '/Snipaste_2025-08-23_22-52-13.png',
    updatedAt: '2024-08-20',
    attributes: [
      {
        key: 'techStack',
        label: '技术栈',
        value: 'Vue + Python',
        icon: 'Code'
      },
      {
        key: 'projectType',
        label: '项目类型',
        value: '公司',
        icon: 'Building2'
      },
      {
        key: 'monthlyPV',
        label: '月访问量',
        value: '10w',
        icon: 'TrendingUp'
      },
      {
        key: 'developmentPeriod',
        label: '开发周期',
        value: '3个月',
        icon: 'Clock'
      }
    ],
    themeColor: {
      primary: 'from-blue-600 to-purple-600',
      secondary: 'from-blue-50 to-purple-50',
      background: 'bg-gradient-to-r from-blue-50/50 to-purple-50/50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  },
  {
    id: '2',
    name: 'Microservices API',
    description: '高性能的微服务架构 API 网关，采用Go语言开发，具有极低的延迟和高吞吐量。项目包含服务发现、负载均衡、熔断器、限流等功能，支持gRPC和HTTP协议，可以水平扩展。使用Docker容器化部署，通过Kubernetes进行编排管理，提供了完善的监控和日志系统。',
    status: 'active' as const,
    category: 'backend-go',
    previewImage: '/Snipaste_2025-08-23_22-52-25.png',
    updatedAt: '2024-08-18',
    attributes: [
      {
        key: 'techStack',
        label: '技术栈',
        value: 'Go + Redis',
        icon: 'Zap'
      },
      {
        key: 'projectType',
        label: '项目类型',
        value: '个人',
        icon: 'User'
      },
      {
        key: 'monthlyPV',
        label: '月访问量',
        value: '50w',
        icon: 'TrendingUp'
      },
      {
        key: 'developmentPeriod',
        label: '开发周期',
        value: '2个月',
        icon: 'Clock'
      }
    ],
    themeColor: {
      primary: 'from-emerald-600 to-teal-600',
      secondary: 'from-emerald-50 to-teal-50',
      background: 'bg-gradient-to-r from-emerald-50/50 to-teal-50/50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    }
  },
  {
    id: '3',
    name: 'Admin Dashboard',
    description: '企业级管理后台系统，提供了完整的权限管理、用户管理、数据统计等功能。采用Vue 3 + TypeScript开发，使用Pinia进行状态管理，Element Plus作为UI组件库。支持多主题切换、国际化、动态路由等功能，具有良好的可扩展性和维护性。后台数据通过图表和表格展示，支持数据导出和打印功能。',
    status: 'maintained' as const,
    category: 'frontend-vue',
    previewImage: '/Snipaste_2025-08-23_22-52-25.png',
    updatedAt: '2024-07-30',
    attributes: [
      {
        key: 'techStack',
        label: '技术栈',
        value: 'Vue + Node.js',
        icon: 'Code'
      },
      {
        key: 'projectType',
        label: '项目类型',
        value: '外包',
        icon: 'Handshake'
      },
      {
        key: 'monthlyPV',
        label: '月访问量',
        value: '5w',
        icon: 'TrendingUp'
      },
      {
        key: 'developmentPeriod',
        label: '开发周期',
        value: '4个月',
        icon: 'Clock'
      }
    ],
    themeColor: {
      primary: 'from-cyan-600 to-blue-600',
      secondary: 'from-cyan-50 to-blue-50',
      background: 'bg-gradient-to-r from-cyan-50/50 to-blue-50/50',
      text: 'text-cyan-700',
      border: 'border-cyan-200'
    }
  },
  {
    id: '4',
    name: 'SaaS Platform',
    description: '多租户 SaaS 平台解决方案，支持多个租户共享同一套系统资源，同时保证数据隔离和安全性。使用Next.js构建前端应用，Prisma作为ORM工具，tRPC提供类型安全的API调用。平台提供了用户管理、订阅管理、支付集成、数据分析等核心功能，支持自定义品牌和域名。',
    status: 'active' as const,
    category: 'frontend-nextjs',
    previewImage: '/Snipaste_2025-08-23_22-52-25.png',
    updatedAt: '2024-08-22',
    attributes: [
      {
        key: 'techStack',
        label: '技术栈',
        value: 'Next.js + PostgreSQL',
        icon: 'Code'
      },
      {
        key: 'projectType',
        label: '项目类型',
        value: '创业',
        icon: 'Rocket'
      },
      {
        key: 'monthlyPV',
        label: '月访问量',
        value: '30w',
        icon: 'TrendingUp'
      },
      {
        key: 'developmentPeriod',
        label: '开发周期',
        value: '6个月',
        icon: 'Calendar'
      }
    ],
    themeColor: {
      primary: 'from-slate-600 to-indigo-600',
      secondary: 'from-slate-50 to-indigo-50',
      background: 'bg-gradient-to-r from-slate-50/50 to-indigo-50/50',
      text: 'text-slate-700',
      border: 'border-slate-200'
    }
  }
]

// Mock 项目详情数据
const mockProjectDetails: Record<string, ProjectDetail> = {
  'zkeq-3': {
    id: '3',
    name: 'E-Commerce Platform',
    description: '现代化的全栈电商解决方案，具有实时库存管理和支付集成',
    status: 'active' as const,
    previewImage: '/Snipaste_2025-08-23_22-52-13.png',
    previewUrl: 'http://localhost:3000/project/zkeq/1',
    longDescription: `
# 项目说明

这是一个现代化的全栈电商解决方案，采用最新的技术栈构建。项目包含完整的购物流程，从商品展示到支付完成，提供了优秀的用户体验。

## 核心功能

- 🛍️ 完整的购物车功能
- 💳 多种支付方式支持
- 📦 实时库存管理
- 👤 用户账户体系
- 📊 数据统计分析

## 技术特色

采用微服务架构，前后端分离，支持高并发访问。前端使用Vue 3 + TypeScript，后端采用Python Django框架。
  `,
    // 可自定义的展示数据（原来的固定字段现在都在这里）
    displayData: [
      {
        key: 'techStack',
        label: '技术栈',
        value: 'Vue + Python',
        icon: 'Zap',
        type: 'badge'
      },
      {
        key: 'projectType',
        label: '项目类型',
        value: '公司',
        icon: 'Building2',
        type: 'badge'
      },
      {
        key: 'monthlyPV',
        label: '月访问量',
        value: '10w',
        icon: 'BarChart3',
        type: 'text'
      },
      {
        key: 'developmentPeriod',
        label: '开发周期',
        value: '3个月',
        icon: 'Clock',
        type: 'text'
      },
      {
        key: 'uiLibrary',
        label: 'UI 库',
        value: 'Tailwind CSS',
        icon: 'Palette',
        type: 'badge'
      },
      {
        key: 'componentLibrary',
        label: '组件库',
        value: 'shadcn/ui',
        icon: 'Puzzle',
        type: 'badge'
      },
      {
        key: 'database',
        label: '数据库',
        value: 'PostgreSQL + Redis',
        icon: 'Database',
        type: 'badge'
      },
      {
        key: 'deployment',
        label: '部署方式',
        value: 'Docker + Kubernetes',
        icon: 'Rocket',
        type: 'badge'
      },
      {
        key: 'codeQuality',
        label: '代码质量',
        value: '95%',
        icon: 'CheckCircle',
        type: 'progress'
      },
      {
        key: 'testCoverage',
        label: '测试覆盖率',
        value: '88%',
        icon: 'TestTube',
        type: 'progress'
      },
      {
        key: 'performance',
        label: '性能评分',
        value: '92分',
        icon: 'Zap',
        type: 'text'
      },
      {
        key: 'teamSize',
        label: '团队规模',
        value: '5人',
        icon: 'Users',
        type: 'text'
      },
      {
        key: 'projectStatus',
        label: '项目状态',
        value: '生产环境运行中',
        icon: 'CheckCircle',
        type: 'badge'
      },
      {
        key: 'maintainability',
        label: '可维护性',
        value: 'A级',
        icon: 'Settings',
        type: 'badge'
      },
      {
        key: 'security',
        label: '安全等级',
        value: '高',
        icon: 'Shield',
        type: 'badge'
      },
      {
        key: 'lastUpdate',
        label: '最后更新',
        value: '2024-08-20',
        icon: 'Calendar',
        type: 'text'
      },
      {
        key: 'buildTool',
        label: '构建工具',
        value: 'Webpack 5',
        icon: 'Settings',
        type: 'badge'
      },
      {
        key: 'linting',
        label: '代码检查',
        value: 'ESLint + Prettier',
        icon: 'CheckCircle',
        type: 'badge'
      },
      {
        key: 'stateManagement',
        label: '状态管理',
        value: 'Pinia',
        icon: 'Database',
        type: 'badge'
      },
      {
        key: 'packageManager',
        label: '包管理器',
        value: 'npm',
        icon: 'Package',
        type: 'badge'
      }
    ],
    images: [
      {
        src: '/Snipaste_2025-08-23_22-52-13.png',
        alt: 'E-Commerce Platform 主页',
        label: '主页',
        description: '项目主页展示，包含产品列表和导航功能'
      },
      {
        src: '/Snipaste_2025-08-23_22-52-25.png',
        alt: '用户登录页面',
        label: '登录',
        description: '用户登录界面，支持多种登录方式'
      },
      {
        src: '/Snipaste_2025-08-23_22-52-13.png',
        alt: '管理后台仪表板',
        label: '仪表板',
        description: '管理员后台仪表板，显示关键业务指标'
      }
    ],
    features: [
      {
        title: '响应式设计',
        description: '适配各种设备尺寸，提供一致的用户体验，支持多种屏幕规格的完美适配',
        icon: 'Smartphone',
        techStack: [
          { name: 'CSS Grid', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
          { name: 'Flexbox', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
          { name: 'Tailwind CSS', color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50 hover:bg-cyan-100', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' }
        ],
        images: [
          {
            src: '/Snipaste_2025-08-23_22-52-13.png',
            alt: '桌面端响应式展示',
            label: '桌面端',
            description: '桌面端完整界面展示'
          },
          {
            src: '/Snipaste_2025-08-23_22-52-25.png',
            alt: '平板端适配',
            label: '平板端',
            description: '平板设备界面适配'
          }
        ]
      }
    ],
    timeline: {
      '2025': {
        '08': [
          { title: '项目启动', date: '2025-08-01', status: 'completed' },
          { title: '需求分析完成', date: '2025-08-05', status: 'completed' },
          { title: '原型设计', date: '2025-08-10', status: 'completed' }
        ],
        '07': [
          { title: '前端开发', date: '2025-07-01', status: 'completed' },
          { title: '后端API开发', date: '2025-07-15', status: 'completed' }
        ]
      }
    },
    themeColor: {
      primary: 'from-blue-600 to-purple-600',
      secondary: 'from-blue-50 to-purple-50',
      background: 'bg-gradient-to-r from-blue-50/50 to-purple-50/50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  },
  'zkeq-1': {
    id: '1',
    name: 'E-Commerce Platform',
    description: '现代化的全栈电商解决方案，具有实时库存管理和支付集成',
    status: 'active' as const,
    previewImage: '/Snipaste_2025-08-23_22-52-13.png',
    previewUrl: 'http://localhost:3001/project/zkeq/1',
    longDescription: `# E-Commerce Platform

现代化的全栈电商解决方案，采用最新的技术栈构建。项目包含完整的购物流程，从商品展示到支付完成，提供了优秀的用户体验。

## 核心功能

- 🛍️ 完整的购物车功能
- 💳 多种支付方式支持  
- 📦 实时库存管理
- 👤 用户账户体系
- 📊 数据统计分析`,
    displayData: [
      { key: 'techStack', label: '技术栈', value: 'Vue + Python', icon: 'Code', type: 'badge' },
      { key: 'projectType', label: '项目类型', value: '公司', icon: 'Building2', type: 'badge' },
      { key: 'monthlyPV', label: '月访问量', value: '10w', icon: 'TrendingUp', type: 'text' },
      { key: 'developmentPeriod', label: '开发周期', value: '3个月', icon: 'Clock', type: 'text' },
      { key: 'database', label: '数据库', value: 'PostgreSQL + Redis', icon: 'Database', type: 'badge' },
      { key: 'deployment', label: '部署方式', value: 'Docker + Kubernetes', icon: 'Rocket', type: 'badge' }
    ],
    images: [
      { src: '/Snipaste_2025-08-23_22-52-13.png', alt: '主页', label: '主页', description: '项目主页展示' }
    ],
    features: [
      {
        title: '响应式设计',
        description: '适配各种设备尺寸，提供一致的用户体验',
        icon: 'Smartphone',
        techStack: [
          { name: 'CSS Grid', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' }
        ],
        images: [{ src: '/Snipaste_2025-08-23_22-52-13.png', alt: '响应式展示', label: '响应式', description: '响应式界面展示' }]
      }
    ],
    timeline: {
      '2025': {
        '08': [
          { title: '项目启动', date: '2025-08-01', status: 'completed' },
          { title: '需求分析完成', date: '2025-08-05', status: 'completed' }
        ]
      }
    },
    themeColor: {
      primary: 'from-blue-600 to-purple-600',
      secondary: 'from-blue-50 to-purple-50',
      background: 'bg-gradient-to-r from-blue-50/50 to-purple-50/50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    }
  },
  'zkeq-2': {
    id: '2',
    name: 'Microservices API',
    description: '高性能的微服务架构 API 网关，采用Go语言开发',
    status: 'active' as const,
    previewImage: '/Snipaste_2025-08-23_22-52-25.png',
    previewUrl: 'http://localhost:3001/project/zkeq/2',
    longDescription: `# Microservices API

高性能的微服务架构 API 网关，采用Go语言开发，具有极低的延迟和高吞吐量。

## 核心功能

- 🚀 服务发现与注册
- ⚖️ 智能负载均衡
- 🛡️ 熔断器和限流
- 📊 监控和日志`,
    displayData: [
      { key: 'techStack', label: '技术栈', value: 'Go + Redis', icon: 'Zap', type: 'badge' },
      { key: 'projectType', label: '项目类型', value: '个人', icon: 'User', type: 'badge' },
      { key: 'monthlyPV', label: '月访问量', value: '50w', icon: 'TrendingUp', type: 'text' },
      { key: 'developmentPeriod', label: '开发周期', value: '2个月', icon: 'Clock', type: 'text' }
    ],
    images: [
      { src: '/Snipaste_2025-08-23_22-52-25.png', alt: 'API架构', label: 'API', description: 'API架构图' }
    ],
    features: [],
    timeline: {
      '2025': {
        '07': [
          { title: '项目启动', date: '2025-07-01', status: 'completed' }
        ]
      }
    },
    themeColor: {
      primary: 'from-emerald-600 to-teal-600',
      secondary: 'from-emerald-50 to-teal-50', 
      background: 'bg-gradient-to-r from-emerald-50/50 to-teal-50/50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    }
  },
  'zkeq-4': {
    id: '4',
    name: 'SaaS Platform', 
    description: '多租户 SaaS 平台解决方案，支持多个租户共享同一套系统资源',
    status: 'active' as const,
    previewImage: '/Snipaste_2025-08-23_22-52-25.png',
    previewUrl: 'http://localhost:3001/project/zkeq/4',
    longDescription: `# SaaS Platform

多租户 SaaS 平台解决方案，支持多个租户共享同一套系统资源，同时保证数据隔离和安全性。

## 核心功能

- 👥 用户管理
- 💳 订阅管理  
- 💰 支付集成
- 📊 数据分析`,
    displayData: [
      { key: 'techStack', label: '技术栈', value: 'Next.js + PostgreSQL', icon: 'Code', type: 'badge' },
      { key: 'projectType', label: '项目类型', value: '创业', icon: 'Rocket', type: 'badge' },
      { key: 'monthlyPV', label: '月访问量', value: '30w', icon: 'TrendingUp', type: 'text' },
      { key: 'developmentPeriod', label: '开发周期', value: '6个月', icon: 'Calendar', type: 'text' }
    ],
    images: [
      { src: '/Snipaste_2025-08-23_22-52-25.png', alt: 'SaaS平台', label: 'SaaS', description: 'SaaS平台界面' }
    ],
    features: [],
    timeline: {
      '2024': {
        '12': [
          { title: '项目启动', date: '2024-12-01', status: 'completed' }
        ]
      }
    },
    themeColor: {
      primary: 'from-slate-600 to-indigo-600',
      secondary: 'from-slate-50 to-indigo-50',
      background: 'bg-gradient-to-r from-slate-50/50 to-indigo-50/50',
      text: 'text-slate-700', 
      border: 'border-slate-200'
    }
  }
}

// Mock 演示项目数据
const mockDemoProjects: DemoProject[] = [
  {
    id: 1,
    title: "SaaS 平台",
    description:
      "使用 Next.js 和 PostgreSQL 构建的综合 SaaS 平台，具有用户认证、订阅管理和实时分析功能。",
    longDescription:
      "这个综合 SaaS 平台是一个全栈解决方案，旨在处理企业级需求。采用现代技术和最佳实践构建，为订阅制业务提供了强大的基础。",
    image: "/modern-saas-dashboard.png",
    images: ["/modern-saas-dashboard.png", "/api-architecture-diagram.png"],
    technologies: ["Next.js", "PostgreSQL", "Stripe", "Tailwind CSS", "TypeScript"],
    status: "Live",
    demoUrl: "https://icodeq.com/",
    embedUrl: "https://icodeq.com/",
    allowIframe: true,
    githubUrl: "#",
    category: "Web 开发",
    featured: true,
    completedDate: "2024-12",
    stars: 24,
    views: 1250,
    challenges: [
      "使用 Stripe 实现安全支付处理",
      "构建实时分析仪表板",
      "优化大型数据集的数据库查询"
    ],
    solutions: [
      "集成 Stripe webhooks 进行安全支付处理",
      "使用 WebSocket 连接进行实时数据更新",
      "实施数据库索引和查询优化"
    ],
    features: [
      "用户认证和授权",
      "使用 Stripe 进行订阅管理",
      "实时分析仪表板",
      "多租户架构"
    ],
    timeline: [
      {
        phase: "规划与设计",
        duration: "2 周",
        description: "需求收集、系统架构设计和 UI/UX 原型",
      },
      {
        phase: "后端开发",
        duration: "4 周",
        description: "API 开发、数据库模式、认证系统和支付集成",
      }
    ],
  },
  {
    id: 2,
    title: "电子商务平台",
    description:
      "使用 Vue.js 前端和 Python 后端的全栈电子商务解决方案，包括库存管理和支付处理。",
    longDescription:
      "一个完整的电子商务解决方案，旨在处理现代在线零售需求。该平台将响应式 Vue.js 前端与强大的 Python Django 后端相结合。",
    image: "/ecommerce-website-interface.png",
    images: ["/ecommerce-website-interface.png", "/mobile-app-backend-architecture.png"],
    technologies: ["Vue.js", "Python", "Django", "Redis", "PostgreSQL"],
    status: "Live",
    demoUrl: "https://ecommerce-demo.vercel.app",
    embedUrl: "https://ecommerce-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "Web 开发",
    featured: true,
    completedDate: "2024-11",
    stars: 18,
    views: 980,
    challenges: [
      "管理带有变体的复杂产品目录",
      "实现高效的搜索和过滤",
      "处理销售活动期间的高流量"
    ],
    solutions: [
      "创建支持变体的灵活产品模型",
      "实施 Elasticsearch 进行快速产品搜索",
      "使用 Redis 缓存和负载均衡"
    ],
    features: [
      "带有变体和类别的产品目录",
      "高级搜索和过滤",
      "购物车和愿望清单",
      "多个支付网关支持"
    ],
    timeline: [
      {
        phase: "研究与规划",
        duration: "1 周",
        description: "市场研究、竞争对手分析和技术需求",
      },
      {
        phase: "后端架构",
        duration: "3 周",
        description: "Django API 开发、数据库设计和支付集成",
      }
    ],
  },
  {
    id: 3,
    title: "微服务 API",
    description:
      "使用 Go 和 Redis 构建的可扩展微服务架构，处理高流量应用和强大的错误处理。",
    longDescription:
      "一个复杂的微服务架构，旨在处理具有高可用性和性能要求的企业级应用。使用 Go 实现最佳性能，使用 Redis 进行缓存和会话管理。",
    image: "/api-architecture-diagram.png",
    images: ["/api-architecture-diagram.png", "/data-visualization-dashboard.png"],
    technologies: ["Go", "Redis", "Docker", "Kubernetes", "gRPC"],
    status: "In Development",
    demoUrl: "https://api-docs.vercel.app",
    embedUrl: "https://api-docs.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "后端开发",
    featured: true,
    completedDate: "2025-01",
    stars: 12,
    views: 750,
    challenges: [
      "设计服务通信模式",
      "实现分布式追踪",
      "管理服务发现和负载均衡"
    ],
    solutions: [
      "使用 gRPC 进行高效的服务间通信",
      "实施 OpenTelemetry 进行分布式追踪",
      "通过 Kubernetes 部署以实现自动扩展"
    ],
    features: [
      "Go 微服务架构",
      "gRPC 服务间通信",
      "Redis 缓存和会话管理",
      "Docker 容器化"
    ],
    timeline: [
      {
        phase: "架构设计",
        duration: "2 周",
        description: "系统设计、服务边界定义和技术选择",
      },
      {
        phase: "核心服务开发",
        duration: "5 周",
        description: "使用 Go 和 gRPC 实现各个微服务",
      }
    ],
  }
]

// Mock 个人资料数据
const mockProfileInfo: ProfileInfo = {
  username: "zkeq",
  name: "张三",
  title: "全栈开发工程师",
  email: "contact@example.com",
  github: "zkeq",
  website: "personal-website.com",
  bio: "我是一名充满热情的全栈开发工程师，拥有 5 年以上的软件开发经验。专注于构建高性能、可扩展的 Web 应用，热衷于学习新技术和分享知识。在职业生涯中，我参与了多个大型项目的开发，从前端界面到后端架构，从数据库设计到部署运维，积累了丰富的全栈开发经验。我相信技术的力量，也相信团队合作的重要性。",
  skills: {
    frontend: [
      "React / Vue.js",
      "Next.js / Nuxt.js", 
      "TypeScript",
      "Tailwind CSS"
    ],
    backend: [
      "Python / Go",
      "Django / FastAPI",
      "PostgreSQL / Redis",
      "Docker / Kubernetes"
    ]
  },
  interests: ["编程", "开源", "摄影", "阅读", "旅行", "音乐"]
}

// Mock 工作经历数据
const mockExperiences: Experience[] = [
  {
    id: '1',
    title: '高级全栈开发工程师',
    company: '科技创新公司',
    location: '北京',
    period: '2021 - 至今',
    responsibilities: [
      '负责核心业务系统的架构设计和技术选型',
      '带领 5 人技术团队完成多个大型项目',
      '优化系统性能，将响应时间提升 60%',
      '建立完善的 CI/CD 流程和代码规范'
    ]
  },
  {
    id: '2',
    title: '前端开发工程师',
    company: '互联网科技公司',
    location: '上海',
    period: '2019 - 2021',
    responsibilities: [
      '参与公司主要产品的前端开发工作',
      '负责移动端 H5 页面的开发和优化',
      '搭建组件库和开发工具，提高团队效率',
      '参与技术分享和新人培训工作'
    ]
  },
  {
    id: '3',
    title: '初级开发工程师',
    company: '软件开发公司',
    location: '深圳',
    period: '2018 - 2019',
    responsibilities: [
      '参与企业管理系统的开发和维护',
      '学习现代前端框架和后端技术',
      '配合产品和设计团队完成需求开发',
      '积累了丰富的项目开发经验'
    ]
  }
]

// Mock 快捷链接数据
const mockQuickLinks: QuickLink[] = [
  {
    id: '1',
    name: 'GitHub',
    url: 'https://github.com/zkeq',
    icon: 'Github',
    description: '我的开源项目和代码仓库'
  },
  {
    id: '2',
    name: '博客',
    url: 'https://blog.example.com',
    icon: 'BookOpen',
    description: '技术文章和学习笔记'
  },
  {
    id: '3',
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/profile',
    icon: 'Linkedin',
    description: '职业经历和联系方式'
  },
  {
    id: '4',
    name: 'Twitter',
    url: 'https://twitter.com/username',
    icon: 'Twitter',
    description: '技术动态和日常分享'
  },
  {
    id: '5',
    name: '简历下载',
    url: '/resume.pdf',
    icon: 'Download',
    description: '下载完整版简历'
  },
  {
    id: '6',
    name: 'Email',
    url: 'mailto:contact@example.com',
    icon: 'Mail',
    description: '通过邮件联系我'
  }
]

// 创建全局状态管理
export const useGlobalStore = create<GlobalState>((set, get) => ({
  // 初始数据
  users: mockUsers,
  timelineItems: mockTimelineItems,
  projects: mockProjects,
  projectDetails: mockProjectDetails,
  demoProjects: mockDemoProjects,
  profileInfo: mockProfileInfo,
  experiences: mockExperiences,
  quickLinks: mockQuickLinks,

  // Actions
  getUserByUsername: (username: string) => {
    return get().users[username]
  },

  getTimelineItems: () => {
    return get().timelineItems
  },

  getProjectsByUsername: (_username: string) => {
    // 假设所有项目都属于指定用户
    return get().projects
  },

  getProjectDetail: (username: string, projectId: string) => {
    const key = `${username}-${projectId}`
    return get().projectDetails[key]
  },

  getDemoProject: (id: number) => {
    return get().demoProjects.find(project => project.id === id)
  },

  getProjectsByCategory: (category: string) => {
    return get().projects.filter(project => project.category === category)
  },

  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => {
    set((state) => ({
      timelineItems: state.timelineItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  },

  // 个人资料相关 actions
  getProfileInfo: () => {
    return get().profileInfo
  },

  getExperiences: () => {
    return get().experiences
  },

  getQuickLinks: () => {
    return get().quickLinks
  },

  getExperienceById: (id: string) => {
    return get().experiences.find(exp => exp.id === id)
  },

  likeTimelineItem: (id: string) => {
    set((state) => ({
      timelineItems: state.timelineItems.map(item =>
        item.id === id 
          ? { 
              ...item, 
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1
            } 
          : item
      )
    }))
  },

  // 项目 CRUD 操作
  createProject: (project: Omit<Project, 'id' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString().split('T')[0]
    }
    set((state) => ({
      projects: [...state.projects, newProject]
    }))
    return newProject
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map(project =>
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : project
      )
    }))
  },

  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter(project => project.id !== id),
      // 同时删除相关的项目详情
      projectDetails: Object.fromEntries(
        Object.entries(state.projectDetails).filter(([key]) => !key.endsWith(`-${id}`))
      )
    }))
  },

  // 动态 CRUD 操作
  createTimelineItem: (item: Omit<TimelineItem, 'id' | 'publishedAt' | 'likes' | 'comments' | 'isLiked'>) => {
    const newItem: TimelineItem = {
      ...item,
      id: `timeline-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false
    }
    set((state) => ({
      timelineItems: [newItem, ...state.timelineItems]
    }))
    return newItem
  },

  deleteTimelineItem: (id: string) => {
    set((state) => ({
      timelineItems: state.timelineItems.filter(item => item.id !== id)
    }))
  },

  // 获取项目通过ID
  getProjectById: (id: string) => {
    return get().projects.find(project => project.id === id)
  },

  // 获取动态通过ID
  getTimelineItemById: (id: string) => {
    return get().timelineItems.find(item => item.id === id)
  }
}))