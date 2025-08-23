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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* 圆角图片预览 */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-3">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* 状态标识 */}
        {project.status === 'active' && (
          <Badge className="absolute top-5 right-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            活跃
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        {/* 项目标题 */}
        <h3 className="text-xl font-semibold mb-4">{project.name}</h3>

        {/* 四个展示数据 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">技术栈</p>
            <p className="font-medium">{project.techStack || 'Vue + Python'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">项目类型</p>
            <p className="font-medium">{project.projectType || '个人项目'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">月PV</p>
            <p className="font-medium">{project.monthlyPV || '10w'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">开发周期</p>
            <p className="font-medium">{project.developmentPeriod || '3个月'}</p>
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