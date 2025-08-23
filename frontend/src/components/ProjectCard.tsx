'use client'

import { Card, CardContent } from '@/components/ui/card'
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
    status?: 'active' | 'archived'
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border bg-card text-card-foreground shadow-sm">
      {/* 圆角图片预览 - ShadCN UI 风格 */}
      <div className="relative aspect-video bg-muted/50 p-3 border-b">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* 状态标识 */}
        {project.status === 'active' && (
          <Badge variant="secondary" className="absolute top-4 right-4">
            活跃
          </Badge>
        )}
        {project.status === 'maintained' && (
          <Badge variant="outline" className="absolute top-4 right-4">
            维护中
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        {/* 项目标题 */}
        <h3 className="text-xl font-semibold mb-4">{project.name}</h3>

        {/* 四个展示数据 - 一行显示 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">技术栈</p>
            <p className="font-medium text-sm">{project.techStack || 'Vue + Python'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">项目类型</p>
            <p className="font-medium text-sm">{project.projectType || '个人项目'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">月PV</p>
            <p className="font-medium text-sm">{project.monthlyPV || '10w'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">开发周期</p>
            <p className="font-medium text-sm">{project.developmentPeriod || '3个月'}</p>
          </div>
        </div>

        {/* 项目简介 - 可展开/收缩 */}
        <div className="relative">
          <div 
            className={`text-sm text-muted-foreground transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'max-h-[150px] overflow-hidden'
            }`}
          >
            <p>{project.description}</p>
          </div>
          
          {/* 渐变遮罩 */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
          )}
          
          {/* 展开/收起按钮 */}
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleExpand}
              className="text-primary hover:text-primary/80 p-0 h-auto"
            >
              {isExpanded ? (
                <>
                  收起
                  <ChevronUp className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  展开
                  <ChevronDown className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}