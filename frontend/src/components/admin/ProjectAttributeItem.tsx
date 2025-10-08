"use client";

import { useExecuteCode } from '@/hooks/useExecuteCode';
import type { ProjectInfo } from '@/types/store';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ProjectAttributeItemProps {
  attribute: ProjectInfo;
  theme: {
    tagBg: string;
    tagText: string;
    tagBorder: string;
  };
}

export function ProjectAttributeItem({ attribute, theme }: ProjectAttributeItemProps) {
  const { value, loading } = useExecuteCode(attribute.valueCode, '加载中...');

  // 动态获取图标
  const IconComponent = attribute.icon
    ? (LucideIcons as Record<string, typeof LucideIcons.Settings>)[attribute.icon] || LucideIcons.Settings
    : LucideIcons.Settings;

  return (
    <div className="text-center space-y-1">
      <div
        className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
      >
        <IconComponent className={`w-3 h-3 ${theme.tagText}`} />
      </div>
      <p className="text-xs text-muted-foreground font-medium">
        {attribute.label}
      </p>
      <p className="font-semibold text-xs text-foreground flex items-center justify-center gap-1">
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>计算中...</span>
          </>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
