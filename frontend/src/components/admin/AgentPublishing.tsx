"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Copy, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { agentPublishPrompt } from "@/constants/agentPublishPrompt";
import {
  API_BASE_URL,
  type AgentKey,
  dismissAgentOnboarding,
  fetchAgentKeys,
  fetchAgentOnboarding,
  issueAgentKey,
  revokeAgentKey,
} from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作失败，请重试";
}

export function AgentPublishing({
  token,
  projectId = null,
  onboarding = false,
  onDismiss,
}: {
  token: string;
  projectId?: string | null;
  onboarding?: boolean;
  onDismiss?: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [activeKey, setActiveKey] = useState<AgentKey>();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const activeKeyId = activeKey?.id;
  const keyStatus = activeKey?.status;

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        const { keys } = await fetchAgentKeys(token, controller.signal);
        if (controller.signal.aborted) return;
        const key = activeKeyId
          ? keys.find((item) => item.id === activeKeyId)
          : keys.find((item) => item.project_id === projectId);
        setActiveKey(key);
        if (key && key.status !== "ready") setPrompt("");
        if (key?.status === "ready") timer = setTimeout(check, 4000);
      } catch {
        if (!controller.signal.aborted && keyStatus === "ready") timer = setTimeout(check, 6000);
      }
    }

    void check();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [token, projectId, activeKeyId, keyStatus]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("已复制提示词，可以粘贴给 Agent。");
    } catch {
      setShowPrompt(true);
      setMessage("请从下方文本框手动复制提示词。");
    }
  }

  async function generate() {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const key = await issueAgentKey(token, projectId);
      const text = agentPublishPrompt({
        apiOrigin: new URL(API_BASE_URL || window.location.origin, window.location.origin).origin,
        key: key.token,
        site: key.site,
        projectId,
      });
      setActiveKey({
        id: key.id,
        project_id: projectId,
        expires_at: key.expires_at,
        status: "ready",
        result: null,
      });
      setShowPrompt(false);
      setPrompt(text);
      await copy(text);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  async function revoke() {
    if (!activeKey) return;
    setPending(true);
    setError("");
    try {
      await revokeAgentKey(token, activeKey.id);
      setActiveKey({ ...activeKey, status: "revoked" });
      setPrompt("");
      setMessage("发布密钥已撤销。");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  async function dismiss() {
    setPending(true);
    setError("");
    try {
      await dismissAgentOnboarding(token);
      onDismiss?.();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  const publication = activeKey?.result;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot aria-hidden="true" className="size-5 text-primary" />
          {onboarding ? "用 Agent 发布第一个作品" : projectId ? "用 Agent 更新此作品" : "用 Agent 发布作品"}
        </CardTitle>
        <CardDescription>
          把提示词粘贴给能访问项目仓库的 Agent。它会整理介绍和截图，并提交到你的作品集。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void generate()} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound aria-hidden="true" />}
            {activeKey?.status === "ready" ? "换一把密钥并复制" : "生成并复制提示词"}
          </Button>
          {prompt && (
            <>
              <Button variant="outline" onClick={() => void copy(prompt)}>
                <Copy aria-hidden="true" /> 复制提示词
              </Button>
              <Button variant="ghost" onClick={() => setShowPrompt((visible) => !visible)}>
                {showPrompt ? "隐藏提示词" : "查看提示词"}
              </Button>
            </>
          )}
          {activeKey?.status === "ready" && (
            <Button variant="ghost" onClick={() => void revoke()} disabled={pending}>撤销密钥</Button>
          )}
          {onboarding && !activeKey && (
            <Button variant="ghost" onClick={() => void dismiss()} disabled={pending}>稍后再说</Button>
          )}
        </div>
        {prompt && showPrompt && (
          <Textarea
            aria-label="含发布密钥的 Agent 提示词"
            className="min-h-40 font-mono text-xs"
            data-clarity-mask="true"
            value={prompt}
            autoComplete="off"
            spellCheck={false}
            readOnly
          />
        )}
        {activeKey?.status === "ready" && (
          <p className="text-sm text-muted-foreground">
            等待 Agent 提交。密钥单次有效，过期时间为 {new Date(activeKey.expires_at * 1000).toLocaleTimeString()}。
          </p>
        )}
        {activeKey?.status === "expired" && <p className="text-sm text-muted-foreground">发布密钥已过期，可以生成新的密钥。</p>}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {publication && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <p role="status" className="text-sm font-medium">作品已{publication.operation === "create" ? "发布" : "更新"}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={publication.url} target="_blank" rel="noreferrer">查看公开作品 <ArrowUpRight aria-hidden="true" /></a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/admin/projects/${encodeURIComponent(publication.project_id)}/edit`}>编辑作品</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AgentOnboardingCard({ token }: { token: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetchAgentOnboarding(token, controller.signal)
      .then((result) => setShow(result.show))
      .catch(() => {});
    return () => controller.abort();
  }, [token]);

  return show ? <AgentPublishing token={token} onboarding onDismiss={() => setShow(false)} /> : null;
}

export function AgentPublishingPage({ projectId }: { projectId: string | null }) {
  const token = useAuthStore((state) => state.token);
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      {token && <AgentPublishing key={projectId ?? "create"} token={token} projectId={projectId} />}
    </div>
  );
}
