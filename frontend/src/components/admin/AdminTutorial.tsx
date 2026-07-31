"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calendar,
  FolderPlus,
  Globe2,
  LayoutDashboard,
  Link2,
  Rocket,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface TutorialStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tips: string[];
  action?: { label: string; href: string };
}

const quickLinks = [
  {
    icon: LayoutDashboard,
    title: '管理控制台',
    description: '项目/动态总览、搜索筛选与快捷入口',
    href: '/admin',
  },
  {
    icon: FolderPlus,
    title: '新建项目',
    description: '录入项目信息、截图、特性与主题色',
    href: '/admin/projects/create',
  },
  {
    icon: Calendar,
    title: '发布动态',
    description: '记录版本更新、里程碑与日常进展',
    href: '/admin/dynamic',
  },
  {
    icon: Settings,
    title: '系统设置',
    description: '个人资料、工作经历、联系方式与技术栈',
    href: '/admin/settings',
  },
];

export function AdminTutorial() {
  const user = useAuthStore((state) => state.user);
  const boundUsername = user?.bound_username ?? '';

  const steps: TutorialStep[] = [
    {
      icon: Link2,
      title: '绑定用户名与站点地址',
      description:
        '首次登录会进入欢迎页，完成用户名、站点标题和站点地址的绑定。站点地址决定你作品集的访问路径，提交后系统会自动初始化你的专属空间。',
      tips: [
        '站点地址仅支持小写字母、数字和连字符（3-20 个字符）',
        '如果登录账号的用户名是中文，系统会自动转换为拼音作为默认站点地址，避免出现很长的编码 URL',
        'GitHub 登录用户会自动同步头像、简介等公开资料',
      ],
      action: { label: '前往欢迎页', href: '/admin/welcome' },
    },
    {
      icon: FolderPlus,
      title: '创建你的第一个项目',
      description:
        '项目是作品集的核心。在「新建项目」中填写名称、描述、状态与分类，上传截图并配置特性亮点，你的项目卡片就会出现在个人主页上。',
      tips: [
        '支持拖拽排序项目卡片，控制主页展示顺序',
        'Markdown 富文本编辑 + 代码高亮，写详情页很顺手',
        '可为项目配置主题色、标签与预览图，卡片更有个性',
      ],
      action: { label: '新建项目', href: '/admin/projects/create' },
    },
    {
      icon: Calendar,
      title: '发布动态与时间线',
      description:
        '通过「动态管理」记录项目的每次更新：新功能、重构、问题修复……动态会以时间线形式展示在主页，让访客看到你的持续活跃。',
      tips: [
        '动态可关联到具体项目，并附上演示/源码链接',
        '支持自定义动态类型与标签（颜色、图标均可配置）',
        '草稿会自动保存在本地，刷新页面也不丢失',
      ],
      action: { label: '发布动态', href: '/admin/dynamic' },
    },
    {
      icon: Settings,
      title: '完善个人资料',
      description:
        '在「系统设置」中维护基本信息、关于我、工作经历、联系方式与技术栈分类。这些内容会渲染到主页的个人资料区与时间线。',
      tips: [
        '技术栈分类可自定义，并关联到具体项目',
        '社交链接与联系方式会显示在主页页脚与侧边栏',
        '所有资料分区保存，互不影响',
      ],
      action: { label: '进入系统设置', href: '/admin/settings' },
    },
    {
      icon: Globe2,
      title: '访问并分享你的主页',
      description:
        '一切就绪后，你的公开作品集就上线了。主页包含项目画廊、时间线、技能标签与关于我页面，支持暗色模式与移动端自适应。',
      tips: boundUsername
        ? [
            `你的主页地址：/project/${boundUsername}`,
            '控制台顶部的绿色横幅可随时复制/访问站点地址',
            '支持生成分享图，把作品集一键分享到社交平台',
          ]
        : [
            '绑定站点地址后，主页路径为 /project/<你的站点地址>',
            '控制台顶部的绿色横幅可随时复制/访问站点地址',
            '支持生成分享图，把作品集一键分享到社交平台',
          ],
      action: boundUsername
        ? { label: '打开我的主页', href: `/project/${encodeURIComponent(boundUsername)}` }
        : undefined,
    },
  ];

  return (
    <div className="relative z-10 container mx-auto max-w-5xl space-y-8 px-4 py-10">
      {/* 页头 */}
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">使用教程</p>
        <h1 className="text-3xl font-semibold tracking-tight">快速上手管理后台</h1>
        <p className="text-muted-foreground">
          PanelShow 是一套真实可用的多用户作品集系统：项目画廊、时间线动态、个人资料一应俱全。
          跟着下面的步骤，几分钟就能搭建好你的专属作品集站点。
        </p>
      </header>

      {/* 返回控制台 */}
      <div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回管理控制台
          </Link>
        </Button>
      </div>

      {/* 步骤列表 */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Card key={step.title} className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      步骤 {index + 1}
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                  </div>
                  {step.action && (
                    <Button size="sm" variant="outline" asChild className="shrink-0">
                      <Link href={step.action.href}>
                        {step.action.label}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pl-[4.75rem]">
                <ul className="space-y-1.5">
                  {step.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 常见问题 */}
      <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">常见问题</CardTitle>
              <CardDescription>初次使用最常遇到的几个问题</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              这个项目能用吗？还是只是个演示 Demo？
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              完全可用。PanelShow 是完整的前后端系统（Next.js + FastAPI + Redis），支持多用户、
              Docker 一键部署、GitHub/TDP OAuth 登录、文件上传与实时通知，已在生产环境运行。
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              支持哪些登录方式？
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              管理员用户名密码、GitHub OAuth、TDP OIDC 三种方式。普通访客使用
              GitHub/TDP 登录后绑定自己的站点地址，即可拥有独立的作品集空间。
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4 text-purple-500" />
              项目截图和图片存在哪里？
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              图片通过后端上传到腾讯云 COS 对象存储；未配置 COS 时会回落到本地存储，
              保证开箱即用。业务数据以 JSON 文件持久化，并由 Redis 提供缓存加速。
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Share2 className="h-4 w-4 text-orange-500" />
              主页地址是什么？可以分享吗？
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {boundUsername
                ? `你的主页地址是 /project/${boundUsername} ，支持生成精美分享图并一键分享到社交平台。`
                : '绑定站点地址后，主页地址为 /project/<你的站点地址> ，支持生成精美分享图并一键分享到社交平台。'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 快捷入口 */}
      <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">快捷入口</CardTitle>
              <CardDescription>常用功能一键直达</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="w-9 h-9 rounded-lg bg-background border border-border/60 flex items-center justify-center text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
