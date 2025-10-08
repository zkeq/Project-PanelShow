'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TimelineItem } from '@/types/timeline'
import { Project } from '@/types/store'
import { ProfileData } from '@/hooks/useProfileData'

import AllProjectsContent from '@/components/project/AllProjectsContent'
import CategoryProjectsContent from '@/components/project/CategoryProjectsContent'
import TimelineContent from '@/components/timeline/TimelineContent'
import ExperienceContent from '@/components/experience/ExperienceContent'
import AboutContent from '@/components/about/AboutContent'
import MobileNavigation from '@/components/layout/MobileNavigation'

interface MobileNavigationData {
  techStackStructure: Array<{
    id: string
    label: string
    children?: Array<{
      id: string
      label: string
    }>
  }>
  expandedCategories: string[]
  expandedYears: string[]
  timelineStructure: { [key: string]: { [key: string]: unknown[] } }
  onTabChange: (tab: 'projects' | 'timeline') => void
  onSectionChange: (section: string) => void
  onCategoryToggle: (categoryId: string) => void
  onYearToggle: (year: string) => void
}

interface ContentRendererProps {
  activeTab: 'projects' | 'timeline'
  activeSection: string
  username: string
  projects: Project[]
  timelineItems: TimelineItem[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  getMonthName: (month: string) => string
  mobileNavigation?: MobileNavigationData
  profileData: ProfileData
}

export default function ContentRenderer({
  activeTab,
  activeSection,
  username,
  projects,
  timelineItems,
  expandedProjects,
  onToggleExpand,
  getMonthName,
  mobileNavigation,
  profileData
}: ContentRendererProps) {

  // 技术栈结构
  const techStackStructure = [
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
  ]

  // 从API数据构建用户资料
  const userProfile = {
    username: profileData.profile?.username || username,
    displayName: profileData.profile?.name || username,
    bio: String(profileData.profile?.github_bio || profileData.profile?.bio || ''),
    followers: profileData.profile?.github_followers || 0,
    following: profileData.profile?.github_following || 0,
    company: profileData.profile?.github_company || '',
    website: profileData.profile?.github_blog || '',
    stars: profileData.profile?.github_total_stars || 0,
    avatar: profileData.profile?.avatar || `https://avatars.githubusercontent.com/u/0`
  }

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
    const sortedTimeline = filteredTimeline.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    
    // 获取标题和描述
    const getTimelineTitle = () => {
      if (activeSection.includes('-') && activeSection !== 'all-timeline') {
        const [year, month] = activeSection.split('-')
        return `${year}年${getMonthName(month)}`
      }
      return '全部动态'
    }

    const getTimelineDescription = () => {
      return `${sortedTimeline.length} 条动态 · 展示项目进展和更新`
    }
    
    return (
      <div className="space-y-6">
        {/* 移动端导航 */}
        {mobileNavigation && (
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              activeSection={activeSection}
              {...mobileNavigation}
              getMonthName={getMonthName}
            />
          </div>
        )}

        <TimelineContent
          timelineItems={sortedTimeline}
          title={getTimelineTitle()}
          description={getTimelineDescription()}
          authorAvatar={userProfile.avatar}
          authorName={userProfile.displayName}
          username={username}
        />
      </div>
    )
  }

  // 项目模式处理
  // 所有项目页面 - 按时间倒序排列
  if (activeSection === 'all-projects') {
    return (
      <div className="space-y-6">
        {/* 移动端导航 */}
        {mobileNavigation && (
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              activeSection={activeSection}
              {...mobileNavigation}
              getMonthName={getMonthName}
            />
          </div>
        )}

        <AllProjectsContent
          projects={projects}
          expandedProjects={expandedProjects}
          onToggleExpand={onToggleExpand}
          userProfile={userProfile}
        />
      </div>
    )
  }

  // 根据当前选中的项目类别过滤项目
  const filteredProjects = projects.filter(p => p.category === activeSection)
  
  if (filteredProjects.length > 0) {
    const categoryLabel = techStackStructure
      .flatMap(cat => cat.children || [])
      .find(child => child.id === activeSection)?.label

    return (
      <div className="space-y-6">
        {/* 移动端导航 */}
        {mobileNavigation && (
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              activeSection={activeSection}
              {...mobileNavigation}
              getMonthName={getMonthName}
            />
          </div>
        )}

        <CategoryProjectsContent
          projects={filteredProjects}
          expandedProjects={expandedProjects}
          onToggleExpand={onToggleExpand}
          categoryLabel={categoryLabel || '未知'}
        />
      </div>
    )
  }

  // 工作经历页面
  if (activeSection === 'experience') {
    return (
      <div className="space-y-6">
        {/* 移动端导航 */}
        {mobileNavigation && (
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              activeSection={activeSection}
              {...mobileNavigation}
              getMonthName={getMonthName}
            />
          </div>
        )}

        <ExperienceContent
          experiences={profileData.experiences || []}
        />
      </div>
    )
  }

  // 关于我页面
  if (activeSection === 'about') {
    return (
      <div className="space-y-6">
        {/* 移动端导航 */}
        {mobileNavigation && (
          <div className="lg:hidden">
            <MobileNavigation
              activeTab={activeTab}
              activeSection={activeSection}
              {...mobileNavigation}
              getMonthName={getMonthName}
            />
          </div>
        )}

        <AboutContent
          username={username}
          github={profileData.profile?.github_username || username}
          bio={String(profileData.profile?.bio || '')}
          skills={profileData.profile?.skills}
          interests={profileData.profile?.interests as string[] | undefined}
        />
      </div>
    )
  }

  // 默认显示概览
  return (
    <div className="space-y-6">
      {/* 移动端导航 */}
      {mobileNavigation && (
        <div className="lg:hidden">
          <MobileNavigation
            activeTab={activeTab}
            activeSection={activeSection}
            {...mobileNavigation}
            getMonthName={getMonthName}
          />
        </div>
      )}

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