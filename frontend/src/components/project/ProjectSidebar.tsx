"use client"

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar, Users, Eye, Clock, ExternalLink, BarChart3, FileText, Sparkles,
  Code, Building2, TrendingUp, Zap, User, Handshake, Rocket, Database,
  Palette, Puzzle, CheckCircle, TestTube, Link2, Globe, BookOpen, Settings,
  Shield, Smartphone, Package, type LucideIcon
} from 'lucide-react'
import { Icon } from '@iconify/react'
import { ProjectInfo } from '@/types/store'
import { useExecuteCode } from '@/hooks/useExecuteCode'

interface SidebarProjectData {
  id: string
  name: string
  description: string
  projectType?: string
  status: 'active' | 'archived' | 'maintained' | 'building'
  statusLabel?: string
  previewUrl?: string
  sidebarAttributes?: ProjectInfo[]
}

interface ProjectSidebarProps {
  project: SidebarProjectData
  activeSection: string
  onSectionChange: (section: string) => void
  username?: string
  projectId?: string
}

const SidebarAttributeItem = ({ attribute }: { attribute: ProjectInfo }) => {
  const { value, loading } = useExecuteCode(attribute.valueCode, attribute.value ?? '')
  const displayValue = attribute.valueCode ? (loading ? '计算中...' : value) : (attribute.value ?? '')

  const renderIcon = (iconName: string) => {
    if (iconName && iconName.includes(':')) {
      return <Icon icon={iconName} className="w-3 h-3 text-muted-foreground" />
    }

    const iconMap: Record<string, LucideIcon> = {
      Code, Building2, TrendingUp, Clock, Zap, User, Handshake, Rocket, Database,
      Calendar, BarChart3, Palette, Puzzle, CheckCircle, TestTube, Link2, Globe,
      BookOpen, Users, Settings, Shield, Smartphone, Eye, Package, ExternalLink,
    }
    const IconComponent = iconMap[iconName] || Code
    return <IconComponent className="w-3 h-3 text-muted-foreground" />
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-2">
        {renderIcon(attribute.icon || 'Code')}
        <span className="text-xs text-muted-foreground font-medium">{attribute.label}</span>
      </div>
      <p className="text-xs font-semibold text-foreground leading-tight">{displayValue || '-'}</p>
    </div>
  )
}

export default function ProjectSidebar({ project, activeSection, onSectionChange, username, projectId }: ProjectSidebarProps) {
  const router = useRouter();
  const navigationItems = [
    { id: 'overview', label: '项目概览', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'description', label: '项目说明', icon: <FileText className="w-4 h-4" /> },
    { id: 'features', label: '特色功能介绍', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'timeline', label: '开发周期介绍', icon: <Clock className="w-4 h-4" /> }
  ]

  const sidebarAttributes = project.sidebarAttributes?.slice(0, 8) ?? []

  const handlePreview = () => {
    if (username && projectId) {
      router.push(`/project/${username}/${projectId}/demo`);
      return;
    }

    if (project.previewUrl) {
      window.open(project.previewUrl, '_blank');
    }
  };

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
                {project.statusLabel ?? '活跃项目'}
              </Badge>
            )}
            {project.status === 'maintained' && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
                {project.statusLabel ?? '维护中'}
              </Badge>
            )}
            {project.status === 'building' && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5" />
                {project.statusLabel ?? '施工中'}
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

        {/* 项目统计信息 */}
        {sidebarAttributes.length > 0 && (
          <>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">项目信息</h2>
              <div className="grid grid-cols-2 gap-2">
                {sidebarAttributes.map((item) => (
                  <SidebarAttributeItem key={item.id} attribute={item} />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

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
                <span className="mr-3">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

      </div>
    </div>
  )
}