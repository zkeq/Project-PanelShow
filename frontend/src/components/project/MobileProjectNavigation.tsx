"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Eye,
  FileText,
  Sparkles,
  Clock,
  ExternalLink
} from "lucide-react";

interface MobileProjectNavigationProps {
  project: {
    name: string
    status: "active" | "archived" | "maintained" | "building"
    previewUrl?: string
  }
  activeSection: string
  onSectionChange: (section: string) => void
  username?: string
  projectId?: string
}

export default function MobileProjectNavigation({
  project,
  activeSection,
  onSectionChange,
  username,
  projectId
}: MobileProjectNavigationProps) {
  const router = useRouter();
  
  const navigationItems = [
    { id: 'overview', label: '项目概览', icon: Eye },
    { id: 'description', label: '项目说明', icon: FileText },
    { id: 'features', label: '特色功能介绍', icon: Sparkles },
    { id: 'timeline', label: '开发周期介绍', icon: Clock }
  ]

  // 获取当前选中项的显示名称
  const getCurrentSectionLabel = () => {
    const currentItem = navigationItems.find(item => item.id === activeSection);
    return currentItem ? currentItem.label : '选择内容';
  };

  const handlePreview = () => {
    if (username && projectId) {
      router.push(`/project/${username}/${projectId}/demo`);
      return;
    }

    if (project.previewUrl) {
      window.open(project.previewUrl, "_blank");
    }
  };

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
          {/* 项目基本信息 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-foreground truncate">{project.name}</h1>
              <div className="flex-shrink-0">
                {project.status === 'active' && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                    活跃
                  </Badge>
                )}
                {project.status === 'maintained' && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5" />
                    维护中
                  </Badge>
                )}
                {project.status === 'building' && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5" />
                    开发中
                  </Badge>
                )}
                {project.status === 'archived' && (
                  <Badge variant="secondary" className="bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5" />
                    已归档
                  </Badge>
                )}
              </div>
            </div>

            {/* 预览按钮 */}
            <Button 
              onClick={handlePreview}
              className="w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              在线预览
            </Button>
          </div>

          {/* 导航下拉菜单 */}
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
              <DropdownMenuLabel className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>页面导航</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem 
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`transition-colors ${activeSection === item.id ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50'}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}