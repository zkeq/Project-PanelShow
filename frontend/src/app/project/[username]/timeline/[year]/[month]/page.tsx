import ProjectShowcaseClient from '../../../ProjectShowcaseClient'

interface PageProps {
  params: {
    username: string
    year: string
    month: string
  }
}

export default function TimelineMonthPage({ params }: PageProps) {
  const normalizedMonth = params.month.padStart(2, '0')
  return (
    <ProjectShowcaseClient
      username={params.username}
      initialTab="timeline"
      initialSection={`${params.year}-${normalizedMonth}`}
    />
  )
}
