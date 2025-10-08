'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Briefcase,
  User
} from 'lucide-react'
import { Icon } from '@iconify/react'
import type { TechStackCategory } from '@/types/tech-stack'

interface SidebarNavigationProps {
  activeTab: 'projects' | 'timeline'
  activeSection: string
  sidebarCollapsed: boolean
  expandedCategories: string[]
  expandedYears: string[]
  timelineStructure: { [key: string]: { [key: string]: unknown[] } }
  techStackStructure: TechStackCategory[]
  onTabChange: (tab: 'projects' | 'timeline') => void
  onSectionChange: (section: string) => void
  onSidebarToggle: () => void
  onCategoryToggle: (categoryId: string) => void
  onYearToggle: (year: string) => void
  getMonthName: (month: string) => string
  quickLinks?: Array<{
    id: string;
    name: string;
    url: string;
    icon: string;
    description: string;
  }>
}

export default function SidebarNavigation({
  activeTab,
  activeSection,
  sidebarCollapsed,
  expandedCategories,
  expandedYears,
  timelineStructure,
  techStackStructure,
  onTabChange,
  onSectionChange,
  onSidebarToggle,
  onCategoryToggle,
  onYearToggle,
  getMonthName,
  quickLinks = []
}: SidebarNavigationProps) {

  return (
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
                  onTabChange('projects')
                  onSectionChange('all-projects')
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
                  onTabChange('timeline')
                  onSectionChange('all-timeline')
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
                  onClick={() => onSectionChange('all-projects')}
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
                  const iconName = typeof category.icon === 'string' && category.icon.trim().length > 0
                    ? category.icon
                    : 'lucide:layers'
                  const isExpanded = expandedCategories.includes(category.id)

                  return (
                    <div key={category.id}>
                      {/* 分类标题 */}
                      <button
                        onClick={() => onCategoryToggle(category.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon icon={iconName} className="w-4 h-4" />
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
                            const childIconName = typeof child.icon === 'string' && child.icon.trim().length > 0
                              ? child.icon
                              : 'lucide:code-2'
                            const isActive = activeSection === child.id

                            return (
                              <button
                                key={child.id}
                                onClick={() => onSectionChange(child.id)}
                                className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                  isActive 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                <Icon icon={childIconName} className="w-3 h-3" />
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
                    onClick={() => onSectionChange('experience')}
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
                    onClick={() => onSectionChange('about')}
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
                  onClick={() => onSectionChange('all-timeline')}
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
                            onClick={() => onYearToggle(year)}
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
                                      onClick={() => onSectionChange(sectionId)}
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
                  {quickLinks.map((link) => {
                    const iconName = typeof link.icon === 'string' && link.icon.trim().length > 0
                      ? link.icon
                      : 'lucide:link'
                    return (
                      <a 
                        key={link.id}
                        href={link.url}
                        target={link.url.startsWith('http') ? '_blank' : undefined}
                        rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        title={link.description}
                      >
                        <Icon icon={iconName} className="w-4 h-4" />
                        <span>{link.name}</span>
                      </a>
                    )
                  })}
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
            onClick={onSidebarToggle}
          >
            {sidebarCollapsed ? 
              <ChevronRight className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4 rotate-90" />
            }
          </Button>
        </div>
      </div>
    </aside>
  )
}
