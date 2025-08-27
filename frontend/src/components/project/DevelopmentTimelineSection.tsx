"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TimelineCard from "@/components/TimelineCard";
import { TimelineItem } from "@/types/timeline";
import { Calendar, ChevronDown, ChevronUp, Activity } from "lucide-react";

interface DevelopmentTimelineSectionProps {
  projectId: string;
  username: string;
}

export default function DevelopmentTimelineSection({
  projectId,
  username,
}: DevelopmentTimelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 模拟获取该项目的动态数据
  useEffect(() => {
    const fetchProjectTimeline = async () => {
      setLoading(true);
      
      // 这里应该是真实的API调用，根据projectId和username获取项目动态
      // 暂时使用模拟数据，过滤出与当前项目相关的动态
      const mockTimelineData: TimelineItem[] = [
        {
          id: 'timeline-project-1',
          publishedAt: '2024-08-22T10:30:00Z',
          author: {
            name: 'Zkeq',
            avatar: 'https://avatars.githubusercontent.com/u/62864752',
            username: 'zkeq'
          },
          project: {
            name: 'E-Commerce Platform',
            logo: 'https://avatars.githubusercontent.com/u/62864752',
            description: '完成了用户认证模块的开发，包括登录、注册、密码重置等功能。优化了前端登录表单的用户体验，增加了输入验证和错误提示。',
            techStack: ['Vue', 'Python', 'Django', 'PostgreSQL'],
            readme: `## 🔐 用户认证模块完成

### ✅ 完成的功能
- 用户注册与邮箱验证
- 安全登录与会话管理
- 密码重置功能
- JWT Token 认证
- 角色权限管理

### 🎨 前端优化
- 响应式登录表单设计
- 实时输入验证
- 友好的错误提示
- 加载状态指示器
- 暗色模式支持

### 🔒 安全特性
- 密码哈希存储
- 防止暴力破解
- CSRF 保护
- XSS 防护
- 会话过期管理`,
            previewImages: [
              '/Snipaste_2025-08-23_22-52-13.png',
              '/Snipaste_2025-08-23_22-52-25.png'
            ],
            repositoryUrl: 'https://github.com/zkeq/e-commerce-platform',
            liveUrl: 'http://localhost:3000/project/zkeq/1'
          },
          updateType: 'feature',
          changelog: '完成用户认证模块开发',
          likes: 18,
          comments: 5,
          isLiked: false
        },
        {
          id: 'timeline-project-2',
          publishedAt: '2024-08-18T15:45:00Z',
          author: {
            name: 'Zkeq',
            avatar: 'https://avatars.githubusercontent.com/u/62864752',
            username: 'zkeq'
          },
          project: {
            name: 'E-Commerce Platform',
            logo: 'https://avatars.githubusercontent.com/u/62864752',
            description: '搭建了项目的基础架构，包括前后端环境配置、数据库设计、API路由规划等。选择了Vue 3 + Django的技术方案。',
            techStack: ['Vue', 'Python', 'Django', 'PostgreSQL', 'Redis'],
            readme: `## 🏗️ 项目架构搭建

### 🎯 技术选型
- **前端**: Vue 3 + TypeScript + Vite
- **后端**: Django + Django REST Framework
- **数据库**: PostgreSQL + Redis
- **部署**: Docker + Docker Compose

### 📋 数据库设计
- 用户表设计
- 商品分类表
- 订单管理表
- 支付记录表
- 库存管理表

### 🚀 开发环境
- 配置开发环境
- 设置 CI/CD 流程
- API 文档规划
- 代码规范制定

### 📦 项目结构
\`\`\`
ecommerce-platform/
├── frontend/          # Vue 3 前端
├── backend/           # Django 后端
├── docker/           # Docker 配置
└── docs/            # 项目文档
\`\`\``,
            previewImages: [
              '/Snipaste_2025-08-23_22-52-25.png'
            ],
            repositoryUrl: 'https://github.com/zkeq/e-commerce-platform'
          },
          updateType: 'new',
          changelog: '项目架构搭建完成',
          likes: 12,
          comments: 8,
          isLiked: true
        },
        {
          id: 'timeline-project-3',
          publishedAt: '2024-08-15T09:20:00Z',
          author: {
            name: 'Zkeq',
            avatar: 'https://avatars.githubusercontent.com/u/62864752',
            username: 'zkeq'
          },
          project: {
            name: 'E-Commerce Platform',
            logo: 'https://avatars.githubusercontent.com/u/62864752',
            description: '完成了商品管理模块的开发，包括商品的增删改查、分类管理、库存管理等核心功能。',
            techStack: ['Vue', 'Python', 'Django', 'PostgreSQL'],
            readme: `## 🛍️ 商品管理模块

### 📦 核心功能
- 商品信息管理
- 商品分类体系
- 库存实时监控
- 商品图片上传
- 规格属性管理

### 🎯 功能特点
- 支持多规格商品
- 批量商品导入
- 商品状态管理
- 价格策略配置
- SEO优化设置

### 🔧 技术实现
- RESTful API 设计
- 图片上传与处理
- 数据库索引优化
- 缓存策略应用
- 搜索功能集成`,
            previewImages: [
              '/Snipaste_2025-08-23_22-52-13.png',
              '/Snipaste_2025-08-23_22-52-25.png'
            ],
            repositoryUrl: 'https://github.com/zkeq/e-commerce-platform',
            liveUrl: 'http://localhost:3000/project/zkeq/1'
          },
          updateType: 'feature',
          changelog: '商品管理模块开发完成',
          likes: 25,
          comments: 7,
          isLiked: false
        }
      ];

      // 模拟异步请求延迟
      setTimeout(() => {
        setTimelineItems(mockTimelineData);
        setLoading(false);
      }, 1000);
    };

    fetchProjectTimeline();
  }, [projectId, username]);

  // 计算显示的动态数量
  const displayCount = isExpanded ? timelineItems.length : Math.min(timelineItems.length, 2);
  const displayItems = timelineItems.slice(0, displayCount);
  const hasMore = timelineItems.length > 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">开发周期介绍</h2>
            <p className="text-sm text-muted-foreground">
              项目开发过程中的重要更新和里程碑
            </p>
          </div>
        </div>
        
        {/* 动态统计徽章 */}
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {timelineItems.length} 个动态
        </Badge>
      </div>

      <Card className="border-0 shadow-none bg-transparent pt-0">
        <CardContent className="p-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              // 加载状态
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : timelineItems.length === 0 ? (
              // 空状态
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无开发动态</h3>
                <p className="text-muted-foreground">
                  该项目还没有发布开发动态
                </p>
              </div>
            ) : (
              // 动态列表
              <div className="space-y-6">
                {displayItems.map((item) => (
                  <div key={item.id}>
                    <TimelineCard item={item} />
                  </div>
                ))}

                {/* 展开/收起按钮 */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          收起动态
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          查看更多动态 ({timelineItems.length - 2} 条)
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 查看全部动态链接 */}
                {timelineItems.length > 0 && (
                  <div className="text-center pt-4 border-t">
                    <Button variant="link" size="sm" asChild>
                      <a href={`/project/${username}`} className="text-primary hover:underline">
                        前往全部动态页面查看更多 →
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}