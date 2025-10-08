"use client";

import TimelineCard from "@/components/TimelineCard";
import { TimelineItem } from "@/types/timeline";
import { Layers } from "lucide-react";

interface TimelineContentProps {
  timelineItems: TimelineItem[];
  title: string;
  description: string;
  authorAvatar?: string;
  authorName?: string;
}

export default function TimelineContent({
  timelineItems,
  title,
  description,
  authorAvatar,
  authorName,
}: TimelineContentProps) {
  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto">
      {/* 时间线标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* 时间线卡片列表 - 左对齐宽屏布局 */}
      <div className="w-full max-w-none space-y-6">
        {timelineItems.map((item) => (
          <div key={item.id} className="">
            <TimelineCard item={item} authorAvatar={authorAvatar} authorName={authorName} />
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {timelineItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
            <Layers className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">暂无动态</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            还没有发布任何项目动态
          </p>
        </div>
      )}
    </div>
  );
}
