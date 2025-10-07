'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Github, Globe } from 'lucide-react'
import { Icon } from '@iconify/react'
import { useGlobalStore } from '@/store/useGlobalStore'

type NormalizedSkillCategory = {
  id: string
  title: string
  icon?: string
  items: { id?: string; label: string; icon?: string }[]
}

interface AboutContentProps {
  // 可选的个人信息属性覆盖
  username?: string
  email?: string
  github?: string
  website?: string
  bio?: string
  aboutSubtitle?: string
  skills?: unknown
  interests?: string[]
}

export default function AboutContent(props: AboutContentProps) {
  const profileData = useGlobalStore(state => state.getProfileInfo())
  
  const {
    username = profileData.username,
    email = profileData.email,
    github = profileData.github,
    website = profileData.website,
    bio = profileData.bio,
    aboutSubtitle = profileData.aboutSubtitle,
    skills = profileData.skills,
    interests = profileData.interests
  } = props

  const normalizedBio = typeof bio === 'string' ? bio : ''

  const normalizedSkills: NormalizedSkillCategory[] = Array.isArray(skills)
    ? skills
    : skills && typeof skills === 'object'
      ? Object.entries(skills as Record<string, unknown[]>).map(([key, value]) => ({
          id: key,
          title: key,
          icon: undefined,
          items: Array.isArray(value)
            ? value.map((item, index) =>
                typeof item === 'string'
                  ? { id: `${key}-${index}`, label: item }
                  : typeof item === 'object' && item !== null
                  ? {
                      id: (item as { id?: string }).id ?? `${key}-${index}`,
                      label: (item as { label?: string }).label ?? '',
                      icon: (item as { icon?: string }).icon,
                    }
                  : { id: `${key}-${index}`, label: '' }
              )
            : [],
        }))
      : []

  const subtitleText = typeof aboutSubtitle === 'string' && aboutSubtitle.trim().length > 0
    ? aboutSubtitle
    : '了解我的技能、兴趣和职业目标'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">关于我</h1>
        <p className="text-muted-foreground">
          {subtitleText}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>个人简介</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {normalizedBio.split('\n').map((paragraph, index) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normalizedSkills.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {category.icon ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon icon={category.icon} className="h-4 w-4" />
                        </span>
                      ) : null}
                      <h4 className="font-medium">{category.title}</h4>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {category.items.map((skill) => (
                        <div key={skill.id ?? skill.label} className="flex items-center gap-2">
                          {skill.icon ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted/50">
                              <Icon icon={skill.icon} className="h-4 w-4" />
                            </span>
                          ) : null}
                          <span>{skill.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
