import ProjectShowcaseClient from '../../ProjectShowcaseClient'

type PageProps = {
  params: Promise<{
    username: string
    categoryId: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId, username } = await params
  const decodedCategoryId = decodeURIComponent(categoryId)

  return (
    <ProjectShowcaseClient
      username={username}
      initialTab="projects"
      initialSection={decodedCategoryId}
    />
  )
}
