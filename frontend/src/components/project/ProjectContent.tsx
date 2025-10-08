"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Markdown from "@/components/Markdown";
import FeatureGallery from "@/components/project/FeatureGallery";
import DevelopmentTimelineSection from "@/components/project/DevelopmentTimelineSection";
import MobileProjectNavigation from "@/components/project/MobileProjectNavigation";
import { Icon } from "@iconify/react";
import {
  Users,
  Eye,
  Clock,
  ExternalLink,
  GitBranch,
  BarChart3,
  Building2,
  Zap,
  Database,
  Rocket,
  CheckCircle,
  TestTube,
  Link2,
  Globe,
  BookOpen,
  Settings,
  Shield,
  Smartphone,
  Calendar,
  TrendingUp,
  User,
  Handshake,
  Puzzle,
  Code,
  Package,
  type LucideIcon,
} from "lucide-react";
import { ProjectInfo } from "@/types/store";
import { TimelineItem } from "@/types/timeline";
import { useExecuteCode } from "@/hooks/useExecuteCode";

interface MobileNavigationData {
  activeSection: string
  onSectionChange: (section: string) => void
}

interface ProjectContentProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: "active" | "archived" | "maintained" | "building";
    previewUrl?: string;
    sourceUrl?: string;
    longDescription?: string;
    homeAttributes?: ProjectInfo[];
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
      techStack?: Array<{
        name: string;
        color: string;
        bgColor: string;
        textColor: string;
        borderColor: string;
      }>;
      images?: Array<{
        src: string;
        alt: string;
        label: string;
        description?: string;
      }>;
      previewUrl?: string;
      demoId?: string | number;
    }>;
  };
  timelineItems?: TimelineItem[];
  username?: string;
  mobileNavigation?: MobileNavigationData;
}

// 图标渲染函数 - 支持 Iconify 和 Lucide 图标
const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
  // 如果是 Iconify 格式的图标（包含冒号），使用 Iconify
  if (iconName.includes(':')) {
    return <Icon icon={iconName} className={className} />;
  }

  // 否则尝试使用 Lucide 图标（向后兼容）
  const iconMap: Record<string, LucideIcon> = {
    Building2,
    TrendingUp,
    Clock,
    Zap,
    User,
    Handshake,
    Rocket,
    Database,
    Calendar,
    BarChart3,
    Puzzle,
    CheckCircle,
    TestTube,
    Link2,
    Globe,
    BookOpen,
    Users,
    Settings,
    Shield,
    Smartphone,
    Eye,
    GitBranch,
    ExternalLink,
  };

  const LucideIcon = iconMap[iconName];
  if (LucideIcon) {
    return <LucideIcon className={className} />;
  }

  // 默认使用 Iconify 的代码图标
  return <Icon icon="lucide:code" className={className} />;
};

// 颜色映射函数
const getColorTheme = (index: number): string => {
  const colorThemes = [
    "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
    "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800",
    "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800",
    "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800",
    "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-800",
    "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-800",
    "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
    "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-800",
    "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800",
    "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
    "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/30 dark:border-teal-800",
    "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/30 dark:border-sky-800",
    "text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-800",
    "text-lime-600 bg-lime-50 border-lime-200 dark:text-lime-400 dark:bg-lime-950/30 dark:border-lime-800",
    "text-stone-600 bg-stone-50 border-stone-200 dark:text-stone-400 dark:bg-stone-950/30 dark:border-stone-800",
    "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
    "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-800",
    "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/30 dark:border-gray-800",
  ];
  return colorThemes[index % colorThemes.length];
};

