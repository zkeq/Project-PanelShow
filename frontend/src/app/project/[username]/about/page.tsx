import ProjectShowcaseClient from '../ProjectShowcaseClient'

interface PageProps {
  params: {
    username: string
  }
}

export default function AboutPage({ params }: PageProps) {
  return (
    <ProjectShowcaseClient
      username={params.username}
      initialTab="projects"
      initialSection="about"
    />
  )
}
