'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/store/useGlobalStore'
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectHero from '@/components/project/ProjectHero'
import ProjectContent from '@/components/project/ProjectContent'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'


export default function ProjectDetailPage() {
  const params = useParams()
  const username = params.username as string
  const projectId = params.projectId as string
  const [activeSection, setActiveSection] = useState('overview')

  // 从 Zustand store 获取项目详情数据
  const { getProjectDetail } = useGlobalStore()
  const projectData = getProjectDetail(username, projectId)

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'description', 'features', 'timeline']
      const scrollPosition = window.scrollY + 150 // 添加偏移量，让导航更早切换
      
      let current = 'overview'
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          
          if (scrollPosition >= elementTop) {
            current = section
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current)
      }
    }

    // 初始检查
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const handleSectionChange = (section: string) => {
    const element = document.getElementById(section)
    if (element) {
      const headerOffset = 100 // 给固定头部留出空间
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  // 如果没有找到项目数据，返回 404 或默认数据
  if (!projectData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">项目未找到</h1>
          <p className="text-muted-foreground">请求的项目不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <HeaderNavigation username={username} />

      {/* 主体内容区 */}
      <div className="flex">
        {/* 左侧固定侧边栏 - 仅桌面端显示 */}
        <div className="hidden lg:block">
          <ProjectSidebar
            project={{
              ...projectData,
              // 为了兼容原有接口，从 displayData 中提取必要字段
              techStack: projectData.displayData.find(item => item.key === 'techStack')?.value || '',
              projectType: projectData.displayData.find(item => item.key === 'projectType')?.value || '',
              monthlyPV: projectData.displayData.find(item => item.key === 'monthlyPV')?.value || '',
              developmentPeriod: projectData.displayData.find(item => item.key === 'developmentPeriod')?.value || '',
              uiLibrary: projectData.displayData.find(item => item.key === 'uiLibrary')?.value || '',
              componentLibrary: projectData.displayData.find(item => item.key === 'componentLibrary')?.value || '',
              // 修复状态类型兼容问题
              status: projectData.status === 'completed' ? 'archived' as const : projectData.status as 'active' | 'maintained'
            }}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* 右侧内容区 */}
        <main className="flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] lg:ml-80">
          {/* 背景装饰 */}
          <BackgroundDecorations />

          <div className="relative z-10">
            <div className="w-full p-4 sm:p-6 lg:p-8">
              {/* 项目Hero区段作为内容的一部分 */}
              <ProjectHero project={{
                ...projectData,
                techStack: projectData.displayData.find(item => item.key === 'techStack')?.value || '',
                projectType: projectData.displayData.find(item => item.key === 'projectType')?.value || '',
                monthlyPV: projectData.displayData.find(item => item.key === 'monthlyPV')?.value || '',
                developmentPeriod: projectData.displayData.find(item => item.key === 'developmentPeriod')?.value || '',
                status: projectData.status === 'completed' ? 'archived' as const : projectData.status as 'active' | 'maintained'
              }} username={username} />
              
              <ProjectContent 
                project={{
                  ...projectData,
                  techStack: projectData.displayData.find(item => item.key === 'techStack')?.value || '',
                  projectType: projectData.displayData.find(item => item.key === 'projectType')?.value || '',
                  monthlyPV: projectData.displayData.find(item => item.key === 'monthlyPV')?.value || '',
                  developmentPeriod: projectData.displayData.find(item => item.key === 'developmentPeriod')?.value || '',
                  status: projectData.status === 'completed' ? 'archived' as const : projectData.status as 'active' | 'maintained'
                }} 
                username={username}
                // 传递移动端导航所需的数据
                mobileNavigation={{
                  activeSection,
                  onSectionChange: handleSectionChange
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}