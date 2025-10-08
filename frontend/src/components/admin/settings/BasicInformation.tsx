"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SiteAddressInput, type AddressAvailabilityStatus } from "@/components/ui/site-address-input";
import { Loader2, Upload, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  API_BASE_URL,
  checkUsernameAvailability,
  getProfileSection,
  syncGithubProfile,
  updateProfileSection,
  uploadImage,
} from "@/lib/api";
import { StatusToast, type StatusToastState } from "@/components/admin/settings/StatusToast";

interface BasicProfileForm {
  profileUsername: string;
  siteTitleBase: string;
  siteAddress: string;
  avatar: string;
  authorName: string;
  githubUsername: string;
  authorDescription: string;
  subDescription: string;
  company: string;
  personalWebsite: string;
  personalWechatQr: string;
  notes: string;
  githubFollowers: number;
  githubFollowing: number;
  githubStars: number;
  githubPublicRepos: number;
  githubPublicGists: number;
}

const SITE_SUFFIX = "的作品集";
const SITE_ADDRESS_DEBOUNCE = 400;

const defaultForm: BasicProfileForm = {
  profileUsername: "",
  siteTitleBase: "",
  siteAddress: "",
  avatar: "",
  authorName: "",
  githubUsername: "",
  authorDescription: "",
  subDescription: "",
  company: "",
  personalWebsite: "",
  personalWechatQr: "",
  notes: "",
  githubFollowers: 0,
  githubFollowing: 0,
  githubStars: 0,
  githubPublicRepos: 0,
  githubPublicGists: 0,
};

const pickString = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const pickNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^-+|-+$/g, "");

const buildBackendUrl = (path: string): string => {
  const sanitizedPath = `/${path.replace(/^\/+/, "")}`;
  const base = API_BASE_URL.replace(/\/+$/, "");
  return `${base}${sanitizedPath}`;
};

const normalizeImageUrl = (value: string): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return buildBackendUrl(trimmed);
};

