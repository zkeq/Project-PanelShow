import type { LucideIcon } from 'lucide-react';

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
  title: string;
  /** 一句话副标题（可选，用于技术力说明） */
  subtitle?: string;
  body: string;
  icon?: LucideIcon;
  /** 进入该步骤时自动切换到的后台路由（预览窗同步展示该页） */
  route?: string;
  actions?: TourAction[];
}

export interface TourChapter {
  id: string;
  label: string;
  title: string;
  steps: TourStep[];
}
