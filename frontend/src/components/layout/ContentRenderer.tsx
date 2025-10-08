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
import type { TechStackCategory } from '@/types/tech-stack'

interface MobileNavigationData {
  techStackStructure: TechStackCategory[]
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
  techStackStructure: TechStackCategory[]
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
  profileData,
  techStackStructure
}: ContentRendererProps) {

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

  const projectMap = new Map<string, Project>()
  projects.forEach(project => {
    if (project.id) {
      projectMap.set(project.id, project)
    }
  })

  const activeTechStackChild = techStackStructure
    .flatMap(category => category.children ?? [])
    .find(child => child.id === activeSection)

  const filteredProjects = activeTechStackChild
    ? activeTechStackChild.projectIds
        .map(projectId => projectMap.get(projectId))
        .filter((project): project is Project => Boolean(project))
    : []
  
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

  // 默认空状态
  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>暂无项目展示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>当前分类下还没有配置项目。请从左侧选择其他分类，或前往管理端的技术栈设置中为该分类添加项目。</p>
          <p>完成配置后，这里会展示属于该分类的全部项目。</p>
        </CardContent>
      </Card>
    </div>
  )
}
