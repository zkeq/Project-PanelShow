'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ChevronDown, 
  Layers,
  Code2,
  Briefcase,
  User,
  Calendar
} from 'lucide-react'

interface MobileNavigationProps {
  activeTab: 'projects' | 'timeline'
  activeSection: string
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
  getMonthName: (month: string) => string
}

export default function MobileNavigation({
  activeTab,
  activeSection,
  techStackStructure,
  timelineStructure,
  onTabChange,
  onSectionChange,
  getMonthName
}: MobileNavigationProps) {
  
  // 获取当前选中项的显示名称
  const getCurrentSectionLabel = () => {
    if (activeSection === 'all-projects') return '所有项目'
    if (activeSection === 'all-timeline') return '全部动态'
    if (activeSection === 'experience') return '工作经历'
    if (activeSection === 'about') return '关于我'
    
    // 检查技术栈
    for (const category of techStackStructure) {
      if (category.children) {
        const child = category.children.find(c => c.id === activeSection)
        if (child) return child.label
      }
    }
    
    // 检查时间线
    if (activeSection.includes('-') && activeSection !== 'all-timeline') {
      const [year, month] = activeSection.split('-')
      return `${year}年${getMonthName(month)}`
    }
    
    return '选择分类'
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg">
      {/* 简洁装饰元素 */}
      <div className="absolute inset-0">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-muted/20 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-muted/10 rounded-full" />
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10 p-4">
        <div className="flex flex-col space-y-4">
          {/* 标签页切换 */}
          <div className="flex bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => {
                onTabChange('projects')
                onSectionChange('all-projects')
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'projects' 
                  ? 'bg-background text-foreground shadow-md border border-border/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>项目</span>
              </span>
            </button>
            <button
              onClick={() => {
                onTabChange('timeline')
                onSectionChange('all-timeline')
              }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'timeline' 
                  ? 'bg-background text-foreground shadow-md border border-border/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>时间线</span>
              </span>
            </button>
          </div>

          {/* 分类选择下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between h-11 bg-background/80 border-border/60 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-muted/30"
              >
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">{getCurrentSectionLabel()}</span>
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[280px] bg-card border-border/60 shadow-xl" align="start">
              {activeTab === 'projects' ? (
                <>
                  <DropdownMenuLabel className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>项目分类</span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('all-projects')}
                    className={`transition-colors ${activeSection === 'all-projects' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    所有项目
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {techStackStructure.map((category) => (
                    <div key={category.id}>
                      <DropdownMenuLabel className="text-xs px-3 py-2 text-muted-foreground font-medium uppercase tracking-wide">
                        {category.label}
                      </DropdownMenuLabel>
                      {category.children?.map((child) => (
                        <DropdownMenuItem 
                          key={child.id}
                          onClick={() => onSectionChange(child.id)}
                          className={`ml-4 transition-colors ${activeSection === child.id ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                        >
                          <Code2 className="mr-2 h-3 w-3" />
                          {child.label}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('experience')}
                    className={`transition-colors ${activeSection === 'experience' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    工作经历
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('about')}
                    className={`transition-colors ${activeSection === 'about' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    关于我
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>时间线筛选</span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('all-timeline')}
                    className={`transition-colors ${activeSection === 'all-timeline' ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    全部动态
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {Object.keys(timelineStructure)
                    .sort((a, b) => parseInt(b) - parseInt(a))
                    .map(year => {
                      const yearData = timelineStructure[year]
                      
                      return (
                        <div key={year}>
                          <DropdownMenuLabel className="text-xs px-3 py-2 text-muted-foreground font-medium uppercase tracking-wide flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {year}年
                          </DropdownMenuLabel>
                          {Object.keys(yearData)
                            .sort((a, b) => parseInt(b) - parseInt(a))
                            .map(month => {
                              const sectionId = `${year}-${month}`
                              const monthItems = yearData[month]
                              
                              return (
                                <DropdownMenuItem
                                  key={month}
                                  onClick={() => onSectionChange(sectionId)}
                                  className={`ml-4 transition-colors ${activeSection === sectionId ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                                >
                                  <span className="mr-2 text-xs">📅</span>
                                  <span className="flex-1">{getMonthName(month)}</span>
                                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full ml-2 font-medium">
                                    {monthItems.length}
                                  </span>
                                </DropdownMenuItem>
                              )
                            })}
                        </div>
                      )
                    })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}