import { Badge } from "@/components/ui/badge"
import type { ProjectOverview } from "@/types/demo"

interface ProjectInfoProps {
  project: ProjectOverview
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
  const tags = project.tags?.filter(Boolean) ?? []

  return (
    <div className="w-full max-w-[1440px] mb-6">
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-muted-foreground whitespace-pre-line">
        {project.description || "暂无项目描述"}
      </p>
    </div>
  )
}
