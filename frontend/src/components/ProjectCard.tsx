'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
  onToggleExpand 
}: ProjectCardProps) {
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

  return (
    <div className="group space-y-6">
      {/* 网站截图 - 圆角无边框 */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted/50">
        <Image
          src={imageSrc}
          alt={project.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* 状态标识 */}
        {project.status === 'active' && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            活跃
          </Badge>
        )}
        {project.status === 'maintained' && (
          <Badge 
            variant="outline" 
            className="absolute top-4 right-4 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700"
          >
            维护中
          </Badge>
        )}
      </div>

      {/* 项目内容区域 */}
      <div className="space-y-4">
        {/* 项目统计信息 - 一行四个 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">技术栈</p>
            <p className="font-medium text-sm">{project.techStack || 'Vue + Python'}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">项目类型</p>
            <p className="font-medium text-sm">{project.projectType || '个人项目'}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">月PV</p>
            <p className="font-medium text-sm">{project.monthlyPV || '10w'}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">开发周期</p>
            <p className="font-medium text-sm">{project.developmentPeriod || '3个月'}</p>
          </div>
        </div>

        {/* 项目标题和简介 */}
        <div className="relative">
          {/* 项目标题 */}
          <div className="text-sm font-bold">{project.name}</div>
          
          {/* 项目简介 */}
          <div 
            className={`text-muted-foreground leading-relaxed transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-[4.5rem] overflow-hidden'
            }`}
          >
            <p className="text-sm">{project.description}</p>
          </div>
          
          {/* 渐变遮罩 */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background via-background/80 to-transparent" />
          )}
        </div>

        {/* 展开按钮 */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleExpand}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-3 transition-colors"
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
    </div>
  )
}