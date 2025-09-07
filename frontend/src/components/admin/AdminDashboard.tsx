"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  BarChart3,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalStore } from '@/store/useGlobalStore';
import { ProjectManagementList } from './ProjectManagementList';
import { TimelineManagementList } from './TimelineManagementList';
import { SearchAndFilter } from './SearchAndFilter';
import { AdminHeader } from './AdminHeader';

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 获取数据
  const { projects, timelineItems, createProject, createTimelineItem } = useGlobalStore();

  // 新建项目处理
  const handleCreateProject = () => {
    const newProject = {
      name: '新项目',
      description: '这是一个新创建的项目，请编辑项目信息。',
      status: 'active' as const,
      category: 'frontend',
      previewImage: '/Snipaste_2025-08-23_22-52-13.png',
      attributes: [
        { key: 'techStack', label: '技术栈', value: 'React', icon: 'Code' },
        { key: 'projectType', label: '项目类型', value: '个人', icon: 'User' },
        { key: 'monthlyPV', label: '月访问量', value: '1k', icon: 'TrendingUp' },
        { key: 'developmentPeriod', label: '开发周期', value: '1个月', icon: 'Clock' }
      ],
      themeColor: {
        primary: 'from-blue-600 to-purple-600',
        secondary: 'from-blue-50 to-purple-50',
        background: 'bg-gradient-to-r from-blue-50/50 to-purple-50/50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      }
    };
    createProject(newProject);
  };

  // 新建动态处理
  const handleCreateTimeline = () => {
    const newTimeline = {
      author: {
        name: '管理员',
        avatar: 'https://avatars.githubusercontent.com/u/62864752',
        username: 'admin'
      },
      project: {
        name: '示例项目',
        logo: 'https://avatars.githubusercontent.com/u/62864752',
        description: '这是一个新的项目动态，请编辑动态信息。',
        techStack: ['React', 'TypeScript'],
        readme: '## 项目更新\n\n这是一个新的项目动态。',
        previewImages: ['/Snipaste_2025-08-23_22-52-13.png'],
        repositoryUrl: 'https://github.com/example/project'
      },
      updateType: 'new' as const,
      changelog: '新增功能或项目更新'
    };
    createTimelineItem(newTimeline);
  };

  // 统计数据
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalProjects = projects.length;
    const totalTimeline = timelineItems.length;
    const thisMonthTimeline = timelineItems.filter(item => {
      const publishedDate = new Date(item.publishedAt);
      const now = new Date();
      return publishedDate.getMonth() === now.getMonth() && 
             publishedDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalProjects,
      activeProjects,
      totalTimeline,
      thisMonthTimeline
    };
  }, [projects, timelineItems]);

  // 过滤数据
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const filteredTimelineItems = useMemo(() => {
    return timelineItems.filter(item => {
      const matchesSearch = item.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [timelineItems, searchQuery]);

  return (
    <>
        {/* 主内容区域 */}
        <div className="relative z-10 container mx-auto p-6 space-y-6 pt-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-white/20 dark:from-blue-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">总项目数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 to-white/20 dark:from-emerald-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">活跃项目</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/40 to-white/20 dark:from-purple-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">总动态数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalTimeline}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/40 to-white/20 dark:from-orange-950/20 dark:to-background/20" />
            <CardContent className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">本月动态</p>
                  <p className="text-2xl font-bold text-foreground">{stats.thisMonthTimeline}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和快速操作 */}
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="搜索项目或动态..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <SearchAndFilter
                  statusFilter={statusFilter}
                  categoryFilter={categoryFilter}
                  onStatusChange={setStatusFilter}
                  onCategoryChange={setCategoryFilter}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建项目
                </Button>
                <Button size="sm" variant="outline" onClick={handleCreateTimeline}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建动态
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader>
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="projects">
                  项目管理 ({filteredProjects.length})
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  动态管理 ({filteredTimelineItems.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="p-0">
              <TabsContent value="projects" className="m-0">
                <ProjectManagementList 
                  projects={filteredProjects}
                  searchQuery={searchQuery}
                />
              </TabsContent>
              
              <TabsContent value="timeline" className="m-0">
                <TimelineManagementList 
                  items={filteredTimelineItems}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
