"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface TagManagerProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TagManager({ tags, setTags }: TagManagerProps) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          🏷️ 标签管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1.5 border border-blue-200 rounded-full transition-colors"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
          {tags.length === 0 && (
            <span className="text-sm italic">暂无标签</span>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加标签..."
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            className="flex-1 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200"
          />
          <Button
            type="button"
            onClick={addTag}
            variant="outline"
            size="sm"
            className="border-2 rounded-lg transition-all duration-200 bg-transparent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
