'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { checkUsername } from '@/lib/api'
import { useProfileData } from '@/hooks/useProfileData'
import { useProjectsAndTimeline } from '@/hooks/useProjectsAndTimeline'
import { useTechStackConfig } from '@/hooks/useTechStackConfig'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// 导入新的组件
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import SidebarNavigation from '@/components/layout/SidebarNavigation'
import ContentRenderer from '@/components/layout/ContentRenderer'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'

export default function UserProjectPage() {
  const params = useParams()
  const username = params.username as string
  const encodedUsername = encodeURIComponent(username)

  // 所有 hooks 必须在顶部调用
  const [activeTab, setActiveTab] = useState<'projects' | 'timeline'>('projects')
  const [activeSection, setActiveSection] = useState('all-projects')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedYears, setExpandedYears] = useState<string[]>(['2024', '2025'])
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])

  const [userStatus, setUserStatus] = useState<{
    loading: boolean;
    exists: boolean;
    isBound: boolean;
    error: string | null;
  }>({
    loading: true,
    exists: false,
    isBound: false,
    error: null
  })

  // 从 API 获取项目和时间线数据
  const projectsAndTimeline = useProjectsAndTimeline(username)
  const techStackConfig = useTechStackConfig(username)
  const projects = projectsAndTimeline.projects
  const timelineItems = projectsAndTimeline.timelineItems
  const techStackStructure = useMemo(
    () => techStackConfig.config?.categories ?? [],
    [techStackConfig.config]
  )

  // 获取profile数据
  const profileData = useProfileData(username)
  const headerAvatar = useMemo(() => {
    const rawAvatar = profileData.profile?.avatar
    if (typeof rawAvatar === 'string') {
      const trimmed = rawAvatar.trim()
      if (trimmed.length > 0) return trimmed
    }
    return undefined
  }, [profileData.profile?.avatar])
  const headerDisplayName = useMemo(() => {
    const rawSiteTitle = profileData.profile?.siteTitle
    if (typeof rawSiteTitle === 'string') {
      const trimmed = rawSiteTitle.trim()
      if (trimmed.length > 0) return trimmed
    }
    const rawName = profileData.profile?.name
    if (typeof rawName === 'string') {
      const trimmed = rawName.trim()
      if (trimmed.length > 0) return trimmed
    }
    return undefined
  }, [profileData.profile?.siteTitle, profileData.profile?.name])

  // 检查用户名是否存在和被绑定
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await checkUsername(username)

        // 用户必须存在且被绑定才能访问
        if (response.exists && response.is_bound) {
          setUserStatus({
            loading: false,
            exists: true,
            isBound: true,
            error: null
          })
        } else {
          setUserStatus({
            loading: false,
            exists: response.exists,
            isBound: response.is_bound,
            error: response.exists ? '该用户还未完成设置' : '该用户不存在'
          })
        }
      } catch {
        setUserStatus({
          loading: false,
          exists: false,
          isBound: false,
          error: '无法验证用户信息'
        })
      }
    }

    checkUser()
  }, [username])

  useEffect(() => {
    if (techStackStructure.length > 0) {
      setExpandedCategories(prev => (prev.length > 0 ? prev : techStackStructure.map(category => category.id)))
    }
  }, [techStackStructure])

  useEffect(() => {
    if (activeTab !== 'projects') return

    const staticProjectSections = new Set(['all-projects', 'experience', 'about'])
    if (staticProjectSections.has(activeSection)) return

    const allChildIds = techStackStructure.flatMap(category => category.children?.map(child => child.id) ?? [])
    if (!allChildIds.includes(activeSection)) {
      setActiveSection('all-projects')
    }
  }, [activeTab, activeSection, techStackStructure])

  // 显示加载状态
  if (userStatus.loading || profileData.loading || projectsAndTimeline.loading || techStackConfig.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // 显示错误状态
  if (userStatus.error || profileData.error || projectsAndTimeline.error || techStackConfig.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">访问受限</h2>
            <p className="text-muted-foreground text-center">
              {userStatus.error || profileData.error || projectsAndTimeline.error || techStackConfig.error}
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 用户验证通过，继续渲染页面


  // 从时间线数据中生成时间分类结构
  const generateTimelineStructure = () => {
    const timelineByYear: { [key: string]: { [key: string]: typeof timelineItems } } = {}
    
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
      <HeaderNavigation
        username={username}
        avatar={headerAvatar}
        displayName={headerDisplayName}
        titleHref={`/project/${encodedUsername}`}
      />

      {/* 主体内容区 */}
      <div className="flex">
        {/* 左侧目录栏 - 桌面端显示 */}
        <div className="hidden lg:block">
          <SidebarNavigation
            activeTab={activeTab}
            activeSection={activeSection}
            sidebarCollapsed={sidebarCollapsed}
            expandedCategories={expandedCategories}
            expandedYears={expandedYears}
            timelineStructure={timelineStructure}
            techStackStructure={techStackStructure}
            onTabChange={handleTabChange}
            onSectionChange={handleSectionChange}
            onSidebarToggle={handleSidebarToggle}
            onCategoryToggle={handleCategoryToggle}
            onYearToggle={handleYearToggle}
            getMonthName={getMonthName}
            quickLinks={profileData.quickLinks || []}
          />
        </div>

        {/* 右侧内容区 */}
        <main className={`flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
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
                profileData={profileData}
                techStackStructure={techStackStructure}
                // 移动端需要的导航控制
                mobileNavigation={{
                  techStackStructure,
                  expandedCategories,
                  expandedYears,
                  timelineStructure,
                  onTabChange: handleTabChange,
                  onSectionChange: handleSectionChange,
                  onCategoryToggle: handleCategoryToggle,
                  onYearToggle: handleYearToggle
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}