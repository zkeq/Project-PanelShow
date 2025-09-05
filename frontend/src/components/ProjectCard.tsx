"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  BarChart3,
  Code,
  Building2,
  TrendingUp,
  Clock,
  Zap,
  User,
  Handshake,
  Rocket,
  Database,
  Palette,
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
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";
import Markdown from "@/components/Markdown";
import { Project } from '@/types/store';

interface ProjectCardProps {
  project: Project;
  expandedProjects?: string[];
  onToggleExpand?: (projectId: string) => void;
}

// 图标映射函数
const getIcon = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Code,
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
    Palette,
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
  };
  return iconMap[iconName] || Code;
};

export default function ProjectCard({
  project,
  expandedProjects = [],
  onToggleExpand,
  index = 0,
}: ProjectCardProps & { index?: number }) {
  const [localExpanded, setLocalExpanded] = useState(false);

  // 使用传入的展开状态或本地状态
  const isExpanded = expandedProjects.includes(project.id) || localExpanded;

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(project.id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  // 默认图片列表
  const defaultImages = [
    "/Snipaste_2025-08-23_22-52-13.png",
    "/Snipaste_2025-08-23_22-52-25.png",
  ];

  // 根据项目ID选择图片
  const imageIndex = parseInt(project.id) % defaultImages.length;
  const imageSrc = project.previewImage || defaultImages[imageIndex];

  // 颜色主题数组 - 根据首页核心优势卡片样式
  const colorThemes = [
    {
      bg: "bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconHoverBg: "group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50",
      iconColor: "text-blue-700 dark:text-blue-400",
      tagBg: "bg-blue-50 dark:bg-blue-950/30",
      tagText: "text-blue-700 dark:text-blue-300",
      tagBorder: "border-blue-200 dark:border-blue-800",
    },
    {
      bg: "bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconHoverBg:
        "group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50",
      iconColor: "text-purple-700 dark:text-purple-400",
      tagBg: "bg-purple-50 dark:bg-purple-950/30",
      tagText: "text-purple-700 dark:text-purple-300",
      tagBorder: "border-purple-200 dark:border-purple-800",
    },
    {
      bg: "bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconHoverBg:
        "group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50",
      iconColor: "text-emerald-700 dark:text-emerald-400",
      tagBg: "bg-emerald-50 dark:bg-emerald-950/30",
      tagText: "text-emerald-700 dark:text-emerald-300",
      tagBorder: "border-emerald-200 dark:border-emerald-800",
    },
    {
      bg: "bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-background",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconHoverBg:
        "group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50",
      iconColor: "text-orange-700 dark:text-orange-400",
      tagBg: "bg-orange-50 dark:bg-orange-950/30",
      tagText: "text-orange-700 dark:text-orange-300",
      tagBorder: "border-orange-200 dark:border-orange-800",
    },
    {
      bg: "bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconHoverBg: "group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50",
      iconColor: "text-cyan-700 dark:text-cyan-400",
      tagBg: "bg-cyan-50 dark:bg-cyan-950/30",
      tagText: "text-cyan-700 dark:text-cyan-300",
      tagBorder: "border-cyan-200 dark:border-cyan-800",
    },
    {
      bg: "bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconHoverBg:
        "group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50",
      iconColor: "text-indigo-700 dark:text-indigo-400",
      tagBg: "bg-indigo-50 dark:bg-indigo-950/30",
      tagText: "text-indigo-700 dark:text-indigo-300",
      tagBorder: "border-indigo-200 dark:border-indigo-800",
    },
  ];

  // 根据索引选择颜色主题，确保相邻项目颜色不重合
  const theme = colorThemes[index % colorThemes.length];

  // 为暗色模式定义具体的背景颜色 - 更暗的渐变，与管理页面一致
  const darkBackgrounds = [
    "linear-gradient(to bottom, rgba(59, 130, 246, 0.08), rgba(13, 13, 13, 0.95))", // blue - 更暗
    "linear-gradient(to bottom, rgba(168, 85, 247, 0.08), rgba(13, 13, 13, 0.95))", // purple - 更暗
    "linear-gradient(to bottom, rgba(34, 197, 94, 0.08), rgba(13, 13, 13, 0.95))", // emerald - 更暗
    "linear-gradient(to bottom, rgba(249, 115, 22, 0.08), rgba(13, 13, 13, 0.95))", // orange - 更暗
    "linear-gradient(to bottom, rgba(34, 211, 238, 0.08), rgba(13, 13, 13, 0.95))", // cyan - 更暗
    "linear-gradient(to bottom, rgba(99, 102, 241, 0.08), rgba(13, 13, 13, 0.95))", // indigo - 更暗
  ];

  return (
    <NextLink
      href={`/project/zkeq/${project.id}`}
      className="block transition-transform hover:scale-[1.02]"
    >
      <Card
        className={`py-0 text-card-foreground flex flex-col rounded-xl group relative overflow-hidden border hover:shadow-lg hover:border-border/80 transition-all duration-300 cursor-pointer`}
      >
        {/* 亮色模式背景 */}
        <div
          className={`absolute inset-0 rounded-xl dark:hidden ${theme.bg}`}
        />

        {/* 暗色模式背景 - 实心背景遮盖点状图案 */}
        <div
          className="absolute inset-0 hidden dark:block rounded-xl"
          style={{
            background: darkBackgrounds[index % darkBackgrounds.length],
          }}
        />

        {/* 内容层 */}
        <div className="relative z-10">
          {/* 网站截图 - 完全贴合顶部 */}
          <div className="relative aspect-video overflow-hidden rounded-t-xl">
            <Image
              src={imageSrc}
              alt={project.name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* 状态标识 */}
            {project.status === "active" && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-green-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
                活跃
              </Badge>
            )}
            {project.status === "maintained" && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-blue-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
                维护中
              </Badge>
            )}
            {project.status === "completed" && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-gray-500/90 text-white border-0 shadow-sm backdrop-blur-sm"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" />
                已完成
              </Badge>
            )}

            {/* 悬浮操作按钮 */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 w-7 p-0 bg-white/90 hover:bg-white border-0 shadow-sm backdrop-blur-sm pointer-events-none"
              >
                <ExternalLink className="h-3 w-3 text-gray-700" />
              </Button>
            </div>

          </div>

          <CardContent className="px-5 pt-4 pb-3 space-y-4">
            {/* 项目统计信息 - 带图标的现代设计 */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center space-y-1">
                <div
                  className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
                >
                  <BarChart3 className={`w-3 h-3 ${theme.tagText}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  技术栈
                </p>
                <p className="font-semibold text-xs text-foreground">
                  {project.attributes.find(attr => attr.key === 'techStack')?.value || "Vue + Python"}
                </p>
              </div>
              <div className="text-center space-y-1">
                <div
                  className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
                >
                  <Calendar className={`w-3 h-3 ${theme.tagText}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  项目类型
                </p>
                <p className="font-semibold text-xs text-foreground">
                  {project.attributes.find(attr => attr.key === 'projectType')?.value || "个人项目"}
                </p>
              </div>
              <div className="text-center space-y-1">
                <div
                  className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
                >
                  <BarChart3 className={`w-3 h-3 ${theme.tagText}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  月PV
                </p>
                <p className="font-semibold text-xs text-foreground">
                  {project.attributes.find(attr => attr.key === 'monthlyPV')?.value || "10w"}
                </p>
              </div>
              <div className="text-center space-y-1">
                <div
                  className={`inline-flex items-center justify-center rounded-md ${theme.tagBg} px-2 py-1 border ${theme.tagBorder} mx-auto`}
                >
                  <Calendar className={`w-3 h-3 ${theme.tagText}`} />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  开发周期
                </p>
                <p className="font-semibold text-xs text-foreground">
                  {project.attributes.find(attr => attr.key === 'developmentPeriod')?.value || "3个月"}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* 项目标题和简介 */}
            <div className="space-y-3">
              {/* 项目标题 */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
              </div>

              {/* 项目简介 */}
              <div className="relative">
                <div
                  className={`text-muted-foreground leading-relaxed transition-all duration-300 ${
                    isExpanded ? "max-h-none" : "max-h-[3.5rem] overflow-hidden"
                  }`}
                >
                  <Markdown>{project.description}</Markdown>
                </div>

                {/* 渐变遮罩 */}
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>

              {/* 展开按钮 */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleExpand();
                  }}
                  className="text-xs text-muted-foreground hover:text-primary h-7 px-3 transition-colors hover:bg-muted/50"
                >
                  {isExpanded ? (
                    <>
                      收起
                      <ChevronUp className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      展开阅读
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </NextLink>
  );
}
