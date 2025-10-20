import ProjectShowcaseClient from '../../../ProjectShowcaseClient'

type PageProps = {
  params: Promise<{
    username: string
    year: string
    month: string
  }>
}

export default async function TimelineMonthPage({ params }: PageProps) {
  const { month, username, year } = await params
  const normalizedMonth = month.padStart(2, '0')

  return (
    <ProjectShowcaseClient
      username={username}
      initialTab="timeline"
      initialSection={`${year}-${normalizedMonth}`}
    />
  )
}
