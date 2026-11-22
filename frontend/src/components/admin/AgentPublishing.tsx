"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import styles from "./AgentPublishing.module.css";

const keyStatusLabels = {
  ready: "可用",
  published: "已使用",
  expired: "已过期",
  revoked: "已撤销",
};
const schemaUrl = `${API_BASE_URL.replace(/\/+$/, "")}/api/agent/v1/schema`;

const colors = ["#f59e0b", "#f472b6", "#38bdf8", "#34d399", "#a78bfa"];
const sparks = Array.from({ length: 24 }, (_, index) => {
  const group = Math.floor(index / 8);
  const angle = (index % 8) * Math.PI / 4 + group * .27;
  const distance = index % 2 ? 42 : 61;
  const start = (group - 1) * 24;
  return {
    "--spark-start": `${start}px`,
    "--spark-x": `${start + Math.cos(angle) * distance}px`,
    "--spark-y": `${Math.sin(angle) * distance}px`,
    "--spark-color": colors[index % colors.length],
    "--spark-delay": `${group * 40}ms`,
  } as CSSProperties;
});

function CopyFirework() {
  return (
    <span aria-hidden="true" data-copy-firework className={styles.firework}>
      {sparks.map((style, index) => <span key={index} className={styles.spark} style={style} />)}
    </span>
  );
}

