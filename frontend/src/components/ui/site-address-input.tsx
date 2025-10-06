"use client";

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AddressAvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

interface SiteAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  status?: AddressAvailabilityStatus;
  statusMessage?: string;
}

export function SiteAddressInput({ 
  value, 
  onChange, 
  className,
  placeholder = "输入站点地址",
  status = 'idle',
  statusMessage,
}: SiteAddressInputProps) {
  const [error, setError] = useState<string>('');

  // 验证站点地址格式：全小写字母、数字、连字符，不能以连字符开头或结尾
  const validateAddress = (address: string): string => {
    if (!address) {
      return '站点地址不能为空';
    }
    
    // 检查长度
    if (address.length < 3) {
      return '站点地址至少需要3个字符';
    }
    
    if (address.length > 20) {
      return '站点地址不能超过20个字符';
    }
    
    // 检查格式：只能包含小写字母、数字和连字符
    if (!/^[a-z0-9-]+$/.test(address)) {
      return '站点地址只能包含小写字母、数字和连字符';
    }
    
    // 不能以连字符开头或结尾
    if (address.startsWith('-') || address.endsWith('-')) {
      return '站点地址不能以连字符开头或结尾';
    }
    
    // 不能包含连续的连字符
    if (address.includes('--')) {
      return '站点地址不能包含连续的连字符';
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase(); // 自动转换为小写
    onChange(newValue);
    
    // 实时验证
    const validationError = validateAddress(newValue);
    setError(validationError);
  };

  const isValid = !error && value.length > 0;
  const hasError = error && value.length > 0;
  const hasRemoteIssue = !hasError && value.length > 0 && (status === 'unavailable' || status === 'error');
  const isChecking = !hasError && value.length > 0 && status === 'checking';
  const isAvailable = !hasError && value.length > 0 && status === 'available';

  const indicatorClass = useMemo(() => {
    if (hasError || hasRemoteIssue) return 'bg-red-500';
    if (isAvailable) return 'bg-green-500';
    if (isChecking) return 'bg-amber-500';
    return 'bg-muted-foreground/40';
  }, [hasError, hasRemoteIssue, isAvailable, isChecking]);

  const host = typeof window !== 'undefined' ? window.location.host : 'localhost';

  const primaryMessage = useMemo(() => {
    if (hasError) return error;
    if (hasRemoteIssue) return statusMessage || '站点地址已被使用';
    if (isChecking) return statusMessage || '正在检查站点地址可用性...';
    if (isAvailable) return `你的站点将在 https://${host}/project/${value} 有效`;
    if (value.length > 0) {
      return statusMessage || `你的站点将在 https://${host}/project/${value} 有效`;
    }
    return '';
  }, [error, hasError, hasRemoteIssue, isChecking, isAvailable, statusMessage, host, value]);

  const primaryMessageClass = hasError || hasRemoteIssue
    ? 'text-sm text-red-600 dark:text-red-400'
    : isAvailable
      ? 'text-sm text-green-600 dark:text-green-400'
      : 'text-sm text-muted-foreground';

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "pr-12 transition-colors",
            hasError && "border-red-500 focus-visible:ring-red-500",
            (isValid && !hasRemoteIssue) && status === 'idle' && "border-green-500 focus-visible:ring-green-500",
            isAvailable && "border-green-500 focus-visible:ring-green-500",
            hasRemoteIssue && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        {/* 状态指示器 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {value.length > 0 && (
            <div className={cn(
              "w-2 h-2 rounded-full",
              indicatorClass
            )} />
          )}
        </div>
      </div>
      
      {/* 错误信息或提示信息 */}
      <div className="min-h-[1.25rem] space-y-1">
        {primaryMessage && (
          <p className={primaryMessageClass}>{primaryMessage}</p>
        )}
        <p className="text-xs text-muted-foreground">
          站点地址不可重复，可在设置页修改
        </p>
      </div>
    </div>
  );
}
