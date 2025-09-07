"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, Mail, Heart, Link2 } from "lucide-react";

export function ContactInformation() {
  const [hobbies, setHobbies] = useState(["编程", "摄影", "旅行", "阅读"]);
  const [newHobby, setNewHobby] = useState("");

  const [socialLinks, setSocialLinks] = useState([
    {
      id: 1,
      name: "GitHub",
      url: "https://github.com/alexchen",
      icon: "github",
    },
    {
      id: 2,
      name: "LinkedIn",
      url: "https://linkedin.com/in/alexchen",
      icon: "linkedin",
    },
  ]);

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const addSocialLink = () => {
    const newLink = {
      id: Date.now(),
      name: "",
      url: "",
      icon: "link",
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const removeSocialLink = (id: number) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* 基本联系方式 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            基本联系方式
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                defaultValue="alex.chen@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">电话</Label>
              <Input id="phone" defaultValue="+86 138 0013 8000" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wechat">微信号</Label>
              <Input id="wechat" defaultValue="alexchen2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">所在城市</Label>
              <Input id="location" defaultValue="北京，中国" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 兴趣爱好 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            兴趣爱好
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {hobbies.map((hobby) => (
              <Badge
                key={hobby}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {hobby}
                <button
                  onClick={() => removeHobby(hobby)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="添加新的兴趣爱好..."
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addHobby()}
              className="max-w-xs"
            />
            <Button onClick={addHobby} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 社交链接 */}
      {socialLinks.map((link, index) => (
        <Card key={link.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                社交链接 #{index + 1}
              </CardTitle>
              {socialLinks.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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
                <Label htmlFor={`name-${link.id}`}>平台名称</Label>
                <Input
                  id={`name-${link.id}`}
                  defaultValue={link.name}
                  placeholder="例如：GitHub"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`icon-${link.id}`}>图标类型</Label>
                <Select defaultValue={link.icon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="link">通用链接</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`url-${link.id}`}>网址</Label>
              <Input
                id={`url-${link.id}`}
                defaultValue={link.url}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 添加社交链接按钮 */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={addSocialLink}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加社交链接
          </Button>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          重置更改
        </Button>
        <Button>
          保存更改
        </Button>
      </div>
    </div>
  );
}
