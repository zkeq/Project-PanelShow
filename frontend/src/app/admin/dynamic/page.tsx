"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DynamicTags } from '@/components/admin/DynamicTags';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { ImageUpload } from '@/components/admin/dynamic/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DynamicFormData {
  // 基础信息
  title: string;
  summary: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  
  // 内容分类
  category: string;
  subcategory: string;
  tags: string[];
  
  // 时间管理
  publishTime: string;
  createdTime: string;
  updatedTime: string;
  
  // 媒体内容
  coverImage: File | null;
  images: File[];
  
  // 发布设置
  isPinned: boolean;
  isFeatured: boolean;
  allowComments: boolean;
  isPublic: boolean;
  
  // 相关链接
  sourceUrl: string;
  demoUrl: string;
  downloadUrl: string;
}

export default function CreateDynamicPage() {
  const [formData, setFormData] = useState<DynamicFormData>({
    // 基础信息
    title: '',
    summary: '',
    content: '',
    author: '',
    status: 'draft',
    
    // 内容分类
    category: '',
    subcategory: '',
    tags: [],
    
    // 时间管理
    publishTime: new Date().toISOString().slice(0, 16),
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
    
    // 媒体内容
    coverImage: null,
    images: [],
    
    // 发布设置
    isPinned: false,
    isFeatured: false,
    allowComments: true,
    isPublic: true,
    
    // 相关链接
    sourceUrl: '',
    demoUrl: '',
    downloadUrl: ''
  });

  const [isSubmitting] = useState(false);

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

  // 图片上传适配器
  const handleImageUpload = useCallback((images: File[] | ((prev: File[]) => File[])) => {
    if (typeof images === 'function') {
      setFormData(prev => ({ ...prev, images: images(prev.images) }));
    } else {
      setFormData(prev => ({ ...prev, images }));
    }
  }, []);

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: string[] = [];
    
    // 基础信息验证
    if (!formData.title.trim()) {
      errors.push('动态标题不能为空');
    }
    
    if (!formData.summary.trim()) {
      errors.push('摘要描述不能为空');
    }
    
    if (!formData.author.trim()) {
      errors.push('作者姓名不能为空');
    }
    
    // 内容分类验证
    if (!formData.category) {
      errors.push('请选择主分类');
    }
    
    // 内容验证
    if (!formData.content.trim()) {
      errors.push('动态内容不能为空');
    }
    
    // URL格式验证
    const urlFields = [
      { field: 'sourceUrl', name: '原文链接' },
      { field: 'demoUrl', name: '演示链接' },
      { field: 'downloadUrl', name: '下载链接' }
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
    
    // 更新更新时间
    setFormData(prev => ({
      ...prev,
      updatedTime: new Date().toISOString()
    }));
    
    console.log('提交表单数据:', formData);
    alert('动态创建成功！（这是演示版本）');
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto py-8 px-4 max-w-6xl space-y-8 relative z-10">
      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            基础信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">动态标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入动态标题"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">摘要描述 *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="简要描述动态内容（用于列表展示和SEO）"
                  rows={3}
                  required
                />
              </div>
            </div>
            
            {/* 右侧 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">作者 *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="输入作者姓名"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 草稿</SelectItem>
                    <SelectItem value="published">📢 已发布</SelectItem>
                    <SelectItem value="archived">📦 已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内容分类 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            内容分类
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">主分类 *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择主分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">🎨 设计作品</SelectItem>
                  <SelectItem value="development">💻 开发项目</SelectItem>
                  <SelectItem value="photography">📸 摄影作品</SelectItem>
                  <SelectItem value="writing">✍️ 文字创作</SelectItem>
                  <SelectItem value="video">🎬 视频制作</SelectItem>
                  <SelectItem value="other">🔧 其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subcategory">子分类</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="输入子分类（可选）"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>标签</Label>
            <DynamicTags
              tags={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="输入标签后按回车或点击添加"
            />
          </div>
        </CardContent>
      </Card>

      {/* 时间管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            时间管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishTime">发布时间</Label>
              <Input
                id="publishTime"
                type="datetime-local"
                value={formData.publishTime}
                onChange={(e) => setFormData(prev => ({ ...prev, publishTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>创建时间</Label>
              <Input
                value={new Date(formData.createdTime).toLocaleString()}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>更新时间</Label>
              <Input
                value={new Date(formData.updatedTime).toLocaleString()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* 媒体内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
            媒体内容
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={formData.images}
            setImages={handleImageUpload}
          />
        </CardContent>
      </Card>

      {/* 发布设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
            发布设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
                />
                <Label htmlFor="isPinned">置顶显示</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">推荐内容</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowComments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: checked }))}
                />
                <Label htmlFor="allowComments">允许评论</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">公开显示</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 相关链接 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            相关链接
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">原文链接</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demoUrl">演示链接</Label>
              <Input
                id="demoUrl"
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                placeholder="https://demo.example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downloadUrl">下载链接</Label>
              <Input
                id="downloadUrl"
                type="url"
                value={formData.downloadUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                placeholder="https://download.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 动态内容 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            动态内容
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="使用 Markdown 编写您的动态内容..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          创建时间：{new Date(formData.createdTime).toLocaleString()}
        </div>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            保存草稿
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '发布中...' : '发布动态'}
          </Button>
        </div>
      </div>
    </form>
  );
}
