type PageProps = {
  params: Promise<{
    username: string
    categoryId: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  await params
  return null
}
