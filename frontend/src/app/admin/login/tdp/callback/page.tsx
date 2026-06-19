"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, OctagonX, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

const steps = ["获取授权凭证", "验证用户身份", "完成登录"];

function TdpCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const loginWithTdpToken = useAuthStore((store) => store.loginWithTdpToken);
  const hasRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("未获取到授权凭证，请重试");
      return;
    }

    if (hasRequestedRef.current === token) return;
    hasRequestedRef.current = token;

    let cancelled = false;

    const handleLogin = async () => {
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 300));

      try {
        setCurrentStep(2);
        await loginWithTdpToken(token);
        if (cancelled) return;

        setStatus("success");
        setCurrentStep(3);

        const currentUser = useAuthStore.getState().user;
        const hasBound = Boolean(currentUser?.bound_username);
        const target = hasBound ? "/admin" : "/admin/welcome";

        setTimeout(() => { router.replace(target); }, 800);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(error instanceof Error ? error.message : "登录失败，请稍后重试");
      }
    };

    void handleLogin();
    return () => { cancelled = true; };
  }, [token, loginWithTdpToken, router]);

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      "bg-gradient-to-br from-gray-50 via-white to-gray-100/50",
      "dark:from-background dark:via-background dark:to-muted/50"
    )}>
      <div className="absolute inset-0 bg-grid-gray-100/40 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-muted/15 rounded-full blur-3xl opacity-80" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-muted/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-20 right-20 w-32 h-32 border border-border/50 rounded-lg rotate-12 animate-slow-spin" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-border/60 rounded-full animate-bounce-slow" />
      </div>

      <Card className="w-full max-w-sm shadow-xl backdrop-blur-sm bg-card/90 border relative z-10">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-6">

          {/* 图标区 */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border flex items-center justify-center">
              <Image
                src="https://tdp.fan/favicon.ico"
                alt="TDP"
                width={36}
                height={36}
                unoptimized
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border flex items-center justify-center">
              {status === "error" ? (
                <OctagonX className="w-4 h-4 text-destructive" />
              ) : status === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">
              {status === "error" ? "授权失败" : status === "success" ? "授权成功" : "TDP 授权登录"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {status === "error" ? errorMsg : status === "success" ? "即将跳转到管理后台..." : "请稍候，正在完成登录流程"}
            </p>
          </div>

          {/* 步骤进度 */}
          {status !== "error" && (
            <div className="w-full space-y-3">
              <div className="space-y-2">
                {steps.map((step, i) => {
                  const stepNum = i + 1;
                  const done = currentStep > stepNum;
                  const active = currentStep === stepNum;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium transition-all",
                        done ? "bg-green-500 text-white" :
                        active ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {done ? <CheckCircle2 className="w-3 h-3" /> : stepNum}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        done ? "text-green-600 dark:text-green-400" :
                        active ? "text-foreground font-medium" :
                        "text-muted-foreground"
                      )}>
                        {step}
                      </span>
                      {active && <Loader2 className="w-3 h-3 animate-spin text-primary ml-auto" />}
                    </div>
                  );
                })}
              </div>

              {/* 底部进度条 */}
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((currentStep / steps.length) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误操作 */}
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

const FallbackUI = (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
    <Card className="w-full max-w-sm shadow-xl">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">正在加载...</p>
      </CardContent>
    </Card>
  </div>
);

export default function TdpCallbackPage() {
  return (
    <Suspense fallback={FallbackUI}>
      <TdpCallbackContent />
    </Suspense>
  );
}
