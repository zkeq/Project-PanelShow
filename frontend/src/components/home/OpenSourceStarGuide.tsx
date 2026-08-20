"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Github, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CNB_REPO_URL,
  GITHUB_REPO_API_URL,
  GITHUB_REPO_URL,
} from "@/constants/open-source";

const BANNER_DISMISS_KEY = "pps-star-banner-dismissed";

let cachedGithubStars: number | null = null;
let githubStarsRequest: Promise<number | null> | null = null;

function fetchGithubStarCount() {
  if (cachedGithubStars !== null) {
    return Promise.resolve(cachedGithubStars);
  }
  if (githubStarsRequest) {
    return githubStarsRequest;
  }

  githubStarsRequest = fetch(GITHUB_REPO_API_URL, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && typeof data.stargazers_count === "number") {
        cachedGithubStars = data.stargazers_count;
        return cachedGithubStars;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      githubStarsRequest = null;
    });

  return githubStarsRequest;
}

function useGithubStarCount() {
  const [count, setCount] = useState<number | null>(cachedGithubStars);

  useEffect(() => {
    let cancelled = false;
    fetchGithubStarCount().then((value) => {
      if (!cancelled && value !== null) {
        setCount(value);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}

function formatStarCount(count: number) {
  if (count >= 1000) {
    const value = count / 1000;
    const digits = count >= 10000 ? 0 : 1;
    return `${value.toFixed(digits).replace(/\.0$/, "")}k`;
  }
  return String(count);
}

function CnbMark({ className }: { className?: string }) {
  return (
    <img
      src="/cnb-favicon.png"
      alt=""
      width={24}
      height={24}
      className={className}
    />
  );
}

function StarCount({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
      {formatStarCount(count)}
    </span>
  );
}

export function OpenSourceHeaderMenu() {
  const githubStars = useGithubStarCount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2 sm:px-3">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          <span className="hidden sm:inline">Star</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>为开源点亮一颗星</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            <span className="flex-1">GitHub</span>
            {githubStars !== null && (
              <span className="text-muted-foreground text-xs">
                {formatStarCount(githubStars)}
              </span>
            )}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={CNB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <CnbMark className="h-4 w-4 rounded-sm" />
            <span className="flex-1">CNB</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OpenSourceMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
        onClick={onNavigate}
      >
        GitHub
      </a>
      <a
        href={CNB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
        onClick={onNavigate}
      >
        CNB
      </a>
    </>
  );
}

export function OpenSourceStarBanner() {
  const [visible, setVisible] = useState(true);
  const githubStars = useGithubStarCount();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(BANNER_DISMISS_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      // Safari 隐私模式可能无法访问 localStorage
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(BANNER_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden border-b bg-gradient-to-r from-amber-50 via-blue-50/70 to-purple-50 dark:from-amber-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container flex flex-col gap-3 py-3 pr-10 sm:flex-row sm:items-center sm:justify-between sm:py-2.5">
        <div className="flex items-start gap-2 text-sm sm:items-center">
          <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-500 sm:mt-0" />
          <p className="text-foreground/80">
            本项目已在 GitHub 与 CNB 开源。如果它对你有帮助，欢迎点个
            <span className="font-semibold text-foreground"> Star </span>
            支持一下——这是对开源作者最大的鼓励。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8">
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              GitHub
              <StarCount count={githubStars} />
            </a>
          </Button>
          <Button asChild size="sm" className="h-8">
            <a href={CNB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <CnbMark className="h-4 w-4 rounded-sm" />
              CNB Star
            </a>
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭 Star 引导"
        className="absolute top-2.5 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OpenSourceStarSection() {
  const githubStars = useGithubStarCount();

  return (
    <section id="open-source" className="py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-500" />
            开源共建
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            为开源点亮一颗星
          </h2>
          <p className="mt-4 text-muted-foreground">
            Project-PanelShow 已在 GitHub 与 CNB 双平台开源。一颗 Star
            能让更多开发者发现这个项目，也是对作者最直接的鼓励。
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
          <Card className="group relative overflow-hidden border bg-gradient-to-b from-slate-50/80 to-white transition-all duration-300 hover:shadow-lg dark:from-slate-900/40 dark:to-background">
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors duration-300 group-hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:group-hover:bg-white">
                <Github className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">GitHub</CardTitle>
                <StarCount count={githubStars} />
              </div>
              <CardDescription>面向全球开发者的源码仓库</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                浏览完整源码、提交 Issue、发起 Pull Request。国际社区协作首选，
                欢迎 Watch 与 Fork。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                  MIT License
                </span>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
                  Issues / PR
                </span>
              </div>
              <Button asChild className="w-full">
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  前往 GitHub 点 Star
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border bg-gradient-to-b from-orange-50/50 to-white transition-all duration-300 hover:shadow-lg dark:from-orange-950/20 dark:to-background">
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 transition-colors duration-300 group-hover:bg-orange-200 dark:bg-orange-900/30 dark:group-hover:bg-orange-900/50">
                <CnbMark className="h-7 w-7" />
              </div>
              <CardTitle className="text-lg font-semibold">CNB</CardTitle>
              <CardDescription>腾讯云 Cloud Native Build 国内镜像</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                国内访问更快的开源镜像。适合克隆、阅读文档与参与讨论，
                也可以直接给项目点亮一颗星。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
                  国内镜像
                </span>
                <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
                  腾讯云
                </span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <a href={CNB_REPO_URL} target="_blank" rel="noopener noreferrer">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  前往 CNB 点 Star
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
