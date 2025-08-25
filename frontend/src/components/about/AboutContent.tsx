'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Github, Globe } from 'lucide-react'

interface AboutContentProps {
  username: string
  email?: string
  github?: string
  website?: string
  bio?: string
  skills?: {
    frontend: string[]
    backend: string[]
  }
  interests?: string[]
}

export default function AboutContent({ 
  username,
  email = 'contact@example.com',
  github,
  website = 'personal-website.com',
  bio = '我是一名充满热情的全栈开发工程师，拥有 5 年以上的软件开发经验。专注于构建高性能、可扩展的 Web 应用，热衷于学习新技术和分享知识。在职业生涯中，我参与了多个大型项目的开发，从前端界面到后端架构，从数据库设计到部署运维，积累了丰富的全栈开发经验。我相信技术的力量，也相信团队合作的重要性。',
  skills = {
    frontend: ['React / Vue.js', 'Next.js / Nuxt.js', 'TypeScript', 'Tailwind CSS'],
    backend: ['Python / Go', 'Django / FastAPI', 'PostgreSQL / Redis', 'Docker / Kubernetes']
  },
  interests = ['编程', '开源', '摄影', '阅读', '旅行', '音乐']
}: AboutContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">关于我</h1>
        <p className="text-muted-foreground">
          了解我的技能、兴趣和职业目标
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>个人简介</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bio.split('\n').map((paragraph, index) => (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>核心技能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">前端开发</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {skills.frontend.map((skill, index) => (
                      <div key={index}>{skill}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">后端开发</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {skills.backend.map((skill, index) => (
                      <div key={index}>{skill}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>联系信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Github className="w-4 h-4 text-muted-foreground" />
                <span>github.com/{github || username}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{website}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>兴趣爱好</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}