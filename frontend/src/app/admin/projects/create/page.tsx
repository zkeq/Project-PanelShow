import { CreateProjectForm } from '@/components/admin/CreateProjectForm';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="新建作品集" />
      <CreateProjectForm />
    </div>
  );
}