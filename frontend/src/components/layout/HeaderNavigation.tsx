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
}

export default function HeaderNavigation({
  username,
  showManageButton = true,
  avatar,
  displayName
}: HeaderNavigationProps) {
  const router = useRouter()

  const handleManageClick = () => {
    router.push('/admin')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6 mx-auto">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="返回首页"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {avatar ? (
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 border border-border/60">
              <img
                src={avatar}
                alt={displayName || username}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 bg-muted/80 border border-border/60 rounded-md flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0">
              {username?.charAt(0).toUpperCase()}
            </div>
          )}
          <Link href="/" className="flex items-center space-x-2 min-w-0 group" aria-label="返回首页">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {displayName || username}
            </h1>
            <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap hidden sm:inline group-hover:text-primary transition-colors">
              的作品集
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