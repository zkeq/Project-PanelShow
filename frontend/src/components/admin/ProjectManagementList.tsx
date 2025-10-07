"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Project } from '@/types/store';
import { useGlobalStore } from '@/store/useGlobalStore';
import { AdminProjectCard } from './AdminProjectCard';
import { useRouter } from 'next/navigation';

interface ProjectManagementListProps {
  projects: Project[];
  searchQuery: string;
}

export function ProjectManagementList({ projects, searchQuery }: ProjectManagementListProps) {
  const { deleteProject } = useGlobalStore();
  const router = useRouter();

  const handleEditProject = (projectId: string) => {
    router.push(`/admin/projects/${projectId}/edit`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      deleteProject(projectId);
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
      <div className="grid gap-3 sm:gap-4 lg:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))' }}>
        {projects.map((project, index) => (
          <AdminProjectCard
            key={project.id}
            project={project}
            index={index}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>
    </div>
  );
}
