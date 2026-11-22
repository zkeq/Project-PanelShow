import type { LucideIcon } from 'lucide-react';

export interface TourAction {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface TourStep {
  id: string;
  /** iframe 内的高亮锚点：匹配 `[data-tour="..."]` */
  target?: string;
  title: string;
  /** 一句话副标题（可选，用于技术力说明） */
  subtitle?: string;
  body: string;
  icon?: LucideIcon;
  /** 该步骤所展示的后台预览页 */
  route: string;
  actions?: TourAction[];
}

export interface TourChapter {
  id: string;
  label: string;
  title: string;
  steps: TourStep[];
}
