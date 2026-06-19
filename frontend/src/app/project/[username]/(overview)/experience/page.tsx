type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function ExperiencePage({ params }: PageProps) {
  await params
  return null
}
