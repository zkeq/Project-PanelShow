"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { IconPicker } from "@/components/admin/IconPicker";
import { Plus, Trash2, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileSection, updateProfileSection } from "@/lib/api";
import { StatusToast, type StatusToastState } from "@/components/admin/settings/StatusToast";

interface SkillItemForm {
  id: string;
  label: string;
  icon: string;
}

interface SkillCategoryForm {
  id: string;
  title: string;
  icon: string;
  items: SkillItemForm[];
}

interface AboutFormState {
  aboutSubtitle: string;
  bio: string;
  skillCategories: SkillCategoryForm[];
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const defaultSubtitle = "了解我的技能、兴趣和职业目标";

const getDefaultIconForCategory = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("front") || title.includes("前端")) {
    return "lucide:laptop";
  }
  if (normalized.includes("back") || title.includes("后端")) {
    return "lucide:server";
  }
  if (normalized.includes("design") || title.includes("设计")) {
    return "lucide:palette";
  }
  return "lucide:sparkles";
};

const createEmptyCategory = (): SkillCategoryForm => ({
  id: createId(),
  title: "新的技能类别",
  icon: "lucide:sparkles",
  items: [
    {
      id: createId(),
      label: "",
      icon: "",
    },
  ],
});

const defaultAboutForm: AboutFormState = {
  aboutSubtitle: defaultSubtitle,
  bio: "",
  skillCategories: [
    {
      id: "frontend",
      title: "前端开发",
      icon: "lucide:laptop",
      items: [
        { id: createId(), label: "React / Vue.js", icon: "logos:react" },
        { id: createId(), label: "Next.js / Nuxt.js", icon: "logos:nextjs-icon" },
        { id: createId(), label: "TypeScript", icon: "logos:typescript-icon" },
        { id: createId(), label: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
      ],
    },
    {
      id: "backend",
      title: "后端开发",
      icon: "lucide:server",
      items: [
        { id: createId(), label: "Python / Go", icon: "logos:python" },
        { id: createId(), label: "Django / FastAPI", icon: "logos:django" },
        { id: createId(), label: "PostgreSQL / Redis", icon: "logos:postgresql" },
        { id: createId(), label: "Docker / Kubernetes", icon: "logos:docker-icon" },
      ],
    },
  ],
};

export function AboutMe() {
  const { user, token } = useAuthStore();
  const effectiveUsername = user?.bound_username ?? "";

  const [form, setForm] = useState<AboutFormState>(defaultAboutForm);
  const [rawProfile, setRawProfile] = useState<Record<string, unknown>>({});
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

  const normalizeSkillCategories = useCallback((value: unknown): SkillCategoryForm[] => {
    if (Array.isArray(value)) {
      return value.map((category, categoryIndex) => {
        if (typeof category !== "object" || category === null) {
          return createEmptyCategory();
        }
        const record = category as Record<string, unknown>;
        const rawItems = Array.isArray(record["items"]) ? (record["items"] as unknown[]) : [];
        return {
          id: typeof record["id"] === "string" ? record["id"] : createId(),
          title:
            typeof record["title"] === "string" && record["title"].trim().length > 0
              ? (record["title"] as string)
              : `技能类别 ${categoryIndex + 1}`,
          icon:
            typeof record["icon"] === "string" && record["icon"].trim().length > 0
              ? (record["icon"] as string)
              : getDefaultIconForCategory(
                  typeof record["title"] === "string" ? (record["title"] as string) : `技能类别 ${categoryIndex + 1}`
                ),
          items: rawItems.map((item, itemIndex) => {
            if (typeof item !== "object" || item === null) {
              return { id: createId(), label: "", icon: "" };
            }
            const itemRecord = item as Record<string, unknown>;
            return {
              id: typeof itemRecord["id"] === "string" ? itemRecord["id"] : createId(),
              label:
                typeof itemRecord["label"] === "string" && itemRecord["label"].trim().length > 0
                  ? (itemRecord["label"] as string)
                  : `技能 ${itemIndex + 1}`,
              icon: typeof itemRecord["icon"] === "string" ? itemRecord["icon"] : "",
            } satisfies SkillItemForm;
          }),
        } satisfies SkillCategoryForm;
      });
    }

    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>).map(([key, val]) => {
        const label = key.trim();
        const items = Array.isArray(val)
          ? val.map((entry, entryIndex) =>
              typeof entry === "string"
                ? ({ id: createId(), label: entry, icon: "" } satisfies SkillItemForm)
                : typeof entry === "object" && entry !== null
                ? ({
                    id: typeof (entry as Record<string, unknown>)["id"] === "string"
                      ? (entry as Record<string, unknown>)["id"] as string
                      : createId(),
                    label:
                      typeof (entry as Record<string, unknown>)["label"] === "string"
                        ? ((entry as Record<string, unknown>)["label"] as string)
                        : `技能 ${entryIndex + 1}`,
                    icon:
                      typeof (entry as Record<string, unknown>)["icon"] === "string"
                        ? ((entry as Record<string, unknown>)["icon"] as string)
                        : "",
                  } satisfies SkillItemForm)
                : ({ id: createId(), label: `技能 ${entryIndex + 1}`, icon: "" } satisfies SkillItemForm)
            )
          : [];
        return {
          id: key,
          title: label || "未命名类别",
          icon: getDefaultIconForCategory(label || key),
          items,
        } satisfies SkillCategoryForm;
      });
    }

    return [];
  }, []);

  const loadAboutSettings = useCallback(async () => {
    if (!token || !effectiveUsername) {
      setForm(defaultAboutForm);
      setRawProfile({});
      return;
    }

    setIsLoading(true);
    try {
      const response = await getProfileSection<Record<string, unknown>>(effectiveUsername, "profile");
      const profileData = (response?.data && typeof response.data === "object") ? response.data : {};
      setRawProfile(profileData);

      const aboutSubtitle = typeof profileData["aboutSubtitle"] === "string" && profileData["aboutSubtitle"].trim().length
        ? (profileData["aboutSubtitle"] as string)
        : defaultSubtitle;

      const bio = typeof profileData["bio"] === "string" ? (profileData["bio"] as string) : "";

      const skillCategories = normalizeSkillCategories(profileData["skills"]);
      const preparedCategories = skillCategories.length ? skillCategories : defaultAboutForm.skillCategories;

      setForm({
        aboutSubtitle,
        bio,
        skillCategories: preparedCategories.map((category) => ({
          ...category,
          items: category.items.length
            ? category.items
            : [{ id: createId(), label: "", icon: "" }],
        })),
      });
      setStatusBanner(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载关于我信息失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUsername, token, normalizeSkillCategories]);

  useEffect(() => {
    loadAboutSettings();
  }, [loadAboutSettings]);

  const isReadonly = useMemo(() => !effectiveUsername, [effectiveUsername]);

  const updateCategoryField = (id: string, key: "title" | "icon", value: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.map((category) =>
        category.id === id
          ? { ...category, [key]: value }
          : category
      ),
    }));
  };

  const addCategory = () => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      skillCategories: [...prev.skillCategories, createEmptyCategory()],
    }));
  };

  const removeCategory = (id: string) => {
    if (isReadonly) return;
    setForm((prev) => {
      if (prev.skillCategories.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        skillCategories: prev.skillCategories.filter((category) => category.id !== id),
      };
    });
  };

  const addSkillItem = (categoryId: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [...category.items, { id: createId(), label: "", icon: "" }],
            }
          : category
      ),
    }));
  };

  const updateSkillItem = (
    categoryId: string,
    itemId: string,
    key: "label" | "icon",
    value: string
  ) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          items: category.items.map((item) =>
            item.id === itemId ? { ...item, [key]: value } : item
          ),
        };
      }),
    }));
  };

  const removeSkillItem = (categoryId: string, itemId: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.map((category) => {
        if (category.id !== categoryId) return category;
        if (category.items.length <= 1) return category;
        return {
          ...category,
          items: category.items.filter((item) => item.id !== itemId),
        };
      }),
    }));
  };

  const handleSave = async () => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再保存" });
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedCategories = form.skillCategories.map((category) => {
        const sanitizedItems = category.items
          .map((item) => ({
            id: item.id,
            label: item.label.trim(),
            icon: item.icon.trim(),
          }))
          .filter((item) => item.label.length > 0);

        return {
          id: category.id,
          title: category.title.trim() || "未命名类别",
          icon: category.icon.trim(),
          items: sanitizedItems,
        };
      });

      const updatedProfile = {
        ...rawProfile,
        aboutSubtitle: form.aboutSubtitle.trim() || defaultSubtitle,
        bio: form.bio,
        skills: sanitizedCategories,
        updatedAt: new Date().toISOString(),
      };

      await updateProfileSection(effectiveUsername, "profile", updatedProfile, token);

      setRawProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        skillCategories: sanitizedCategories.map((category) => ({
          ...category,
          items: category.items.length
            ? category.items.map((item) => ({ ...item, icon: item.icon }))
            : [{ id: createId(), label: "", icon: "" }],
        })),
      }));

      setStatusBanner({ type: "success", message: "关于我信息已保存" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存关于我信息失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadAboutSettings();
  };

  return (
    <div className="space-y-8">
      {statusBanner ? (
        <StatusToast status={statusBanner} onClose={() => setStatusBanner(null)} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            关于我简介
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="about-subtitle">页面副标题</Label>
            <Input
              id="about-subtitle"
              value={form.aboutSubtitle}
              onChange={(event) => setForm((prev) => ({ ...prev, aboutSubtitle: event.target.value }))}
              placeholder={defaultSubtitle}
              disabled={isReadonly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about-bio">个人简介</Label>
            <Textarea
              id="about-bio"
              value={form.bio}
              onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
              placeholder="介绍您的经历、热情和职业目标..."
              className="min-h-[180px]"
              disabled={isReadonly}
            />
            <p className="text-xs text-muted-foreground">支持换行，展示在关于我页的“个人简介”部分。</p>
          </div>
        </CardContent>
      </Card>

      {form.skillCategories.map((category, categoryIndex) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {category.icon ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon icon={category.icon} className="h-4 w-4" />
                  </span>
                ) : null}
                技能类别 #{categoryIndex + 1}
              </CardTitle>
              {form.skillCategories.length > 1 && !isReadonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <Label htmlFor={`skill-title-${category.id}`}>类别名称</Label>
                <Input
                  id={`skill-title-${category.id}`}
                  value={category.title}
                  onChange={(event) => updateCategoryField(category.id, "title", event.target.value)}
                  placeholder="例如：前端开发"
                  disabled={isReadonly}
                />
              </div>
              <IconPicker
                label="类别图标"
                value={category.icon}
                onChange={(value) => updateCategoryField(category.id, "icon", value)}
              />
            </div>

            <div className="space-y-4">
              <div className="font-medium text-sm text-muted-foreground">技能清单</div>
              {category.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[3fr_2fr_auto] gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`skill-label-${item.id}`}>技能名称</Label>
                    <Input
                      id={`skill-label-${item.id}`}
                      value={item.label}
                      onChange={(event) => updateSkillItem(category.id, item.id, "label", event.target.value)}
                      placeholder="例如：React / Vue.js"
                      disabled={isReadonly}
                    />
                  </div>
                  <div className="space-y-2">
                    <IconPicker
                      label="技能图标"
                      value={item.icon}
                      onChange={(value) => updateSkillItem(category.id, item.id, "icon", value)}
                    />
                  </div>
                  {!isReadonly && category.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillItem(category.id, item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      移除
                    </Button>
                  )}
                </div>
              ))}

              {!isReadonly && (
                <Button
                  onClick={() => addSkillItem(category.id)}
                  variant="outline"
                  size="sm"
                  className="border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加技能
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {!isReadonly && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={addCategory} variant="outline" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              添加技能类别
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving || isLoading}>
          重置更改
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving || isLoading || isReadonly}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          保存更改
        </Button>
      </div>

      {(isLoading || !effectiveUsername) && (
        <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {effectiveUsername ? "正在加载关于我信息..." : "请先完成用户名绑定以配置关于我页面"}
        </div>
      )}
    </div>
  );
}
