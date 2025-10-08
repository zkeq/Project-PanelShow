"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/admin') return '管理控制台';
  if (pathname === '/admin/welcome') return '欢迎页面';
  if (pathname === '/admin/projects/create') return '新建作品集';
  if (pathname === '/admin/settings') return '系统设置';
  if (pathname === '/admin/dynamic') return '动态管理';
  if (pathname.startsWith('/admin/projects')) return '项目管理';
  return '管理控制台';
};

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ 
  title
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const displayTitle = title || getPageTitle(pathname);
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSettings = () => {
    router.push('/admin/settings');
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  const displayName = useMemo(() => {
    if (!user) return '未登录';
    if (user.bound_username) return user.bound_username;
    if (user.auth_type === 'github' && user.github_username) {
      return user.github_username;
    }
    return user.role === 'admin' ? '管理员' : '用户';
  }, [user]);

  const avatarLetter = useMemo(() => {
    if (!displayName) return 'A';
    const letter = displayName.trim()[0]?.toUpperCase();
    return letter || 'A';
  }, [displayName]);

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 左侧 - 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{displayTitle}</h1>
        </div>

        {/* 右侧 - 账号邮箱、主题切换和设置 */}
        <div className="flex items-center gap-3">
          {/* 账号邮箱 */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">{avatarLetter}</span>
            </div>
            <span>{displayName}</span>
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
          <Button variant="outline" size="sm" onClick={handleSettings}>
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>

          {/* 退出登录 */}
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
