'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface DynamicTagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function DynamicTags({ 
  tags, 
  onChange, 
  placeholder = "输入标签后按回车或点击添加",
  maxTags = 10
}: DynamicTagsProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      {/* 输入框和添加按钮 */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim() || tags.includes(inputValue.trim()) || tags.length >= maxTags}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 标签显示 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`删除标签 ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 标签数量提示 */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{tags.length}/{maxTags} 标签</span>
        {tags.length >= maxTags && (
          <span className="text-orange-500">已达到标签数量上限</span>
        )}
      </div>
    </div>
  );
}