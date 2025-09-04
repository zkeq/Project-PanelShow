"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteAddressInput } from '@/components/ui/site-address-input';
import { Settings, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminWelcomeProps {
  className?: string;
}

export function AdminWelcome({ className }: AdminWelcomeProps) {
  const [username, setUsername] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canProceed = username.trim() && siteTitle.trim() && siteAddress.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    
    setIsLoading(true);
    
    try {
      // 这里添加实际的提交逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      // 跳转到网站或下一步
      console.log('提交数据:', { username, siteTitle, siteAddress });
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 bg-muted/30",
      className
    )}>
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">设置站点信息</CardTitle>
            <CardDescription>
              配置您的用户名和站点详细信息以开始使用
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名和站点标题 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteTitle">站点标题</Label>
                <div className="relative">
                  <Input
                    id="siteTitle"
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="输入标题"
                    className="pr-20"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-sm">的作品集</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 站点地址 */}
            <div className="space-y-2">
              <Label htmlFor="siteAddress">站点地址</Label>
              <SiteAddressInput
                value={siteAddress}
                onChange={setSiteAddress}
                placeholder="输入站点地址"
              />
            </div>

            {/* 进入网站按钮 */}
            <Button
              type="submit"
              disabled={!canProceed || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  进入网站
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* 额外信息 */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              已有账户？系统会自动识别并关联。更多设置可在后续页面中配置。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}