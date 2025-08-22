import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              🚀 革命性作品集展示平台
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Project-PanelShow
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            突破传统截图展示限制，打造<span className="text-foreground font-medium">真正可交互</span>的项目演示体验
          </p>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            通过本地化 API 快照技术，让访客深度体验每个项目的完整功能，即使原始后端服务已经下线
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge variant="outline">Next.js 14</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
            <Badge variant="outline">shadcn/ui</Badge>
            <Badge variant="outline">API 快照服务</Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              探索项目展示
            </Button>
            <Button variant="outline" size="lg">
              了解技术架构
            </Button>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">核心特性</h2>
            <p className="text-muted-foreground">
              重新定义作品集展示的新标准
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 真实交互体验
                </CardTitle>
                <CardDescription>
                  告别静态截图，体验真正的项目界面
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  访客可以点击、滚动、输入，完整体验每个项目的用户界面和交互流程，如同使用真实的在线应用
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ 智能 API 快照
                </CardTitle>
                <CardDescription>
                  本地化后端服务，永久保持项目活力
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  自动缓存和管理 API 响应数据，即使原始后端服务停止运行，项目依然能够完美展示所有功能
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 现代化架构
                </CardTitle>
                <CardDescription>
                  基于最新技术栈的高性能展示平台
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  采用 Next.js 14、TypeScript、Tailwind CSS 等前沿技术，确保极致的用户体验和开发效率
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">平台架构</h2>
            <p className="text-muted-foreground">
              双服务架构，完美平衡展示效果与技术实现
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 作品集展示网站
                </CardTitle>
                <CardDescription>
                  精美的项目展示与交互平台
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">项目状态实时监控</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">交互式项目预览</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">详细技术说明</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">响应式设计适配</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔧 API 快照服务
                </CardTitle>
                <CardDescription>
                  智能化后端数据缓存系统
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">API 响应自动缓存</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">本地化数据服务</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">遗留项目续命</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">无缝数据迁移</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Development Status */}
        <div className="text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">开发进度</h2>
            <p className="text-muted-foreground">
              精心规划，稳步推进的一个月开发计划
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>项目里程碑</CardTitle>
              <CardDescription>
                构建下一代作品集展示平台的关键节点
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">前端架构搭建</p>
                      <p className="text-sm text-muted-foreground">Next.js + TypeScript + Tailwind CSS</p>
                    </div>
                  </div>
                  <Badge variant="default">已完成</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">UI 组件库集成</p>
                      <p className="text-sm text-muted-foreground">shadcn/ui 组件系统</p>
                    </div>
                  </div>
                  <Badge variant="secondary">进行中</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm font-bold">3</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">API 快照服务</p>
                      <p className="text-sm text-muted-foreground">后端数据缓存与管理</p>
                    </div>
                  </div>
                  <Badge variant="outline">计划中</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm font-bold">4</span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">项目集成部署</p>
                      <p className="text-sm text-muted-foreground">多项目统一展示平台</p>
                    </div>
                  </div>
                  <Badge variant="outline">计划中</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
