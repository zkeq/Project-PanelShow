
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Briefcase, MapPin, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileSection, updateProfileSection } from "@/lib/api";
import { StatusToast, type StatusToastState } from "@/components/admin/settings/StatusToast";

interface WorkExperienceItem {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  periodLabel: string;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const emptyExperience = (): WorkExperienceItem => ({
  id: createId(),
  position: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  responsibilities: "",
  periodLabel: "",
});

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const sanitizeMonthValue = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return MONTH_PATTERN.test(trimmed) ? trimmed : "";
};

const extractPeriod = (record: Record<string, unknown>): { start: string; end: string } => {
  const startFromFields = sanitizeMonthValue(record["startDate"]);
  const endFromFields = sanitizeMonthValue(record["endDate"]);

  if (startFromFields || endFromFields) {
    return { start: startFromFields, end: endFromFields };
  }

  const periodValue = typeof record["period"] === "string" ? record["period"].trim() : "";
  if (!periodValue) {
    return { start: "", end: "" };
  }

  const match = periodValue.match(/^(.*?)(?:\s+-\s+)(.+)$/);
  if (match) {
    const rawStart = match[1]?.trim() ?? "";
    const rawEnd = match[2]?.trim() ?? "";
    return {
      start: sanitizeMonthValue(rawStart),
      end: rawEnd === "至今" ? "" : sanitizeMonthValue(rawEnd),
    };
  }

  return { start: "", end: "" };
};

