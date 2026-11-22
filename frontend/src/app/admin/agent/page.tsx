import { AgentPublishingPage } from "@/components/admin/AgentPublishing";

export default async function AgentPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string | string[] }>;
}) {
  const { project } = await searchParams;
  return <AgentPublishingPage projectId={typeof project === "string" && project ? project : null} />;
}
