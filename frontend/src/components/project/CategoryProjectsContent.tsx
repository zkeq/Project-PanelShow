'use client'

import ProjectGrid from '@/components/project/ProjectGrid'
import { Project } from '@/types/store'

interface CategoryProjectsContentProps {
  projects: Project[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  categoryLabel: string
  username: string
}

export default function CategoryProjectsContent({
  projects,
  expandedProjects,
  onToggleExpand,
  categoryLabel,
  username
}: CategoryProjectsContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {categoryLabel} 项目
        </h1>
        <p className="text-muted-foreground">
          使用 {categoryLabel} 开发的项目
        </p>
      </div>

      <ProjectGrid
        projects={projects}
        expandedProjects={expandedProjects}
        onToggleExpand={onToggleExpand}
        username={username}
      />
    </div>
  )
}