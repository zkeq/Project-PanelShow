type PageProps = {
  params: Promise<{
    username: string
    year: string
    month: string
  }>
}

export default async function TimelineMonthPage({ params }: PageProps) {
  await params
  return null
}
