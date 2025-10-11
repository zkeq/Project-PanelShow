"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Calendar,
  User,
  GitBranch,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TimelineItem } from '@/types/store';
import { cn } from '@/lib/utils';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { deleteTimeline as deleteTimelineApi } from '@/lib/api';
import { useShallow } from 'zustand/react/shallow';

interface TimelineManagementListProps {
  items: TimelineItem[];
  searchQuery: string;
}

export function TimelineManagementList({ items, searchQuery }: TimelineManagementListProps) {
  const { deleteTimelineItem } = useGlobalStore();
  const router = useRouter();
  const { boundUsername, token } = useAuthStore(
    useShallow((state) => ({
      boundUsername: state.user?.bound_username ?? '',
      token: state.token ?? null,
    }))
  );
  const [deletingTimelineId, setDeletingTimelineId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    { type: 'success' | 'error'; message: string }
  | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
  };

  const handleEditTimeline = (timelineId: string) => {
    router.push(`/admin/dynamic?id=${encodeURIComponent(timelineId)}`);
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    if (!confirm('确定要删除这个动态吗？此操作不可撤销。')) {
      return;
    }

    if (!token || !boundUsername) {
      notify('error', '请登录并绑定用户名后再删除动态。');
      return;
    }

    setDeletingTimelineId(timelineId);

    try {
      await deleteTimelineApi(boundUsername, timelineId, token);
      // 成功后从本地状态中删除
      deleteTimelineItem(timelineId);
      notify('success', '动态删除成功');
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除失败，请稍后重试。';
      notify('error', message);
    } finally {
      setDeletingTimelineId(null);
    }
  };

  // 更新类型配置
  const updateTypeConfig = {
    new: { label: '新项目', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    update: { label: '更新', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    fix: { label: '修复', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    feature: { label: '新功能', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    refactor: { label: '重构', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">暂无动态</h3>
        <p className="text-sm">
          {searchQuery ? '没有找到匹配的动态' : '开始发布您的第一个项目动态'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {feedback && (
        <div
          className={`mb-4 rounded-md border px-4 py-2 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => {
          const updateConfig = updateTypeConfig[item.updateType] || updateTypeConfig.update;
          
          return (
            <Card key={item.id} className="group relative overflow-hidden border hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                {/* 头部信息 */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {/* 作者头像 */}
                      <div className="relative w-10 h-10">
                        <img
                          src={item.author.avatar}
                          alt={item.author.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      
                      {/* 作者信息和更新类型 */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">
                            {item.author.name}
                          </h4>
                          <Badge className={cn("text-xs px-2 py-0.5 border-0", updateConfig.color)}>
                            <GitBranch className="w-3 h-3 mr-1" />
                            {updateConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.publishedAt).toLocaleString()}
                          <span>•</span>
                          <User className="w-3 h-3" />
                          @{item.author.username}
                        </div>
                      </div>
                    </div>

                    {/* 管理操作 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTimeline(item.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑动态
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTimeline(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除动态
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <Separator className="mx-4" />

                {/* 项目信息 */}
                <div className="p-4 space-y-4">
                  {/* 项目标题和描述 */}
                  <div className="flex items-start gap-3">
                    {/* 项目Logo */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={item.project.logo}
                        alt={item.project.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* 项目信息 */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">
                          {item.project.name}
                        </h3>
                        {item.project.liveUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(item.project.liveUrl, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.project.description}
                      </p>
                      
                      {/* 技术栈标签 */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.project.techStack.map((tech, index) => (
                          <Badge 
                            key={index}
                            variant="secondary" 
                            className="text-xs px-2 py-0.5"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 更新日志 */}
                  {item.changelog && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-foreground mb-2">更新说明</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.changelog}
                      </p>
                    </div>
                  )}

                  {/* 预览图片 */}
                  {item.project.previewImages && item.project.previewImages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">预览图片</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {item.project.previewImages.slice(0, 6).map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <img
                              src={image}
                              alt={`预览图 ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部互动信息和操作 */}
                <div className="px-4 py-3 border-t bg-muted/20">
                  <div className="flex items-center justify-between">
                    {/* 互动数据 */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className={cn("w-4 h-4", item.isLiked && "fill-red-500 text-red-500")} />
                        <span>{item.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.comments}</span>
                      </div>
                      <div className="text-xs">
                        ID: {item.id}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTimeline(item.id)}
                        className="h-7 px-3 text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        修改
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTimeline(item.id)}
                        className="h-7 px-3 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}