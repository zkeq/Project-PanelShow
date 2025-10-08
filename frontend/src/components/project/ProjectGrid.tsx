'use client'

import ProjectCard from '@/components/ProjectCard'
import { Project } from '@/types/store'

interface ProjectGridProps {
  projects: Project[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  username: string
}

export default function ProjectGrid({
  projects,
  expandedProjects,
  onToggleExpand,
  username
}: ProjectGridProps) {
  return (
    <div className="grid gap-3 sm:gap-4 lg:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(365px, 1fr))' }}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          expandedProjects={expandedProjects}
          onToggleExpand={onToggleExpand}
          index={index}
          username={username}
        />
      ))}
    </div>
  )
}