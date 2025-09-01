'use client'

import UserProfileCard from '@/components/profile/UserProfileCard'
import ProjectGrid from '@/components/project/ProjectGrid'
import { Project } from '@/types/store'

interface AllProjectsContentProps {
  projects: Project[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  userProfile: {
    username: string
    displayName: string
    bio: string
    followers: number
    following: number
    company?: string
    website?: string
    stars?: number
    avatar?: string
  }
}

export default function AllProjectsContent({ 
  projects, 
  expandedProjects, 
  onToggleExpand,
  userProfile 
}: AllProjectsContentProps) {
  // 按更新时间倒序排列
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="space-y-6">
      {/* 用户信息区域 */}
      <UserProfileCard {...userProfile} />

      {/* 项目网格 */}
      <ProjectGrid 
        projects={sortedProjects}
        expandedProjects={expandedProjects}
        onToggleExpand={onToggleExpand}
      />
    </div>
  )
}