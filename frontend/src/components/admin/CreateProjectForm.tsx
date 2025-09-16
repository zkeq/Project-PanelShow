'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DynamicTags } from './DynamicTags';
import { ProjectStatusSelector } from './ProjectStatusSelector';
import { ProjectTypeSelector } from './ProjectTypeSelector';
import { ProjectFeatureSelector } from './ProjectFeatureSelector';
import { MarkdownEditor } from './MarkdownEditor';
import { ScreenshotManager } from './ScreenshotManager';
import { ProjectInfoManager, type ProjectInfo } from './ProjectInfoManager';
import { FeatureHighlightManager, type FeatureHighlight } from './FeatureHighlightManager';
import { Monitor, Smartphone, Github } from 'lucide-react';

interface ProjectFormData {
  name: string;
  description: string;
  tags: string[];
  status: {
    id: string;
    label: string;
    color: string;
  } | null;
  type: {
    id: string;
    label: string;
    icon: string;
  } | null;
  features: Array<{
    id: string;
    label: string;
    color: string;
    icon: string;
  }>;
  previewUrl: string;
  mobilePreviewUrl: string;
  sourceUrl: string;
  leftSidebarMarkdown: string;
  rightSidebarMarkdown: string;
  isOpenSource: boolean;
  readme: string;
  screenshots: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
  }>;
  projectInfos: ProjectInfo[];
  projectIntroduction: string;
  featureHighlights: FeatureHighlight[];
}

