"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Project } from '@/types/store';
import { useGlobalStore } from '@/store/useGlobalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminProjectCard } from './AdminProjectCard';
import { useRouter } from 'next/navigation';
import { reorderProjects as reorderProjectsApi } from '@/lib/api';
import { useShallow } from 'zustand/react/shallow';

interface ProjectManagementListProps {
  projects: Project[];
  searchQuery: string;
  isFiltered?: boolean;
}

export function ProjectManagementList({ projects, searchQuery, isFiltered = false }: ProjectManagementListProps) {
  const { deleteProject } = useGlobalStore();
  const fullProjectList = useGlobalStore((state) => state.projects);
  const setProjects = useGlobalStore((state) => state.setProjects);
  const router = useRouter();
  const { boundUsername, token } = useAuthStore(
    useShallow((state) => ({
      boundUsername: state.user?.bound_username ?? '',
      token: state.token ?? null,
    }))
  );
  const [reorderingProjectId, setReorderingProjectId] = useState<string | null>(null);
  const [reorderFeedback, setReorderFeedback] = useState<
    { type: 'success' | 'error'; message: string }
  | null>(null);

  useEffect(() => {
    if (!reorderFeedback) return;
    const timer = setTimeout(() => setReorderFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [reorderFeedback]);

  const handleEditProject = (projectId: string) => {
    router.push(`/admin/projects/${projectId}/edit`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      deleteProject(projectId);
    }
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setReorderFeedback({ type, message });
  };

  const handleReorder = async (projectId: string, direction: 'up' | 'down') => {
    if (isFiltered) {
      notify('error', '请先清除搜索或筛选条件后再调整排序。');
      return;
    }

    if (!token || !boundUsername) {
      notify('error', '请登录并绑定用户名后再调整项目排序。');
      return;
    }

    if (fullProjectList.length < 2) {
      return;
    }

    const currentIndex = fullProjectList.findIndex((item) => item.id === projectId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= fullProjectList.length) {
      return;
    }

    const previousSnapshot = fullProjectList.map((item) => ({ ...item }));
    const reordered = [...fullProjectList];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];
    const assigned = reordered.map((item, index) => ({ ...item, order: index }));

    setReorderingProjectId(projectId);
    setProjects(assigned);

    try {
      await reorderProjectsApi(
        boundUsername,
        assigned.map((item, index) => ({ id: item.id, order: item.order ?? index })),
        token
      );
      notify('success', '排序已更新');
    } catch (error) {
      setProjects(previousSnapshot);
      const message = error instanceof Error ? error.message : '更新排序失败，请稍后再试。';
      notify('error', message);
    } finally {
      setReorderingProjectId(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">暂无项目</h3>
        <p className="text-sm">
          {searchQuery ? '没有找到匹配的项目' : '开始创建您的第一个项目'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isFiltered && (
        <div className="mb-4 rounded-md border border-dashed border-border/40 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          当前列表已应用搜索或筛选条件，为确保顺序准确，请清除筛选后再调整排序。
        </div>
      )}
      {reorderFeedback && (
        <div
          className={`mb-4 rounded-md border px-4 py-2 text-sm ${
            reorderFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
          }`}
        >
          {reorderFeedback.message}
        </div>
      )}
      <div className="grid gap-3 sm:gap-4 lg:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))' }}>
        {projects.map((project, index) => {
          const fullIndex = fullProjectList.findIndex((item) => item.id === project.id);
          const disableMoveUp = isFiltered || fullIndex <= 0;
          const disableMoveDown =
            isFiltered || fullIndex === -1 || fullIndex >= fullProjectList.length - 1;

          return (
            <AdminProjectCard
              key={project.id}
              project={project}
              index={index}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              username={boundUsername || undefined}
              onMoveUp={disableMoveUp ? undefined : () => handleReorder(project.id, 'up')}
              onMoveDown={disableMoveDown ? undefined : () => handleReorder(project.id, 'down')}
              disableMoveUp={disableMoveUp}
              disableMoveDown={disableMoveDown}
              isReordering={reorderingProjectId === project.id}
            />
          );
        })}
      </div>
    </div>
  );
}
