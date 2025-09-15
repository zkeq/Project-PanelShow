'use client';

import { useState, useEffect } from 'react';
import { Icon, addAPIProvider } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// 配置 Iconify API，启用动态加载
if (typeof window !== 'undefined') {
  addAPIProvider('', {
    resources: ['https://api.iconify.design'],
  });
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  placeholder?: string;
}

// 热门图标分类
const popularIcons = {
  '常用': [
    'lucide:code',
    'lucide:settings',
    'lucide:user',
    'lucide:users',
    'lucide:home',
    'lucide:heart',
    'lucide:star',
    'lucide:bookmark',
    'lucide:search',
    'lucide:bell',
    'lucide:mail',
    'lucide:phone',
    'lucide:calendar',
    'lucide:clock',
    'lucide:map-pin',
    'lucide:globe',
  ],
  '技术栈': [
    'logos:react',
    'logos:vue',
    'logos:angular-icon',
    'logos:typescript-icon',
    'logos:javascript',
    'logos:nodejs-icon',
    'logos:python',
    'logos:java',
    'mdi:language-go',
    'mdi:language-rust',
    'logos:mysql-icon',
    'logos:postgresql',
    'logos:mongodb-icon',
    'logos:redis',
    'logos:docker-icon',
    'mdi:kubernetes',
    'mdi:react',
    'mdi:vuejs',
    'mdi:angular',
    'heroicons:code-bracket',
    'heroicons:cpu-chip',
    'heroicons:server',
    'heroicons:cloud',
    'heroicons:database',
  ],
  '工具': [
    'lucide:wrench',
    'lucide:hammer',
    'lucide:scissors',
    'lucide:paintbrush',
    'lucide:pen-tool',
    'lucide:edit',
    'lucide:file-text',
    'lucide:folder',
    'lucide:download',
    'lucide:upload',
    'lucide:share',
    'lucide:copy',
    'lucide:trash',
    'lucide:archive',
    'lucide:package',
    'lucide:box',
  ],
  '业务': [
    'lucide:trending-up',
    'lucide:bar-chart-3',
    'lucide:pie-chart',
    'lucide:activity',
    'lucide:target',
    'lucide:zap',
    'lucide:rocket',
    'lucide:trophy',
    'lucide:award',
    'lucide:medal',
    'lucide:gift',
    'lucide:shopping-cart',
    'lucide:credit-card',
    'lucide:dollar-sign',
    'lucide:building-2',
    'lucide:briefcase',
  ],
  '状态': [
    'lucide:check-circle',
    'lucide:x-circle',
    'lucide:alert-circle',
    'lucide:info',
    'lucide:help-circle',
    'lucide:alert-triangle',
    'lucide:shield',
    'lucide:lock',
    'lucide:unlock',
    'lucide:eye',
    'lucide:eye-off',
    'lucide:thumbs-up',
    'lucide:thumbs-down',
    'lucide:smile',
    'lucide:frown',
    'lucide:meh',
  ],
};

// 品牌图标
const brandIcons = [
  'simple-icons:github',
  'simple-icons:gitlab',
  'simple-icons:bitbucket',
  'simple-icons:google',
  'simple-icons:microsoft',
  'simple-icons:apple',
  'simple-icons:amazon',
  'simple-icons:meta',
  'simple-icons:twitter',
  'simple-icons:linkedin',
  'simple-icons:youtube',
  'simple-icons:instagram',
  'simple-icons:discord',
  'simple-icons:slack',
  'simple-icons:notion',
  'simple-icons:figma',
  'mdi:github',
  'mdi:google',
  'mdi:microsoft',
  'mdi:apple',
  'mdi:twitter',
  'mdi:facebook',
  'mdi:linkedin',
  'mdi:youtube',
  'mdi:instagram',
  'tabler:brand-github',
  'tabler:brand-google',
  'tabler:brand-twitter',
  'tabler:brand-facebook',
  'tabler:brand-linkedin',
  'tabler:brand-figma',
  'tabler:brand-slack',
];

export function IconPicker({ value, onChange, placeholder = "选择图标" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customIcon, setCustomIcon] = useState('');

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  const handleCustomIconAdd = () => {
    if (customIcon.trim()) {
      onChange(customIcon.trim());
      setCustomIcon('');
      setOpen(false);
    }
  };

  // 搜索过滤
  const filteredIcons = (icons: string[]) => {
    if (!searchTerm) return icons;
    return icons.filter(icon =>
      icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-2">
      <Label>图标</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
          >
            {value ? (
              <div className="flex items-center gap-2">
                <Icon icon={value} className="w-4 h-4" />
                <span className="truncate">{value}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4">
            <div className="space-y-4">
              {/* 搜索框 */}
              <Input
                placeholder="搜索图标..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* 自定义图标输入 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">自定义图标</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="如: mdi:react 或 tabler:database"
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      className="text-xs pr-10"
                    />
                    {customIcon && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                        <Icon
                          icon={customIcon}
                          className="w-4 h-4"
                          onLoad={() => {}}
                          onError={() => {}}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCustomIconAdd}
                    disabled={!customIcon.trim()}
                  >
                    添加
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✨ 支持所有 Iconify 图标集（30万+ 图标）</p>
                  <p className="pt-1">
                    🔍 在 <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">icon-sets.iconify.design</a> 浏览所有图标集
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="popular">热门图标</TabsTrigger>
              <TabsTrigger value="brands">品牌图标</TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="mt-0">
              <ScrollArea className="h-80">
                <div className="p-4 space-y-4">
                  {Object.entries(popularIcons).map(([category, icons]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {filteredIcons(icons).length} 个图标
                        </span>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {filteredIcons(icons).map((iconName) => (
                          <Button
                            key={iconName}
                            variant={value === iconName ? "default" : "ghost"}
                            size="sm"
                            className="p-2 h-10 w-10"
                            onClick={() => handleIconSelect(iconName)}
                            title={iconName}
                          >
                            <Icon icon={iconName} className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="brands" className="mt-0">
              <ScrollArea className="h-80">
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      品牌
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {filteredIcons(brandIcons).length} 个图标
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {filteredIcons(brandIcons).map((iconName) => (
                      <Button
                        key={iconName}
                        variant={value === iconName ? "default" : "ghost"}
                        size="sm"
                        className="p-2 h-10 w-10"
                        onClick={() => handleIconSelect(iconName)}
                        title={iconName}
                      >
                        <Icon icon={iconName} className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}