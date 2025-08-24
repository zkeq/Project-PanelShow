'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, ExternalLink, Calendar, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    techStack?: string
    projectType?: string
    monthlyPV?: string
    developmentPeriod?: string
    previewImage?: string
    status?: 'active' | 'archived' | 'maintained'
  }
  expandedProjects?: string[]
  onToggleExpand?: (projectId: string) => void
}

export default function ProjectCard({ 
  project, 
  expandedProjects = [], 
  onToggleExpand,
  index = 0
}: ProjectCardProps & { index?: number }) {
  const [localExpanded, setLocalExpanded] = useState(false)
  
  // 使用传入的展开状态或本地状态
  const isExpanded = expandedProjects.includes(project.id) || localExpanded
  
  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(project.id)
    } else {
      setLocalExpanded(!localExpanded)
    }
  }

  // 默认图片列表
  const defaultImages = [
    '/Snipaste_2025-08-23_22-52-13.png',
    '/Snipaste_2025-08-23_22-52-25.png'
  ]
  
  // 根据项目ID选择图片
  const imageIndex = parseInt(project.id) % defaultImages.length
  const imageSrc = project.previewImage || defaultImages[imageIndex]

  // 颜色主题数组 - 根据首页核心优势卡片样式
  const colorThemes = [
    {
      bg: 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconHoverBg: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
      iconColor: 'text-blue-700 dark:text-blue-400',
      tagBg: 'bg-blue-50 dark:bg-blue-950/30',
      tagText: 'text-blue-700 dark:text-blue-300',
      tagBorder: 'border-blue-200 dark:border-blue-800'
    },
    {
      bg: 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconHoverBg: 'group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50',
      iconColor: 'text-purple-700 dark:text-purple-400',
      tagBg: 'bg-purple-50 dark:bg-purple-950/30',
      tagText: 'text-purple-700 dark:text-purple-300',
      tagBorder: 'border-purple-200 dark:border-purple-800'
    },
    {
      bg: 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconHoverBg: 'group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      tagBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      tagText: 'text-emerald-700 dark:text-emerald-300',
      tagBorder: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      bg: 'bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconHoverBg: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50',
      iconColor: 'text-orange-700 dark:text-orange-400',
      tagBg: 'bg-orange-50 dark:bg-orange-950/30',
      tagText: 'text-orange-700 dark:text-orange-300',
      tagBorder: 'border-orange-200 dark:border-orange-800'
    },
    {
      bg: 'bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconHoverBg: 'group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50',
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      tagBg: 'bg-cyan-50 dark:bg-cyan-950/30',
      tagText: 'text-cyan-700 dark:text-cyan-300',
      tagBorder: 'border-cyan-200 dark:border-cyan-800'
    },
    {
      bg: 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconHoverBg: 'group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50',
      iconColor: 'text-indigo-700 dark:text-indigo-400',
      tagBg: 'bg-indigo-50 dark:bg-indigo-950/30',
      tagText: 'text-indigo-700 dark:text-indigo-300',
      tagBorder: 'border-indigo-200 dark:border-indigo-800'
    }
  ]

  // 根据索引选择颜色主题，确保相邻项目颜色不重合
  const theme = colorThemes[index % colorThemes.length]
  
  // 为暗色模式定义具体的背景颜色 - 带彩色渐变但遮盖点状图案
  const darkBackgrounds = [
    'linear-gradient(to bottom, rgba(59, 130, 246, 0.15), rgba(13, 13, 13, 0.9))', // blue - 更深
    'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), rgba(13, 13, 13, 0.9))', // purple - 更深
    'linear-gradient(to bottom, rgba(34, 197, 94, 0.15), rgba(13, 13, 13, 0.9))', // emerald - 更深
    'linear-gradient(to bottom, rgba(249, 115, 22, 0.15), rgba(13, 13, 13, 0.9))', // orange - 更深
    'linear-gradient(to bottom, rgba(34, 211, 238, 0.15), rgba(13, 13, 13, 0.9))', // cyan - 更深
    'linear-gradient(to bottom, rgba(99, 102, 241, 0.15), rgba(13, 13, 13, 0.9))'  // indigo - 更深
  ]

  return (
    <Card className={`py-0 text-card-foreground flex flex-col rounded-xl group relative overflow-hidden border hover:shadow-lg transition-all duration-300`}>
      {/* 亮色模式背景 */}
      <div 
        className={`absolute inset-0 rounded-xl dark:hidden ${theme.bg}`}
      />
      
      {/* 暗色模式背景 - 实心背景遮盖点状图案 */}
      <div 
        className="absolute inset-0 hidden dark:block rounded-xl"
        style={{
          background: darkBackgrounds[index % darkBackgrounds.length]
        }}
      />
      
      {/* 内容层 */}
      <div className="relative z-10">
        {/* 网站截图 - 完全贴合顶部 */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl">
          <Image
            src={imageSrc}
            alt={project.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* 状态标识 */}
          {project.status === 'active' && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
              活跃
            </Badge>
          )}
          {project.status === 'maintained' && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 right-3 bg-blue-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
              维护中
            </Badge>
          )}
          
          {/* 悬浮操作按钮 */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 bg-white/90 hover:bg-white border-0 shadow-sm backdrop-blur-sm"
            >
              <ExternalLink className="h-3 w-3 text-gray-700" />
            </Button>
          </div>
        </div>

        <CardContent className="px-5 pt-4 pb-3 space-y-4">
          {/* 项目统计信息 - 带图标的现代设计 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}>
                <BarChart3 className={`w-3 h-3 ${theme.tagText}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">技术栈</p>
              <p className="font-semibold text-xs text-foreground">{project.techStack || 'Vue + Python'}</p>
            </div>
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}>
                <Calendar className={`w-3 h-3 ${theme.tagText}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">项目类型</p>
              <p className="font-semibold text-xs text-foreground">{project.projectType || '个人项目'}</p>
            </div>
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}>
                <BarChart3 className={`w-3 h-3 ${theme.tagText}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">月PV</p>
              <p className="font-semibold text-xs text-foreground">{project.monthlyPV || '10w'}</p>
            </div>
            <div className="text-center space-y-1">
              <div className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}>
                <Calendar className={`w-3 h-3 ${theme.tagText}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium">开发周期</p>
              <p className="font-semibold text-xs text-foreground">{project.developmentPeriod || '3个月'}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* 项目标题和简介 */}
          <div className="space-y-3">
            {/* 项目标题 */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
            </div>
            
            {/* 项目简介 */}
            <div className="relative">
              <div 
                className={`text-muted-foreground leading-relaxed transition-all duration-300 ${
                  isExpanded ? 'max-h-none' : 'max-h-[3.5rem] overflow-hidden'
                }`}
              >
                <p className="text-xs leading-relaxed">{project.description}</p>
              </div>
              
              {/* 渐变遮罩 */}
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>

            {/* 展开按钮 */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleExpand}
                className="text-xs text-muted-foreground hover:text-primary h-7 px-3 transition-colors hover:bg-muted/50"
              >
                {isExpanded ? (
                  <>
                    收起
                    <ChevronUp className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    展开阅读
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}