"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Mail, Heart, Link2, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileSection, updateProfileSection } from "@/lib/api";
import { IconPicker } from "@/components/admin/IconPicker";
import { StatusToast, type StatusToastState } from "@/components/admin/settings/StatusToast";

interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface ContactMethod {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface ContactFormState {
  contactMethods: ContactMethod[];
  hobbies: string[];
  socialLinks: SocialLinkItem[];
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const DEFAULT_CONTACT_METHODS: ContactMethod[] = [
  { id: "email", label: "邮箱", value: "", icon: "lucide:mail" },
  { id: "github", label: "GitHub", value: "", icon: "simple-icons:github" },
  { id: "website", label: "个人网站", value: "", icon: "lucide:globe" },
  { id: "city", label: "所在城市", value: "", icon: "lucide:map-pin" },
];

const createDefaultSocialLinks = (): SocialLinkItem[] => [
  { id: createId(), name: "GitHub", url: "", icon: "simple-icons:github" },
];

const sanitizeIconValue = (value: unknown): string => {
  if (typeof value !== "string") return "lucide:link";
  const trimmed = value.trim();
  return trimmed.length ? trimmed : "lucide:link";
};

const ensureGithubUrl = (value: string): string => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://github.com/${value.replace(/^\/+/, "")}`;
};

const extractGithubUsername = (value: string): string | null => {
  if (!value) return null;
  try {
    const url = value.startsWith("http://") || value.startsWith("https://")
      ? new URL(value)
      : new URL(`https://github.com/${value.replace(/^@/, "").replace(/^\/+/, "")}`);
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes("github")) {
      return null;
    }
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[0] ?? null;
  } catch {
    if (!value.includes("://")) {
      return value.replace(/^@/, "");
    }
    return null;
  }
};

const parseContactMethods = (value: unknown): ContactMethod[] => {
  if (!Array.isArray(value)) {
    return DEFAULT_CONTACT_METHODS.map((method) => ({ ...method }));
  }

  const sanitized = value
    .map((item, index) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const record = item as Record<string, unknown>;
      const id = typeof record["id"] === "string" && record["id"].trim().length
        ? record["id"].trim()
        : createId();
      const label = typeof record["label"] === "string" && record["label"].trim().length
        ? record["label"].trim()
        : `联系方式 ${index + 1}`;
      const valueText = typeof record["value"] === "string"
        ? record["value"].trim()
        : "";
      const icon = sanitizeIconValue(record["icon"]);
      return {
        id,
        label,
        value: valueText,
        icon,
      } satisfies ContactMethod;
    })
    .filter((item): item is ContactMethod => Boolean(item));

  return sanitized.length ? sanitized : DEFAULT_CONTACT_METHODS.map((method) => ({ ...method }));
};

