'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@iconify/react'
import { useGlobalStore } from '@/store/useGlobalStore'
import type { ContactMethod } from '@/types/store'

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
  contactMethods?: ContactMethod[]
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
    interests = profileData.interests,
    contactMethods = profileData.contactMethods
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

  const sanitizeContactMethods = (methods: ContactMethod[] | undefined): ContactMethod[] => {
    if (!Array.isArray(methods)) return []

    const seen = new Set<string>()
    return methods.reduce<ContactMethod[]>((acc, method) => {
      if (!method) return acc

      const rawLabel = typeof method.label === 'string' ? method.label.trim() : ''
      const rawValue = typeof method.value === 'string' ? method.value.trim() : ''
      if (!rawLabel || !rawValue) return acc

      const rawId = typeof method.id === 'string' ? method.id.trim() : ''
      const id = rawId || `${rawLabel}-${rawValue}`
      if (seen.has(id)) return acc

      seen.add(id)
      acc.push({
        id,
        label: rawLabel,
        value: rawValue,
        icon: typeof method.icon === 'string' && method.icon.trim().length > 0 ? method.icon.trim() : undefined
      })
      return acc
    }, [])
  }

  const trimmedEmail = typeof email === 'string' ? email.trim() : ''
  const trimmedGithub = typeof github === 'string' ? github.trim() : ''
  const trimmedWebsite = typeof website === 'string' ? website.trim() : ''

  const fallbackContactMethods: ContactMethod[] = []
  if (trimmedEmail) {
    fallbackContactMethods.push({
      id: 'email',
      label: '邮箱',
      value: trimmedEmail,
      icon: 'lucide:mail'
    })
  }

  const githubDisplayValue = (() => {
    if (!trimmedGithub && !username) return ''
    if (trimmedGithub.startsWith('http://') || trimmedGithub.startsWith('https://')) {
      return trimmedGithub
    }
    const normalizedHandle = trimmedGithub.replace(/^@/, '') || username
    return `https://github.com/${normalizedHandle}`
  })()

  if (githubDisplayValue) {
    fallbackContactMethods.push({
      id: 'github',
      label: 'GitHub',
      value: githubDisplayValue,
      icon: 'simple-icons:github'
    })
  }

  if (trimmedWebsite) {
    fallbackContactMethods.push({
      id: 'website',
      label: '个人网站',
      value: trimmedWebsite,
      icon: 'lucide:globe'
    })
  }

  const normalizedContactMethods = sanitizeContactMethods(contactMethods)
  const effectiveContactMethods = normalizedContactMethods.length > 0
    ? normalizedContactMethods
    : sanitizeContactMethods(fallbackContactMethods)

  const resolveContactLink = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return { href: trimmed, label: trimmed.replace(/^mailto:/, '') }
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { href: trimmed, label: trimmed.replace(/^https?:\/\//, '') }
    }
    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/u.test(trimmed)) {
      return { href: `mailto:${trimmed}`, label: trimmed }
    }
    if (/^www\./i.test(trimmed) || /^[\w.-]+\.[A-Za-z]{2,}/u.test(trimmed)) {
      return { href: `https://${trimmed.replace(/^https?:\/\//, '')}`, label: trimmed.replace(/^https?:\/\//, '') }
    }
    return null
  }

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
            <CardContent className="space-y-4">
              {effectiveContactMethods.length > 0 ? (
                effectiveContactMethods.map((method) => {
                  const iconName = method.icon ?? 'lucide:info'
                  const linkInfo = resolveContactLink(method.value)
                  const displayLabel = linkInfo?.label ?? method.value
                  const href = linkInfo?.href
                  const isExternal = href ? href.startsWith('http://') || href.startsWith('https://') : false

                  return (
                    <div key={method.id} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon icon={iconName} className="h-4 w-4" />
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{method.label}</p>
                        {href ? (
                          <a
                            href={href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="text-sm text-muted-foreground hover:text-primary break-all"
                          >
                            {displayLabel}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground break-all">{displayLabel}</span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">暂未提供联系方式</p>
              )}
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
