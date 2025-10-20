type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function TimelinePage({ params }: PageProps) {
  await params
  return null
}
