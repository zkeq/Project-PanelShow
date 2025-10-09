'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings, ArrowLeft } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { useRouter } from 'next/navigation'

interface HeaderNavigationProps {
  username: string
  showManageButton?: boolean
  avatar?: string
  displayName?: string
  backHref?: string | null
  titleHref?: string
}

export default function HeaderNavigation({
  username,
  showManageButton = true,
  avatar,
  displayName,
  backHref,
  titleHref
}: HeaderNavigationProps) {
  const router = useRouter()

  const handleManageClick = () => {
    router.push('/admin')
  }

  const hasBackButton = typeof backHref === 'string' && backHref.trim().length > 0
  const resolvedTitleHref = titleHref ?? `/project/${encodeURIComponent(username)}`
  const trimmedAvatar = typeof avatar === 'string' && avatar.trim().length > 0 ? avatar.trim() : undefined
  const trimmedDisplayName =
    typeof displayName === 'string' && displayName.trim().length > 0 ? displayName.trim() : undefined
  const resolvedDisplayName = trimmedDisplayName ?? username
  const suffixLabel = '的作品集'
  const titleText = resolvedDisplayName.endsWith(suffixLabel)
    ? resolvedDisplayName
    : `${resolvedDisplayName}${suffixLabel}`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6 mx-auto">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {hasBackButton && backHref && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="返回上一页"
            >
              <Link href={backHref}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {trimmedAvatar ? (
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 border border-border/60">
              <img
                src={trimmedAvatar}
                alt={displayName || username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 bg-muted/80 border border-border/60 rounded-md flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0">
              {username?.charAt(0).toUpperCase()}
            </div>
          )}
          <Link href={resolvedTitleHref} className="flex items-center space-x-2 min-w-0 group" aria-label="返回作品集主页">
            <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap group-hover:text-primary transition-colors">
              {titleText}
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <ThemeSwitch />
          {showManageButton && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleManageClick}
            >
              <Settings className="w-3 h-3 sm:mr-1.5" />
              <span className="hidden sm:inline">管理</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}