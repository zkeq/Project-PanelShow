import ProjectShowcaseClient from './ProjectShowcaseClient'

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { username } = await params

  return (
    <ProjectShowcaseClient
      username={username}
      initialTab="projects"
      initialSection="all-projects"
    />
  )
}