export function ContactInformation() {
  const { user, token } = useAuthStore();
  const effectiveUsername = user?.bound_username ?? "";
  const [form, setForm] = useState<ContactFormState>(() => ({
    contactMethods: DEFAULT_CONTACT_METHODS.map((method) => ({ ...method })),
    hobbies: [],
    socialLinks: createDefaultSocialLinks(),
  }));
  const [rawProfile, setRawProfile] = useState<Record<string, unknown>>({});
  const [newHobby, setNewHobby] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState<StatusToastState | null>(null);

  const loadContactInfo = useCallback(async () => {
    if (!token || !effectiveUsername) {
      setForm({
        contactMethods: DEFAULT_CONTACT_METHODS.map((method) => ({ ...method })),
        hobbies: [],
        socialLinks: createDefaultSocialLinks(),
      });
      setRawProfile({});
      return;
    }
    setIsLoading(true);
    try {
      const [profileRes, quickLinksRes] = await Promise.all([
        getProfileSection<Record<string, unknown>>(effectiveUsername, "profile"),
        getProfileSection<unknown[]>(effectiveUsername, "quickLinks"),
      ]);

      const profileData = (profileRes?.data && typeof profileRes.data === "object") ? profileRes.data : {};
      setRawProfile(profileData);

      const quickLinksData = Array.isArray(quickLinksRes?.data) ? quickLinksRes.data : [];

      const contactMethods = parseContactMethods(profileData["contactMethods"]);

      const mappedSocialLinks: SocialLinkItem[] = quickLinksData.map((link) => {
        if (typeof link !== "object" || link === null) {
          return { id: createId(), name: "", url: "", icon: "link" };
        }
        const record = link as Record<string, unknown>;
        return {
          id: typeof record["id"] === "string" ? record["id"] : createId(),
          name: typeof record["name"] === "string" ? record["name"] : "",
          url: typeof record["url"] === "string" ? record["url"] : "",
          icon: sanitizeIconValue(record["icon"]),
        } satisfies SocialLinkItem;
      });

      setForm({
        contactMethods: contactMethods.length
          ? contactMethods
          : DEFAULT_CONTACT_METHODS.map((method) => ({ ...method })),
        hobbies: Array.isArray(profileData["interests"])
          ? (profileData["interests"] as unknown[]).filter((item): item is string => typeof item === "string")
          : [],
        socialLinks: mappedSocialLinks.length ? mappedSocialLinks : createDefaultSocialLinks(),
      });
      setStatusBanner(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载联系方式失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [token, effectiveUsername]);

  useEffect(() => {
    loadContactInfo();
  }, [loadContactInfo]);

  const isReadonly = useMemo(() => !effectiveUsername, [effectiveUsername]);

  const visibleHobbies = useMemo(() => form.hobbies, [form.hobbies]);

  const addHobby = () => {
    if (isReadonly) return;
    const value = newHobby.trim();
    if (!value) return;
    setForm((prev) =>
      prev.hobbies.includes(value)
        ? prev
        : { ...prev, hobbies: [...prev.hobbies, value] }
    );
    setNewHobby("");
  };

  const removeHobby = (hobby: string) => {
    if (isReadonly) return;
    setForm((prev) => ({ ...prev, hobbies: prev.hobbies.filter((item) => item !== hobby) }));
  };

  const addSocialLink = () => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: createId(), name: "", url: "", icon: "lucide:link" }],
    }));
  };

  const updateSocialLink = (id: string, key: keyof SocialLinkItem, value: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) => (link.id === id ? { ...link, [key]: value } : link)),
    }));
  };

  const removeSocialLink = (id: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.length === 1 ? prev.socialLinks : prev.socialLinks.filter((link) => link.id !== id),
    }));
  };

  const addContactMethod = () => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      contactMethods: [
        ...prev.contactMethods,
        {
          id: createId(),
          label: "新的联系方式",
          value: "",
          icon: "lucide:link",
        },
      ],
    }));
  };

  const updateContactMethod = (
    id: string,
    key: keyof ContactMethod,
    value: string
  ) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      contactMethods: prev.contactMethods.map((method) =>
        method.id === id
          ? {
              ...method,
              [key]: key === "icon" ? sanitizeIconValue(value) : value,
            }
          : method
      ),
    }));
  };

  const removeContactMethod = (id: string) => {
    if (isReadonly) return;
    setForm((prev) => ({
      ...prev,
      contactMethods:
        prev.contactMethods.length === 1
          ? prev.contactMethods
          : prev.contactMethods.filter((method) => method.id !== id),
    }));
  };

  useEffect(() => {
    if (!statusBanner) return;
    const timer = window.setTimeout(() => {
      setStatusBanner(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [statusBanner]);

  const getContactPlaceholder = (method: ContactMethod) => {
    const identifier = `${method.id} ${method.label}`.toLowerCase();
    if (identifier.includes("mail") || identifier.includes("邮箱")) {
      return "name@example.com";
    }
    if (identifier.includes("github")) {
      return "https://github.com/yourname";
    }
    if (identifier.includes("site") || identifier.includes("网站") || identifier.includes("web")) {
      return "https://your-site.com";
    }
    if (identifier.includes("city") || identifier.includes("城市") || identifier.includes("location")) {
      return "例如：北京，中国";
    }
    return "请输入联系方式内容";
  };

  const handleSave = async () => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再保存" });
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedMethods: ContactMethod[] = form.contactMethods
        .map((method) => ({
          id: method.id || createId(),
          label: method.label.trim() || "未命名联系方式",
          value: method.value.trim(),
          icon: sanitizeIconValue(method.icon),
        }))
        .filter((method) => method.label.length > 0 || method.value.length > 0);

      const finalMethods: ContactMethod[] = sanitizedMethods.length
        ? sanitizedMethods
        : DEFAULT_CONTACT_METHODS.map((method) => ({ ...method }));

      const matchesKeywords = (method: ContactMethod, keywords: string[]) => {
        const labelLower = method.label.toLowerCase();
        return keywords.some((keyword) => labelLower.includes(keyword));
      };

      const emailMethod = finalMethods.find(
        (method) => method.id === "email" || matchesKeywords(method, ["email", "mail", "邮箱"])
      );
      const githubMethod = finalMethods.find(
        (method) => method.id === "github" || matchesKeywords(method, ["github", "git"])
      );
      const websiteMethod = finalMethods.find(
        (method) => method.id === "website" || matchesKeywords(method, ["site", "网站", "web"])
      );
      const cityMethod = finalMethods.find(
        (method) => method.id === "city" || matchesKeywords(method, ["city", "城市", "位置", "location"])
      );

      const updatedProfile: Record<string, unknown> = {
        ...rawProfile,
        contactMethods: finalMethods,
        email: emailMethod?.value ?? "",
        personalWebsite: websiteMethod?.value ?? "",
        website: websiteMethod?.value ?? "",
        location: cityMethod?.value ?? "",
        interests: form.hobbies,
        phone: "",
        wechat: "",
        updatedAt: new Date().toISOString(),
      };

      if (githubMethod?.value) {
        const githubUrl = ensureGithubUrl(githubMethod.value);
        updatedProfile.github_profile_url = githubUrl;
        const username = extractGithubUsername(githubUrl);
        if (username) {
          updatedProfile.github = username;
        }
      }

      const updatedQuickLinks = form.socialLinks.map((link) => ({
        id: link.id,
        name: link.name,
        url: link.url,
        icon: sanitizeIconValue(link.icon),
        description: link.name,
      }));

      await Promise.all([
        updateProfileSection(effectiveUsername, "profile", updatedProfile, token),
        updateProfileSection(effectiveUsername, "quickLinks", updatedQuickLinks, token),
      ]);

      setRawProfile(updatedProfile);
      setForm((prev) => ({
        ...prev,
        contactMethods: finalMethods.map((method) => ({ ...method })),
      }));
      setStatusBanner({ type: "success", message: "联系方式已保存" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存联系方式失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadContactInfo();
  };

  return (
    <div className="space-y-8">
      {statusBanner ? (
        <StatusToast status={statusBanner} onClose={() => setStatusBanner(null)} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            基本联系方式
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {form.contactMethods.map((method, index) => (
              <div key={method.id} className="rounded-lg border border-border/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    联系方式 #{index + 1}
                  </p>
                  {form.contactMethods.length > 1 && !isReadonly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContactMethod(method.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px] gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor={`contact-label-${method.id}`}>名称</Label>
                    <Input
                      id={`contact-label-${method.id}`}
                      value={method.label}
                      onChange={(event) => updateContactMethod(method.id, "label", event.target.value)}
                      placeholder="例如：邮箱"
                      disabled={isReadonly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`contact-value-${method.id}`}>联系方式内容</Label>
                    <Input
                      id={`contact-value-${method.id}`}
                      value={method.value}
                      onChange={(event) => updateContactMethod(method.id, "value", event.target.value)}
                      placeholder={getContactPlaceholder(method)}
                      disabled={isReadonly}
                    />
                  </div>
                  <div className="space-y-2">
                    <IconPicker
                      label="图标"
                      value={method.icon}
                      onChange={(value) => updateContactMethod(method.id, "icon", value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isReadonly && (
            <Button onClick={addContactMethod} variant="outline" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              添加联系方式
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            兴趣爱好
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {visibleHobbies.map((hobby) => (
              <Badge key={hobby} variant="secondary" className="flex items-center gap-1">
                {hobby}
                {!isReadonly && (
                  <button onClick={() => removeHobby(hobby)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {!isReadonly && (
            <div className="flex gap-2">
              <Input
                placeholder="添加新的兴趣爱好..."
                value={newHobby}
                onChange={(event) => setNewHobby(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addHobby();
                  }
                }}
                className="max-w-xs"
              />
              <Button onClick={addHobby} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {form.socialLinks.map((link, index) => (
        <Card key={link.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                社交链接 #{index + 1}
              </CardTitle>
              {form.socialLinks.length > 1 && !isReadonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
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
                <Label htmlFor={`social-name-${link.id}`}>平台名称</Label>
                <Input
                  id={`social-name-${link.id}`}
                  value={link.name}
                  onChange={(event) => updateSocialLink(link.id, "name", event.target.value)}
                  placeholder="例如：GitHub"
                  disabled={isReadonly}
                />
              </div>
              <div className="space-y-2">
                <IconPicker
                  label="社交图标"
                  value={link.icon}
                  onChange={(value) => updateSocialLink(link.id, "icon", value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`social-url-${link.id}`}>网址</Label>
              <Input
                id={`social-url-${link.id}`}
                value={link.url}
                onChange={(event) => updateSocialLink(link.id, "url", event.target.value)}
                placeholder="https://..."
                disabled={isReadonly}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 添加社交链接按钮 */}
      {!isReadonly && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={addSocialLink} variant="outline" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              添加社交链接
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

      {(!effectiveUsername || isLoading) && (
        <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {effectiveUsername ? "正在加载联系信息..." : "请先绑定用户名后管理联系信息"}
        </div>
      )}
    </div>
  );
}
