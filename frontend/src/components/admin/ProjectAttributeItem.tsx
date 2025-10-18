"use client";

import { useExecuteCode } from '@/hooks/useExecuteCode';
import type { ProjectInfo } from '@/types/store';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ProjectAttributeItemProps {
  attribute: ProjectInfo;
  theme: {
    tagBg: string;
    tagText: string;
    tagBorder: string;
  };
}

const emojiRegex = /\p{Extended_Pictographic}/u;

const toPascalCase = (iconName: string) =>
  iconName
    .replace(/^lucide:/, '')
    .split(/[-_:]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

const iconLibrary = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

const renderAttributeIcon = (iconName: string | undefined, iconClassName: string) => {
  const FallbackIconComponent = iconLibrary.Sparkles ?? iconLibrary.Settings;

  if (!iconName) {
    const FallbackIcon = FallbackIconComponent;
    return <FallbackIcon className={iconClassName} />;
  }

  if (emojiRegex.test(iconName)) {
    return <span className={cn('leading-none text-sm', iconClassName)}>{iconName}</span>;
  }

  if (iconName.includes(':')) {
    return <Icon icon={iconName} className={iconClassName} />;
  }

  const directMatch = iconLibrary[iconName];
  if (directMatch) {
    const DirectMatch = directMatch;
    return <DirectMatch className={iconClassName} />;
  }

  const pascalName = toPascalCase(iconName);
  const pascalMatch = pascalName ? iconLibrary[pascalName] : undefined;
  if (pascalMatch) {
    const PascalMatch = pascalMatch;
    return <PascalMatch className={iconClassName} />;
  }

  const FallbackIcon = FallbackIconComponent;
  return <FallbackIcon className={iconClassName} />;
};

export function ProjectAttributeItem({ attribute, theme }: ProjectAttributeItemProps) {
  const { value, loading } = useExecuteCode(attribute.valueCode, '加载中...');

  return (
    <div className="text-center space-y-1">
      <div
        className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
      >
        {renderAttributeIcon(attribute.icon, `w-3 h-3 ${theme.tagText}`)}
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
