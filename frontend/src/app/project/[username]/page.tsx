'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { TimelineItem } from '@/types/timeline'

// 导入新的组件
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import SidebarNavigation from '@/components/layout/SidebarNavigation'
import ContentRenderer from '@/components/layout/ContentRenderer'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'

export default function UserProjectPage() {
  const params = useParams()
  const username = params.username as string
  const [activeTab, setActiveTab] = useState<'projects' | 'timeline'>('projects')
  const [activeSection, setActiveSection] = useState('all-projects')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['backend', 'frontend'])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedYears, setExpandedYears] = useState<string[]>(['2024', '2025'])
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])

  // 时间线数据
  const timelineItems: TimelineItem[] = [
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
          '/Snipaste_2025-08-23_22-52-25.png'
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

  // 从时间线数据中生成时间分类结构
  const generateTimelineStructure = () => {
    const timelineByYear: { [key: string]: { [key: string]: TimelineItem[] } } = {}
    
    timelineItems.forEach(item => {
      const date = new Date(item.publishedAt)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      
      if (!timelineByYear[year]) {
        timelineByYear[year] = {}
      }
      if (!timelineByYear[year][month]) {
        timelineByYear[year][month] = []
      }
      timelineByYear[year][month].push(item)
    })
    
    return timelineByYear
  }

  const timelineStructure = generateTimelineStructure()

  const getMonthName = (month: string) => {
    return `${parseInt(month)}月`
  }

  const projects = [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: '现代化的全栈电商解决方案，具有实时库存管理和支付集成。该项目采用微服务架构，支持高并发访问，集成了第三方支付、物流追踪、用户评价等功能模块。前端采用响应式设计，提供了优秀的用户体验，后端使用Django框架构建RESTful API，数据库采用PostgreSQL和Redis缓存方案，确保了系统的稳定性和性能。',
      status: 'active' as const,
      category: 'backend-python',
      techStack: 'Vue + Python',
      projectType: '公司',
      monthlyPV: '10w',
      developmentPeriod: '3个月',
      previewImage: '/Snipaste_2025-08-23_22-52-13.png',
      updatedAt: '2024-08-20'
    },
    {
      id: '2',
      name: 'Microservices API',
      description: '高性能的微服务架构 API 网关，采用Go语言开发，具有极低的延迟和高吞吐量。项目包含服务发现、负载均衡、熔断器、限流等功能，支持gRPC和HTTP协议，可以水平扩展。使用Docker容器化部署，通过Kubernetes进行编排管理，提供了完善的监控和日志系统。',
      status: 'active' as const,
      category: 'backend-go',
      techStack: 'Go + Redis',
      projectType: '个人',
      monthlyPV: '50w',
      developmentPeriod: '2个月',
      previewImage: '/Snipaste_2025-08-23_22-52-25.png',
      updatedAt: '2024-08-18'
    },
    {
      id: '3',
      name: 'Admin Dashboard',
      description: '企业级管理后台系统，提供了完整的权限管理、用户管理、数据统计等功能。采用Vue 3 + TypeScript开发，使用Pinia进行状态管理，Element Plus作为UI组件库。支持多主题切换、国际化、动态路由等功能，具有良好的可扩展性和维护性。后台数据通过图表和表格展示，支持数据导出和打印功能。',
      status: 'maintained' as const,
      category: 'frontend-vue',
      techStack: 'Vue + Node.js',
      projectType: '外包',
      monthlyPV: '5w',
      developmentPeriod: '4个月',
      previewImage: '/Snipaste_2025-08-23_22-52-25.png',
      updatedAt: '2024-07-30'
    },
    {
      id: '4',
      name: 'SaaS Platform',
      description: '多租户 SaaS 平台解决方案，支持多个租户共享同一套系统资源，同时保证数据隔离和安全性。使用Next.js构建前端应用，Prisma作为ORM工具，tRPC提供类型安全的API调用。平台提供了用户管理、订阅管理、支付集成、数据分析等核心功能，支持自定义品牌和域名。',
      status: 'active' as const,
      category: 'frontend-nextjs',
      techStack: 'Next.js + PostgreSQL',
      projectType: '创业',
      monthlyPV: '30w',
      developmentPeriod: '6个月',
      previewImage: '/Snipaste_2025-08-23_22-52-25.png',
      updatedAt: '2024-08-22'
    }
  ]


  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  // 事件处理函数
  const handleTabChange = (tab: 'projects' | 'timeline') => {
    setActiveTab(tab)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleYearToggle = (year: string) => {
    setExpandedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <HeaderNavigation username={username} />

      {/* 主体内容区 */}
      <div className="flex">
        {/* 左侧目录栏 */}
        <SidebarNavigation
          activeTab={activeTab}
          activeSection={activeSection}
          sidebarCollapsed={sidebarCollapsed}
          expandedCategories={expandedCategories}
          expandedYears={expandedYears}
          timelineStructure={timelineStructure}
          onTabChange={handleTabChange}
          onSectionChange={handleSectionChange}
          onSidebarToggle={handleSidebarToggle}
          onCategoryToggle={handleCategoryToggle}
          onYearToggle={handleYearToggle}
          getMonthName={getMonthName}
        />

        {/* 右侧内容区 */}
        <main className={`flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          {/* 背景装饰 */}
          <BackgroundDecorations />

          <div className="relative z-10">
            <div className="max-w-none p-4 sm:p-6 lg:p-8">
              <ContentRenderer
                activeTab={activeTab}
                activeSection={activeSection}
                username={username}
                projects={projects}
                timelineItems={timelineItems}
                expandedProjects={expandedProjects}
                onToggleExpand={toggleProjectExpansion}
                getMonthName={getMonthName}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}