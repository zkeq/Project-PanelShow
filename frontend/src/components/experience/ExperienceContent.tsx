'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGlobalStore } from '@/store/useGlobalStore'
import { type Experience } from '@/types/store'

interface ExperienceContentProps {
  experiences?: Experience[]
}

export default function ExperienceContent({ experiences }: ExperienceContentProps) {
  const defaultExperiences = useGlobalStore(state => state.getExperiences())
  const experienceData = experiences || defaultExperiences
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">工作经历</h1>
        <p className="text-muted-foreground">
          我的职业发展历程
        </p>
      </div>

      <div className="space-y-6">
        {experienceData.map((exp) => (
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