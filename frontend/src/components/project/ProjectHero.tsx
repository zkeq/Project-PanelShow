'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  GitBranch,
  Star,
  Users,
  Zap,
  Shield
} from 'lucide-react'
import { ProjectInfo } from '@/types/store'
import { useExecuteCode } from '@/hooks/useExecuteCode'

interface HeroProjectData {
  name: string
  description: string
  status: 'active' | 'archived' | 'maintained' | 'building'
  statusLabel?: string
  tags?: string[]
  techStack?: string
  projectType?: string
  previewUrl?: string
  sourceUrl?: string
  heroAttributes?: ProjectInfo[]
}

interface ProjectHeroProps {
  project: HeroProjectData
  username?: string
}

const HeroStatItem = ({ attribute }: { attribute: ProjectInfo }) => {
  const { value, loading } = useExecuteCode(attribute.valueCode, attribute.value ?? '')
  const displayValue = attribute.valueCode ? (loading ? '计算中...' : value) : (attribute.value ?? '')

  return (
    <div>
      <div className="text-2xl font-bold text-foreground">
        {displayValue || '-'}
      </div>
      <div className="text-sm text-muted-foreground">{attribute.label}</div>
    </div>
  )
}

export default function ProjectHero({ project, username }: ProjectHeroProps) {
  const getStatusConfig = (status: string, label?: string) => {
    switch (status) {
      case 'active':
        return {
          label: label ?? '活跃项目',
          color: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800',
          dot: 'bg-green-500'
        }
      case 'maintained':
        return {
          label: label ?? '维护中',
          color: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800',
          dot: 'bg-blue-500'
        }
      case 'archived':
        return {
          label: label ?? '已归档',
          color: 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800',
          dot: 'bg-orange-500'
        }
      case 'building':
        return {
          label: label ?? '施工中',
          color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800',
          dot: 'bg-yellow-500'
        }
      default:
        return {
          label: label ?? '未知状态',
          color: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800',
          dot: 'bg-gray-500'
        }
    }
  }

  const statusConfig = getStatusConfig(project.status, project.statusLabel)

  const handlePreview = () => {
    if (project.previewUrl) {
      window.open(project.previewUrl, '_blank')
    }
  }

  const handleSourceCode = () => {
    if (project.sourceUrl) {
      window.open(project.sourceUrl, '_blank')
      return
    }

    if (username) {
      const githubUrl = `https://github.com/${username}/${project.name}`
      window.open(githubUrl, '_blank')
    }
  }

  const heroAttributes = project.heroAttributes?.slice(0, 3)
  const hasHeroAttributes = heroAttributes && heroAttributes.length > 0
  const fallbackStats: ProjectInfo[] = [
    {
      id: 'fallback-monthlyPV',
      icon: 'TrendingUp',
      label: '月访问量',
      valueCode: '',
      value: '—',
      showInHomepage: false,
      showInSidebar: false,
      color: '',
      order: 0
    },
    {
      id: 'fallback-development',
      icon: 'Clock',
      label: '开发周期',
      valueCode: '',
      value: '—',
      showInHomepage: false,
      showInSidebar: false,
      color: '',
      order: 1
    },
    {
      id: 'fallback-completion',
      icon: 'CheckCircle',
      label: '完成度',
      valueCode: '',
      value: '—',
      showInHomepage: false,
      showInSidebar: false,
      color: '',
      order: 2
    }
  ]
  const statsToRender = hasHeroAttributes ? heroAttributes! : fallbackStats

  return (
    <div className="w-full max-w-[1100px] py-8 mb-12">
      {/* 背景装饰 */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-slate-50/50 via-transparent to-slate-100/50 dark:from-slate-900/20 dark:via-transparent dark:to-slate-800/20 h-full -z-10" />
      
      {/* 浮动动画元素 */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div 
          className="absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20" 
          style={{ 
            background: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, rgba(203, 213, 225, 0.1) 50%, transparent 100%)',
            animation: 'float 6s ease-in-out infinite' 
          }} 
        />
        <div 
          className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20" 
          style={{ 
            background: 'radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, rgba(148, 163, 184, 0.1) 50%, transparent 100%)',
            animation: 'float 8s ease-in-out infinite reverse' 
          }} 
        />
      </div>

      <div className="relative z-10 space-y-8">
        {/* 状态徽章 */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={`px-3 py-1 ${statusConfig.color}`}>
            <div className={`w-1.5 h-1.5 ${statusConfig.dot} rounded-full mr-2 animate-pulse`} />
            {statusConfig.label}
          </Badge>
          {project.projectType && (
            <Badge variant="outline" className="px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              {project.projectType}
            </Badge>
          )}
        </div>

        {/* 项目标题 */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            {project.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* 技术栈 */}
        {(() => {
          const techItems = project.tags && project.tags.length > 0
            ? project.tags
            : project.techStack
              ? project.techStack.split('+').map(item => item.trim()).filter(Boolean)
              : []

          if (techItems.length === 0) {
            return null
          }

          return (
            <div className="flex flex-wrap gap-2">
              {techItems.map((tech, index) => (
                <Badge
                  key={`${tech}-${index}`}
                  variant="outline"
                  className="px-3 py-1 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          )
        })()}

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {statsToRender.map((attribute) => (
            <HeroStatItem key={attribute.id} attribute={attribute} />
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={handlePreview}
            className="px-8 bg-foreground text-background hover:bg-foreground/90"
            disabled={!project.previewUrl}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            在线预览
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSourceCode}
            className="px-8 border-2"
            disabled={!project.sourceUrl && !username}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            查看源码
          </Button>
        </div>

        {/* 特色标签 */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-800/30">
            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">高性能</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">安全可靠</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">现代化</span>
          </div>
        </div>
      </div>
    </div>
  )
}