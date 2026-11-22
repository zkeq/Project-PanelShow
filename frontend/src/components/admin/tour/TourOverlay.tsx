"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTourStore } from "./useTourStore";

const chapters = [
  {
    title: "控制台",
    route: "/admin",
    sections: [
      ["公开站点地址", "顶部的站点地址是访客看到的作品集。打开它可以确认项目发布后的展示效果。"],
      ["项目统计", "统计区显示你的项目数和近期动态。下方可以搜索、排序和编辑作品。"],
    ],
  },
  {
    title: "站点资料",
    route: "/admin/settings",
    sections: [
      ["基本信息", "设置作品集标题、头像和个人简介，让访客知道你是谁。"],
      ["经历与联系方式", "按需要补充工作经历、技术栈和公开联系方式。"],
    ],
  },
  {
    title: "新建作品",
    route: "/admin/projects/create",
    sections: [
      ["作品内容", "填写名称、一句话简介和正文，给关键流程配上真实截图和亮点。"],
      ["提交发布", "核对界面、演示和源码地址，再保存草稿或发布到公开站点。"],
    ],
  },
  {
    title: "Agent 发布",
    route: "/admin/agent",
    sections: [
      ["复制发布提示词", "生成一把短期发布密钥，把完整提示词交给能访问项目仓库的 Agent。"],
      ["查看发布结果", "Agent 会分析代码、上传素材并提交作品。返回这个页面查看公开链接。"],
    ],
  },
  {
    title: "发布动态",
    route: "/admin/dynamic",
    sections: [
      ["关联项目", "选择已有作品，记录一次功能更新、修复或发布里程碑。"],
      ["查看时间线", "发布后，访客可以从你的作品详情和公开时间线看到项目进展。"],
    ],
  },
];

const steps = chapters.flatMap((chapter) =>
  chapter.sections.map(([label, description]) => ({ chapter, label, description })),
);

function TourContent({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const { chapter, label, description } = steps[index];
  const last = index === steps.length - 1;

  return (
    <DialogContent
      className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
        if (event.key === "ArrowRight") setIndex((value) => Math.min(steps.length - 1, value + 1));
      }}
    >
      <DialogTitle>后台互动引导</DialogTitle>
      <DialogDescription className="sr-only">了解控制台、作品发布和项目动态。</DialogDescription>
      <nav aria-label="引导章节" className="flex flex-wrap gap-2">
        {chapters.map((item) => (
          <Button
            key={item.route}
            type="button"
            variant={item === chapter ? "secondary" : "ghost"}
            size="sm"
            aria-current={item === chapter ? "step" : undefined}
            onClick={() => setIndex(steps.findIndex((step) => step.chapter === item))}
          >
            {item.title}
          </Button>
        ))}
      </nav>
      <div className="space-y-3 rounded-xl border bg-muted/25 p-4">
        {chapter.sections.map(([name]) => {
          const selected = name === label;
          const Icon = selected ? CheckCircle2 : Circle;
          return (
            <div key={name} className={cn(
              "flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm",
              selected && "border-primary/40 bg-primary/5 font-medium text-primary",
            )}>
              <Icon aria-hidden="true" className="size-4" />
              {name}
            </div>
          );
        })}
      </div>
      <p aria-live="polite" className="min-h-10 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={chapter.route} prefetch={false} onClick={onClose}>
            前往此页面 <ExternalLink aria-hidden="true" />
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <ArrowLeft aria-hidden="true" /> 上一步
          </Button>
          <Button size="sm" onClick={() => last ? onClose() : setIndex(index + 1)}>
            {last ? "完成" : <>下一步 <ArrowRight aria-hidden="true" /></>}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export function TourOverlay() {
  const active = useTourStore((state) => state.active);
  const close = useTourStore((state) => state.close);
  return (
    <Dialog open={active} onOpenChange={(open) => { if (!open) close(); }}>
      {active && <TourContent onClose={close} />}
    </Dialog>
  );
}
