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
  Star
} from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function UserProjectPage() {
  const params = useParams()
  const username = params.username as string
  const [activeTab, setActiveTab] = useState<'projects' | 'timeline'>('projects')
  const [activeSection, setActiveSection] = useState('all-projects')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['backend', 'frontend'])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])

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
          <div className="grid gap-3 sm:gap-4 lg:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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

          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
            <ModeToggle />
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
        <aside className={`border-r bg-muted/10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-56'
        }`}>
          <div className="h-full flex flex-col">
            {/* 项目/时间线 切换标签 */}
            {!sidebarCollapsed && (
              <div className="p-4 pb-2">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'projects' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    项目
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
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
                    <p className="text-sm text-muted-foreground px-3">时间线内容开发中...</p>
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
        <main className="flex-1 min-w-0 relative">
          {/* 点状背景装饰 - 使用 CSS background-image 避免 hydration 问题 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* 点状背景层 */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.4) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0'
              }}
            />
            
            {/* 暗色主题下的点状背景 */}
            <div 
              className="absolute inset-0 dark:block hidden"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0'
              }}
            />
            
            {/* 渐变装饰元素 - 与现有设计系统颜色一致 */}
            <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-32 left-32 w-48 h-48 bg-gradient-to-tr from-purple-500/8 to-pink-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="h-[calc(100vh-3.5rem)] overflow-auto relative z-10">
            <div className="max-w-none p-4 sm:p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}