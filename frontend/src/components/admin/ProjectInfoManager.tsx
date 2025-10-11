'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { IconPicker } from './IconPicker';
import { useExecuteCode } from '@/hooks/useExecuteCode';
import { Loader2 } from 'lucide-react';
import { JS_CODE_EXECUTOR_GUIDE } from '@/constants/projectJsonPrompt';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Home,
  Sidebar,
  Sparkles,
} from 'lucide-react';

export interface ProjectInfo {
  id: string;
  icon: string;
  label: string;
  valueCode: string;
  showInHomepage: boolean;
  showInSidebar: boolean;
  showInHero: boolean;
  color: string;
  order: number;
}

interface ProjectInfoManagerProps {
  projectInfos: ProjectInfo[];
  onChange: (infos: ProjectInfo[]) => void;
}

// 预设颜色主题 - 去除相似颜色，保留最具代表性的颜色
const colorThemes = [
  // 基础彩色系列
  "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800",
  "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800",
  "text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800",
  "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
  "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800",

  // 蓝绿色系
  "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/30 dark:border-cyan-800",
  "text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/30 dark:border-teal-800",

  // 紫色系
  "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-800",
  "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-800",
  "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-800",

  // 粉红色系
  "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800",
  "text-pink-600 bg-pink-50 border-pink-200 dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-800",

  // 特殊颜色
  "text-lime-600 bg-lime-50 border-lime-200 dark:text-lime-400 dark:bg-lime-950/30 dark:border-lime-800",
  "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",

  // 中性色系（保留最常用的）
  "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/30 dark:border-gray-800",
  // 深色变种（精选）
  "text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-700",
  "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700",
  "text-purple-700 bg-purple-100 border-purple-300 dark:text-purple-300 dark:bg-purple-900/40 dark:border-purple-700",
];

