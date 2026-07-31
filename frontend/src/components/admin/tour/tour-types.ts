import type { LucideIcon } from 'lucide-react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/** 自动定位失败时的重试策略 */
export interface TourRetry {
  /** 最多重试次数（默认约 20 次，每次 120ms） */
  max?: number;
  /** 重试间隔毫秒（默认 120） */
  interval?: number;
}

export interface TourAction {
  label: string;
  /** 点击后跳转的站内路由 */
  href?: string;
  /** 点击后的回调（在跳转前执行） */
  onClick?: () => void;
  variant?: 'default' | 'outline';
  icon?: LucideIcon;
}

export interface TourStep {
  id: string;
  /** 高亮锚点：document.querySelector(`[data-tour="${target}"]`)，缺省时展示居中卡片 */
  target?: string;
  title: string;
  /** 一句话副标题（可选，用于技术力说明） */
  subtitle?: string;
  body: string;
  icon?: LucideIcon;
  placement?: TourPlacement;
  /** 进入该步骤前需要确保位于的路由（不强制跳转，仅作提示性校验） */
  route?: string;
  /** 目标元素不可见/未渲染时的重试策略 */
  retry?: TourRetry;
  actions?: TourAction[];
}

export interface TourChapter {
  id: string;
  label: string;
  title: string;
  steps: TourStep[];
}
