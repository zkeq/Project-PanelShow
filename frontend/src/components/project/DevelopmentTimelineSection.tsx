"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TimelineCard from "@/components/TimelineCard";
import { TimelineItem } from "@/types/timeline";
import { Calendar, ChevronDown, ChevronUp, Activity } from "lucide-react";

interface DevelopmentTimelineSectionProps {
  projectId: string;
  username: string;
  initialTimelineItems?: TimelineItem[];
}

export default function DevelopmentTimelineSection({
  projectId,
  username,
  initialTimelineItems,
}: DevelopmentTimelineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(Array.isArray(initialTimelineItems) ? initialTimelineItems : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimelineItems(Array.isArray(initialTimelineItems) ? initialTimelineItems : []);
    setLoading(false);
  }, [initialTimelineItems, projectId, username]);

  // 计算显示的动态数量
  const displayCount = isExpanded ? timelineItems.length : Math.min(timelineItems.length, 2);
  const displayItems = timelineItems.slice(0, displayCount);
  const hasMore = timelineItems.length > 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">开发周期介绍</h2>
            <p className="text-sm text-muted-foreground">
              项目开发过程中的重要更新和里程碑
            </p>
          </div>
        </div>
        
        {/* 动态统计徽章 */}
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {timelineItems.length} 个动态
        </Badge>
      </div>

      <Card className="border-0 shadow-none bg-transparent pt-0">
        <CardContent className="p-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              // 加载状态
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : timelineItems.length === 0 ? (
              // 空状态
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">暂无开发动态</h3>
                <p className="text-muted-foreground">
                  该项目还没有发布开发动态
                </p>
              </div>
            ) : (
              // 动态列表
              <div className="space-y-6">
                {displayItems.map((item) => (
                  <div key={item.id}>
                    <TimelineCard item={item} />
                  </div>
                ))}

                {/* 展开/收起按钮 */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          收起动态
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          查看更多动态 ({timelineItems.length - 2} 条)
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* 查看全部动态链接 */}
                {timelineItems.length > 0 && (
                  <div className="text-center pt-4 border-t">
                    <Button variant="link" size="sm" asChild>
                      <a href={`/project/${username}`} className="text-primary hover:underline">
                        前往全部动态页面查看更多 →
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}