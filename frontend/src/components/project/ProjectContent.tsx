"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Markdown from "@/components/Markdown";
import FeatureGallery from "@/components/project/FeatureGallery";
import DevelopmentTimelineSection from "@/components/project/DevelopmentTimelineSection";
import { useState, useEffect } from "react";
import {
  Users,
  Eye,
  Clock,
  Code,
  Palette,
  Package,
  ExternalLink,
  GitBranch,
  BarChart3,
} from "lucide-react";

interface ProjectContentProps {
  project: {
    id: string;
    name: string;
    description: string;
    techStack: string;
    projectType: string;
    monthlyPV: string;
    developmentPeriod: string;
    uiLibrary?: string;
    componentLibrary?: string;
    status: "active" | "archived" | "maintained";
    previewImage?: string;
    previewUrl?: string;
    longDescription?: string;
    images?: Array<{
      src: string;
      alt: string;
      label: string;
      description?: string;
    }>;
    features?: Array<{
      title: string;
      description: string;
      icon: string;
      images?: Array<{
        src: string;
        alt: string;
        label: string;
        description?: string;
      }>;
    }>;
    timeline?: {
      [year: string]: {
        [month: string]: Array<{
          title: string;
          date: string;
          status: string;
        }>;
      };
    };
  };
  username?: string;
}

export default function ProjectContent({ project, username }: ProjectContentProps) {
  const [isStackedLayout, setIsStackedLayout] = useState(false);
  
  useEffect(() => {
    const checkWindowSize = () => {
      // 基于窗口宽度来决定布局，更简单稳定
      // 当窗口宽度小于1200px时使用垂直布局
      setIsStackedLayout(window.innerWidth < 1400);
    };

    // 初始检查
    checkWindowSize();

    // 监听窗口大小变化
    window.addEventListener('resize', checkWindowSize);
    
    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);
  const projectStats = [
    // 第一行
    {
      label: "技术栈",
      value: project.techStack,
      icon: Code,
      color:
        "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
    },
    {
      label: "类型",
      value: project.projectType,
      icon: Users,
      color:
        "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800",
    },
    {
      label: "月PV",
      value: project.monthlyPV,
      icon: BarChart3,
      color:
        "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800",
    },
    {
      label: "开发时间",
      value: project.developmentPeriod,
      icon: Clock,
      color:
        "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800",
    },
    {
      label: "样式",
      value: project.uiLibrary || "Tailwind CSS",
      icon: Palette,
      color:
        "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-800",
    },
    // 第二行
    {
      label: "组件库",
      value: project.componentLibrary || "shadcn/ui",
      icon: Package,
      color:
        "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-800",
    },
    {
      label: "数据库",
      value: "PostgreSQL",
      icon: Package,
      color:
        "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
    },
    {
      label: "部署",
      value: "Vercel",
      icon: Code,
      color:
        "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-800",
    },
    {
      label: "版本控制",
      value: "Git",
      icon: Code,
      color:
        "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800",
    },
    {
      label: "测试框架",
      value: "Jest",
      icon: Code,
      color:
        "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
    },
    // 第三行
    {
      label: "状态管理",
      value: "Zustand",
      icon: Package,
      color:
        "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/30 dark:border-teal-800",
    },
    {
      label: "构建工具",
      value: "Webpack",
      icon: Code,
      color:
        "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/30 dark:border-sky-800",
    },
    {
      label: "代码规范",
      value: "ESLint",
      icon: Code,
      color:
        "text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-800",
    },
    {
      label: "类型检查",
      value: "TypeScript",
      icon: Code,
      color:
        "text-lime-600 bg-lime-50 border-lime-200 dark:text-lime-400 dark:bg-lime-950/30 dark:border-lime-800",
    },
    {
      label: "包管理",
      value: "npm",
      icon: Package,
      color:
        "text-stone-600 bg-stone-50 border-stone-200 dark:text-stone-400 dark:bg-stone-950/30 dark:border-stone-800",
    },
    // 第四行
    {
      label: "监控",
      value: "Sentry",
      icon: Eye,
      color:
        "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
    },
    {
      label: "文档",
      value: "Storybook",
      icon: Package,
      color:
        "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-800",
    },
    {
      label: "协作",
      value: "GitHub",
      icon: Users,
      color:
        "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/30 dark:border-gray-800",
    },
    {
      label: "容器化",
      value: "Docker",
      icon: Package,
      color:
        "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
    },
    {
      label: "缓存",
      value: "Redis",
      icon: Package,
      color:
        "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 项目概览面板 */}
      <section id="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">项目概览</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <GitBranch className="w-4 h-4 mr-2" />
              源码
            </Button>
            <Button size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              在线预览
            </Button>
          </div>
        </div>

        <div className={`${isStackedLayout ? 'space-y-6' : 'flex gap-6 items-start'}`}>
          {/* 左侧信息面板 - 弹性区域 */}
          <div className={`${isStackedLayout ? 'w-full' : 'flex-1 min-w-0'}`}>
            {/* 项目统计信息 - 5×4布局 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">项目信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {projectStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="space-y-2">
                        <div
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${stat.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">
                            {stat.label}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 项目图集 - 响应式布局 */}
          <div className={`${isStackedLayout ? 'w-full' : 'flex-shrink-0 w-[410px]'}`}>
            <FeatureGallery 
              images={project.images || []}
              variant="grid"
              className={isStackedLayout ? 'w-[410px] mx-auto' : 'w-full'}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 项目说明 */}
      <section id="description" className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">项目说明</h2>
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {project.longDescription ? (
                <Markdown>{project.longDescription}</Markdown>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  这是一个现代化的全栈电商解决方案，采用最新的技术栈构建。项目包含完整的购物流程，从商品展示到支付完成，提供了优秀的用户体验。
                  采 用微服务架构，前后端分离，支持高并发访问。前端使用Vue 3 +
                  TypeScript，后端采用Python Django框架。
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 特色功能介绍 */}
      <section id="features" className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">特色功能介绍</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            project.features || [
              {
                title: "响应式设计",
                description: "适配各种设备尺寸，提供一致的用户体验",
                icon: "📱",
              },
              {
                title: "高性能缓存",
                description: "使用Redis缓存，提升系统响应速度",
                icon: "⚡",
              },
              {
                title: "安全支付",
                description: "集成多种支付方式，保障交易安全",
                icon: "🔒",
              },
            ]
          ).map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  
                  {/* 功能图片展示 */}
                  {feature.images && feature.images.length > 0 && (
                    <div className="mt-4">
                      <FeatureGallery 
                        images={feature.images}
                        previewUrl={project.previewUrl}
                        variant="compact"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* 开发周期介绍 - 使用动态时间线组件 */}
      <section id="timeline">
        <DevelopmentTimelineSection
          projectId={project.id}
          username={username || 'zkeq'}
        />
      </section>
    </div>
  );
}
