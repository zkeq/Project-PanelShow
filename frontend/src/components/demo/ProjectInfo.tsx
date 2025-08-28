import { Badge } from "@/components/ui/badge"
import { type Project } from "@/app/project/[username]/[projectId]/demo/[demoId]/projects-data"

interface ProjectInfoProps {
  project: Project
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
  return (
    <div className="w-full max-w-[1440px] mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {project.technologies.map((tech: string) => (
          <Badge key={tech} variant="secondary" className="text-xs">
            {tech}
          </Badge>
        ))}
      </div>
      <p className="text-muted-foreground">{project.description}</p>
    </div>
  )
}