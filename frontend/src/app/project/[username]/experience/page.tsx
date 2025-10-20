import ProjectShowcaseClient from '../ProjectShowcaseClient'

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function ExperiencePage({ params }: PageProps) {
  const { username } = await params

  return (
    <ProjectShowcaseClient
      username={username}
      initialTab="projects"
      initialSection="experience"
    />
  )
}
