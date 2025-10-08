"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, OctagonX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("正在处理 GitHub 授权...");

  const loginWithGithubCode = useAuthStore((store) => store.loginWithGithubCode);
  const setGithubState = useAuthStore((store) => store.setGithubState);
  const hasRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("未获取到 GitHub 授权码，请重试");
      return;
    }

    const sessionState = typeof window !== "undefined" ? sessionStorage.getItem("panelshow_github_state") : null;
    const expectedState = sessionState ?? useAuthStore.getState().pendingGithubState;

    if (!state || !expectedState || state !== expectedState) {
      setStatus("error");
      setMessage("GitHub 授权校验失败，请重新登录");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("panelshow_github_state");
      }
      setGithubState(null);
      return;
    }

    if (hasRequestedRef.current === code) {
      return;
    }

    hasRequestedRef.current = code;

    let cancelled = false;

    const handleLogin = async () => {
      try {
        await loginWithGithubCode(code);
        if (cancelled) return;
        setStatus("success");
        setMessage("授权成功，正在跳转...");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("panelshow_github_state");
        }
        setGithubState(null);

        const currentUser = useAuthStore.getState().user;
        const hasBound = Boolean(currentUser?.bound_username);
        const target = hasBound ? "/admin" : "/admin/welcome";

        setTimeout(() => {
          router.replace(target);
        }, 600);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        const detail = error instanceof Error ? error.message : "登录失败，请稍后重试";
        setMessage(detail);
        setGithubState(null);
      }
    };

    void handleLogin();

    return () => {
      cancelled = true;
    };
  }, [code, state, loginWithGithubCode, router, setGithubState]);

  const isLoading = status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl">GitHub 授权登录</CardTitle>
          <CardDescription>请稍候，我们正在完成登录流程</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : status === "success" ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : (
            <OctagonX className="h-10 w-10 text-destructive" />
          )}
          <p className="text-sm text-muted-foreground text-center whitespace-pre-line">{message}</p>
          {status === "error" && (
            <div className="flex w-full flex-col gap-2">
              <Button onClick={() => router.replace("/admin/login")}>返回登录</Button>
              <Button variant="outline" asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">GitHub 授权登录</CardTitle>
            <CardDescription>请稍候，我们正在完成登录流程</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">正在加载...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <GithubCallbackContent />
    </Suspense>
  );
}
