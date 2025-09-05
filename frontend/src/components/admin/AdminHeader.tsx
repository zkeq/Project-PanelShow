"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ 
  title = "管理控制台"
}: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 左侧 - 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>

        {/* 右侧 - 账号邮箱、主题切换和设置 */}
        <div className="flex items-center gap-3">
          {/* 账号邮箱 */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">A</span>
            </div>
            <span>admin@example.com</span>
          </div>

          {/* 主题切换 */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>

          {/* 设置按钮 */}
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>
      </div>
    </div>
  );
}