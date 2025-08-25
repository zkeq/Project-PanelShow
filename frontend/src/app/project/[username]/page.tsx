'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import ProjectCard from '@/components/ProjectCard'
import TimelineCard from '@/components/TimelineCard'
import { TimelineItem } from '@/types/timeline'
import { 
  Github, 
  Globe, 
  Code2,
  User,
  Briefcase,
  Mail,
  Settings,
  ChevronRight,
  ChevronDown,
  Cpu,
  Layers,
  Star,
  Zap
} from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'

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

  const toggleYear = (year: string) => {
    setExpandedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  const getMonthName = (month: string) => {
    return `${parseInt(month)}月`
  }

  // 技术栈结构
  const techStackStructure = [
    {
      id: 'backend',
      label: '技术栈 - 后端',
      icon: Cpu,
      type: 'category',
      children: [
        { id: 'backend-python', label: 'Python', icon: Code2 },
        { id: 'backend-go', label: 'Go', icon: Code2 }
      ]
    },
    {
      id: 'frontend',
      label: '技术栈 - 前端',
      icon: Layers,
      type: 'category',
      children: [
        { id: 'frontend-vue', label: 'Vue', icon: Code2 },
        { id: 'frontend-nextjs', label: 'Next.js', icon: Code2 }
      ]
    }
  ]

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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleNavClick = (id: string) => {
    setActiveSection(id)
  }

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const renderContent = () => {
    // 时间线模式处理
    if (activeTab === 'timeline') {
      // 根据选择的类型过滤时间线数据
      let filteredTimeline = [...timelineItems]
      
      // 按年月筛选
      if (activeSection.includes('-') && activeSection !== 'all-timeline') {
        const [year, month] = activeSection.split('-')
        filteredTimeline = timelineItems.filter(item => {
          const itemDate = new Date(item.publishedAt)
          const itemYear = itemDate.getFullYear().toString()
          const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0')
          return itemYear === year && itemMonth === month
        })
      }
      
      // 按时间排序
      const sortedTimeline = filteredTimeline.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      
      // 获取标题
      const getTimelineTitle = () => {
        if (activeSection.includes('-') && activeSection !== 'all-timeline') {
          const [year, month] = activeSection.split('-')
          return `${year}年${getMonthName(month)}`
        }
        return '全部动态'
      }
      
      return (
        <div className="w-full space-y-6 max-w-4xl mx-auto">
          {/* 时间线标题 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {getTimelineTitle()}
            </h1>
            <p className="text-muted-foreground">
              {sortedTimeline.length} 条动态 · 展示项目进展和更新
            </p>
          </div>
          
          {/* 时间线卡片列表 - 左对齐宽屏布局 */}
          <div className="w-full max-w-none space-y-6">
            {sortedTimeline.map((item) => (
              <div key={item.id} className="">
                <TimelineCard item={item} />
              </div>
            ))}
          </div>
          
          {/* 空状态 */}
          {sortedTimeline.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无动态</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {activeSection.includes('-') && activeSection !== 'all-timeline' 
                  ? `${getTimelineTitle()}暂无项目动态` 
                  : '还没有发布任何项目动态'}
              </p>
            </div>
          )}
        </div>
      )
    }

    // 项目模式处理（原有逻辑保持不变）
    // 所有项目页面 - 按时间倒序排列
    if (activeSection === 'all-projects') {
      const sortedProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      return (
        <div className="space-y-6">
          {/* Zkeq 用户信息区域 */}
          <div className="w-full bg-background border border-border/40 rounded-lg">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* 头像 */}
                <div className="flex-shrink-0">
                  <Image
                    src="https://avatars.githubusercontent.com/u/62864752"
                    alt="Zkeq"
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-border/60"
                  />
                </div>
                
                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-xl font-bold text-foreground">Zkeq</h1>
                    <span className="text-muted-foreground text-base">zkeq</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
                    A front-end engineer. Enjoy something that brings convenience to people. Just show, Just love.
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <span>195 followers</span>
                    <span>·</span>
                    <span>15 following</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>广州图欧科技有限公司</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Aspire to be a pure thinker.</span>
                    <a 
                      href="https://icodeq.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center space-x-1"
                    >
                      <Globe className="w-4 h-4" />
                      <span>icodeq.com</span>
                    </a>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <span>610</span>
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 项目网格 */}
          <div className="grid gap-3 sm:gap-4 lg:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))' }}>
            {sortedProjects.map((project, index) => (
              <ProjectCard 
                key={project.id}
                project={project}
                expandedProjects={expandedProjects}
                onToggleExpand={toggleProjectExpansion}
                index={index}
              />
            ))}
          </div>
        </div>
      )
    }

    // 根据当前选中的项目类别过滤项目
    const filteredProjects = projects.filter(p => p.category === activeSection)
    
    if (filteredProjects.length > 0) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {techStackStructure
                .flatMap(cat => cat.children || [])
                .find(child => child.id === activeSection)?.label} 项目
            </h1>
            <p className="text-muted-foreground">
              使用 {techStackStructure
                .flatMap(cat => cat.children || [])
                .find(child => child.id === activeSection)?.label} 开发的项目
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))' }}>
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id}
                project={project}
                expandedProjects={expandedProjects}
                onToggleExpand={toggleProjectExpansion}
                index={index}
              />
            ))}
          </div>
        </div>
      )
    }

    // 工作经历页面
    if (activeSection === 'experience') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">工作经历</h1>
            <p className="text-muted-foreground">
              我的职业发展历程
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>高级全栈开发工程师</CardTitle>
                    <CardDescription className="mt-1">科技创新公司 • 北京</CardDescription>
                  </div>
                  <Badge variant="outline">2021 - 至今</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 负责核心业务系统的架构设计和技术选型</li>
                  <li>• 带领 5 人技术团队完成多个大型项目</li>
                  <li>• 优化系统性能，将响应时间提升 60%</li>
                  <li>• 建立完善的 CI/CD 流程和代码规范</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>前端开发工程师</CardTitle>
                    <CardDescription className="mt-1">互联网科技公司 • 上海</CardDescription>
                  </div>
                  <Badge variant="outline">2019 - 2021</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 参与公司主要产品的前端开发工作</li>
                  <li>• 负责移动端 H5 页面的开发和优化</li>
                  <li>• 搭建组件库和开发工具，提高团队效率</li>
                  <li>• 参与技术分享和新人培训工作</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>初级开发工程师</CardTitle>
                    <CardDescription className="mt-1">软件开发公司 • 深圳</CardDescription>
                  </div>
                  <Badge variant="outline">2018 - 2019</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 参与企业管理系统的开发和维护</li>
                  <li>• 学习现代前端框架和后端技术</li>
                  <li>• 配合产品和设计团队完成需求开发</li>
                  <li>• 积累了丰富的项目开发经验</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    // 关于我页面
    if (activeSection === 'about') {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">关于我</h1>
            <p className="text-muted-foreground">
              了解我的技能、兴趣和职业目标
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>个人简介</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    我是一名充满热情的全栈开发工程师，拥有 5 年以上的软件开发经验。
                    专注于构建高性能、可扩展的 Web 应用，热衷于学习新技术和分享知识。
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    在职业生涯中，我参与了多个大型项目的开发，从前端界面到后端架构，
                    从数据库设计到部署运维，积累了丰富的全栈开发经验。我相信技术的力量，
                    也相信团队合作的重要性。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>核心技能</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">前端开发</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>React / Vue.js</div>
                        <div>Next.js / Nuxt.js</div>
                        <div>TypeScript</div>
                        <div>Tailwind CSS</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">后端开发</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Python / Go</div>
                        <div>Django / FastAPI</div>
                        <div>PostgreSQL / Redis</div>
                        <div>Docker / Kubernetes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>联系信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>contact@example.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Github className="w-4 h-4 text-muted-foreground" />
                    <span>github.com/{username}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>personal-website.com</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>兴趣爱好</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">编程</Badge>
                    <Badge variant="secondary">开源</Badge>
                    <Badge variant="secondary">摄影</Badge>
                    <Badge variant="secondary">阅读</Badge>
                    <Badge variant="secondary">旅行</Badge>
                    <Badge variant="secondary">音乐</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    // 默认显示概览
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">欢迎来到 {username} 的作品集</h1>
          <p className="text-muted-foreground">
            探索我的项目和技术栈
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>关于我</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-muted/80 border border-border/60 rounded-full flex items-center justify-center text-foreground text-xl font-semibold">
                {username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">@{username}</h3>
                <p className="text-muted-foreground mb-4">
                  全栈开发者，专注于构建高性能、可扩展的 Web 应用。
                  精通 Python、Go、Vue 和 Next.js 等技术栈。
                </p>
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="font-semibold">12</span>
                    <span className="text-muted-foreground ml-1">项目</span>
                  </div>
                  <div>
                    <span className="font-semibold">1.2K</span>
                    <span className="text-muted-foreground ml-1">Stars</span>
                  </div>
                  <div>
                    <span className="font-semibold">342</span>
                    <span className="text-muted-foreground ml-1">Forks</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 - 更简洁的设计 */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-muted/80 border border-border/60 rounded-md flex items-center justify-center text-foreground text-sm font-semibold">
              {username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-foreground">{username}</h1>
              <span className="text-muted-foreground text-sm">的作品集</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <ThemeSwitch />
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="w-3 h-3 mr-1.5" />
              管理
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="flex">
        {/* 左侧目录栏 */}
        <aside className={`border-r bg-muted/10 transition-all duration-300 fixed h-[calc(100vh-3.5rem)] z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}>
          <div className="h-full flex flex-col">
            {/* 项目/时间线 切换标签 */}
            {!sidebarCollapsed && (
              <div className="p-4 pb-2">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => {
                      setActiveTab('projects')
                      setActiveSection('all-projects')
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'projects' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    项目
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('timeline')
                      setActiveSection('all-timeline')
                    }}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'timeline' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    时间线
                  </button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="p-4 pt-2">
                {activeTab === 'projects' ? (
                  <div className="space-y-2">
                    {/* 所有项目选项 */}
                    <button
                      onClick={() => handleNavClick('all-projects')}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'all-projects' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      {!sidebarCollapsed && <span>所有项目</span>}
                    </button>

                    <Separator className="my-3" />

                    {techStackStructure.map((category) => {
                      const Icon = category.icon
                      const isExpanded = expandedCategories.includes(category.id)

                      return (
                        <div key={category.id}>
                          {/* 分类标题 */}
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              {!sidebarCollapsed && <span>{category.label}</span>}
                            </div>
                            {!sidebarCollapsed && (
                              isExpanded ? 
                                <ChevronDown className="w-3 h-3" /> : 
                                <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                          
                          {/* 子项目 */}
                          {isExpanded && !sidebarCollapsed && category.children && (
                            <div className="ml-6 space-y-1">
                              {category.children.map((child) => {
                                const ChildIcon = child.icon
                                const isActive = activeSection === child.id
                                
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNavClick(child.id)}
                                    className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                      isActive 
                                        ? 'bg-primary/10 text-primary font-medium' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                  >
                                    <ChildIcon className="w-3 h-3" />
                                    <span>{child.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* 分隔线 */}
                    <Separator className="my-3" />
                    
                    {/* 单独的页面项 */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick('experience')}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          activeSection === 'experience' 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        {!sidebarCollapsed && <span>工作经历</span>}
                      </button>
                      
                      <button
                        onClick={() => handleNavClick('about')}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          activeSection === 'about' 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        {!sidebarCollapsed && <span>关于我</span>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 全部时间线 */}
                    <button
                      onClick={() => handleNavClick('all-timeline')}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === 'all-timeline' 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      {!sidebarCollapsed && <span>全部动态</span>}
                    </button>

                    <Separator className="my-3" />
                    
                    {/* 按年份和月份分类 */}
                    <div className="space-y-1">
                      {Object.keys(timelineStructure)
                        .sort((a, b) => parseInt(b) - parseInt(a)) // 年份倒序
                        .map(year => {
                          const isYearExpanded = expandedYears.includes(year)
                          const yearData = timelineStructure[year]
                          const totalItemsInYear = Object.values(yearData).reduce((sum, items) => sum + items.length, 0)
                          
                          return (
                            <div key={year}>
                              {/* 年份标题 */}
                              <button
                                onClick={() => toggleYear(year)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                                  activeSection === `year-${year}` 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'text-foreground hover:text-foreground hover:bg-muted'
                                } rounded-md`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">{year.slice(-2)}</span>
                                  </div>
                                  {!sidebarCollapsed && (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{year}年</span>
                                      <span className="text-xs text-muted-foreground">({totalItemsInYear})</span>
                                    </div>
                                  )}
                                </div>
                                {!sidebarCollapsed && (
                                  isYearExpanded ? 
                                    <ChevronDown className="w-3 h-3" /> : 
                                    <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                              
                              {/* 月份列表 */}
                              {isYearExpanded && !sidebarCollapsed && (
                                <div className="ml-6 mt-1 space-y-1">
                                  {Object.keys(yearData)
                                    .sort((a, b) => parseInt(b) - parseInt(a)) // 月份倒序
                                    .map(month => {
                                      const monthItems = yearData[month]
                                      const sectionId = `${year}-${month}`
                                      
                                      return (
                                        <button
                                          key={month}
                                          onClick={() => handleNavClick(sectionId)}
                                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
                                            activeSection === sectionId 
                                              ? 'bg-primary/10 text-primary font-medium' 
                                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                          }`}
                                        >
                                          <span>{getMonthName(month)}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {monthItems.length}
                                          </span>
                                        </button>
                                      )
                                    })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {!sidebarCollapsed && (
                  <>
                    <Separator className="my-4" />
                    
                    {/* 快速链接 */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground px-3 mb-2">快速链接</p>
                      <a 
                        href="#" 
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                      <a 
                        href="#" 
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>个人网站</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* 折叠按钮 */}
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? 
                  <ChevronRight className="w-4 h-4" /> : 
                  <ChevronDown className="w-4 h-4 rotate-90" />
                }
              </Button>
            </div>
          </div>
        </aside>

        {/* 右侧内容区 */}
        <main className={`flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          {/* 点状背景装饰 - 使用 CSS background-image 避免 hydration 问题 */}
          <div className="absolute inset-0 min-h-[calc(100vh-3.5rem)] overflow-hidden pointer-events-none">
            {/* 点状背景层 */}
            <div 
              className="absolute inset-0 min-h-full dark:hidden"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.4) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0'
              }}
            />
            
            {/* 暗色模式下的点状背景 - 更淡 */}
            <div 
              className="absolute inset-0 min-h-full hidden dark:block"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0'
              }}
            />
            
            {/* 渐变装饰元素 - 与现有设计系统颜色一致 */}
            <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-32 left-32 w-48 h-48 bg-gradient-to-tr from-purple-500/8 to-pink-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <div className="max-w-none p-4 sm:p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}