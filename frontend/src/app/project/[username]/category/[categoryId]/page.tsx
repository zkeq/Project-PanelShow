import ProjectShowcaseClient from '../../ProjectShowcaseClient'

interface PageProps {
  params: {
    username: string
    categoryId: string
  }
}

export default function CategoryPage({ params }: PageProps) {
  const decodedCategoryId = decodeURIComponent(params.categoryId)
  return (
    <ProjectShowcaseClient
      username={params.username}
      initialTab="projects"
      initialSection={decodedCategoryId}
    />
  )
}
