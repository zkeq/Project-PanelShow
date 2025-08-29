'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* 标签页切换 */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => {
                onTabChange('projects')
                onSectionChange('all-projects')
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'timeline' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              时间线
            </button>
          </div>

          {/* 分类选择下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {getCurrentSectionLabel()}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]" align="start">
              {activeTab === 'projects' ? (
                <>
                  <DropdownMenuLabel>项目分类</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('all-projects')}
                    className={activeSection === 'all-projects' ? 'bg-primary/10' : ''}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    所有项目
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {techStackStructure.map((category) => (
                    <div key={category.id}>
                      <DropdownMenuLabel className="text-xs px-2 py-1">
                        {category.label}
                      </DropdownMenuLabel>
                      {category.children?.map((child) => (
                        <DropdownMenuItem 
                          key={child.id}
                          onClick={() => onSectionChange(child.id)}
                          className={`ml-4 ${activeSection === child.id ? 'bg-primary/10' : ''}`}
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
                    className={activeSection === 'experience' ? 'bg-primary/10' : ''}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    工作经历
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('about')}
                    className={activeSection === 'about' ? 'bg-primary/10' : ''}
                  >
                    <User className="mr-2 h-4 w-4" />
                    关于我
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>时间线筛选</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => onSectionChange('all-timeline')}
                    className={activeSection === 'all-timeline' ? 'bg-primary/10' : ''}
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
                          <DropdownMenuLabel className="text-xs px-2 py-1 flex items-center">
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
                                  className={`ml-4 ${activeSection === sectionId ? 'bg-primary/10' : ''}`}
                                >
                                  <span className="mr-2 text-xs">📅</span>
                                  <span className="flex-1">{getMonthName(month)}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
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
      </CardContent>
    </Card>
  )
}