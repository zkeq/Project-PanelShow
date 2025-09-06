"use client";

import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

interface ActionButtonsProps {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isSubmitting?: boolean;
}

export function ActionButtons({
  onSaveDraft,
  onPublish,
  isSubmitting = false,
}: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        type="button"
        onClick={onSaveDraft}
        disabled={isSubmitting}
        className="w-full border-2 border-slate-300 h-12 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 bg-transparent"
      >
        <Save className="h-4 w-4" />
        保存草稿
      </Button>
      <Button
        variant="default"
        type="submit"
        onClick={onPublish}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:!from-blue-400 disabled:!to-indigo-400 dark:bg-slate-700"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? "发布中..." : "发布动态"}
      </Button>
    </div>
  );
}
