"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, LockKeyhole, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const {
    token,
    user,
    error,
    isLoading,
    hydrated,
    clearError,
    loginWithPassword,
    getGithubAuthUrl,
    fetchUser,
    setGithubState,
  } = useAuthStore();

  const hasBoundUsername = useMemo(() => Boolean(user?.bound_username), [user?.bound_username]);

  useEffect(() => {
    if (!hydrated) return;
    if (token && !user?.role) {
      fetchUser();
    }
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

  const isFormDisabled = !username.trim() || !password.trim();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">初始化</CardTitle>
            <CardDescription>正在准备认证信息...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
        "bg-gradient-to-br from-gray-50 via-white to-gray-100/50",
        "dark:from-background dark:via-background dark:to-muted/50"
      )}
    >
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

      <Card className="w-full max-w-lg shadow-xl backdrop-blur-sm bg-card/90 border relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <LockKeyhole className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">管理端登录</CardTitle>
            <CardDescription>使用管理员账号或 GitHub 完成登录</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="username">管理员用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => {
                  if (error) clearError();
                  setUsername(event.target.value);
                }}
                placeholder="输入管理员用户名"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password">管理员密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  if (error) clearError();
                  setPassword(event.target.value);
                }}
                placeholder="输入管理员密码"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/40 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isFormDisabled || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  管理员登录
                </>
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <span className="relative bg-card px-3 text-xs text-muted-foreground">
              或者使用 GitHub 登录
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGitHubLogin}
            disabled={isGitHubLoading}
          >
            {isGitHubLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                跳转中...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                GitHub 授权登录
              </>
            )}
          </Button>

          <div className="rounded-md border border-border/50 bg-muted/20 p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              登录后若未绑定用户名，将自动跳转至绑定页面。
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>默认管理员账号：<strong>admin / admin123</strong></p>
              <p>GitHub 登录将引导至授权页面并返回此站点继续。</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
