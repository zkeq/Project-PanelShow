import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Code2, Database, Globe, Monitor, Rocket, Shield, Star, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-6 w-6" />
            <span className="font-bold text-xl">Project-PanelShow</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
              特性
            </a>
            <a href="#architecture" className="transition-colors hover:text-foreground/80 text-foreground/60">
              架构
            </a>
            <a href="#progress" className="transition-colors hover:text-foreground/80 text-foreground/60">
              进度
            </a>
            <a href="#docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
              文档
            </a>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
            <Button size="sm">
              开始体验
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pb-16 pt-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
          <div className="container relative">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4 px-3 py-1">
                  <Rocket className="mr-1 h-3 w-3" />
                  革命性作品集展示平台
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                重新定义
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  项目展示
                </span>
                体验
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                突破传统截图展示限制，打造真正可交互的项目演示体验。通过智能 API 快照技术，
                让访客深度体验每个项目的完整功能，即使原始后端服务已经下线。
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Code2 className="mr-1 h-3 w-3" />
                  Next.js 14
                </Badge>
                <Badge variant="outline" className="px-3 py-1">TypeScript</Badge>
                <Badge variant="outline" className="px-3 py-1">Tailwind CSS</Badge>
                <Badge variant="outline" className="px-3 py-1">shadcn/ui</Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Database className="mr-1 h-3 w-3" />
                  API 快照服务
                </Badge>
              </div>
              
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="px-8">
                  探索项目展示
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <Globe className="mr-2 h-4 w-4" />
                  查看演示
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">交互体验</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">在线展示</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0ms</div>
                  <div className="text-sm text-muted-foreground">冷启动</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">∞</div>
                  <div className="text-sm text-muted-foreground">项目生命周期</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                核心优势
              </h2>
              <p className="mt-4 text-muted-foreground">
                基于现代技术栈构建的下一代作品集展示平台
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-6xl">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>真实交互体验</CardTitle>
                    <CardDescription>
                      告别静态截图，体验真正的项目界面
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      访客可以点击、滚动、输入，完整体验每个项目的用户界面和交互流程，
                      获得与真实在线应用完全一致的使用体验。
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Database className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle>智能 API 快照</CardTitle>
                    <CardDescription>
                      本地化后端服务，永久保持项目活力
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      自动缓存和管理 API 响应数据，即使原始后端服务停止运行，
                      项目依然能够完美展示所有功能特性。
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Rocket className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle>现代化架构</CardTitle>
                    <CardDescription>
                      基于最新技术栈的高性能展示平台
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      采用 Next.js 14、TypeScript、Tailwind CSS 等前沿技术，
                      确保极致的用户体验和开发效率。
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle>企业级安全</CardTitle>
                    <CardDescription>
                      数据安全与隐私保护的完美平衡
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      所有敏感数据本地化处理，确保项目信息安全的同时，
                      为访客提供完整的功能演示体验。
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Zap className="h-5 w-5 text-cyan-600" />
                    </div>
                    <CardTitle>极速响应</CardTitle>
                    <CardDescription>
                      毫秒级响应，流畅的用户体验
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      基于边缘计算和智能缓存技术，实现毫秒级响应速度，
                      为用户提供丝滑流畅的项目体验过程。
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10" />
                  <CardHeader className="relative">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <CardTitle>多用户支持</CardTitle>
                    <CardDescription>
                      支持多人同时访问和体验项目
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      高并发架构设计，支持多人同时访问和体验项目，
                      满足团队展示和客户演示的各种场景需求。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Architecture Section */}
        <section id="architecture" className="py-24 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                系统架构
              </h2>
              <p className="mt-4 text-muted-foreground">
                双服务架构，完美平衡展示效果与技术实现
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="grid gap-8 md:grid-cols-2">
                <Card className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                  <CardHeader className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">作品集展示网站</CardTitle>
                    <CardDescription className="text-base">
                      精美的项目展示与交互平台
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">项目状态实时监控</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">交互式项目预览</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">详细技术说明</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">响应式设计适配</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">SEO 优化支持</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                  <CardHeader className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                      <Database className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">API 快照服务</CardTitle>
                    <CardDescription className="text-base">
                      智能化后端数据缓存系统
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">API 响应自动缓存</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">本地化数据服务</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">遗留项目续命</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">无缝数据迁移</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium">智能数据更新</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Progress Section */}
        <section id="progress" className="py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                开发进度
              </h2>
              <p className="mt-4 text-muted-foreground">
                精心规划，稳步推进的一个月开发计划
              </p>
            </div>
            
            <Card className="mx-auto mt-16 max-w-4xl">
              <CardHeader>
                <CardTitle className="text-2xl">项目里程碑</CardTitle>
                <CardDescription className="text-base">
                  构建下一代作品集展示平台的关键节点
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border bg-green-50/50 p-6 dark:bg-green-950/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                        <span className="text-sm font-bold text-white">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold">前端架构搭建</p>
                        <p className="text-sm text-muted-foreground">
                          Next.js + TypeScript + Tailwind CSS 技术栈完成
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      已完成
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border bg-blue-50/50 p-6 dark:bg-blue-950/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                        <span className="text-sm font-bold text-white">2</span>
                      </div>
                      <div>
                        <p className="font-semibold">UI 组件库集成</p>
                        <p className="text-sm text-muted-foreground">
                          shadcn/ui 组件系统集成与定制化开发
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      进行中
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-bold text-muted-foreground">3</span>
                      </div>
                      <div>
                        <p className="font-semibold">API 快照服务</p>
                        <p className="text-sm text-muted-foreground">
                          后端数据缓存与管理系统开发
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">计划中</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-sm font-bold text-muted-foreground">4</span>
                      </div>
                      <div>
                        <p className="font-semibold">项目集成部署</p>
                        <p className="text-sm text-muted-foreground">
                          多项目统一展示平台与生产环境部署
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">计划中</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                准备开始体验？
              </h2>
              <p className="mt-4 text-muted-foreground">
                立即体验革命性的项目展示平台，重新定义您的作品集展示方式
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="px-8">
                  <Star className="mr-2 h-4 w-4" />
                  立即体验
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  <Code2 className="mr-2 h-4 w-4" />
                  查看源码
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold">产品</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">功能特性</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">技术架构</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">使用案例</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">开发者</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API 文档</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">SDK</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">集成指南</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">支持</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">帮助中心</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">社区</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">公司</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">关于我们</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">博客</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span className="font-semibold">Project-PanelShow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Project-PanelShow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