const ProjectStatItem = ({ attribute, colorClass }: { attribute: ProjectInfo; colorClass: string }) => {
  const { value, loading } = useExecuteCode(attribute.valueCode, attribute.value ?? "")
  const displayValue = attribute.valueCode ? (loading ? "计算中..." : value) : (attribute.value ?? "")

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${colorClass}`}>
        {renderIcon(attribute.icon || "lucide:code")}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{attribute.label}</p>
        <p className="text-sm font-semibold text-foreground">{displayValue || "-"}</p>
      </div>
    </div>
  )
}

export default function ProjectContent({ project, username, mobileNavigation, timelineItems }: ProjectContentProps) {
  const router = useRouter();
  const statsAttributes = (project.homeAttributes || []).slice(0, 12);
  const demoBasePath = username ? `/project/${username}/${project.id}/demo` : null;

  const openDemo = (options?: { demoId?: string | number; fallbackUrl?: string }) => {
    const demoId = options?.demoId;
    const fallbackUrl = options?.fallbackUrl;

    if (demoBasePath) {
      const demoPath =
        demoId !== undefined && demoId !== null && `${demoId}`.length > 0
          ? `${demoBasePath}/${demoId}`
          : demoBasePath;
      router.push(demoPath);
      return;
    }

    if (fallbackUrl) {
      window.open(fallbackUrl, "_blank");
      return;
    }

    if (project.previewUrl) {
      window.open(project.previewUrl, "_blank");
    }
  };

  return (
    <div className="space-y-8">
      {/* 移动端导航 */}
      {mobileNavigation && (
        <div className="lg:hidden">
          <MobileProjectNavigation
            project={{
              name: project.name,
              status: project.status,
              previewUrl: project.previewUrl
            }}
            activeSection={mobileNavigation.activeSection}
            onSectionChange={mobileNavigation.onSectionChange}
            username={username}
            projectId={project.id}
          />
        </div>
      )}

      {/* 项目概览面板 */}
      <section id="overview" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">项目概览</h2>
            <p className="text-sm text-muted-foreground">
              项目的基本信息、技术栈以及在线演示
            </p>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-2 lg:flex lg:gap-4 lg:items-start">
          {/* 左侧信息面板 - 弹性区域 */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            {/* 项目统计信息 - 响应式布局 */}
            <Card className="gap-2 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">项目信息</CardTitle>
                <div className="flex gap-2">
                  {project.sourceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(project.sourceUrl!, "_blank")}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      源码
                    </Button>
                  )}
                  {project.previewUrl && (
                    <Button size="sm" onClick={() => openDemo({ fallbackUrl: project.previewUrl })}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      在线预览
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-4 lg:py-6">
                {statsAttributes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4 w-full">
                    {statsAttributes.map((attribute, index) => (
                      <ProjectStatItem
                        key={attribute.id}
                        attribute={attribute}
                        colorClass={attribute.color || getColorTheme(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无项目信息。</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 项目图集 - 响应式布局 */}
          <div className="w-full lg:flex-shrink-0 lg:w-[380px]">
            <FeatureGallery
              images={project.images || []}
              variant="carousel"
              className="w-full"
              previewUrl={project.previewUrl}
              onPreviewClick={() => openDemo({ fallbackUrl: project.previewUrl })}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 项目说明 */}
      <section id="description" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">项目说明</h2>
            <p className="text-sm text-muted-foreground">
              项目的详细介绍、技术架构和实现方案
            </p>
          </div>
        </div>
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
      <section id="features" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">特色功能介绍</h2>
            <p className="text-sm text-muted-foreground">
              探索项目的核心功能特色，了解所使用的技术栈和实现方案
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            project.features || [
              {
                title: "响应式设计",
                description: "适配各种设备尺寸，提供一致的用户体验",
                icon: "📱",
                techStack: [
                  { name: 'CSS Grid', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
                  { name: 'Flexbox', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' }
                ]
              },
              {
                title: "高性能缓存",
                description: "使用Redis缓存，提升系统响应速度",
                icon: "⚡",
                techStack: [
                  { name: 'Redis', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 hover:bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
                  { name: 'Memory Cache', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200' }
                ]
              },
              {
                title: "安全支付",
                description: "集成多种支付方式，保障交易安全",
                icon: "🔒",
                techStack: [
                  { name: 'SSL/TLS', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 hover:bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
                  { name: 'OAuth 2.0', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' }
                ]
              },
            ]
          ).map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header with icon and title */}
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  
                  {/* Tech Stack Tags */}
                  {feature.techStack && feature.techStack.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">技术栈</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {feature.techStack.map((tech, techIndex) => (
                          <div
                            key={techIndex}
                            className={`px-2.5 py-1 rounded-full border text-xs font-medium ${tech.bgColor} ${tech.textColor} ${tech.borderColor}`}
                          >
                            {tech.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Feature Images */}
                  {feature.images && feature.images.length > 0 && (
                    <div className="mt-4">
                      <FeatureGallery
                        images={feature.images}
                        previewUrl={feature.previewUrl || project.previewUrl}
                        variant="compact"
                        onPreviewClick={() =>
                          openDemo({
                            demoId: feature.demoId ?? index + 1,
                            fallbackUrl: feature.previewUrl || project.previewUrl,
                          })
                        }
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
          initialTimelineItems={timelineItems}
        />
      </section>
    </div>
  );
}
