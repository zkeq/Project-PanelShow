import ProjectShowcaseClient from '../ProjectShowcaseClient'

interface PageProps {
  params: {
    username: string
  }
}

export default function TimelinePage({ params }: PageProps) {
  return (
    <ProjectShowcaseClient
      username={params.username}
      initialTab="timeline"
      initialSection="all-timeline"
    />
  )
}
