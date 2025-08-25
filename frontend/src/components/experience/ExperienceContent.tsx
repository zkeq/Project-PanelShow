'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Experience {
  id: string
  title: string
  company: string
  location: string
  period: string
  responsibilities: string[]
}

interface ExperienceContentProps {
  experiences?: Experience[]
}

const defaultExperiences: Experience[] = [
  {
    id: '1',
    title: '高级全栈开发工程师',
    company: '科技创新公司',
    location: '北京',
    period: '2021 - 至今',
    responsibilities: [
      '负责核心业务系统的架构设计和技术选型',
      '带领 5 人技术团队完成多个大型项目',
      '优化系统性能，将响应时间提升 60%',
      '建立完善的 CI/CD 流程和代码规范'
    ]
  },
  {
    id: '2',
    title: '前端开发工程师',
    company: '互联网科技公司',
    location: '上海',
    period: '2019 - 2021',
    responsibilities: [
      '参与公司主要产品的前端开发工作',
      '负责移动端 H5 页面的开发和优化',
      '搭建组件库和开发工具，提高团队效率',
      '参与技术分享和新人培训工作'
    ]
  },
  {
    id: '3',
    title: '初级开发工程师',
    company: '软件开发公司',
    location: '深圳',
    period: '2018 - 2019',
    responsibilities: [
      '参与企业管理系统的开发和维护',
      '学习现代前端框架和后端技术',
      '配合产品和设计团队完成需求开发',
      '积累了丰富的项目开发经验'
    ]
  }
]

export default function ExperienceContent({ experiences = defaultExperiences }: ExperienceContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">工作经历</h1>
        <p className="text-muted-foreground">
          我的职业发展历程
        </p>
      </div>

      <div className="space-y-6">
        {experiences.map((exp) => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{exp.title}</CardTitle>
                  <CardDescription className="mt-1">{exp.company} • {exp.location}</CardDescription>
                </div>
                <Badge variant="outline">{exp.period}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {exp.responsibilities.map((responsibility, index) => (
                  <li key={index}>• {responsibility}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}