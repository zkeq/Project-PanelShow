"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  MousePointerClick,
  Sparkles,
  X,
} from 'lucide-react';
import { FLAT_STEPS } from './tour-steps';
import { useTourStore } from './useTourStore';
import type { FlatStep } from './tour-steps';
import type { TourPlacement } from './tour-types';

const SPOTLIGHT_PAD = 10;
const TOOLTIP_WIDTH = 380;
const TOOLTIP_OFFSET = 18;
const VIEWPORT_MARGIN = 16;
const RETRY_DEFAULT_MAX = 20;
const RETRY_DEFAULT_INTERVAL = 120;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: TourPlacement;
  arrow: { top?: number; left?: number };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** 计算气泡位置：优先按指定方位，溢出时自动翻转，再不行降级为底部并 clamp */
function computeTooltipPosition(
  rect: Rect | null,
  preferred: TourPlacement | undefined,
  tooltipSize: { width: number; height: number }
): TooltipPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect || preferred === 'center') {
    return {
      top: Math.max(VIEWPORT_MARGIN, vh / 2 - tooltipSize.height / 2),
      left: Math.max(VIEWPORT_MARGIN, vw / 2 - tooltipSize.width / 2),
      placement: 'center',
      arrow: {},
    };
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const candidates: TourPlacement[] = [];
  const p = preferred ?? 'bottom';
  candidates.push(p);
  // 自动翻转候选
  if (p === 'bottom') candidates.push('top');
  if (p === 'top') candidates.push('bottom');
  if (p === 'left') candidates.push('right');
  if (p === 'right') candidates.push('left');
  candidates.push('bottom', 'top');

  const fits = (placement: TourPlacement) => {
    switch (placement) {
      case 'bottom':
        return rect.top + rect.height + TOOLTIP_OFFSET + tooltipSize.height + VIEWPORT_MARGIN <= vh;
      case 'top':
        return rect.top - TOOLTIP_OFFSET - tooltipSize.height - VIEWPORT_MARGIN >= 0;
      case 'left':
        return rect.left - TOOLTIP_OFFSET - tooltipSize.width - VIEWPORT_MARGIN >= 0;
      case 'right':
        return rect.left + rect.width + TOOLTIP_OFFSET + tooltipSize.width + VIEWPORT_MARGIN <= vw;
      default:
        return false;
    }
  };

  const placement = candidates.find(fits) ?? 'bottom';

  let top = 0;
  let left = 0;
  switch (placement) {
    case 'bottom':
      top = rect.top + rect.height + TOOLTIP_OFFSET;
      left = centerX - tooltipSize.width / 2;
      break;
    case 'top':
      top = rect.top - TOOLTIP_OFFSET - tooltipSize.height;
      left = centerX - tooltipSize.width / 2;
      break;
    case 'left':
      top = centerY - tooltipSize.height / 2;
      left = rect.left - TOOLTIP_OFFSET - tooltipSize.width;
      break;
    case 'right':
      top = centerY - tooltipSize.height / 2;
      left = rect.left + rect.width + TOOLTIP_OFFSET;
      break;
    default:
      break;
  }

  left = clamp(left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vw - tooltipSize.width - VIEWPORT_MARGIN));
  top = clamp(top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vh - tooltipSize.height - VIEWPORT_MARGIN));

  const arrow: TooltipPosition['arrow'] = {};
  if (placement === 'bottom' || placement === 'top') {
    arrow.left = clamp(centerX - left, 24, tooltipSize.width - 24);
  } else if (placement === 'left' || placement === 'right') {
    arrow.top = clamp(centerY - top, 24, tooltipSize.height - 24);
  }

  return { top, left, placement, arrow };
}

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

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: TOOLTIP_WIDTH, height: 240 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [routeHint, setRouteHint] = useState<string | null>(null);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const scrollSettleTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setViewport({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (scrollSettleTimerRef.current !== null) {
      window.clearTimeout(scrollSettleTimerRef.current);
      scrollSettleTimerRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  /** 定位并滚动到当前步骤的目标元素 */
  const locateTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      const max = step.retry?.max ?? RETRY_DEFAULT_MAX;
      const interval = step.retry?.interval ?? RETRY_DEFAULT_INTERVAL;
      if (retryCountRef.current < max) {
        retryCountRef.current += 1;
        retryTimerRef.current = window.setTimeout(locateTarget, interval);
      } else {
        // 找不到就降级为居中卡片，不阻塞流程
        setTargetRect(null);
      }
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 等滚动动画结束后再读取精确位置
    scrollSettleTimerRef.current = window.setTimeout(() => {
      scrollSettleTimerRef.current = null;
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: r.top - SPOTLIGHT_PAD,
        left: r.left - SPOTLIGHT_PAD,
        width: r.width + SPOTLIGHT_PAD * 2,
        height: r.height + SPOTLIGHT_PAD * 2,
      });
    }, 320);
  }, [step]);

  // 步骤切换：重置重试、重新定位
  useEffect(() => {
    if (!active) return;
    clearRetry();
    setTargetRect(null);
    setRouteHint(
      step?.route && pathname !== step.route
        ? `该步骤对应「${step.route}」页面，可点下方按钮前往，或先浏览说明`
        : null
    );
    // 给路由渲染一帧时间
    rafRef.current = window.requestAnimationFrame(() => locateTarget());
    return () => {
      clearRetry();
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [active, stepIndex, step, pathname, locateTarget, clearRetry]);

  // 窗口尺寸变化时重新定位
  useEffect(() => {
    if (!active) return;
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      locateTarget();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, locateTarget]);

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

  // 监听气泡自身尺寸（内容高度随步骤变化）
  useEffect(() => {
    if (!active || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const observer = new ResizeObserver(() => {
      setTooltipSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    observer.observe(el);
    setTooltipSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, [active, stepIndex]);

  const position = useMemo(
    () => computeTooltipPosition(targetRect, step?.placement, tooltipSize),
    [targetRect, step?.placement, tooltipSize]
  );

  if (!mounted || !active || !step) return null;

  const isLast = stepIndex === total - 1;
  const progress = ((stepIndex + 1) / total) * 100;
  const StepIcon = step.icon ?? Sparkles;

  const handleAction = (href?: string, onClick?: () => void) => {
    onClick?.();
    if (href) router.push(href);
  };

  const vw = viewport.width || 1280;
  const vh = viewport.height || 800;
  const tooltipWidth = Math.min(TOOLTIP_WIDTH, vw - VIEWPORT_MARGIN * 2);

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="管理后台互动引导">
      {/* 遮罩：用四个矩形拼出聚光灯空洞，避免 clip-path 兼容性问题，并支持过渡动画 */}
      <div className="absolute inset-0" onClick={skip}>
        {/* 上 */}
        <div
          className="absolute left-0 right-0 top-0 bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
          style={{ height: targetRect ? Math.max(0, targetRect.top) : '100%' }}
        />
        {/* 下 */}
        {targetRect && (
          <div
            className="absolute left-0 right-0 bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{
              top: targetRect.top + targetRect.height,
              height: Math.max(0, vh - targetRect.top - targetRect.height),
            }}
          />
        )}
        {/* 左 */}
        {targetRect && (
          <div
            className="absolute bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: 0,
              width: Math.max(0, targetRect.left),
              height: targetRect.height,
            }}
          />
        )}
        {/* 右 */}
        {targetRect && (
          <div
            className="absolute bg-slate-950/60 backdrop-blur-[2px] transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: targetRect.left + targetRect.width,
              width: Math.max(0, vw - targetRect.left - targetRect.width),
              height: targetRect.height,
            }}
          />
        )}
      </div>

      {/* 聚光灯边框 + 呼吸光晕 */}
      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary/90 shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_0_40px_rgba(59,130,246,0.35)] transition-all duration-300 ease-out animate-pulse"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* 气泡卡片 */}
      <div
        ref={tooltipRef}
        className={cn(
          'absolute rounded-2xl border border-white/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20',
          'transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95'
        )}
        style={{ top: position.top, left: position.left, width: tooltipWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 箭头 */}
        {position.placement === 'bottom' && (
          <div
            className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-white/20 bg-card/95"
            style={{ left: (position.arrow.left ?? tooltipWidth / 2) - 6 }}
          />
        )}
        {position.placement === 'top' && (
          <div
            className="absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-white/20 bg-card/95"
            style={{ left: (position.arrow.left ?? tooltipWidth / 2) - 6 }}
          />
        )}
        {position.placement === 'left' && (
          <div
            className="absolute -right-1.5 h-3 w-3 rotate-45 border-r border-t border-white/20 bg-card/95"
            style={{ top: (position.arrow.top ?? 40) - 6 }}
          />
        )}
        {position.placement === 'right' && (
          <div
            className="absolute -left-1.5 h-3 w-3 rotate-45 border-b border-l border-white/20 bg-card/95"
            style={{ top: (position.arrow.top ?? 40) - 6 }}
          />
        )}

        {/* 进度条 */}
        <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-muted/60">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          {/* 头部：章节 + 步骤 + 关闭 */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{step.chapterTitle}</span>
              <span>
                {stepIndex + 1} / {total}
              </span>
            </div>
            <button
              type="button"
              onClick={skip}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="跳过引导"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 标题 */}
          <div className="mb-2 flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-primary ring-1 ring-primary/20">
              <StepIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-6 text-foreground">{step.title}</h3>
              {step.subtitle && (
                <p className="mt-0.5 text-[11px] font-medium text-primary/80">{step.subtitle}</p>
              )}
            </div>
          </div>

          {/* 正文 */}
          <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>

          {routeHint && (
            <p className="mt-2 rounded-md border border-amber-200/60 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              {routeHint}
            </p>
          )}

          {/* 可选动作按钮 */}
          {step.actions && step.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
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

          {/* 底部：步骤圆点 + 上一步/下一步 */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5">
              {FLAT_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`跳转到第 ${i + 1} 步`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === stepIndex
                      ? 'w-5 bg-primary'
                      : i < stepIndex
                        ? 'w-1.5 bg-primary/50 hover:bg-primary/70'
                        : 'w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={prev} className="h-8 px-2.5 text-xs">
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  上一步
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => next(total)}
                className="h-8 bg-gradient-to-r from-blue-600 to-violet-600 px-3 text-xs text-white hover:from-blue-500 hover:to-violet-500"
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
          </div>

          {/* 快捷键提示 */}
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <ChevronRight className="h-3 w-3" />
            快捷键：← → 切换步骤 · Esc 跳过 · 点击圆点任意跳转
          </p>
        </div>
      </div>
    </div>
  );
}
