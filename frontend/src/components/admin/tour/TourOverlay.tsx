"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Globe2,
  Loader2,
  Monitor,
  MousePointerClick,
  X,
} from 'lucide-react';
import { FLAT_STEPS } from './tour-steps';
import { useTourStore } from './useTourStore';
import type { FlatStep } from './tour-steps';

/** iframe 未触发 load 时解除遮罩，避免异常页面让预览永久停在加载中 */
const PREVIEW_LOADING_TIMEOUT_MS = 10_000;
const HIGHLIGHT_RETRY_INTERVAL_MS = 120;
const HIGHLIGHT_RETRY_MAX = 30;
const HIGHLIGHT_PADDING = 8;

export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();

  const active = useTourStore((s) => s.active);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const goTo = useTourStore((s) => s.goTo);
  const next = useTourStore((s) => s.next);
  const prev = useTourStore((s) => s.prev);
  const skip = useTourStore((s) => s.skip);

  const step: FlatStep | undefined = FLAT_STEPS[stepIndex];
  const total = FLAT_STEPS.length;

  const [mounted, setMounted] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  /** 当前实际展示在预览窗里的路由（用于过渡动画） */
  const [previewRoute, setPreviewRoute] = useState<string | null>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const highlightCleanupRef = useRef<(() => void) | null>(null);

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current === null) return;
    window.clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = null;
  }, []);

  const clearPreviewHighlight = useCallback(() => {
    highlightCleanupRef.current?.();
    highlightCleanupRef.current = null;
  }, []);

  const highlightPreviewTarget = useCallback(
    (targetName?: string) => {
      clearPreviewHighlight();
      if (!targetName) return;

      const iframe = iframeRef.current;
      const frameWindow = iframe?.contentWindow;
      const frameDocument = iframe?.contentDocument;
      if (!frameWindow || !frameDocument) return;

      let disposed = false;
      let retryTimer: number | null = null;
      let settleTimer: number | null = null;
      let animationFrame: number | null = null;
      let resizeObserver: ResizeObserver | null = null;
      let spotlight: HTMLDivElement | null = null;

      const updateSpotlight = (target: HTMLElement) => {
        if (disposed || !spotlight) return;
        const rect = target.getBoundingClientRect();
        const top = Math.max(0, rect.top - HIGHLIGHT_PADDING);
        const left = Math.max(0, rect.left - HIGHLIGHT_PADDING);
        const width = Math.min(
          frameWindow.innerWidth - left,
          rect.width + HIGHLIGHT_PADDING * 2
        );
        const height = Math.min(
          frameWindow.innerHeight - top,
          rect.height + HIGHLIGHT_PADDING * 2
        );

        spotlight.style.top = `${top}px`;
        spotlight.style.left = `${left}px`;
        spotlight.style.width = `${Math.max(0, width)}px`;
        spotlight.style.height = `${Math.max(0, height)}px`;
      };

      const scheduleUpdate = (target: HTMLElement) => {
        if (animationFrame !== null) frameWindow.cancelAnimationFrame(animationFrame);
        animationFrame = frameWindow.requestAnimationFrame(() => {
          animationFrame = null;
          updateSpotlight(target);
        });
      };

      const mountSpotlight = (target: HTMLElement) => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        settleTimer = frameWindow.setTimeout(() => {
          if (disposed) return;

          spotlight = frameDocument.createElement('div');
          spotlight.setAttribute('data-tour-spotlight', targetName);
          Object.assign(spotlight.style, {
            position: 'fixed',
            zIndex: '2147483646',
            boxSizing: 'border-box',
            border: '2px solid rgb(59 130 246)',
            borderRadius: '12px',
            boxShadow:
              '0 0 0 9999px rgb(2 6 23 / 62%), 0 0 0 5px rgb(59 130 246 / 24%), 0 0 32px rgb(59 130 246 / 45%)',
            pointerEvents: 'none',
            transition: 'top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease',
          });

          const label = frameDocument.createElement('span');
          label.textContent = '当前引导重点';
          Object.assign(label.style, {
            position: 'absolute',
            top: '-30px',
            left: '0',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgb(37 99 235)',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgb(0 0 0 / 24%)',
          });
          spotlight.appendChild(label);
          frameDocument.body.appendChild(spotlight);
          updateSpotlight(target);

          const onViewportChange = () => scheduleUpdate(target);
          frameWindow.addEventListener('scroll', onViewportChange, true);
          frameWindow.addEventListener('resize', onViewportChange);
          const targetResizeObserver = new ResizeObserver(onViewportChange);
          resizeObserver = targetResizeObserver;
          targetResizeObserver.observe(target);

          const previousCleanup = highlightCleanupRef.current;
          highlightCleanupRef.current = () => {
            frameWindow.removeEventListener('scroll', onViewportChange, true);
            frameWindow.removeEventListener('resize', onViewportChange);
            resizeObserver?.disconnect();
            previousCleanup?.();
            spotlight?.remove();
          };
        }, 360);
      };

      const locateTarget = (attempt: number) => {
        if (disposed) return;
        const target = frameDocument.querySelector<HTMLElement>(
          `[data-tour="${targetName}"]`
        );
        if (target) {
          mountSpotlight(target);
          return;
        }
        if (attempt >= HIGHLIGHT_RETRY_MAX) return;
        retryTimer = frameWindow.setTimeout(
          () => locateTarget(attempt + 1),
          HIGHLIGHT_RETRY_INTERVAL_MS
        );
      };

      locateTarget(0);

      highlightCleanupRef.current = () => {
        disposed = true;
        if (retryTimer !== null) frameWindow.clearTimeout(retryTimer);
        if (settleTimer !== null) frameWindow.clearTimeout(settleTimer);
        if (animationFrame !== null) frameWindow.cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        spotlight?.remove();
      };
    },
    [clearPreviewHighlight]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // 步骤切换：若步骤声明了 route 且当前不在该页，自动导航，实现「引导跟着步骤翻页」
  useEffect(() => {
    if (!active || !step?.route) return;
    if (pathname !== step.route) {
      router.push(step.route);
    }
  }, [active, step, pathname, router]);

  // 预览窗路由：优先当前真实路由（引导就是带你逛真实后台），兜底步骤 route
  const targetPreviewRoute = useMemo(() => {
    if (!active || !step) return '/admin';
    return step.route ?? pathname ?? '/admin';
  }, [active, step, pathname]);

  // 路由变化时显示骨架屏，由 iframe load 事件结束；超时仅作为异常兜底。
  useEffect(() => {
    if (!active) return;

    setPreviewLoading(true);
    setPreviewRoute(targetPreviewRoute);

    clearLoadingTimer();
    loadingTimerRef.current = window.setTimeout(() => {
      setPreviewLoading(false);
      loadingTimerRef.current = null;
    }, PREVIEW_LOADING_TIMEOUT_MS);

    return clearLoadingTimer;
  }, [active, targetPreviewRoute, clearLoadingTimer]);

  const handlePreviewLoad = useCallback(
    (loadedRoute: string) => {
      if (loadedRoute !== targetPreviewRoute) return;
      clearLoadingTimer();
      setPreviewLoading(false);
    },
    [clearLoadingTimer, targetPreviewRoute]
  );

  useEffect(() => {
    if (!active || previewLoading) {
      clearPreviewHighlight();
      return;
    }
    highlightPreviewTarget(step?.target);
    return clearPreviewHighlight;
  }, [
    active,
    previewLoading,
    previewRoute,
    step?.target,
    highlightPreviewTarget,
    clearPreviewHighlight,
  ]);

  // 键盘导航：← → 切换，Esc 跳过
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      if (e.key === 'ArrowRight') next(total);
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, prev, skip, total]);

  const handleAction = useCallback(
    (href?: string, onClick?: () => void) => {
      onClick?.();
      if (href) router.push(href);
    },
    [router]
  );

  if (!mounted || !active || !step) return null;

  const isLast = stepIndex === total - 1;
  const progress = ((stepIndex + 1) / total) * 100;
  const StepIcon = step.icon ?? Monitor;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background text-foreground"
      role="dialog"
      aria-modal="true"
      aria-label="管理后台互动引导"
    >
      {/* 顶栏：仪表盘式标题 + 关闭 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Monitor className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">PanelShow 上手引导</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              实时预览 · 边学边操作
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={skip}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="跳过引导"
        >
          <X className="h-3.5 w-3.5" />
          跳过引导
        </button>
      </header>

      {/* 主体：左控制面板 + 右实时预览 */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 左侧：步骤控制面板 */}
        <aside className="flex w-full shrink-0 flex-col border-b border-border lg:w-[400px] lg:border-b-0 lg:border-r">
          {/* 进度 */}
          <div className="border-b border-border px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium uppercase tracking-wider">{step.chapterTitle}</span>
              <span className="tabular-nums">
                {stepIndex + 1} / {total}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 步骤内容 */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
              <StepIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold leading-7 tracking-tight">{step.title}</h2>
            {step.subtitle && (
              <p className="mt-1 text-xs font-medium text-muted-foreground">{step.subtitle}</p>
            )}
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>

            {/* 章节内序号提示 */}
            <p className="mt-3 text-[11px] text-muted-foreground/70">
              本章第 {step.indexInChapter} / {step.chapterSize} 步
            </p>

            {/* 可选动作 */}
            {step.actions && step.actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {step.actions.map((action) => {
                  const ActionIcon = action.icon ?? MousePointerClick;
                  return (
                    <Button
                      key={action.label}
                      type="button"
                      size="sm"
                      variant={action.variant ?? 'outline'}
                      onClick={() => handleAction(action.href, action.onClick)}
                      className="h-8 text-xs"
                    >
                      <ActionIcon className="mr-1.5 h-3.5 w-3.5" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* 当前预览页说明 */}
            <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Globe2 className="h-3.5 w-3.5" />
                右侧正在实时预览
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {previewRoute ?? '/admin'}
              </p>
              <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground/80">
                这就是你的真实后台页面，可以直接在其中点击操作。
              </p>
            </div>
          </div>

          {/* 底部：步骤圆点 + 翻页 */}
          <div className="shrink-0 border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center gap-1.5">
              {FLAT_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`跳转到第 ${i + 1} 步`}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-200',
                    i === stepIndex
                      ? 'w-5 bg-foreground'
                      : i < stepIndex
                        ? 'w-1.5 bg-foreground/40 hover:bg-foreground/60'
                        : 'w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prev}
                disabled={stepIndex === 0}
                className="h-9 px-3 text-xs"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                上一步
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => next(total)}
                className="h-9 px-4 text-xs"
              >
                {isLast ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5" />
                    完成
                  </>
                ) : (
                  <>
                    下一步
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground/70">
              快捷键：← → 切换步骤 · Esc 跳过
            </p>
          </div>
        </aside>

        {/* 右侧：实时预览窗口 */}
        <section className="flex min-h-[50vh] flex-1 flex-col bg-muted/30 p-3 sm:p-4 lg:min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            {/* 浏览器标题栏 */}
            <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-muted/50 px-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
              </div>
              <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
                <Globe2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">
                  {previewRoute ?? '/admin'}
                </span>
              </div>
              <a
                href={previewRoute ?? '/admin'}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="在新标签页打开"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">新窗口</span>
              </a>
            </div>

            {/* 预览内容 */}
            <div className="relative min-h-0 flex-1">
              {previewLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">正在加载实时页面…</p>
                  {/* 骨架屏 */}
                  <div className="mt-2 w-full max-w-md space-y-2 px-8">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-20 w-full rounded bg-muted/70" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                  </div>
                </div>
              )}
              {previewRoute && (
                <iframe
                  ref={iframeRef}
                  key={previewRoute}
                  src={previewRoute}
                  title="管理后台实时预览"
                  onLoad={() => handlePreviewLoad(previewRoute)}
                  className={cn(
                    'h-full w-full border-0 transition-opacity duration-300',
                    previewLoading ? 'opacity-0' : 'opacity-100'
                  )}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