const joinPeriod = (start: string, end: string) => {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - 至今`;
  return end;
};

export function WorkExperience() {
  const { user, token } = useAuthStore();
  const effectiveUsername = user?.bound_username ?? "";
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([emptyExperience()]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<StatusToastState | null>(null);

  useEffect(() => {
    if (!statusBanner) return;
    const timer = window.setTimeout(() => {
      setStatusBanner(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [statusBanner]);

  const loadExperiences = useCallback(async () => {
    if (!token || !effectiveUsername) {
      setExperiences([emptyExperience()]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getProfileSection<unknown[]>(effectiveUsername, "experiences");
      const list = Array.isArray(response?.data) ? response.data : [];
      if (list.length === 0) {
        setExperiences([emptyExperience()]);
      } else {
        const mapped = list.map((item) => {
          if (typeof item !== "object" || item === null) {
            return emptyExperience();
          }
          const record = item as Record<string, unknown>;
          const { start, end } = extractPeriod(record);
          const periodLabel = typeof record["period"] === "string" ? record["period"].trim() : "";
          return {
            id: typeof record["id"] === "string" ? record["id"] : createId(),
            position: typeof record["title"] === "string" ? record["title"] : "",
            company: typeof record["company"] === "string" ? record["company"] : "",
            location: typeof record["location"] === "string" ? record["location"] : "",
            startDate: start,
            endDate: end,
            periodLabel,
            responsibilities: Array.isArray(record["responsibilities"])
              ? (record["responsibilities"] as unknown[])
                  .filter((line): line is string => typeof line === "string")
                  .join("\n")
              : typeof record["responsibilities"] === "string"
              ? (record["responsibilities"] as string)
              : "",
          } satisfies WorkExperienceItem;
        });
        setExperiences(mapped);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载工作经历失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [token, effectiveUsername]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleExperienceChange = (id: string, key: keyof WorkExperienceItem, value: string) => {
    setExperiences((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [key]: value } as WorkExperienceItem;
        if (key === "startDate" || key === "endDate") {
          const nextStart = key === "startDate" ? value : updated.startDate;
          const nextEnd = key === "endDate" ? value : updated.endDate;
          const normalizedStart = sanitizeMonthValue(nextStart);
          const normalizedEnd = sanitizeMonthValue(nextEnd);
          return {
            ...updated,
            periodLabel: joinPeriod(normalizedStart, normalizedEnd),
          };
        }
        return updated;
      })
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [...prev, emptyExperience()]);
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const handleSave = async () => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再保存" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = experiences.map((item) => {
        const responsibilities = item.responsibilities
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        const normalizedStartDate = sanitizeMonthValue(item.startDate);
        const normalizedEndDate = sanitizeMonthValue(item.endDate);
        const computedPeriod = joinPeriod(normalizedStartDate, normalizedEndDate);
        const persistedPeriod = computedPeriod || item.periodLabel || "";
        return {
          id: item.id,
          title: item.position,
          company: item.company,
          location: item.location,
          startDate: normalizedStartDate,
          endDate: normalizedEndDate,
          period: persistedPeriod,
          responsibilities,
        };
      });

      await updateProfileSection(effectiveUsername, "experiences", payload, token);
      setExperiences((prev) =>
        prev.map((item) => {
          const updated = payload.find((entry) => entry.id === item.id);
          if (!updated) return item;
          return {
            ...item,
            startDate: updated.startDate,
            endDate: updated.endDate,
            periodLabel: updated.period,
            responsibilities: updated.responsibilities.join("\n"),
          };
        })
      );
      setStatusBanner({ type: "success", message: "工作经历已保存" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存工作经历失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadExperiences();
  };

  const isReadonly = useMemo(() => !effectiveUsername, [effectiveUsername]);

  return (
    <div className="space-y-8">
      {statusBanner ? (
        <StatusToast status={statusBanner} onClose={() => setStatusBanner(null)} />
      ) : null}

      {experiences.map((exp, index) => (
        <Card key={exp.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                工作经历 #{index + 1}
              </CardTitle>
              {experiences.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isReadonly || isLoading || isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`position-${exp.id}`} className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  职位
                </Label>
                <Input
                  id={`position-${exp.id}`}
                  value={exp.position}
                  onChange={(event) => handleExperienceChange(exp.id, "position", event.target.value)}
                  placeholder="例如：高级开发工程师"
                  disabled={isReadonly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`company-${exp.id}`}>公司</Label>
                <Input
                  id={`company-${exp.id}`}
                  value={exp.company}
                  onChange={(event) => handleExperienceChange(exp.id, "company", event.target.value)}
                  placeholder="例如：科技公司"
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`location-${exp.id}`} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                工作地点
              </Label>
              <Input
                id={`location-${exp.id}`}
                value={exp.location}
                onChange={(event) => handleExperienceChange(exp.id, "location", event.target.value)}
                placeholder="例如：北京，中国"
                disabled={isReadonly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${exp.id}`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  开始时间
                </Label>
                <Input
                  id={`startDate-${exp.id}`}
                  type="month"
                  value={exp.startDate}
                  onChange={(event) => handleExperienceChange(exp.id, "startDate", event.target.value)}
                  disabled={isReadonly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${exp.id}`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  结束时间
                </Label>
                <Input
                  id={`endDate-${exp.id}`}
                  type="month"
                  value={exp.endDate}
                  onChange={(event) => handleExperienceChange(exp.id, "endDate", event.target.value)}
                  placeholder="至今"
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`responsibilities-${exp.id}`}>工作职责</Label>
              <Textarea
                id={`responsibilities-${exp.id}`}
                value={exp.responsibilities}
                onChange={(event) => handleExperienceChange(exp.id, "responsibilities", event.target.value)}
                placeholder="描述您的主要职责和成就，每行一条..."
                className="min-h-[120px]"
                disabled={isReadonly}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={addExperience}
            variant="outline"
            className="w-full border-dashed"
            disabled={isReadonly || isLoading || isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加工作经历
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving || isLoading}>
          重置更改
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving || isLoading || isReadonly}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          保存更改
        </Button>
      </div>

      {(!effectiveUsername || isLoading) && (
        <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {effectiveUsername ? "正在加载工作经历..." : "请先绑定用户名后管理工作经历"}
        </div>
      )}
    </div>
  );
}
