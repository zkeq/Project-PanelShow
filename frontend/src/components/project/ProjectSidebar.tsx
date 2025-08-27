'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Eye, Clock, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface ProjectSidebarProps {
  project: {
    id: string
    name: string
    description: string
    techStack: string
    projectType: string
    monthlyPV: string
    developmentPeriod: string
    uiLibrary?: string
    componentLibrary?: string
    status: 'active' | 'archived' | 'maintained'
    previewImage?: string
    timeline?: {
      [year: string]: {
        [month: string]: Array<{
          title: string
          date: string
          status: string
        }>
      }
    }
  }
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function ProjectSidebar({ project, activeSection, onSectionChange }: ProjectSidebarProps) {
  const navigationItems = [
    { id: 'overview', label: '项目概览', icon: '📊' },
    { id: 'description', label: '项目说明', icon: '📄' },
    { id: 'features', label: '特色功能介绍', icon: '✨' },
    { id: 'timeline', label: '开发周期介绍', icon: '⏱️' }
  ]

  const timelineYears = project.timeline ? Object.keys(project.timeline).sort((a, b) => parseInt(b) - parseInt(a)) : []

  const handlePreview = () => {
    // 这里可以根据项目ID或配置跳转到实际的预览地址
    // 目前使用示例URL，实际项目中应该从项目数据中获取
    const previewUrl = 'https://example.com' // 可以从 project 数据中获取实际的预览URL
    window.open(previewUrl, '_blank')
  }

  return (
    <div className="fixed left-0 top-14 w-80 h-[calc(100vh-3.5rem)] bg-background border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 项目基础信息 */}
        <div className="space-y-4">
          {/* 项目名称 */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </div>

          {/* 项目状态徽章 */}
          <div className="flex gap-2">
            {project.status === 'active' && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                活跃项目
              </Badge>
            )}
            {project.status === 'maintained' && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
                维护中
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* 在线预览按钮 */}
        <div className="space-y-2">
          <Button 
            onClick={handlePreview}
            className="w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            在线预览
          </Button>
        </div>

        <Separator />

        {/* 导航菜单 */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">目录</h2>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onSectionChange(item.id)}
                className={`w-full justify-start text-left h-auto p-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                }`}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* 开发时间线 */}
        {project.timeline && timelineYears.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">开发时间线</h3>
              <div className="space-y-2">
                {timelineYears.map((year) => (
                  <div key={year} className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">{year}年</h4>
                    <div className="space-y-1 pl-4">
                      {Object.keys(project.timeline![year])
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .map((month) => (
                          <Button
                            key={`${year}-${month}`}
                            variant="ghost"
                            onClick={() => onSectionChange('timeline')}
                            className={`w-full justify-start text-left h-auto p-2 rounded-md transition-all duration-200 ${
                              activeSection === 'timeline' 
                                ? 'bg-primary/5 text-primary border border-primary/20' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent'
                            }`}
                          >
                            <Calendar className="w-3 h-3 mr-2" />
                            <span className="text-xs">{parseInt(month)}月</span>
                            <span className="ml-auto text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                              {project.timeline![year][month].length}
                            </span>
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}