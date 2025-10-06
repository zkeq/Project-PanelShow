"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteAddressInput, type AddressAvailabilityStatus } from '@/components/ui/site-address-input';
import { Settings, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import {
  checkUsernameAvailability,
  getProfileSection,
  updateProfileSection,
} from '@/lib/api';

interface AdminWelcomeProps {
  className?: string;
}

export function AdminWelcome({ className }: AdminWelcomeProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const bindUsername = useAuthStore((state) => state.bindUsername);
  const clearError = useAuthStore((state) => state.clearError);
  const token = useAuthStore((state) => state.token);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [username, setUsername] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [siteAddressStatus, setSiteAddressStatus] = useState<AddressAvailabilityStatus>('idle');
  const [siteAddressStatusMessage, setSiteAddressStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const siteAddressCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSubmitting) return;
    if (user?.bound_username) {
      router.replace('/admin');
    }
  }, [user?.bound_username, router, isSubmitting]);

  useEffect(() => {
    if (user?.auth_type === 'github' && user.github_username) {
      setSiteTitle((prev) => prev || `${user.github_username}`);
    }
  }, [user?.auth_type, user?.github_username]);

  useEffect(() => {
    if (!user) return;
    if (!user.bound_username && user.auth_type === 'github' && user.github_username) {
      if (!username) {
        setUsername(user.github_username);
      }
      if (!siteAddress) {
        setSiteAddress(user.github_username);
      }
    }
    if (user.bound_username) {
      if (user.bound_username !== username) {
        setUsername(user.bound_username);
      }
      if (!siteAddress) {
        setSiteAddress(user.bound_username);
      }
    }
  }, [user, username, siteAddress]);

  useEffect(() => {
    if (siteAddressCheckTimeout.current) {
      clearTimeout(siteAddressCheckTimeout.current);
    }

    const trimmed = siteAddress.trim();

    if (!trimmed) {
      setSiteAddressStatus('idle');
      setSiteAddressStatusMessage('');
      return;
    }

    setSiteAddressStatus('checking');
    setSiteAddressStatusMessage('正在检查站点地址可用性...');

    const currentValue = trimmed;

    siteAddressCheckTimeout.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(trimmed);
        if (currentValue !== siteAddress.trim()) {
          return;
        }
        if (result.available) {
          setSiteAddressStatus('available');
          setSiteAddressStatusMessage(result.message || '该站点地址可使用');
        } else {
          setSiteAddressStatus('unavailable');
          setSiteAddressStatusMessage(result.message || '站点地址已被使用');
        }
      } catch (err) {
        if (currentValue !== siteAddress.trim()) {
          return;
        }
        setSiteAddressStatus('error');
        setSiteAddressStatusMessage(
          err instanceof Error ? err.message : '检查站点地址失败，请稍后重试'
        );
      }
    }, 400);

    return () => {
      if (siteAddressCheckTimeout.current) {
        clearTimeout(siteAddressCheckTimeout.current);
        siteAddressCheckTimeout.current = null;
      }
    };
  }, [siteAddress]);

  const loginIdentity = useMemo(() => {
    if (!user) return '';
    if (user.auth_type === 'admin') return '管理员账号';
    if (user.auth_type === 'github') {
      return user.github_username ? `GitHub 用户：${user.github_username}` : 'GitHub 用户';
    }
    return '';
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = username.trim();
    if (!targetUsername) {
      setLocalError('请输入要绑定的用户名');
      return;
    }

    setLocalError('');
    setSuccessMessage('');
    clearError();
    if (!token) {
      setLocalError('登录状态已过期，请重新登录');
      return;
    }

    if (siteAddressStatus === 'unavailable' || siteAddressStatus === 'error') {
      setLocalError(siteAddressStatusMessage || '请输入可用的站点地址');
      return;
    }

    setIsSubmitting(true);
    setProfileUpdating(true);

    try {
      await bindUsername(targetUsername);

      let currentProfile: Record<string, unknown> = {};
      try {
        const profileResult = await getProfileSection<Record<string, unknown>>(
          targetUsername,
          'profile'
        );
        if (profileResult.success && profileResult.data) {
          currentProfile = profileResult.data;
        }
      } catch (fetchError) {
        console.warn('获取现有 profile 失败，将创建新配置', fetchError);
      }

      const mergedProfile = {
        ...currentProfile,
        username: targetUsername,
        name: siteTitle.trim() || currentProfile.name || targetUsername,
        siteTitle: siteTitle.trim() || currentProfile.siteTitle || targetUsername,
        siteAddress: siteAddress.trim() || currentProfile.siteAddress || targetUsername,
        updatedAt: new Date().toISOString(),
      } as Record<string, unknown>;

      await updateProfileSection(targetUsername, 'profile', mergedProfile, token);

      setSuccessMessage('绑定成功并已更新站点信息，正在进入管理后台...');
      setProfileUpdating(false);

      await fetchUser();

      setTimeout(() => {
        router.replace('/admin');
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : '绑定或更新资料失败，请稍后重试';
      setLocalError(message);
      setProfileUpdating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackMessage = successMessage || localError || error;
  const isSuccess = Boolean(successMessage);
  const trimmedUsername = username.trim();
  const canProceed =
    Boolean(trimmedUsername) &&
    Boolean(siteTitle.trim()) &&
    Boolean(siteAddress.trim()) &&
    siteAddressStatus === 'available' &&
    !profileUpdating;

  const submitting = isLoading || isSubmitting || profileUpdating;

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      "bg-gradient-to-br from-gray-50 via-white to-gray-100/50",
      "dark:from-background dark:via-background dark:to-muted/50",
      className
    )}>
      {/* 背景装饰网格 */}
      <div className="absolute inset-0 bg-grid-gray-100/40 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      {/* 动态背景元素 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 主要光晕 - 使用更淡的灰色 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-muted/15 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-muted/10 rounded-full blur-2xl animate-pulse delay-1000" />
        
        {/* 几何装饰 - 使用border色调 */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-border/50 rounded-lg rotate-12 animate-slow-spin" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-border/60 rounded-full animate-bounce-slow" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-muted/30 rounded-lg rotate-45" />
        
        {/* 额外的浮动装饰 */}
        <div className="absolute top-1/3 right-1/2 w-20 h-20 bg-muted/15 rounded-full blur-xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-muted/20 rounded-full blur-2xl animate-pulse delay-1500" />
      </div>

      {/* 主内容 */}
      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-card/90 border relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">设置站点信息</CardTitle>
            <CardDescription>
              {loginIdentity ? `${loginIdentity}，请先绑定用户名后继续` : '配置您的用户名和站点详细信息以开始使用'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名和站点标题 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    if (feedbackMessage) {
                      setLocalError('');
                      setSuccessMessage('');
                      clearError();
                    }
                    setUsername(e.target.value);
                  }}
                  placeholder="输入用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteTitle">站点标题</Label>
                <div className="relative">
                  <Input
                    id="siteTitle"
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="输入标题"
                    className="pr-20"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-sm">的作品集</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 站点地址 */}
            <div className="space-y-2">
              <Label htmlFor="siteAddress">站点地址</Label>
              <SiteAddressInput
                value={siteAddress}
                onChange={setSiteAddress}
                placeholder="输入站点地址"
                status={siteAddressStatus}
                statusMessage={siteAddressStatusMessage}
              />
            </div>

            {feedbackMessage && (
              <div
                className={cn(
                  'text-sm rounded-md border px-3 py-2',
                  isSuccess
                    ? 'border-green-300 bg-green-50 text-green-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'border-destructive/40 bg-destructive/10 text-destructive'
                )}
              >
                {feedbackMessage}
              </div>
            )}

            {/* 进入网站按钮 */}
            <Button
              type="submit"
              disabled={!canProceed || submitting || isSuccess}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {profileUpdating ? '更新资料中...' : '提交中...'}
                </>
              ) : (
                <>
                  绑定并进入管理后台
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* 额外信息 */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {user?.auth_type === 'github'
                ? 'GitHub 用户需绑定本地用户名后才能管理数据。用户名需由管理员提前创建。'
                : '管理员可绑定已存在的用户名。绑定后所有操作将作用于该用户数据。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
