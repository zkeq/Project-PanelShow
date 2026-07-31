"use client";

import { create } from 'zustand';
import type { TourStep } from './tour-types';

export const TOUR_STORAGE_KEY = 'panelshow_admin_tour_v1';

interface TourPersistState {
  completedAt?: string;
  skippedAt?: string;
}

interface TourStore {
  /** 引导是否正在播放 */
  active: boolean;
  /** 当前步骤在扁平步骤列表中的下标 */
  stepIndex: number;
  /** 本次会话内是否已触发过自动弹出（防止路由切换反复弹） */
  autoTriggered: boolean;

  start: (index?: number) => void;
  goTo: (index: number) => void;
  next: (total: number) => void;
  prev: () => void;
  /** 跳过：记录并关闭 */
  skip: () => void;
  /** 完成：记录并关闭 */
  complete: () => void;
  markAutoTriggered: () => void;
}

function readPersist(): TourPersistState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const record = parsed as Record<string, unknown>;
    return {
      completedAt: typeof record.completedAt === 'string' ? record.completedAt : undefined,
      skippedAt: typeof record.skippedAt === 'string' ? record.skippedAt : undefined,
    };
  } catch {
    return {};
  }
}

function writePersist(patch: TourPersistState) {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...readPersist(), ...patch };
    window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 忽略隐私模式下的写入失败
  }
}

/** 用户是否已经完成或跳过过一次完整引导 */
export function hasTourFinished(): boolean {
  const state = readPersist();
  return Boolean(state.completedAt || state.skippedAt);
}

export function resetTourProgress() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // noop
  }
}

export const useTourStore = create<TourStore>((set, get) => ({
  active: false,
  stepIndex: 0,
  autoTriggered: false,

  start: (index = 0) => set({ active: true, stepIndex: index }),
  goTo: (index) => set({ stepIndex: Math.max(0, index) }),
  next: (total) => {
    const { stepIndex, complete } = get();
    if (stepIndex >= total - 1) {
      complete();
      return;
    }
    set({ stepIndex: stepIndex + 1 });
  },
  prev: () => set((state) => ({ stepIndex: Math.max(0, state.stepIndex - 1) })),
  skip: () => {
    writePersist({ skippedAt: new Date().toISOString() });
    set({ active: false, stepIndex: 0 });
  },
  complete: () => {
    writePersist({ completedAt: new Date().toISOString() });
    set({ active: false, stepIndex: 0 });
  },
  markAutoTriggered: () => set({ autoTriggered: true }),
}));

export type { TourStep };
