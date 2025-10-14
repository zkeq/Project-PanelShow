'use client'

import UserProfileCard from '@/components/profile/UserProfileCard'
import ProjectGrid from '@/components/project/ProjectGrid'
import { Project } from '@/types/store'

interface AllProjectsContentProps {
  projects: Project[]
  expandedProjects: string[]
  onToggleExpand: (projectId: string) => void
  username: string
  userProfile: {
    username: string
    displayName: string
    bio: string
    followers: number
    following: number
    company?: string
    website?: string
    githubUrl?: string
  stars?: number
  avatar?: string
  wechatQr?: string
  wechatDescription?: string
  subDescription?: string
}
}

export default function AllProjectsContent({
  projects,
  expandedProjects,
  onToggleExpand,
  username,
  userProfile
}: AllProjectsContentProps) {
  // 项目已经在 useProjectsAndTimeline hook 中按 order 字段排序
  // 这里直接使用传入的顺序，不再重新排序
  return (
    <div className="space-y-6">
      {/* 用户信息区域 */}
      <UserProfileCard {...userProfile} />

      {/* 项目网格 */}
      <ProjectGrid
        projects={projects}
        expandedProjects={expandedProjects}
        onToggleExpand={onToggleExpand}
        username={username}
      />
    </div>
  )
}