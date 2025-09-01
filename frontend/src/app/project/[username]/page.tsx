'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/store/useGlobalStore'

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

  // 从 Zustand store 获取数据
  const { getTimelineItems, getProjectsByUsername } = useGlobalStore()
  const timelineItems = getTimelineItems()
  const projects = getProjectsByUsername(username)


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
      <HeaderNavigation username={username} />

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
            onTabChange={handleTabChange}
            onSectionChange={handleSectionChange}
            onSidebarToggle={handleSidebarToggle}
            onCategoryToggle={handleCategoryToggle}
            onYearToggle={handleYearToggle}
            getMonthName={getMonthName}
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
                // 移动端需要的导航控制
                mobileNavigation={{
                  techStackStructure: [
                    {
                      id: 'backend',
                      label: '技术栈 - 后端',
                      children: [
                        { id: 'backend-python', label: 'Python' },
                        { id: 'backend-go', label: 'Go' }
                      ]
                    },
                    {
                      id: 'frontend',
                      label: '技术栈 - 前端',
                      children: [
                        { id: 'frontend-vue', label: 'Vue' },
                        { id: 'frontend-nextjs', label: 'Next.js' }
                      ]
                    }
                  ],
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