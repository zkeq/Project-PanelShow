import { type ReactNode } from 'react'

import ProjectShowcaseClient from '../ProjectShowcaseClient'

interface LayoutProps {
  children: ReactNode
  params: Promise<{
    username: string
  }>
}

export default async function ProjectOverviewLayout({ children, params }: LayoutProps) {
  const { username } = await params

  return (
    <ProjectShowcaseClient username={username}>
      {children}
    </ProjectShowcaseClient>
  )
}
