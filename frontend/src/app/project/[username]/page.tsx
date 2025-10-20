type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function Page({ params }: PageProps) {
  await params
  return null
}
