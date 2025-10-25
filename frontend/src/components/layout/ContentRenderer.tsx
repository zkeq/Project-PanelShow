'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TimelineItem } from '@/types/timeline'
import { Project, ContactMethod } from '@/types/store'
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
  onSectionChange: (section: string, tabOverride?: 'projects' | 'timeline') => void
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

const parseContactMethods = (value: unknown): ContactMethod[] => {
  if (!Array.isArray(value)) return []

  return value.reduce<ContactMethod[]>((accumulator, item) => {
    if (!item || typeof item !== 'object') return accumulator
    const candidate = item as Record<string, unknown>
    const rawId = candidate.id
    const rawLabel = candidate.label
    const rawValue = candidate.value
    const rawIcon = candidate.icon

    const label = typeof rawLabel === 'string' ? rawLabel.trim() : ''
    const valueText = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (!label || !valueText) return accumulator

    const id = typeof rawId === 'string' && rawId.trim().length > 0
      ? rawId.trim()
      : `${label}-${valueText}`
    const icon = typeof rawIcon === 'string' && rawIcon.trim().length > 0
      ? rawIcon.trim()
      : undefined

    accumulator.push({
      id,
      label,
      value: valueText,
      icon
    })

    return accumulator
  }, [])
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
  const getString = (value: unknown) =>
    typeof value === 'string' && value.trim().length > 0 ? value : undefined

  const getNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
  }

  const website =
    getString(profileData.profile?.personalWebsite) ||
    getString(profileData.profile?.github_blog) ||
    getString(profileData.profile?.website)

  const githubHandle = getString(profileData.profile?.github)
  const githubUrl =
    getString(profileData.profile?.github_profile_url) ||
    (githubHandle ? `https://github.com/${githubHandle}` : undefined)

  const userProfile = {
    username: getString(profileData.profile?.username) || username,
    displayName: getString(profileData.profile?.name) || username,
    bio:
      getString(profileData.profile?.github_bio) ||
      getString(profileData.profile?.bio) ||
      '',
    followers: getNumber(profileData.profile?.github_followers) || 0,
    following: getNumber(profileData.profile?.github_following) || 0,
    company: getString(profileData.profile?.github_company),
    website,
    githubUrl,
    stars: getNumber(profileData.profile?.github_total_stars),
    avatar:
      getString(profileData.profile?.avatar) ||
      `https://avatars.githubusercontent.com/u/0`,
    wechatQr: getString(profileData.profile?.wechatQr),
    wechatDescription: getString(profileData.profile?.notes),
    subDescription: getString(profileData.profile?.subDescription)
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
          username={username}
          userProfile={userProfile}
        />
      </div>
    )
  }

  const projectMap = new Map<string, Project>()
  const projectIndexMap = new Map<string, number>()

  projects.forEach((project, index) => {
    if (project.id) {
      projectMap.set(project.id, project)
      projectIndexMap.set(project.id, index)
    }
  })

  const activeTechStackChild = techStackStructure
    .flatMap(category => category.children ?? [])
    .find(child => child.id === activeSection)

  const filteredProjects = activeTechStackChild
    ? activeTechStackChild.projectIds
        .map(projectId => projectMap.get(projectId))
        .filter((project): project is Project => Boolean(project))
        .sort((a, b) => {
          const orderA = a.id ? projectIndexMap.get(a.id) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
          const orderB = b.id ? projectIndexMap.get(b.id) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER

          return orderA - orderB
        })
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
          username={username}
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
    const contactMethods = parseContactMethods(profileData.profile?.contactMethods)
    const email = getString(profileData.profile?.email)
    const aboutGithub = getString(profileData.profile?.github_username) || githubHandle
    const aboutBio = getString(profileData.profile?.bio) || ''
    const aboutSubtitle = getString(profileData.profile?.aboutSubtitle)

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
          github={aboutGithub || username}
          bio={aboutBio}
          skills={profileData.profile?.skills}
          interests={profileData.profile?.interests as string[] | undefined}
          email={email}
          website={website}
          aboutSubtitle={aboutSubtitle}
          contactMethods={contactMethods.length ? contactMethods : undefined}
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
