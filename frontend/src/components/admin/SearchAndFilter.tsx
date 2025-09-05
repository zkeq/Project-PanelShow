"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

interface SearchAndFilterProps {
  statusFilter: string;
  categoryFilter: string;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
}

export function SearchAndFilter({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: SearchAndFilterProps) {
  const statusOptions = [
    { value: 'all', label: '所有状态' },
    { value: 'active', label: '活跃' },
    { value: 'maintained', label: '维护中' },
    { value: 'completed', label: '已完成' },
  ];

  const categoryOptions = [
    { value: 'all', label: '所有分类' },
    { value: 'frontend', label: '前端' },
    { value: 'backend', label: '后端' },
    { value: 'fullstack', label: '全栈' },
    { value: 'mobile', label: '移动端' },
    { value: 'desktop', label: '桌面端' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          筛选
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>状态筛选</DropdownMenuLabel>
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={statusFilter === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>分类筛选</DropdownMenuLabel>
        {categoryOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onCategoryChange(option.value)}
            className={categoryFilter === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}