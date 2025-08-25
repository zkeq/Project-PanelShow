'use client'

import ProjectGrid from '@/components/project/ProjectGrid'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'maintained' | 'archived'
  category: string
  techStack: string
  projectType: string
  monthlyPV: string
  developmentPeriod: string
  previewImage: string
  updatedAt: string
}

interface CategoryProjectsContentProps {
  projects: Project[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  categoryLabel: string
}

export default function CategoryProjectsContent({ 
  projects, 
  expandedProjects, 
  onToggleExpand,
  categoryLabel 
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
      />
    </div>
  )
}