// 预览项组件
function PreviewItem({ info }: { info: ProjectInfo }) {
  const { value, loading } = useExecuteCode(info.valueCode, '计算中...');

  return (
    <div className="space-y-2">
      <div
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${info.color}`}
      >
        <Icon icon={info.icon} className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">
          {info.label}
        </p>
        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">执行中...</span>
            </>
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  );
}

// 可排序的列表项组件
type PlacementField = 'showInHomepage' | 'showInSidebar' | 'showInHero';

function SortableItem({ info, onEdit, onDelete, onToggleHomepage, onToggleSidebar, onToggleHero }: {
  info: ProjectInfo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHomepage: () => void;
  onToggleSidebar: () => void;
  onToggleHero: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: info.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <button
        className="cursor-grab hover:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${info.color}`}>
        <Icon icon={info.icon} className="w-4 h-4" />
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-sm">{info.label}</p>
        <div className="flex gap-2 mt-1">
          {info.showInHomepage && (
            <Badge variant="secondary" className="text-xs">
              <Home className="w-3 h-3 mr-1" />
              首页
            </Badge>
          )}
          {info.showInSidebar && (
            <Badge variant="secondary" className="text-xs">
              <Sidebar className="w-3 h-3 mr-1" />
              侧边栏
            </Badge>
          )}
          {info.showInHero && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Hero
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={info.showInHomepage ? 'secondary' : 'ghost'}
            className="h-8"
            onClick={onToggleHomepage}
          >
            <Home className="w-4 h-4 mr-1" />
            首页
          </Button>
          <Button
            type="button"
            size="sm"
            variant={info.showInSidebar ? 'secondary' : 'ghost'}
            className="h-8"
            onClick={onToggleSidebar}
          >
            <Sidebar className="w-4 h-4 mr-1" />
            侧边栏
          </Button>
          <Button
            type="button"
            size="sm"
            variant={info.showInHero ? 'secondary' : 'ghost'}
            className="h-8"
            onClick={onToggleHero}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Hero
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onEdit}
        >
          编辑
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function ProjectInfoManager({ projectInfos, onChange }: ProjectInfoManagerProps) {
  const normalizedProjectInfos = useMemo(
    () =>
      projectInfos.map((info, index) => ({
        ...info,
        showInHero: Boolean(info.showInHero),
        order: typeof info.order === 'number' ? info.order : index,
      })),
    [projectInfos]
  );

  const [infos, setInfos] = useState<ProjectInfo[]>(normalizedProjectInfos);

  useEffect(() => {
    setInfos(normalizedProjectInfos);
  }, [normalizedProjectInfos]);
  const [editingInfo, setEditingInfo] = useState<ProjectInfo | null>(null);
  const [customColor, setCustomColor] = useState('');
  const [formData, setFormData] = useState<Omit<ProjectInfo, 'id' | 'order'>>({
    icon: 'lucide:code',
    label: '',
    valueCode: '',
    showInHomepage: false,
    showInSidebar: false,
    showInHero: false,
    color: colorThemes[0],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 只在用户操作时才调用 onChange，不要在 useEffect 中自动同步
  // 这会导致无限循环，因为 onChange 会触发父组件更新，然后又触发这个组件重新渲染
  // useEffect(() => {
  //   const hasChanged = JSON.stringify(infos) !== JSON.stringify(normalizedProjectInfos);
  //   if (hasChanged) {
  //     onChange(infos);
  //   }
  // }, [infos, normalizedProjectInfos, onChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setInfos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        const reordered = newItems.map((item, index) => ({ ...item, order: index }));

        // 调用 onChange 通知父组件
        onChange(reordered);

        return reordered;
      });
    }
  };

  const updateInfoPlacement = (id: string, field: PlacementField) => {
    setInfos(prevInfos => {
      const target = prevInfos.find(info => info.id === id);
      if (!target) {
        return prevInfos;
      }

      const nextValue = !target[field];
      if (nextValue) {
        if (field === 'showInHomepage') {
          const homepageCount = prevInfos.filter(info => info.showInHomepage).length;
          if (homepageCount >= 4) {
            alert('首页最多只能展示4个信息');
            return prevInfos;
          }
        }

        if (field === 'showInSidebar') {
          const sidebarCount = prevInfos.filter(info => info.showInSidebar).length;
          if (sidebarCount >= 8) {
            alert('侧边栏最多只能展示8个信息');
            return prevInfos;
          }
        }
      }

      const updated = prevInfos.map(info =>
        info.id === id ? { ...info, [field]: nextValue } : info
      );

      if (editingInfo?.id === id) {
        setEditingInfo(prev => (prev ? { ...prev, [field]: nextValue } : prev));
        setFormData(prev => ({ ...prev, [field]: nextValue }));
      }

      onChange(updated);
      return updated;
    });
  };

  const handleAddInfo = () => {
    // 检查限制
    const homepageCount = infos.filter(info => info.showInHomepage).length;
    const sidebarCount = infos.filter(info => info.showInSidebar).length;

    if (formData.showInHomepage && homepageCount >= 4) {
      alert('首页最多只能展示4个信息');
      return;
    }

    if (formData.showInSidebar && sidebarCount >= 8) {
      alert('侧边栏最多只能展示8个信息');
      return;
    }

    if (!formData.label || !formData.valueCode) {
      alert('请填写信息名称和代码');
      return;
    }

    if (editingInfo) {
      // 编辑模式
      const updated = infos.map(info =>
        info.id === editingInfo.id
          ? { ...formData, id: info.id, order: info.order }
          : info
      );
      setInfos(updated);
      onChange(updated);
      setEditingInfo(null);
    } else {
      // 新增模式
      const newInfo: ProjectInfo = {
        ...formData,
        id: Date.now().toString(),
        order: infos.length,
      };
      const updated = [...infos, newInfo];
      setInfos(updated);
      onChange(updated);
    }

    // 重置表单
    setFormData({
      icon: 'lucide:code',
      label: '',
      valueCode: '',
      showInHomepage: false,
      showInSidebar: false,
      showInHero: false,
      color: colorThemes[0],
    });
    setCustomColor('');
  };

  const handleEditInfo = (info: ProjectInfo) => {
    setEditingInfo(info);
    setFormData({
      icon: info.icon,
      label: info.label,
      valueCode: info.valueCode,
      showInHomepage: info.showInHomepage,
      showInSidebar: info.showInSidebar,
      showInHero: info.showInHero,
      color: info.color,
    });
  };

  const handleDeleteInfo = (id: string) => {
    const updated = infos.filter(info => info.id !== id);
    setInfos(updated);
    onChange(updated);
  };

  const handleCancelEdit = () => {
    setEditingInfo(null);
    setFormData({
      icon: 'lucide:code',
      label: '',
      valueCode: '',
      showInHomepage: false,
      showInSidebar: false,
      showInHero: false,
      color: colorThemes[0],
    });
    setCustomColor('');
  };

  return (
    <div className="space-y-6">
      {/* 拖动排序区域 */}
      <Card>
        <CardHeader>
          <CardTitle>信息展示管理</CardTitle>
          <p className="text-sm text-muted-foreground">
            拖动排序项目信息，管理展示内容
          </p>
        </CardHeader>
        <CardContent>
          {infos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无项目信息，请在下方添加
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={infos.map(info => info.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {infos.map((info) => (
                    <SortableItem
                      key={info.id}
                      info={info}
                      onEdit={() => handleEditInfo(info)}
                      onDelete={() => handleDeleteInfo(info.id)}
                      onToggleHomepage={() => updateInfoPlacement(info.id, 'showInHomepage')}
                      onToggleSidebar={() => updateInfoPlacement(info.id, 'showInSidebar')}
                      onToggleHero={() => updateInfoPlacement(info.id, 'showInHero')}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* 信息表单 */}
      <Card>
        <CardHeader>
          <CardTitle>{editingInfo ? '编辑信息' : '添加信息'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 图标选择 */}
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
              placeholder="选择图标"
            />

            {/* 信息名称 */}
            <div className="space-y-2">
              <Label htmlFor="label">信息名称</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="如：技术栈、开发周期等"
              />
            </div>
          </div>

          {/* 信息值代码 */}
          <div className="space-y-2">
            <Label htmlFor="valueCode">信息值代码 (JavaScript)</Label>
            <Textarea
              id="valueCode"
              value={formData.valueCode}
              onChange={(e) => setFormData(prev => ({ ...prev, valueCode: e.target.value }))}
              placeholder={JS_CODE_EXECUTOR_GUIDE}
              rows={12}
              className="font-mono text-sm overflow-y-auto max-h-[360px]"
            />
            <p className="text-xs text-muted-foreground">
              💡 支持 fetch API 网络请求、异步操作、数据计算等。结果会被缓存 6 小时。
            </p>
          </div>

          {/* 展示选项 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showInHomepage" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                展示在首页
                <span className="text-xs text-muted-foreground">（最多4个）</span>
              </Label>
              <Switch
                id="showInHomepage"
                checked={formData.showInHomepage}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInHomepage: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showInSidebar" className="flex items-center gap-2">
                <Sidebar className="w-4 h-4" />
                展示在侧边栏
                <span className="text-xs text-muted-foreground">（最多8个）</span>
              </Label>
              <Switch
                id="showInSidebar"
                checked={formData.showInSidebar}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInSidebar: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showInHero" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                展示在 Hero 区域
                <span className="text-xs text-muted-foreground">（建议不超过3个）</span>
              </Label>
              <Switch
                id="showInHero"
                checked={formData.showInHero}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInHero: checked }))}
              />
            </div>
          </div>

          {/* 颜色选择 */}
          <div className="space-y-2">
            <Label>颜色主题</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {colorThemes.map((theme, index) => {
                const isSelected = formData.color === theme;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, color: theme }));
                    }}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${theme}
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <Icon icon={formData.icon} className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 自定义颜色输入 */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="customColor" className="text-sm">自定义颜色</Label>
              <div className="flex gap-2">
                {/* 颜色预览 */}
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-12 h-10 rounded-lg border-2 transition-all flex items-center justify-center
                      ${customColor.trim() ? customColor.trim() : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'}
                    `}
                  >
                    <Icon icon={formData.icon} className="w-4 h-4" />
                  </div>
                </div>

                <Input
                  id="customColor"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="如: text-purple-700 bg-purple-100 border-purple-300"
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (customColor.trim()) {
                      setFormData(prev => ({ ...prev, color: customColor.trim() }));
                      setCustomColor('');
                    }
                  }}
                  disabled={!customColor.trim()}
                >
                  应用
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                输入完整的 Tailwind CSS 类名，格式：text-[color] bg-[color] border-[color] dark:text-[color] dark:bg-[color] dark:border-[color]
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            {editingInfo && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                取消编辑
              </Button>
            )}
            <Button
              type="button"
              onClick={handleAddInfo}
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingInfo ? '保存修改' : '添加信息'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 预览效果 */}
      {infos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              预览效果
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              展示 JavaScript 代码执行后的实际结果
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
              {infos.map((info) => (
                <PreviewItem key={info.id} info={info} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}