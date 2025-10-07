import { CreateProjectForm } from '@/components/admin/CreateProjectForm';

interface EditProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params;

  return <CreateProjectForm mode="edit" projectId={projectId} />;
}

