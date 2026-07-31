"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { hasTourFinished, useTourStore } from './useTourStore';
import { TourOverlay } from './TourOverlay';

const AUTO_START_DELAY = 800;
/** 等待 fetchUser 拉回服务端 bound_username 的最长时间（超时则按当前状态判定） */
const USER_READY_TIMEOUT = 8000;
const POLL_INTERVAL = 300;

/**
 * 管理后台互动引导启动器：
 * - 用户完成鉴权、且服务端确认已完成站点绑定后，首次进入管理后台自动弹出引导
 *   （必须等服务端数据回来：本地缓存的 bound_username 可能为 null，直接判定会错过首次弹出）
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

  /** 服务端用户数据是否已就绪（拿到 bound_username 即视为就绪） */
  const userReadyRef = useRef(false);

  const isExcludedPage =
    pathname.startsWith('/admin/login') || pathname.startsWith('/admin/welcome');

  // 在引导的 iframe 预览窗里不嵌套触发引导
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  // 一旦拿到服务端的绑定信息即标记就绪（bindUsername 成功后也会即时更新该字段）
  useEffect(() => {
    if (user?.bound_username) userReadyRef.current = true;
  }, [user?.bound_username]);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (isExcludedPage || active || autoTriggered || inIframe) return;
    if (hasTourFinished()) return;

    markAutoTriggered();

    let pollTimer: number | null = null;
    let startTimer: number | null = null;
    const deadline = Date.now() + USER_READY_TIMEOUT;

    const maybeStart = () => {
      if (hasTourFinished()) return;
      if (userReadyRef.current || Date.now() >= deadline) {
        // 已确认完成绑定（或兜底超时）才弹出，避免未绑定用户被引导打扰
        if (userReadyRef.current) {
          startTimer = window.setTimeout(() => start(0), AUTO_START_DELAY);
        }
        return;
      }
      pollTimer = window.setTimeout(maybeStart, POLL_INTERVAL);
    };

    maybeStart();

    return () => {
      if (pollTimer !== null) window.clearTimeout(pollTimer);
      if (startTimer !== null) window.clearTimeout(startTimer);
    };
  }, [hydrated, user, isExcludedPage, active, autoTriggered, inIframe, start, markAutoTriggered]);

  if (inIframe) return null;
  return <TourOverlay />;
}
