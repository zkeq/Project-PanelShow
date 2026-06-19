"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, LogIn, ChevronDown, ChevronUp, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isTdpLoading, setIsTdpLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const {
    token, user, error, isLoading, hydrated,
    clearError, loginWithPassword, getGithubAuthUrl, getTdpAuthUrl,
    fetchUser, setGithubState, setTdpState,
  } = useAuthStore();

  const hasBoundUsername = useMemo(() => Boolean(user?.bound_username), [user?.bound_username]);

  useEffect(() => {
    if (!hydrated) return;
    if (token && !user?.role) fetchUser();
  }, [token, user?.role, fetchUser, hydrated]);

  useEffect(() => {
    if (!hydrated || !token) return;
    if (hasBoundUsername) {
      router.replace("/admin");
    } else if (user) {
      router.replace("/admin/welcome");
    }
  }, [hydrated, token, hasBoundUsername, router, user]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        await loginWithPassword(username, password);
      } catch (err) {
        console.error("管理员登录失败", err);
      }
    },
    [loginWithPassword, username, password]
  );

  const handleGitHubLogin = useCallback(async () => {
    try {
      setIsGitHubLoading(true);
      const authUrl = await getGithubAuthUrl();
      const state = crypto.randomUUID();
      sessionStorage.setItem("panelshow_github_state", state);
      setGithubState(state);
      const separator = authUrl.includes("?") ? "&" : "?";
      window.location.href = `${authUrl}${separator}state=${state}`;
    } catch (err) {
      console.error("获取GitHub授权地址失败", err);
    } finally {
      setIsGitHubLoading(false);
    }
  }, [getGithubAuthUrl, setGithubState]);

  const handleTdpLogin = useCallback(async () => {
    try {
      setIsTdpLoading(true);
      const authUrl = await getTdpAuthUrl();
      const state = crypto.randomUUID();
      sessionStorage.setItem("panelshow_tdp_state", state);
      setTdpState(state);
      const separator = authUrl.includes("?") ? "&" : "?";
      window.location.href = `${authUrl}${separator}state=${state}`;
    } catch (err) {
      console.error("获取TDP授权地址失败", err);
    } finally {
      setIsTdpLoading(false);
    }
  }, [getTdpAuthUrl, setTdpState]);

  const isFormDisabled = !username.trim() || !password.trim();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在准备认证信息...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      "bg-gradient-to-br from-gray-50 via-white to-gray-100/50",
      "dark:from-background dark:via-background dark:to-muted/50"
    )}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-gray-100/40 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-muted/15 rounded-full blur-3xl opacity-80" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-muted/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-muted/10 rounded-full blur-2xl opacity-60" />
        <div className="absolute top-20 right-20 w-32 h-32 border border-border/50 rounded-lg rotate-12 animate-slow-spin" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-border/60 rounded-full animate-bounce-slow" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-muted/30 rounded-lg rotate-45" />
        <div className="absolute top-1/3 right-1/2 w-20 h-20 bg-muted/15 rounded-full blur-xl opacity-60" />
        <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-muted/20 rounded-full blur-2xl opacity-60" />
      </div>

      <Card className="w-full max-w-3xl shadow-xl backdrop-blur-sm bg-card/90 border relative z-10 overflow-hidden py-0">
        <div className="flex min-h-[480px]">

          {/* 左侧：品牌区 */}
          <div className={cn(
            "hidden md:flex flex-col justify-between w-2/5 p-8",
            "bg-gradient-to-b from-muted/60 to-muted/20 border-r"
          )}>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow"> 
                <Monitor className="w-5 h-5 text-primary-foreground" /> 
              </div>
              <div>
                <h2 className="text-lg font-bold">Project PanelShow</h2>
                <p className="text-xs text-muted-foreground mt-1">交互式作品集管理平台</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                管理你的项目展示、时间线记录和技术栈配置，让每个项目都能专业呈现。
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>项目实时预览</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>技术栈可视化</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>开发时间线</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：登录区 */}
          <div className="flex-1 flex flex-col justify-center px-8 py-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">欢迎回来</h1>
              <p className="text-sm text-muted-foreground mt-1">选择登录方式继续</p>
            </div>

            <div className="space-y-3">
              {/* TDP 登录 */}
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={handleTdpLogin}
                disabled={isTdpLoading}
              >
                {isTdpLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />跳转中...</>
                ) : (
                  <>
                    <span className="mr-2 w-4 h-4 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
                      <Image
                        src="https://tdp.fan/favicon.ico"
                        alt="TDP"
                        width={12}
                        height={12}
                        unoptimized
                      />
                    </span>
                    TDP 授权登录
                  </>
                )}
              </Button>

              {/* GitHub 登录 */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGitHubLogin}
                disabled={isGitHubLoading}
              >
                {isGitHubLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />跳转中...</>
                ) : (
                  <><Github className="mr-2 h-4 w-4" />GitHub 授权登录</>
                )}
              </Button>
            </div>

            {/* 管理员折叠 */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <div className="flex-1 border-t" />
                <button
                  type="button"
                  onClick={() => setShowAdminForm(!showAdminForm)}
                  className="flex items-center gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  管理员登录
                  {showAdminForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <div className="flex-1 border-t" />
              </div>

              {showAdminForm && (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="space-y-1 text-left">
                    <Label htmlFor="username" className="text-xs">用户名</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => { if (error) clearError(); setUsername(e.target.value); }}
                      placeholder="管理员用户名"
                      autoComplete="username"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <Label htmlFor="password" className="text-xs">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => { if (error) clearError(); setPassword(e.target.value); }}
                      placeholder="管理员密码"
                      autoComplete="current-password"
                      className="h-9"
                    />
                  </div>
                  {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/40 p-2.5 text-xs text-destructive">
                      {error}
                    </div>
                  )}
                  <Button type="submit" size="sm" className="w-full" disabled={isFormDisabled || isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-3 w-3 animate-spin" />登录中...</>
                    ) : (
                      <><LogIn className="mr-2 h-3 w-3" />登录</>
                    )}
                  </Button>
                </form>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              登录后若未绑定用户名，将自动跳转至绑定页面
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
