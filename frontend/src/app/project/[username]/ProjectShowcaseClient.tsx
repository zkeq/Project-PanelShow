'use client'

import { type ReactNode, useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSelectedLayoutSegments } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

import { checkUsername } from '@/lib/api'
import { useProfileData } from '@/hooks/useProfileData'
import { useProjectsAndTimeline } from '@/hooks/useProjectsAndTimeline'
import { useTechStackConfig } from '@/hooks/useTechStackConfig'
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import SidebarNavigation from '@/components/layout/SidebarNavigation'
import ContentRenderer from '@/components/layout/ContentRenderer'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProjectShowcaseClientProps {
  username: string
  children?: ReactNode
}

const deriveSelectionFromSegments = (segments: readonly string[]) => {
  if (!segments || segments.length === 0) {
    return {
      tab: 'projects' as const,
      section: 'all-projects'
    }
  }

  const [first, second, third] = segments

  if (first === 'about') {
    return { tab: 'projects' as const, section: 'about' }
  }

  if (first === 'experience') {
    return { tab: 'projects' as const, section: 'experience' }
  }

  if (first === 'category') {
    if (!second) {
      return { tab: 'projects' as const, section: 'all-projects' }
    }

    try {
      return { tab: 'projects' as const, section: decodeURIComponent(second) }
    } catch {
      return { tab: 'projects' as const, section: second }
    }
  }

  if (first === 'timeline') {
    if (!second) {
      return { tab: 'timeline' as const, section: 'all-timeline' }
    }

    if (!third) {
      return { tab: 'timeline' as const, section: 'all-timeline' }
    }

    const normalizedYear = decodeURIComponent(second)
    const normalizedMonth = decodeURIComponent(third).padStart(2, '0')
    const normalizedSection = `${normalizedYear}-${normalizedMonth}`

    if (/^\d{4}-\d{2}$/.test(normalizedSection)) {
      return { tab: 'timeline' as const, section: normalizedSection }
    }

    return { tab: 'timeline' as const, section: 'all-timeline' }
  }

  return { tab: 'projects' as const, section: 'all-projects' }
}

export default function ProjectShowcaseClient({ username, children }: ProjectShowcaseClientProps) {
  const router = useRouter()
  const encodedUsername = encodeURIComponent(username)
  const basePath = `/project/${encodedUsername}`

  const segments = useSelectedLayoutSegments()
  const derivedSelection = useMemo(() => deriveSelectionFromSegments(segments), [segments])

  const [activeTab, setActiveTab] = useState<'projects' | 'timeline'>(derivedSelection.tab)
  const [activeSection, setActiveSection] = useState(derivedSelection.section)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedYears, setExpandedYears] = useState<string[]>(() => {
    if (derivedSelection.tab === 'timeline' && /^\d{4}-\d{2}$/.test(derivedSelection.section)) {
      return [derivedSelection.section.split('-')[0]]
    }
    return ['2024', '2025']
  })
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])

  const [userStatus, setUserStatus] = useState<{
    loading: boolean
    exists: boolean
    isBound: boolean
    error: string | null
  }>({
    loading: true,
    exists: false,
    isBound: false,
    error: null
  })

  useEffect(() => {
    setActiveTab(prev => (prev === derivedSelection.tab ? prev : derivedSelection.tab))
  }, [derivedSelection.tab])

  useEffect(() => {
    setActiveSection(prev => (prev === derivedSelection.section ? prev : derivedSelection.section))
    if (derivedSelection.tab === 'timeline' && /^\d{4}-\d{2}$/.test(derivedSelection.section)) {
      setExpandedYears(prev => {
        const year = derivedSelection.section.split('-')[0]
        return prev.includes(year) ? prev : [...prev, year]
      })
    }
  }, [derivedSelection.section, derivedSelection.tab])

  const projectsAndTimeline = useProjectsAndTimeline(username)
  const techStackConfig = useTechStackConfig(username)
  const projects = projectsAndTimeline.projects
  const timelineItems = projectsAndTimeline.timelineItems
  const techStackStructure = useMemo(
    () => techStackConfig.config?.categories ?? [],
    [techStackConfig.config]
  )

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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await checkUsername(username)
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

  const handleSectionChange = useCallback(
    (section: string, tabOverride?: 'projects' | 'timeline') => {
      const targetTab = tabOverride ?? activeTab
      setActiveTab(targetTab)

      if (targetTab === 'timeline') {
        if (section === 'all-timeline') {
          setActiveSection(section)
          router.push(`${basePath}/timeline`)
          return
        }

        const [year, month] = section.split('-')
        if (!year || !month) {
          setActiveSection('all-timeline')
          router.push(`${basePath}/timeline`)
          return
        }

        const normalizedMonth = month.padStart(2, '0')
        const normalizedSection = `${year}-${normalizedMonth}`
        setActiveSection(normalizedSection)
        router.push(`${basePath}/timeline/${encodeURIComponent(year)}/${encodeURIComponent(normalizedMonth)}`)
        return
      }

      if (section === 'all-projects') {
        setActiveSection(section)
        router.push(basePath)
        return
      }

      if (section === 'experience') {
        setActiveSection(section)
        router.push(`${basePath}/experience`)
        return
      }

      if (section === 'about') {
        setActiveSection(section)
        router.push(`${basePath}/about`)
        return
      }

      setActiveSection(section)
      router.push(`${basePath}/category/${encodeURIComponent(section)}`)
    },
    [activeTab, basePath, router]
  )

  useEffect(() => {
    if (activeTab !== 'projects') return

    const staticSections = new Set(['all-projects', 'experience', 'about'])
    if (staticSections.has(activeSection)) return

    const allChildIds = techStackStructure.flatMap(category => category.children?.map(child => child.id) ?? [])
    if (!allChildIds.includes(activeSection)) {
      handleSectionChange('all-projects', 'projects')
    }
  }, [activeTab, activeSection, techStackStructure, handleSectionChange])

  const handleTabChange = useCallback(
    (tab: 'projects' | 'timeline') => {
      setActiveTab(tab)
      if (tab === 'projects') {
        setActiveSection('all-projects')
        router.push(basePath)
      } else {
        setActiveSection('all-timeline')
        router.push(`${basePath}/timeline`)
      }
    },
    [basePath, router]
  )

  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => !prev)
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
        ? prev.filter(item => item !== year)
        : [...prev, year]
    )
  }

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  if (userStatus.loading || profileData.loading || projectsAndTimeline.loading || techStackConfig.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation
        username={username}
        avatar={headerAvatar}
        displayName={headerDisplayName}
        titleHref={basePath}
      />

      <div className="flex">
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

        <main className={`flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
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
      {children}
    </div>
  )
}
