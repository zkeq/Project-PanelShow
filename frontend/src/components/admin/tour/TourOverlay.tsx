"use client";

import { useCallback, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Globe2, Monitor, MousePointerClick, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FLAT_STEPS } from './tour-steps';
import { TourPreview } from './TourPreview';
import { useTourStore } from './useTourStore';

const previewRoutes = [...new Set(FLAT_STEPS.map((step) => step.route))];

export function TourOverlay() {
  const active = useTourStore((state) => state.active);
  const preloaded = useTourStore((state) => state.preloaded);
  const stepIndex = useTourStore((state) => state.stepIndex);
  const goTo = useTourStore((state) => state.goTo);
  const close = useTourStore((state) => state.close);
  const dialog = useRef<HTMLDialogElement>(null);
  const step = FLAT_STEPS[stepIndex];
  const total = FLAT_STEPS.length;
  const isLast = stepIndex === total - 1;
  const StepIcon = step.icon ?? Monitor;

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!active || !element) return;

    const page = document.documentElement;
    const previousOverflow = page.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    page.style.overflow = 'hidden';
    document.body.style.overflowX = 'clip';
    element.showModal();
    return () => {
      element.close();
      page.style.overflow = previousOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
    };
  }, [active]);

  const prev = useCallback(() => {
    const index = useTourStore.getState().stepIndex;
    goTo(Math.max(0, index - 1));
  }, [goTo]);

  const next = useCallback(() => {
    const index = useTourStore.getState().stepIndex;
    if (index === total - 1) close();
    else goTo(index + 1);
  }, [close, goTo, total]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.defaultPrevented || (event.target as Element | null)?.closest?.('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Escape') {
      event.preventDefault();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'Escape') close();
    }
  }, [close, next, prev]);

  if (!preloaded) return null;

  return (
    <dialog
      ref={dialog}
      aria-label="管理后台互动引导"
      onKeyDown={(event) => handleKeyDown(event.nativeEvent)}
      onCancel={(event) => { event.preventDefault(); close(); }}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-[100dvw] max-w-[100dvw] overflow-x-hidden overflow-y-auto bg-background p-0 text-foreground open:flex open:flex-col"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Monitor aria-hidden="true" className="size-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">PanelShow 上手引导</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">实时预览 · 边学边操作</span>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={close} autoFocus>
          <X aria-hidden="true" className="size-3.5" /> 跳过引导
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b lg:w-[400px] lg:border-b-0 lg:border-r">
          <div className="border-b px-5 py-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium tracking-wider">{step.chapterTitle}</span>
              <span className="tabular-nums">{stepIndex + 1} / {total}</span>
            </div>
            <progress
              aria-label="引导进度"
              value={stepIndex + 1}
              max={total}
              className="block h-1 w-full overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
            />
          </div>

          <div aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border bg-muted">
              <StepIcon aria-hidden="true" className="size-5" />
            </div>
            <h2 data-tour-step={step.id} className="text-lg font-semibold leading-7 tracking-tight">{step.title}</h2>
            {step.subtitle && <p className="mt-1 text-xs font-medium text-muted-foreground">{step.subtitle}</p>}
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">本章第 {step.indexInChapter} / {step.chapterSize} 步</p>

            {step.actions && (
              <div className="mt-4 flex flex-wrap gap-2">
                {step.actions.map((action) => {
                  const ActionIcon = action.icon ?? MousePointerClick;
                  return (
                    <Button key={action.label} asChild variant="outline" size="sm">
                      <Link href={action.href} prefetch={false} onClick={close}>
                        <ActionIcon aria-hidden="true" className="size-3.5" /> {action.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="mt-5 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Globe2 aria-hidden="true" className="size-3.5" /> 实时预览
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{step.route}</p>
              <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">这是你的后台页面，可以直接在预览窗口里操作。</p>
            </div>
          </div>

          <div className="shrink-0 border-t px-5 py-4">
            <nav aria-label="引导步骤" className="mb-3 flex flex-wrap items-center gap-1.5">
              {FLAT_STEPS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`跳转到第 ${index + 1} 步 · ${item.title}`}
                  aria-current={index === stepIndex ? 'step' : undefined}
                  onClick={() => goTo(index)}
                  className="group flex h-5 min-w-2 items-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className={cn(
                    'h-1.5 rounded-full motion-safe:transition-[width,background-color]',
                    index === stepIndex ? 'w-5 bg-foreground' : 'w-1.5 bg-muted-foreground/40 group-hover:bg-foreground/60',
                  )} />
                </button>
              ))}
            </nav>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={prev} disabled={stepIndex === 0}>
                <ArrowLeft aria-hidden="true" className="size-3.5" /> 上一步
              </Button>
              <Button type="button" size="sm" onClick={next}>
                {isLast ? <><Check aria-hidden="true" className="size-3.5" /> 完成</> : <>下一步 <ArrowRight aria-hidden="true" className="size-3.5" /></>}
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">快捷键 · ← → 切换步骤 · Esc 跳过</p>
          </div>
        </aside>

        <section aria-label="后台页面预览" className="flex min-h-[48dvh] flex-1 flex-col bg-muted/30 p-3 sm:p-4 lg:min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="flex h-10 shrink-0 items-center gap-3 border-b bg-muted/50 px-3">
              <div aria-hidden="true" className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
                <span className="size-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
                <span className="size-2.5 rounded-full border border-foreground/20 bg-foreground/10" />
              </div>
              <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-md border bg-background px-2.5">
                <Globe2 aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-[11px] text-muted-foreground">{step.route}</span>
              </div>
              <a
                href={step.route}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="在新窗口打开当前预览页"
              >
                <ExternalLink aria-hidden="true" className="size-3" /> <span className="hidden sm:inline">新窗口</span>
              </a>
            </div>
            <div className="relative min-h-0 flex-1">
              {previewRoutes.map((route) => (
                <TourPreview key={route} route={route} visible={active && route === step.route} target={step.target} onKeyDown={handleKeyDown} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </dialog>
  );
}
