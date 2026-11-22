"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PREVIEW_TIMEOUT_MS = 10_000;
const PREVIEW_READY_MESSAGE = 'panelshow:admin-preview-ready';

export function TourPreviewReady() {
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(PREVIEW_READY_MESSAGE, window.location.origin);
    }
  }, []);
  return null;
}

function spotlightTarget(document: Document, targetName: string) {
  const viewport = document.defaultView;
  if (!viewport) return;

  const spotlight = document.createElement('div');
  spotlight.dataset.tourSpotlight = targetName;
  Object.assign(spotlight.style, {
    position: 'fixed',
    zIndex: '2147483646',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    boxShadow: '0 0 0 9999px rgb(2 6 23 / 55%), 0 0 0 5px rgb(59 130 246 / 24%)',
    pointerEvents: 'none',
  });
  const label = document.createElement('span');
  label.textContent = '当前引导重点';
  Object.assign(label.style, {
    position: 'absolute', top: '-25px', left: '0', whiteSpace: 'nowrap', borderRadius: '5px',
    padding: '2px 7px', background: '#2563eb', color: 'white', fontSize: '12px',
  });
  spotlight.append(label);

  let target: HTMLElement | null;
  const position = () => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const top = Math.max(0, rect.top - 8);
    const left = Math.max(0, rect.left - 8);
    const width = Math.max(0, Math.min(viewport.innerWidth - left, rect.right + 8 - left));
    const height = Math.max(0, Math.min(viewport.innerHeight - top, rect.bottom + 8 - top));
    Object.assign(spotlight.style, {
      top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`,
      visibility: width && height ? 'visible' : 'hidden',
    });
  };
  const resize = new ResizeObserver(position);
  let find: MutationObserver | undefined;
  const mount = () => {
    target = document.querySelector<HTMLElement>(`[data-tour="${targetName}"]`);
    if (!target) return false;
    find?.disconnect();
    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    document.body.append(spotlight);
    resize.observe(target);
    position();
    return true;
  };
  if (!mount()) {
    find = new MutationObserver(mount);
    find.observe(document.body, { childList: true, subtree: true });
  }
  viewport.addEventListener('scroll', position, true);
  viewport.addEventListener('resize', position);

  return () => {
    find?.disconnect();
    resize.disconnect();
    viewport.removeEventListener('scroll', position, true);
    viewport.removeEventListener('resize', position);
    spotlight.remove();
  };
}

export function TourPreview({ route, visible, target, onKeyDown }: {
  route: string;
  visible: boolean;
  target?: string;
  onKeyDown: (event: KeyboardEvent) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const [readyDocument, setReadyDocument] = useState<Document | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const ready = readyDocument !== null && readyDocument === frameDocument;

  useEffect(() => {
    const handleReady = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow
        || event.data !== PREVIEW_READY_MESSAGE) return;
      setFrameDocument(frame.current?.contentDocument ?? null);
    };
    window.addEventListener('message', handleReady);
    return () => window.removeEventListener('message', handleReady);
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setTimedOut(true), PREVIEW_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!frameDocument?.body) return;
    const style = frameDocument.createElement('style');
    style.textContent = '[data-tour-launcher] { display: none !important; }';
    frameDocument.head.append(style);

    const observer = new MutationObserver(markReady);
    function markReady() {
      if (!frameDocument?.querySelector('[data-tour-preview-content]')) return;
      observer.disconnect();
      setReadyDocument(frameDocument);
    }
    observer.observe(frameDocument.body, { childList: true, subtree: true });
    markReady();
    return () => { observer.disconnect(); style.remove(); };
  }, [frameDocument]);

  useEffect(() => {
    if (!visible || !ready || !frameDocument) return;
    frameDocument.addEventListener('keydown', onKeyDown);
    const clearSpotlight = target ? spotlightTarget(frameDocument, target) : undefined;
    return () => {
      frameDocument.removeEventListener('keydown', onKeyDown);
      clearSpotlight?.();
    };
  }, [frameDocument, onKeyDown, ready, target, visible]);

  return (
    <div
      data-tour-preview-route={route}
      data-tour-preview-ready={ready}
      aria-hidden={!visible}
      className={cn('absolute inset-0', !visible && 'invisible pointer-events-none')}
    >
      <iframe
        ref={frame}
        src={route}
        loading="eager"
        title={`管理后台预览 ${route}`}
        tabIndex={visible && ready ? 0 : -1}
        onLoad={() => setFrameDocument(frame.current?.contentDocument ?? null)}
        className={cn('h-full w-full border-0', !ready && 'invisible')}
      />
      {!ready && (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background px-4 text-center text-xs text-muted-foreground">
          {timedOut ? (
            <a href={route} target="_blank" rel="noreferrer" className="underline">预览暂未就绪，在新窗口打开页面</a>
          ) : (
            <><Loader2 aria-hidden="true" className="size-5 animate-spin" /> 正在准备后台预览…</>
          )}
        </div>
      )}
    </div>
  );
}
