'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DynamicTags } from '@/components/admin/DynamicTags';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { ImageUpload } from '@/components/admin/dynamic/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  FolderOpen,
  FileText,
  Type,
  Tags,
  Image,
  Code,
  ExternalLink,
  Monitor,
  Save,
  Send,
  Globe,
  FileCode
} from 'lucide-react';

interface DynamicFormData {
  // 动态基本信息
  publishDate: string;
  projectBelong: string;
  dynamicDescription: string;
  dynamicType: string;
  dynamicTags: string[];
  dynamicDetails: string;
  dynamicImages: File[];
  codeUrl: string;
  demoUrl: string;
  demoUrlDescriptionLeft: string;
  demoUrlDescriptionRight: string;
}

export default function CreateDynamicPage() {
  const [formData, setFormData] = useState<DynamicFormData>({
    publishDate: new Date().toISOString().slice(0, 10),
    projectBelong: '',
    dynamicDescription: '',
    dynamicType: '',
    dynamicTags: [],
    dynamicDetails: '',
    dynamicImages: [],
    codeUrl: '',
    demoUrl: '',
    demoUrlDescriptionLeft: '',
    demoUrlDescriptionRight: ''
  });


  // 在组件挂载时尝试恢复草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem('dynamic-draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        const { lastSaved, ...dynamicData } = draftData;
        
        if (confirm(`发现保存的草稿（${new Date(lastSaved).toLocaleString()}），是否恢复？`)) {
          setFormData(dynamicData);
        }
      } catch (error) {
        console.error('恢复草稿失败:', error);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draftData = {
      ...formData,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('dynamic-draft', JSON.stringify(draftData));
    alert('草稿已保存到本地');
  };

  // 动态图片上传适配器
  const handleDynamicImageUpload = useCallback((images: File[] | ((prev: File[]) => File[])) => {
    if (typeof images === 'function') {
      setFormData(prev => ({ ...prev, dynamicImages: images(prev.dynamicImages) }));
    } else {
      setFormData(prev => ({ ...prev, dynamicImages: images }));
    }
  }, []);

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: string[] = [];
    
    // 内容验证
    if (!formData.dynamicDescription.trim()) {
      errors.push('动态描述不能为空');
    }
    
    if (!formData.dynamicDetails.trim()) {
      errors.push('动态详细信息不能为空');
    }
    
    // URL格式验证
    const urlFields = [
      { field: 'codeUrl', name: '代码地址' },
      { field: 'demoUrl', name: '演示地址' }
    ];
    
    urlFields.forEach(({ field, name }) => {
      const value = formData[field as keyof typeof formData];
      if (value && typeof value === 'string' && value.trim()) {
        try {
          new URL(value.trim());
        } catch {
          errors.push(`${name}格式不正确`);
        }
      }
    });
    
    if (errors.length > 0) {
      alert(`请修正以下问题：\n${errors.join('\n')}`);
      return;
    }
    
    console.log('提交表单数据:', formData);
    alert('动态创建成功！（这是演示版本）');
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto py-8 px-4 max-w-6xl space-y-8 relative z-10">
      {/* 动态基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FolderOpen className="inline h-5 w-5 mr-2" />
            动态基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                发布日期
              </Label>
              <Input
                id="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectBelong">
                <FolderOpen className="inline h-4 w-4 mr-1" />
                项目归属
              </Label>
              <Input
                id="projectBelong"
                value={formData.projectBelong}
                onChange={(e) => setFormData(prev => ({ ...prev, projectBelong: e.target.value }))}
                placeholder="输入项目归属"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dynamicType">
              <Type className="inline h-4 w-4 mr-1" />
              动态类型
            </Label>
            <Select value={formData.dynamicType} onValueChange={(value) => setFormData(prev => ({ ...prev, dynamicType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="选择动态类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">🔄 项目更新</SelectItem>
                <SelectItem value="release">🚀 版本发布</SelectItem>
                <SelectItem value="feature">✨ 新功能</SelectItem>
                <SelectItem value="bugfix">🐛 问题修复</SelectItem>
                <SelectItem value="announcement">📢 公告</SelectItem>
                <SelectItem value="other">📝 其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dynamicDescription">
              <FileText className="inline h-4 w-4 mr-1" />
              动态描述 *
            </Label>
            <Textarea
              id="dynamicDescription"
              value={formData.dynamicDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, dynamicDescription: e.target.value }))}
              placeholder="简要描述动态内容"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>
              <Tags className="inline h-4 w-4 mr-1" />
              动态标签
            </Label>
            <DynamicTags
              tags={formData.dynamicTags}
              onChange={(tags) => setFormData(prev => ({ ...prev, dynamicTags: tags }))}
              placeholder="输入动态标签"
            />
          </div>
        </CardContent>
      </Card>

      {/* 动态详细信息 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="inline h-5 w-5 mr-2" />
            动态详细信息 *
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <MarkdownEditor
              value={formData.dynamicDetails}
              onChange={(dynamicDetails) => setFormData(prev => ({ ...prev, dynamicDetails }))}
              placeholder="输入动态详细信息..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 动态图片 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Image className="inline h-5 w-5 mr-2" />
            动态图片
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={formData.dynamicImages}
            setImages={handleDynamicImageUpload}
          />
        </CardContent>
      </Card>

      {/* 相关链接 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ExternalLink className="inline h-5 w-5 mr-2" />
            相关链接
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codeUrl">
                <Code className="inline h-4 w-4 mr-1" />
                代码地址
              </Label>
              <Input
                id="codeUrl"
                type="url"
                value={formData.codeUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, codeUrl: e.target.value }))}
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demoUrl">
                <Monitor className="inline h-4 w-4 mr-1" />
                演示地址
              </Label>
              <Input
                id="demoUrl"
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                placeholder="https://demo.example.com"
              />
            </div>
          </div>
          
          {/* 演示地址介绍左右两栏 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demoUrlDescriptionLeft">
                <Code className="inline h-4 w-4 mr-1" />
                演示地址介绍左侧栏 Markdown
              </Label>
              <Textarea
                id="demoUrlDescriptionLeft"
                value={formData.demoUrlDescriptionLeft}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrlDescriptionLeft: e.target.value }))}
                placeholder="输入左侧栏演示介绍的 Markdown 内容..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoUrlDescriptionRight">
                <FileCode className="inline h-4 w-4 mr-1" />
                演示地址介绍右侧栏 Markdown
              </Label>
              <Textarea
                id="demoUrlDescriptionRight"
                value={formData.demoUrlDescriptionRight}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrlDescriptionRight: e.target.value }))}
                placeholder="输入右侧栏演示介绍的 Markdown 内容..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* 提交按钮 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={handleSaveDraft}>
          <Save className="w-4 h-4 mr-2" />
          保存草稿
        </Button>
        <Button type="submit">
          <Send className="w-4 h-4 mr-2" />
          发布动态
        </Button>
      </div>
    </form>
  );
}
