import { CreateProjectForm } from '@/components/admin/CreateProjectForm';

interface EditProjectPageProps {
  params: {
    projectId: string;
  };
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = params;

  return <CreateProjectForm mode="edit" projectId={projectId} />;
}

