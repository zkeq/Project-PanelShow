'use client'

import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { ThemeSwitch } from '@/components/theme-switch'

interface HeaderNavigationProps {
  username: string
  showManageButton?: boolean
}

export default function HeaderNavigation({ 
  username, 
  showManageButton = true 
}: HeaderNavigationProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6 mx-auto">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-7 h-7 bg-muted/80 border border-border/60 rounded-md flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0">
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{username}</h1>
            <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap hidden xs:inline">的作品集</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <ThemeSwitch />
          {showManageButton && (
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="w-3 h-3 sm:mr-1.5" />
              <span className="hidden sm:inline">管理</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}