type CopyTarget = "key" | "prompt";

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
  const keyFieldId = useId();
  const promptFieldId = useId();
  const keyInput = useRef<HTMLInputElement>(null);
  const promptInput = useRef<HTMLTextAreaElement>(null);
  const copyAttempt = useRef(0);
  const [site, setSite] = useState("");
  const [secret, setSecret] = useState<{ id: string; value: string }>();
  const [activeKey, setActiveKey] = useState<AgentKey>();
  const [pending, setPending] = useState<"generate" | "revoke" | "dismiss">();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<{ target: CopyTarget; attempt: number }>();
  const activeKeyId = activeKey?.id;
  const keyStatus = activeKey?.status;
  const keyValue = secret?.id === activeKeyId && keyStatus === "ready" ? secret?.value ?? "" : "";

  function formatPrompt(targetSite: string, key: string) {
    return agentPublishPrompt({
      apiOrigin: new URL(API_BASE_URL || window.location.origin, window.location.origin).origin,
      key,
      site: targetSite,
      projectId,
    });
  }

  const prompt = site ? formatPrompt(site, keyValue || "〈生成发布密钥后自动填入〉") : "";

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        const { keys, site } = await fetchAgentKeys(token, controller.signal);
        if (controller.signal.aborted) return;
        setSite(site);
        const key = activeKeyId
          ? keys.find((item) => item.id === activeKeyId)
          : keys.find((item) => item.project_id === projectId);
        setActiveKey(key);
        if (key?.status !== "ready") setSecret(undefined);
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

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(undefined), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy(target: CopyTarget, text: string) {
    const attempt = ++copyAttempt.current;
    const field = target === "prompt" ? promptInput.current : keyInput.current;
    try {
      const copiedByBrowser = await navigator.clipboard?.writeText(text).then(() => true, () => false);
      if (attempt !== copyAttempt.current) return;
      if (!copiedByBrowser) {
        if (field?.value !== text) throw new Error("Clipboard unavailable");
        field.focus();
        field.select();
        if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
      }
      setCopied({ target, attempt });
      setMessage(target === "prompt" ? "提示词已复制，粘贴给 Agent 即可。" : "发布密钥已复制。");
    } catch {
      if (attempt !== copyAttempt.current) return;
      setCopied(undefined);
      field?.focus();
      field?.select();
      setMessage(target === "prompt" ? "请从提示词输入框手动复制。" : "请从密钥输入框手动复制。");
    }
  }

  async function generate() {
    setPending("generate");
    copyAttempt.current += 1;
    setError("");
    setMessage("");
    setCopied(undefined);
    try {
      const key = await issueAgentKey(token, projectId);
      setSite(key.site);
      setActiveKey({
        id: key.id,
        project_id: projectId,
        expires_at: key.expires_at,
        status: "ready",
        result: null,
      });
      setSecret({ id: key.id, value: key.token });
      if (onboarding) await copy("prompt", formatPrompt(key.site, key.token));
      else setMessage("发布密钥已生成，可以复制提示词。");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(undefined);
    }
  }

  async function revoke() {
    if (!activeKey) return;
    setPending("revoke");
    setError("");
    try {
      await revokeAgentKey(token, activeKey.id);
      copyAttempt.current += 1;
      setActiveKey({ ...activeKey, status: "revoked" });
      setSecret(undefined);
      setCopied(undefined);
      setMessage("发布密钥已撤销。");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(undefined);
    }
  }

  async function dismiss() {
    setPending("dismiss");
    setError("");
    try {
      await dismissAgentOnboarding(token);
      onDismiss?.();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(undefined);
    }
  }

  const publication = activeKey?.result;
  const keyReady = keyStatus === "ready";
  const generateLabel = keyReady ? "重新生成" : "生成密钥";

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
      <CardContent className="space-y-6">
        <section className="space-y-3 rounded-xl border bg-muted/30 p-4" aria-labelledby={keyFieldId + "-label"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label id={keyFieldId + "-label"} htmlFor={keyFieldId}>发布密钥（SK）</Label>
              <Badge variant={keyReady ? "secondary" : "outline"}>
                {keyStatus ? keyStatusLabels[keyStatus] : "待生成"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {keyReady && (
                <Button variant="ghost" size="sm" onClick={() => void revoke()} disabled={!!pending}>撤销密钥</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => void generate()} disabled={!!pending}>
                {pending === "generate" ? <Loader2 className="animate-spin" /> : <KeyRound aria-hidden="true" />}
                {onboarding ? generateLabel + "并复制提示词" : generateLabel}
              </Button>
              {onboarding && !activeKey && (
                <Button variant="ghost" size="sm" onClick={() => void dismiss()} disabled={!!pending}>稍后再说</Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2" data-clarity-mask="true">
            <Input
              ref={keyInput}
              id={keyFieldId}
              className="min-w-0 bg-background font-mono text-xs"
              value={keyValue}
              placeholder={keyReady ? "密钥明文仅在生成时显示" : "生成后在此显示密钥"}
              autoComplete="off"
              spellCheck={false}
              readOnly
            />
            <Button
              className="relative"
              variant="outline"
              size="sm"
              disabled={!keyValue || !!pending}
              onClick={() => void copy("key", keyValue)}
            >
              {copied?.target === "key" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied?.target === "key" ? "已复制" : "复制 SK"}
              {copied?.target === "key" && <CopyFirework key={copied.attempt} />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            这把密钥可上传图片，并{projectId ? "更新这个作品" : "发布一个作品"}。
            {keyReady && activeKey
              ? `本次有效至 ${new Date(activeKey.expires_at * 1000).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}。`
              : "生成后有效期为 1 小时。"}
            {keyReady && !keyValue && "如需查看或复制明文，请重新生成。"}
          </p>
        </section>
        {(!onboarding || keyValue) && <section className="space-y-3" aria-labelledby={promptFieldId + "-label"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label id={promptFieldId + "-label"} htmlFor={promptFieldId}>Agent 提示词</Label>
              <a className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
                href={schemaUrl} target="_blank" rel="noreferrer">
                字段与图标规范 <ArrowUpRight aria-hidden="true" className="size-3" />
              </a>
            </div>
            <Button
              className="relative"
              disabled={!keyValue || !!pending}
              onClick={() => void copy("prompt", prompt)}
            >
              {copied?.target === "prompt" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied?.target === "prompt" ? "提示词已复制" : "复制提示词"}
              {copied?.target === "prompt" && <CopyFirework key={copied.attempt} />}
            </Button>
          </div>
          <Textarea
            ref={promptInput}
            id={promptFieldId}
            className="field-sizing-fixed min-h-[20rem] resize-y font-mono text-sm leading-relaxed"
            data-clarity-mask="true"
            value={prompt}
            placeholder="正在准备提示词…"
            rows={14}
            autoComplete="off"
            spellCheck={false}
            readOnly
          />
        </section>}
        <p role="status" className="min-h-5 text-sm text-muted-foreground">{message}</p>
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
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      {token && <AgentPublishing key={projectId ?? "create"} token={token} projectId={projectId} />}
    </div>
  );
}