export function BasicInformation() {
  const { user, token } = useAuthStore();
  const boundUsername = user?.bound_username ?? "";
  const effectiveUsername = boundUsername;

  const [form, setForm] = useState<BasicProfileForm>(defaultForm);
  const [rawProfile, setRawProfile] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [wechatUploading, setWechatUploading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<StatusToastState | null>(null);
  const [siteAddressStatus, setSiteAddressStatus] = useState<AddressAvailabilityStatus>("idle");
  const [siteAddressMessage, setSiteAddressMessage] = useState("");

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const wechatInputRef = useRef<HTMLInputElement | null>(null);
  const siteAddressCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!statusBanner) return;
    const timer = window.setTimeout(() => {
      setStatusBanner(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [statusBanner]);

  const loadProfile = useCallback(async () => {
    if (!token || !effectiveUsername) {
      setForm(defaultForm);
      setRawProfile({});
      setStatusBanner(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getProfileSection<Record<string, unknown>>(effectiveUsername, "profile");
      const profileData = (response?.data && typeof response.data === "object") ? response.data : {};
      setRawProfile(profileData);

      const siteTitle = pickString(profileData["siteTitle"], pickString(profileData["name"], ""));
      const siteTitleBase = siteTitle.endsWith(SITE_SUFFIX)
        ? siteTitle.slice(0, -SITE_SUFFIX.length)
        : siteTitle;

      const mapped: BasicProfileForm = {
        profileUsername: pickString(profileData["username"], effectiveUsername),
        siteTitleBase,
        siteAddress: pickString(profileData["siteAddress"], effectiveUsername),
        avatar: normalizeImageUrl(pickString(profileData["avatar"], pickString(profileData["github_avatar_url"], ""))),
        authorName: pickString(profileData["name"], ""),
        githubUsername: pickString(
          profileData["github_username"],
          pickString(profileData["github"], slugify(pickString(profileData["name"], effectiveUsername)))
        ).toLowerCase(),
        authorDescription: pickString(profileData["description"], ""),
        subDescription: pickString(profileData["subDescription"], pickString(profileData["github_bio"], "")),
        company: pickString(profileData["company"], pickString(profileData["github_company"], "")),
        personalWebsite: pickString(profileData["personalWebsite"], pickString(profileData["website"], "")),
        personalWechatQr: normalizeImageUrl(pickString(profileData["wechatQr"], "")),
        notes: pickString(profileData["notes"], ""),
        githubFollowers: pickNumber(profileData["github_followers"], 0),
        githubFollowing: pickNumber(profileData["github_following"], 0),
        githubStars: pickNumber(profileData["github_total_stars"], 0),
        githubPublicRepos: pickNumber(profileData["github_public_repos"], 0),
        githubPublicGists: pickNumber(profileData["github_public_gists"], 0),
      };

      setForm(mapped);
      setStatusBanner(null);
      if (mapped.siteAddress) {
        setSiteAddressStatus("available");
        setSiteAddressMessage(
          `你的站点将在 https://${typeof window !== "undefined" ? window.location.host : "localhost"}/project/${mapped.siteAddress} 生效`
        );
      } else {
        setSiteAddressStatus("idle");
        setSiteAddressMessage("");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载个人资料失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }, [token, effectiveUsername]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!form.siteAddress.trim()) {
      setSiteAddressStatus("idle");
      setSiteAddressMessage("");
      return;
    }

    if (siteAddressCheckRef.current) {
      clearTimeout(siteAddressCheckRef.current);
    }

    setSiteAddressStatus("checking");
    setSiteAddressMessage("正在检查站点地址...");

    const currentValue = form.siteAddress.trim().toLowerCase();
    siteAddressCheckRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(currentValue, token ?? undefined);
        if (form.siteAddress.trim().toLowerCase() !== currentValue) return;
        if (result.available) {
          setSiteAddressStatus("available");
          setSiteAddressMessage(
            `你的站点将在 https://${typeof window !== "undefined" ? window.location.host : "localhost"}/project/${currentValue} 生效`
          );
        } else {
          setSiteAddressStatus("unavailable");
          setSiteAddressMessage(result.message || "站点地址不可用");
        }
      } catch (error) {
        if (form.siteAddress.trim().toLowerCase() !== currentValue) return;
        const message = error instanceof Error ? error.message : "检查站点地址失败";
        setSiteAddressStatus("unavailable");
        setSiteAddressMessage(message);
      }
    }, SITE_ADDRESS_DEBOUNCE) as unknown as NodeJS.Timeout;

    return () => {
      if (siteAddressCheckRef.current) {
        clearTimeout(siteAddressCheckRef.current);
        siteAddressCheckRef.current = null;
      }
    };
  }, [form.siteAddress]);

  const handleInputChange = <K extends keyof BasicProfileForm>(key: K, value: BasicProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) {
      setStatusBanner({ type: "error", message: "当前未登录，无法保存" });
      return;
    }
    if (!effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定用户名后再保存" });
      return;
    }
    if (siteAddressStatus === "unavailable" || siteAddressStatus === "checking") {
      setStatusBanner({ type: "error", message: siteAddressMessage || "站点地址不可用" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...rawProfile,
        username: form.profileUsername || effectiveUsername,
        siteTitle: `${form.siteTitleBase}${SITE_SUFFIX}`.trim(),
        siteAddress: form.siteAddress,
        avatar: form.avatar,
        name: form.authorName,
        name_slug: form.githubUsername,
        description: form.authorDescription,
        subDescription: form.subDescription,
        company: form.company,
        personalWebsite: form.personalWebsite,
        wechatQr: form.personalWechatQr,
        notes: form.notes,
        github: form.githubUsername,
        github_username: form.githubUsername,
        github_followers: form.githubFollowers,
        github_following: form.githubFollowing,
        github_total_stars: form.githubStars,
        github_public_repos: form.githubPublicRepos,
        github_public_gists: form.githubPublicGists,
        updatedAt: new Date().toISOString(),
      };

      await updateProfileSection(effectiveUsername, "profile", payload, token);
      setRawProfile(payload);
      setStatusBanner({ type: "success", message: "基本信息已保存" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败，请稍后重试";
      setStatusBanner({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadProfile();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再上传头像" });
      return;
    }
    setAvatarUploading(true);
    try {
      const result = await uploadImage(effectiveUsername, file, token, "avatars");
      handleInputChange("avatar", result.url);
      setStatusBanner({ type: "success", message: "头像上传成功" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "头像上传失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleWechatUpload = async (file: File) => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再上传二维码" });
      return;
    }
    setWechatUploading(true);
    try {
      const result = await uploadImage(effectiveUsername, file, token, "wechat");
      handleInputChange("personalWechatQr", result.url);
      setStatusBanner({ type: "success", message: "二维码上传成功" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "二维码上传失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setWechatUploading(false);
    }
  };

  const handleGithubSync = async () => {
    if (!token || !effectiveUsername) {
      setStatusBanner({ type: "error", message: "请先绑定并登录后再同步 GitHub 信息" });
      return;
    }
    if (!form.githubUsername.trim()) {
      setStatusBanner({ type: "error", message: "请先填写 GitHub 用户名" });
      return;
    }
    setGithubSyncing(true);
    try {
      const result = await syncGithubProfile(effectiveUsername, form.githubUsername.trim().toLowerCase(), token);
      const data = result?.data ?? {};

      setForm((prev) => ({
        ...prev,
        avatar: normalizeImageUrl(pickString(data["avatar"], pickString(data["github_avatar_url"], prev.avatar))),
        authorName: prev.authorName || pickString(data["name"], prev.authorName),
        authorDescription: pickString(data["github_bio"], pickString(data["description"], prev.authorDescription)),
        subDescription: pickString(data["github_location"], prev.subDescription),
        company: pickString(data["company"], prev.company),
      personalWebsite: pickString(data["github_blog"], prev.personalWebsite),
        githubUsername: pickString(data["github_username"], prev.githubUsername).toLowerCase(),
        githubFollowers: pickNumber(data["github_followers"], prev.githubFollowers),
        githubFollowing: pickNumber(data["github_following"], prev.githubFollowing),
        githubStars: pickNumber(data["github_total_stars"], prev.githubStars),
        githubPublicRepos: pickNumber(data["github_public_repos"], prev.githubPublicRepos),
        githubPublicGists: pickNumber(data["github_public_gists"], prev.githubPublicGists),
      }));

      setStatusBanner({ type: "success", message: "GitHub 信息同步成功" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "同步 GitHub 信息失败";
      setStatusBanner({ type: "error", message });
    } finally {
      setGithubSyncing(false);
    }
  };

  const displayAvatarFallback = useMemo(() => {
    if (form.authorName) return form.authorName.trim()[0]?.toUpperCase() ?? "U";
    if (form.profileUsername) return form.profileUsername.trim()[0]?.toUpperCase() ?? "U";
    return "U";
  }, [form.authorName, form.profileUsername]);

  if (!token) {
    return (
      <div className="rounded-md border border-border/40 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        请先登录后再管理个人资料。
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {statusBanner ? (
        <StatusToast status={statusBanner} onClose={() => setStatusBanner(null)} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-username">用户名</Label>
              <Input
                id="profile-username"
                value={form.profileUsername}
                onChange={(event) => handleInputChange("profileUsername", event.target.value)}
                placeholder="例如：zkeq"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">自由填写，用于站点展示。</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-title-base">网站标题</Label>
              <div className="relative">
                <Input
                  id="site-title-base"
                  value={form.siteTitleBase}
                  onChange={(event) => handleInputChange("siteTitleBase", event.target.value)}
                  placeholder="例如：Zkeq"
                  disabled={isLoading}
                  className="pr-24"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground pointer-events-none">
                  {SITE_SUFFIX}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                预览：{form.siteTitleBase || form.profileUsername || effectiveUsername}{SITE_SUFFIX}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-address">站点地址</Label>
            <SiteAddressInput
              value={form.siteAddress}
              onChange={(value) => handleInputChange("siteAddress", value)}
              status={siteAddressStatus}
              statusMessage={siteAddressMessage}
            />
          </div>

          <div className="space-y-2">
            <Label>头像</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {form.avatar ? (
                  <AvatarImage src={form.avatar} alt={form.authorName || form.profileUsername || "头像"} />
                ) : null}
                <AvatarFallback>{displayAvatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading || isLoading || !effectiveUsername}
                >
                  {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  上传头像
                </Button>
                {form.avatar && (
                  <Button variant="ghost" size="sm" onClick={() => handleInputChange("avatar", "")}>清除</Button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleAvatarUpload(file);
                    event.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-name">作者名称</Label>
              <Input
                id="author-name"
                value={form.authorName}
                onChange={(event) => handleInputChange("authorName", event.target.value)}
                placeholder="例如：Zkeq"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-username">作者名称小写（GitHub 用户名）</Label>
              <div className="flex gap-2">
                <Input
                  id="github-username"
                  value={form.githubUsername}
                  onChange={(event) => handleInputChange("githubUsername", slugify(event.target.value))}
                  placeholder="例如：zkeq"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGithubSync}
                  disabled={githubSyncing || !form.githubUsername.trim() || !effectiveUsername}
                >
                  {githubSyncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  拉取 GitHub
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">输入 GitHub 用户名并点击“拉取 GitHub”即可自动同步信息。</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-description">作者描述</Label>
            <Textarea
              id="author-description"
              placeholder="介绍您的背景和创作理念..."
              className="min-h-[120px]"
              value={form.authorDescription}
              onChange={(event) => handleInputChange("authorDescription", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-description">副描述 / 一句话介绍</Label>
            <Input
              id="sub-description"
              value={form.subDescription}
              onChange={(event) => handleInputChange("subDescription", event.target.value)}
              placeholder="例如：全栈开发工程师 / 开源贡献者"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">现工作单位</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(event) => handleInputChange("company", event.target.value)}
                placeholder="例如：科技创新有限公司"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-website">个人网站</Label>
              <Input
                id="personal-website"
                type="url"
                value={form.personalWebsite}
                onChange={(event) => handleInputChange("personalWebsite", event.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>社交及 GitHub 数据</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github-followers">关注者数量 (Followers)</Label>
              <Input
                id="github-followers"
                type="number"
                value={String(form.githubFollowers)}
                onChange={(event) => handleInputChange("githubFollowers", Number(event.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-following">关注中数量 (Following)</Label>
              <Input
                id="github-following"
                type="number"
                value={String(form.githubFollowing)}
                onChange={(event) => handleInputChange("githubFollowing", Number(event.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github-stars">Star 数量</Label>
              <Input
                id="github-stars"
                type="number"
                value={String(form.githubStars)}
                onChange={(event) => handleInputChange("githubStars", Number(event.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github-repos">公开仓库数</Label>
              <Input
                id="github-repos"
                type="number"
                value={String(form.githubPublicRepos)}
                onChange={(event) => handleInputChange("githubPublicRepos", Number(event.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github-gists">公开 Gist 数</Label>
              <Input
                id="github-gists"
                type="number"
                value={String(form.githubPublicGists)}
                onChange={(event) => handleInputChange("githubPublicGists", Number(event.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>社交统计概览</Label>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{form.githubFollowers} Followers</Badge>
                <Badge variant="secondary">{form.githubFollowing} Following</Badge>
                <Badge variant="secondary">{form.githubStars} Stars</Badge>
                <Badge variant="secondary">{form.githubPublicRepos} Public Repos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>联系信息与备注</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>个人微信二维码</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center overflow-hidden">
                {form.personalWechatQr ? (
                  <img src={form.personalWechatQr} alt="微信二维码" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">二维码预览</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => wechatInputRef.current?.click()}
                  disabled={wechatUploading || !effectiveUsername}
                >
                  {wechatUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  上传二维码
                </Button>
                {form.personalWechatQr && (
                  <Button variant="ghost" size="sm" onClick={() => handleInputChange("personalWechatQr", "")}>清除</Button>
                )}
              </div>
              <input
                ref={wechatInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleWechatUpload(file);
                    event.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              placeholder="其他备注信息..."
              className="min-h-[80px]"
              value={form.notes}
              onChange={(event) => handleInputChange("notes", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving || isLoading}>
          重置更改
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          保存更改
        </Button>
      </div>

      {(!effectiveUsername || isLoading) && (
        <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {effectiveUsername ? "正在加载个人资料..." : "请先完成用户名绑定以管理个人资料"}
        </div>
      )}
    </div>
  );
}
