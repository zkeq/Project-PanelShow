"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SiteAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function SiteAddressInput({ 
  value, 
  onChange, 
  className,
  placeholder = "输入站点地址"
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
            isValid && "border-green-500 focus-visible:ring-green-500",
            className
          )}
        />
        {/* 状态指示器 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {value.length > 0 && (
            <div className={cn(
              "w-2 h-2 rounded-full",
              isValid ? "bg-green-500" : "bg-red-500"
            )} />
          )}
        </div>
      </div>
      
      {/* 错误信息或提示信息 */}
      <div className="min-h-[1.25rem] space-y-1">
        {hasError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <>
            {isValid && (
              <p className="text-sm text-green-600 dark:text-green-400">
                你的站点将在 https://{typeof window !== 'undefined' ? window.location.host : 'localhost'}/project/{value} 有效
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              站点地址不可重复，可在设置页修改
            </p>
          </>
        )}
      </div>
    </div>
  );
}