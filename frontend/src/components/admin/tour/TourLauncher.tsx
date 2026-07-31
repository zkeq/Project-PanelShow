"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { hasTourFinished, useTourStore } from './useTourStore';
import { TourOverlay } from './TourOverlay';

const AUTO_START_DELAY = 900;

/**
 * 管理后台互动引导启动器：
 * - 用户完成鉴权、且已完成站点绑定后，首次进入管理后台自动弹出引导
 * - 完成/跳过后写入 localStorage，之后不再自动弹出（可通过 Header 按钮手动重播）
 * - welcome/login 页不触发
 */
export function TourLauncher() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const active = useTourStore((s) => s.active);
  const autoTriggered = useTourStore((s) => s.autoTriggered);
  const start = useTourStore((s) => s.start);
  const markAutoTriggered = useTourStore((s) => s.markAutoTriggered);

  const isExcludedPage =
    pathname.startsWith('/admin/login') || pathname.startsWith('/admin/welcome');

  useEffect(() => {
    if (!hydrated || !user?.bound_username) return;
    if (isExcludedPage || active || autoTriggered) return;
    if (hasTourFinished()) return;

    markAutoTriggered();
    const timer = window.setTimeout(() => start(0), AUTO_START_DELAY);
    return () => window.clearTimeout(timer);
  }, [hydrated, user, isExcludedPage, active, autoTriggered, start, markAutoTriggered]);

  return <TourOverlay />;
}
