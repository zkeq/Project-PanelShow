type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function AboutPage({ params }: PageProps) {
  await params
  return null
}