export function CreateProjectForm() {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    tags: [],
    status: null,
    type: null,
    features: [],
    previewUrl: '',
    mobilePreviewUrl: '',
    sourceUrl: '',
    leftSidebarMarkdown: '',
    rightSidebarMarkdown: '',
    isOpenSource: false,
    readme: '',
    screenshots: [],
    projectInfos: [],
    projectIntroduction: '',
    featureHighlights: []
  });

  const handleSaveDraft = () => {
    // 保存草稿到本地存储
    const draftData = {
      ...formData,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('project-draft', JSON.stringify(draftData));
    alert('草稿已保存到本地');
  };

  // 在组件挂载时尝试恢复草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem('project-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const { lastSaved, ...projectData } = draftData;
        
        if (confirm(`发现保存的草稿（${new Date(lastSaved).toLocaleString()}），是否恢复？`)) {
          setFormData(projectData);
        }
      } catch (error) {
        console.error('恢复草稿失败:', error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('项目名称不能为空');
    }
    
    if (!formData.description.trim()) {
      errors.push('项目简介不能为空');
    }
    
    if (formData.isOpenSource && !formData.sourceUrl.trim()) {
      errors.push('开源项目必须提供源码地址');
    }
    
    if (errors.length > 0) {
      alert(`请修正以下问题：\n${errors.join('\n')}`);
      return;
    }
    
    // 提交表单数据
    console.log('提交表单数据:', formData);
    alert('作品集创建成功！（这是演示版本）');
    
    // TODO: 实现实际的API调用
    // try {
    //   const response = await fetch('/api/projects', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });
    //   
    //   if (response.ok) {
    //     const project = await response.json();
    //     router.push(`/admin/projects/${project.id}`);
    //   } else {
    //     throw new Error('提交失败');
    //   }
    // } catch (error) {
    //   console.error('提交错误:', error);
    //   alert('提交失败，请稍后重试');
    // }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 relative z-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 作品信息 */}
        <Card>
          <CardHeader>
            <CardTitle>作品信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 项目名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">项目名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入项目名称"
                required
              />
            </div>

            {/* 项目简介 */}
            <div className="space-y-2">
              <Label htmlFor="description">项目简介 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="简要描述项目的功能和特点"
                rows={3}
                required
              />
            </div>

            {/* 项目标签 */}
            <div className="space-y-2">
              <Label>项目标签</Label>
              <DynamicTags
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              />
            </div>

            {/* 项目状态 */}
            <div className="space-y-2">
              <Label>项目状态</Label>
              <ProjectStatusSelector
                value={formData.status}
                onChange={(status) => setFormData(prev => ({ ...prev, status }))}
              />
            </div>

            {/* 项目类型 */}
            <div className="space-y-2">
              <Label>项目类型</Label>
              <ProjectTypeSelector
                value={formData.type}
                onChange={(type) => setFormData(prev => ({ ...prev, type }))}
              />
            </div>

            {/* 项目特性 */}
            <div className="space-y-2">
              <Label>项目特性</Label>
              <ProjectFeatureSelector
                features={formData.features}
                onChange={(features) => setFormData(prev => ({ ...prev, features }))}
              />
            </div>

            <Separator />

            {/* URL 信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previewUrl">
                  <Monitor className="inline h-4 w-4 mr-1" />
                  项目预览地址
                </Label>
                <Input
                  id="previewUrl"
                  type="url"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobilePreviewUrl">
                  <Smartphone className="inline h-4 w-4 mr-1" />
                  移动端预览地址 (可选)
                </Label>
                <Input
                  id="mobilePreviewUrl"
                  type="url"
                  value={formData.mobilePreviewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobilePreviewUrl: e.target.value }))}
                  placeholder="https://m.example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">
                  <Github className="inline h-4 w-4 mr-1" />
                  项目源码地址
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  disabled={!formData.isOpenSource}
                />
              </div>
            </div>

            {/* 侧边栏 Markdown 内容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leftSidebarMarkdown">展示信息左侧栏 Markdown</Label>
                <Textarea
                  id="leftSidebarMarkdown"
                  value={formData.leftSidebarMarkdown}
                  onChange={(e) => setFormData(prev => ({ ...prev, leftSidebarMarkdown: e.target.value }))}
                  placeholder="输入左侧栏展示的 Markdown 内容..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rightSidebarMarkdown">展示信息右侧栏 Markdown</Label>
                <Textarea
                  id="rightSidebarMarkdown"
                  value={formData.rightSidebarMarkdown}
                  onChange={(e) => setFormData(prev => ({ ...prev, rightSidebarMarkdown: e.target.value }))}
                  placeholder="输入右侧栏展示的 Markdown 内容..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* 开源选项 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isOpenSource"
                checked={formData.isOpenSource}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  isOpenSource: checked,
                  sourceUrl: checked ? prev.sourceUrl : ''
                }))}
              />
              <Label htmlFor="isOpenSource">项目开源</Label>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 作品截图展示 */}
      <Card>
        <CardHeader>
          <CardTitle>作品截图展示</CardTitle>
        </CardHeader>
        <CardContent>
          <ScreenshotManager
            screenshots={formData.screenshots}
            onChange={(screenshots) => setFormData(prev => ({ ...prev, screenshots }))}
          />
        </CardContent>
      </Card>

      {/* 项目概览 - 信息展示区域 */}
      <Card>
        <CardHeader>
          <CardTitle>项目概览 - 信息展示区域</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectInfoManager
            projectInfos={formData.projectInfos}
            onChange={(infos) => setFormData(prev => ({ ...prev, projectInfos: infos }))}
          />
        </CardContent>
      </Card>

      {/* 项目介绍 Markdown 编辑器 */}
      <Card>
        <CardHeader>
          <CardTitle>项目介绍</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <MarkdownEditor
              value={formData.projectIntroduction}
              onChange={(projectIntroduction) => setFormData(prev => ({ ...prev, projectIntroduction }))}
              placeholder="输入项目介绍..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 特色功能介绍 */}
      <Card>
        <CardHeader>
          <CardTitle>特色功能介绍</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureHighlightManager
            features={formData.featureHighlights}
            onChange={(features) => setFormData(prev => ({ ...prev, featureHighlights: features }))}
          />
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          保存草稿
        </Button>
        <Button onClick={handleSubmit}>
          创建作品集
        </Button>
      </div>
    </div>
  );
}