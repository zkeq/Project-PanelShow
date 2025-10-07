"use client";

import { type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type StatusType = "success" | "error" | "info";

export interface StatusToastState {
  type: StatusType;
  message: string;
}

interface StatusToastProps {
  status: StatusToastState;
  onClose: () => void;
  action?: ReactNode;
}

const containerStyles: Record<StatusType, string> = {
  success: "bg-white/92 text-emerald-900 border border-emerald-300/70",
  error: "bg-white/92 text-destructive border border-destructive/60",
  info: "bg-white/92 text-foreground border border-border/60",
};

const accentStyles: Record<StatusType, string> = {
  success: "bg-emerald-500/15 text-emerald-600",
  error: "bg-destructive/15 text-destructive",
  info: "bg-primary/10 text-primary",
};

const iconMap: Record<StatusType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function StatusToast({ status, onClose, action }: StatusToastProps) {
  const Icon = iconMap[status.type];

  return (
    <div className="fixed bottom-8 right-8 z-50 w-[380px] animate-in fade-in slide-in-from-bottom-5">
      <div
        role="status"
        className={`relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl backdrop-blur-xl transition-all ${containerStyles[status.type]}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_rgba(255,255,255,0))] pointer-events-none" />

        <div className="flex items-start gap-4 px-6 py-5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm ${accentStyles[status.type]}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed">{status.message}</p>
            {action}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="关闭通知"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
