'use client';

import { useState } from 'react';
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
  label?: string;
}

// 常用推荐图标分类
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
  '联系信息': [
    'lucide:mail',
    'lucide:mail-open',
    'lucide:phone',
    'lucide:phone-call',
    'lucide:message-circle',
    'lucide:message-square',
    'lucide:send',
    'lucide:at-sign',
    'lucide:share-2',
    'lucide:link',
    'lucide:link-2',
    'lucide:id-card',
    'lucide:briefcase',
    'lucide:building-2',
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

// 联系人、社交相关图标
const contactIconGroups: Record<string, string[]> = {
  '联系方式': [
    'lucide:mail',
    'lucide:mail-open',
    'lucide:phone',
    'lucide:phone-call',
    'lucide:message-circle',
    'lucide:message-square',
    'lucide:send',
    'lucide:share-2',
    'lucide:at-sign',
  ],
  '位置与组织': [
    'lucide:map-pin',
    'lucide:map',
    'lucide:compass',
    'lucide:globe',
    'lucide:building-2',
    'lucide:landmark',
    'lucide:briefcase',
  ],
  '链接与网络': [
    'lucide:link',
    'lucide:link-2',
    'lucide:share',
    'lucide:rss',
    'lucide:qr-code',
  ],
};

// 品牌与平台图标
const brandIconGroups: Record<string, string[]> = {
  '开发平台': [
    'simple-icons:github',
    'simple-icons:gitlab',
    'simple-icons:bitbucket',
    'simple-icons:stackblitz',
    'simple-icons:vercel',
    'simple-icons:codesandbox',
    'simple-icons:stackoverflow',
  ],
  '国际社交媒体': [
    'simple-icons:twitter',
    'simple-icons:linkedin',
    'simple-icons:facebook',
    'simple-icons:instagram',
    'simple-icons:youtube',
    'simple-icons:telegram',
    'simple-icons:reddit',
    'simple-icons:medium',
    'simple-icons:whatsapp',
  ],
  '设计与协作': [
    'simple-icons:figma',
    'simple-icons:notion',
    'simple-icons:slack',
    'simple-icons:trello',
    'simple-icons:asana',
    'simple-icons:miro',
    'simple-icons:behance',
    'simple-icons:dribbble',
  ],
  '中文社区': [
    'simple-icons:wechat',
    'simple-icons:sinaweibo',
    'simple-icons:zhihu',
    'simple-icons:bilibili',
    'simple-icons:douban',
    'simple-icons:tencentqq',
    'simple-icons:alibabacloud',
  ],
  '品牌与公司': [
    'simple-icons:google',
    'simple-icons:microsoft',
    'simple-icons:apple',
    'simple-icons:amazon',
    'simple-icons:meta',
    'simple-icons:xiaomi',
    'simple-icons:tesla',
    'simple-icons:bytedance',
  ],
};

export function IconPicker({ value, onChange, placeholder = "选择图标", label = "图标" }: IconPickerProps) {
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
      <Label>{label}</Label>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="popular">热门图标</TabsTrigger>
              <TabsTrigger value="contact">联系 / 社交</TabsTrigger>
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

            <TabsContent value="contact" className="mt-0">
              <ScrollArea className="h-80">
                <div className="p-4 space-y-4">
                  {Object.entries(contactIconGroups).map(([category, icons]) => {
                    const filtered = filteredIcons(icons);
                    if (!filtered.length) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {filtered.length} 个图标
                          </span>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                          {filtered.map((iconName) => (
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
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="brands" className="mt-0">
              <ScrollArea className="h-80">
                <div className="p-4 space-y-4">
                  {Object.entries(brandIconGroups).map(([category, icons]) => {
                    const filtered = filteredIcons(icons);
                    if (!filtered.length) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {filtered.length} 个图标
                          </span>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                          {filtered.map((iconName) => (
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
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
