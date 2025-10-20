import ProjectShowcaseClient from '../ProjectShowcaseClient'

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function TimelinePage({ params }: PageProps) {
  const { username } = await params

  return (
    <ProjectShowcaseClient
      username={username}
      initialTab="timeline"
      initialSection="all-timeline"
    />
  )
}
