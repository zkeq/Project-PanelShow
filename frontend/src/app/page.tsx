'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Code2, Database, Globe, Monitor, Rocket, Shield, Star, Users, Zap, Menu, X } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useState } from "react";

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur border-b md:hidden">
          <nav className="container py-4 space-y-4">
            <a 
              href="#features" 
              className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              特性
            </a>
            <a 
              href="#architecture" 
              className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              架构
            </a>
            <a 
              href="#progress" 
              className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              进度
            </a>
            <a 
              href="#docs" 
              className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              文档
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

const ADMIN_DASHBOARD_URL = "/admin";

export default function Home() {
  
  const handleStartExperience = () => {
    window.location.href = ADMIN_DASHBOARD_URL;
  };

  const handleStartHome = () => {
    window.location.href = "/project/zkeq"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between relative">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-bold text-lg sm:text-xl">
              <span className="sm:hidden">PPS</span>
              <span className="hidden sm:inline">Project-PanelShow</span>
            </span>
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
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeSwitch />
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
            <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4" onClick={handleStartExperience}>
              开始体验
            </Button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pb-16 pt-20">
          {/* Animated background with flowing gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 dark:bg-none" />
          
          {/* Flowing light effect */}
          <div className="absolute inset-0 overflow-hidden dark:hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-radial from-blue-400/20 via-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse" 
                 style={{ 
                   background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 100%)',
                   animation: 'float 6s ease-in-out infinite' 
                 }} />
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-radial from-purple-400/20 via-blue-400/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" 
                 style={{ 
                   background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)',
                   animation: 'float 8s ease-in-out infinite reverse' 
                 }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-cyan-400/10 via-transparent to-transparent rounded-full blur-3xl animate-spin" 
                 style={{ 
                   background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(34, 211, 238, 0.1) 90deg, transparent 180deg, rgba(168, 85, 247, 0.1) 270deg, transparent 360deg)',
                   animationDuration: '20s' 
                 }} />
          </div>
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
                <span className="bg-gradient-to-r from-blue-600 to-purple-600  dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
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
                <Button size="lg" className="px-8" onClick={handleStartHome}>
                  探索项目展示
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="px-8" onClick={handleStartHome}>
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
                为开发者打造的现代化项目展示解决方案
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-6xl">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                      <Monitor className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Live Interactive Demo
                    </CardTitle>
                    <CardDescription>
                      真实项目交互，非静态展示
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      支持完整的用户交互操作，包括点击、表单输入、路由跳转等，
                      让访客体验真实的应用功能流程。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        React
                      </span>
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Vue
                      </span>
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Angular
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-300">
                      <Database className="h-6 w-6 text-purple-700 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      API Snapshot Engine
                    </CardTitle>
                    <CardDescription>
                      智能 API 响应缓存与管理
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      自动记录和回放 API 请求响应，确保项目在原始后端服务下线后
                      依然能够完整展示业务逻辑。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        REST
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        GraphQL
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        WebSocket
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors duration-300">
                      <Rocket className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Modern Tech Stack
                    </CardTitle>
                    <CardDescription>
                      企业级技术架构与性能优化
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      基于 Next.js 14、TypeScript、Tailwind CSS 构建，
                      支持 SSR、ISR、Edge Runtime 等现代化特性。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Next.js
                      </span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        TypeScript
                      </span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Vercel
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors duration-300">
                      <Shield className="h-6 w-6 text-orange-700 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Security & Privacy
                    </CardTitle>
                    <CardDescription>
                      数据安全与隐私保护机制
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      敏感数据本地化处理，支持数据脱敏、访问控制、
                      审计日志等企业级安全特性。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-950/30 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        HTTPS
                      </span>
                      <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-950/30 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        OAuth
                      </span>
                      <span className="inline-flex items-center rounded-md bg-orange-50 dark:bg-orange-950/30 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        RBAC
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors duration-300">
                      <Zap className="h-6 w-6 text-cyan-700 dark:text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Performance Optimized
                    </CardTitle>
                    <CardDescription>
                      极致性能与用户体验优化
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      Edge CDN 分发、智能预加载、资源压缩、
                      Tree Shaking 等多种性能优化策略。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        CDN
                      </span>
                      <span className="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        Cache
                      </span>
                      <span className="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                        Lighthouse
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
                      <Users className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Developer Experience
                    </CardTitle>
                    <CardDescription>
                      完整的开发者工具链支持
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                      提供 CLI 工具、SDK、API 文档、
                      项目模板等完整开发者生态。
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        CLI
                      </span>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        SDK
                      </span>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        API
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Architecture Section */}
        <section id="architecture" className="py-24 bg-muted/30">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                系统架构
              </h2>
              <p className="mt-4 text-muted-foreground">
                微服务架构设计，高可用与高性能并存
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="group relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" />
                  <CardHeader className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                      <Globe className="h-6 w-6 text-slate-100 dark:text-slate-900" />
                    </div>
                    <CardTitle className="text-xl font-mono">Frontend Service</CardTitle>
                    <CardDescription className="text-base">
                      Next.js 全栈应用 • 项目展示与管理平台
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="space-y-4">
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm font-mono font-medium">SSR/SSG Rendering</span>
                        </div>
                        <p className="text-xs text-muted-foreground">服务端渲染与静态生成，SEO 友好</p>
                      </div>
                      
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-sm font-mono font-medium">Interactive Previews</span>
                        </div>
                        <p className="text-xs text-muted-foreground">项目交互式预览与实时演示</p>
                      </div>
                      
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          <span className="text-sm font-mono font-medium">Admin Dashboard</span>
                        </div>
                        <p className="text-xs text-muted-foreground">项目管理与配置控制台</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground font-mono">
                        Tech Stack: Next.js 14 • React 19 • TypeScript • Tailwind CSS
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" />
                  <CardHeader className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
                      <Database className="h-6 w-6 text-slate-100 dark:text-slate-900" />
                    </div>
                    <CardTitle className="text-xl font-mono">Snapshot Service</CardTitle>
                    <CardDescription className="text-base">
                      API 快照引擎 • 数据缓存与回放系统
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="space-y-4">
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span className="text-sm font-mono font-medium">Request Interceptor</span>
                        </div>
                        <p className="text-xs text-muted-foreground">HTTP/API 请求拦截与记录</p>
                      </div>
                      
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-sm font-mono font-medium">Data Storage</span>
                        </div>
                        <p className="text-xs text-muted-foreground">响应数据本地化存储与管理</p>
                      </div>
                      
                      <div className="rounded-md border bg-background/50 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-cyan-500" />
                          <span className="text-sm font-mono font-medium">Mock Server</span>
                        </div>
                        <p className="text-xs text-muted-foreground">智能 Mock 服务与数据回放</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground font-mono">
                        Tech Stack: Node.js • Express • SQLite • Redis • Docker
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Data Flow Diagram */}
              <div className="mt-12">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-center font-mono">Data Flow Architecture</CardTitle>
                    <CardDescription className="text-center">
                      请求流程与数据处理管道
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center space-x-4 overflow-x-auto py-6">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                          <Users className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-mono">User Request</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                          <Globe className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-mono">Frontend</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                          <Database className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-mono">Snapshot API</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                          <Monitor className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-mono">Live Demo</span>
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
                <Button size="lg" className="px-8" onClick={handleStartHome}>
                  <Star className="mr-2 h-4 w-4" />
                  立即体验
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
