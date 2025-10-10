'use client'

import { Briefcase, Globe, Star, Github } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface UserProfileCardProps {
  username: string
  displayName: string
  bio: string
  followers: number
  following: number
  company?: string
  website?: string
  githubUrl?: string
  stars?: number
  avatar?: string
  wechatQr?: string
  wechatDescription?: string
  subDescription?: string
}

export default function UserProfileCard({
  username,
  displayName,
  bio,
  followers,
  following,
  company,
  website,
  githubUrl,
  stars,
  avatar,
  wechatQr,
  wechatDescription,
  subDescription
}: UserProfileCardProps) {
  const websiteLabel = website?.replace(/^https?:\/\//, '') ?? ''
  const githubLabel = githubUrl?.replace(/^https?:\/\//, '') ?? ''
  const hasStars = typeof stars === 'number' && !Number.isNaN(stars)
  const subtitle = typeof subDescription === 'string' ? subDescription.trim() : ''

  return (
    <div className="w-full bg-background border border-border/40 rounded-lg">
      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-[auto,1fr] gap-4 lg:gap-6">
              {/* 头像 */}
              <div className="flex-shrink-0">
                <img
                  src={avatar || 'https://avatars.githubusercontent.com/u/62864752'}
                  alt={displayName}
                  className="w-16 h-16 rounded-full border-2 border-border/60"
                />
              </div>

              {/* 用户基础信息 */}
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                  <span className="text-muted-foreground text-base">{username}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{followers} followers</span>
                  <span>·</span>
                  <span>{following} following</span>
                  {hasStars && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        {stars}
                        <Star className="w-4 h-4" />
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="col-span-2 space-y-3 text-left lg:col-span-1 lg:col-start-2 lg:min-w-0">
                {bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed break-words">
                    {bio}
                  </p>
                )}

                {company && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{company}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 text-sm lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
                  {subtitle && (
                    <p className="text-muted-foreground leading-relaxed">{subtitle}</p>
                  )}

                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-w-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-[12rem]" title={website}>
                          {websiteLabel}
                        </span>
                      </a>
                    )}
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 min-w-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <Github className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-[12rem]" title={githubUrl}>
                          {githubLabel || `github.com/${username}`}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {wechatQr && (
            <div className="flex flex-col items-center justify-center gap-2 lg:w-40">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="relative w-28 h-28 rounded-lg border border-border/60 overflow-hidden transition-transform hover:scale-105"
                  >
                    <img
                      src={wechatQr}
                      alt="微信二维码"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader className="space-y-2 text-center">
                    <DialogTitle>微信二维码</DialogTitle>
                    {wechatDescription && (
                      <DialogDescription>{wechatDescription}</DialogDescription>
                    )}
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img
                      src={wechatQr}
                      alt="微信二维码大图"
                      className="w-full max-w-xs rounded-md"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              {wechatDescription && (
                <p className="text-xs text-muted-foreground text-center max-w-[10rem] leading-relaxed">
                  {wechatDescription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}