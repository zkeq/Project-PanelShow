import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Project } from "@/app/project/[username]/[projectId]/demo/[demoId]/projects-data"

interface DemoInfoProps {
  project: Project
}

export default function DemoInfo({ project }: DemoInfoProps) {
  return (
    <div className="w-full max-w-6xl mt-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">演示信息</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">展示功能</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 跨设备响应式设计</li>
              <li>• 交互式用户界面</li>
              <li>• 实时功能</li>
              <li>• 现代网络技术</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">技术栈</h4>
            <div className="flex flex-wrap gap-1">
              {project.technologies.map((tech: string) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}