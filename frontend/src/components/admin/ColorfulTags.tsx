'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { X, Plus, Palette } from 'lucide-react';

interface ColorfulTag {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface ColorfulTagsProps {
  tags: ColorfulTag[];
  onChange: (tags: ColorfulTag[]) => void;
  placeholder?: string;
  maxTags?: number;
  label?: string;
}

const colorOptions = [
  { 
    name: 'red', 
    label: '红色',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  { 
    name: 'orange', 
    label: '橙色',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  { 
    name: 'amber', 
    label: '琥珀',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  { 
    name: 'yellow', 
    label: '黄色',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  { 
    name: 'lime', 
    label: '青柠',
    color: 'from-lime-500 to-lime-600',
    bgColor: 'bg-lime-50 hover:bg-lime-100',
    textColor: 'text-lime-700',
    borderColor: 'border-lime-200'
  },
  { 
    name: 'green', 
    label: '绿色',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  { 
    name: 'emerald', 
    label: '翠绿',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  { 
    name: 'teal', 
    label: '青绿',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200'
  },
  { 
    name: 'cyan', 
    label: '青色',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  { 
    name: 'sky', 
    label: '天蓝',
    color: 'from-sky-500 to-sky-600',
    bgColor: 'bg-sky-50 hover:bg-sky-100',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200'
  },
  { 
    name: 'blue', 
    label: '蓝色',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  { 
    name: 'indigo', 
    label: '靛蓝',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  { 
    name: 'violet', 
    label: '紫罗兰',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 hover:bg-violet-100',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200'
  },
  { 
    name: 'purple', 
    label: '紫色',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  { 
    name: 'fuchsia', 
    label: '品红',
    color: 'from-fuchsia-500 to-fuchsia-600',
    bgColor: 'bg-fuchsia-50 hover:bg-fuchsia-100',
    textColor: 'text-fuchsia-700',
    borderColor: 'border-fuchsia-200'
  },
  { 
    name: 'pink', 
    label: '粉色',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200'
  },
  { 
    name: 'rose', 
    label: '玫瑰',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  },
  { 
    name: 'gray', 
    label: '灰色',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  },
  { 
    name: 'slate', 
    label: '石板',
    color: 'from-slate-500 to-slate-600',
    bgColor: 'bg-slate-50 hover:bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200'
  },
  { 
    name: 'zinc', 
    label: '锌色',
    color: 'from-zinc-500 to-zinc-600',
    bgColor: 'bg-zinc-50 hover:bg-zinc-100',
    textColor: 'text-zinc-700',
    borderColor: 'border-zinc-200'
  },
];

export function ColorfulTags({ 
  tags, 
  onChange, 
  placeholder = "输入标签后按回车",
  maxTags = 10,
  label = "技术栈"
}: ColorfulTagsProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedColorOption, setSelectedColorOption] = useState(colorOptions[10]); // 默认蓝色
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [tempTag, setTempTag] = useState('');

  const addTag = (text: string, colorOption: typeof colorOptions[0]) => {
    const trimmedText = text.trim();
    if (trimmedText && tags.length < maxTags && !tags.find(t => t.name === trimmedText)) {
      const newTag: ColorfulTag = {
        id: `tag-${Date.now()}`,
        name: trimmedText,
        color: colorOption.color,
        bgColor: colorOption.bgColor,
        textColor: colorOption.textColor,
        borderColor: colorOption.borderColor
      };
      onChange([...tags, newTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagId: string) => {
    onChange(tags.filter(tag => tag.id !== tagId));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      setTempTag(inputValue.trim());
      setIsColorDialogOpen(true);
    }
  };

  const confirmAddTag = () => {
    addTag(tempTag, selectedColorOption);
    setTempTag('');
    setIsColorDialogOpen(false);
  };

  const handleQuickAdd = () => {
    if (inputValue.trim()) {
      setTempTag(inputValue.trim());
      setIsColorDialogOpen(true);
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
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
        <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              onClick={handleQuickAdd}
              disabled={!inputValue.trim() || tags.length >= maxTags}
              size="sm"
            >
              <Palette className="h-4 w-4 mr-1" />
              添加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">选择标签颜色</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* 标签预览 */}
              <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gradient-to-br from-muted/50 to-muted/30">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${selectedColorOption.bgColor} ${selectedColorOption.textColor} ${selectedColorOption.borderColor} transition-all duration-200 shadow-sm`}
                >
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedColorOption.color} mr-2.5 shadow-sm`}></span>
                  {tempTag || '标签预览'}
                </span>
              </div>

              {/* 颜色选择网格 - 使用滚动容器 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">选择颜色主题</Label>
                <div className="max-h-80 overflow-y-auto border-2 rounded-lg p-4 bg-background/50 backdrop-blur-sm">
                  <div className="grid grid-cols-4 gap-4">
                    {colorOptions.map((colorOpt) => (
                      <button
                        key={colorOpt.name}
                        type="button"
                        className={`group relative h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden hover:scale-[1.02] active:scale-95 ${
                          selectedColorOption.name === colorOpt.name
                            ? 'border-primary shadow-lg ring-4 ring-primary/20 scale-[1.02]'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedColorOption(colorOpt)}
                        title={colorOpt.label}
                      >
                        {/* 渐变背景 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorOpt.color} transition-opacity duration-300`}></div>

                        {/* 选中指示器 */}
                        {selectedColorOption.name === colorOpt.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/50">
                              <div className="w-4 h-4 bg-primary rounded-full shadow-sm"></div>
                            </div>
                          </div>
                        )}

                        {/* 颜色名称标签 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="text-white text-xs font-medium px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {colorOpt.label}
                          </div>
                        </div>

                        {/* 悬停光效 */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* 操作按钮 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsColorDialogOpen(false);
                    setTempTag('');
                  }}
                  className="px-6"
                >
                  取消
                </Button>
                <Button
                  onClick={confirmAddTag}
                  disabled={!tempTag}
                  className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  添加标签
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 标签展示 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span 
              key={tag.id} 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tag.bgColor} ${tag.textColor} ${tag.borderColor} transition-colors`}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${tag.color} mr-2`}></span>
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-2 hover:opacity-70 transition-opacity"
                aria-label={`删除标签 ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
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