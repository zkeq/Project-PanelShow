"use client";

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Braces,
  BrainCircuit,
  Calendar,
  Check,
  ClipboardPaste,
  Clipboard,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  FileCode,
  FileText,
  FolderPlus,
  Github,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutList,
  Link2,
  ListOrdered,
  MousePointerClick,
  Package,
  Rocket,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  TerminalSquare,
  Type,
  Upload,
  User,
  Wand2,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { PROJECT_JSON_PROMPT_GUIDE } from '@/constants/projectJsonPrompt';

/* ---------------------------------- 类型 ---------------------------------- */

interface SectionNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TutorialStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tips: string[];
  action?: { label: string; href: string };
}

interface SubTask {
  /** 子任务编号，如 3.1 */
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  goal: string;
  details: string[];
  warning?: string;
}

/* ------------------------------ 区块导航数据 ------------------------------ */

const SECTION_NAV: SectionNavItem[] = [
  { id: 'overview', label: '项目概览', icon: BookOpen },
  { id: 'steps', label: '上手流程', icon: LayoutList },
  { id: 'create-project', label: '新建项目详解', icon: FolderPlus },
  { id: 'ai-workflow', label: 'AI 一键建站', icon: Wand2 },
  { id: 'prompt-anatomy', label: '提示词解剖', icon: BrainCircuit },
  { id: 'dynamic', label: '发布动态', icon: Calendar },
  { id: 'settings', label: '个人资料', icon: Settings },
  { id: 'faq', label: '常见问题', icon: BadgeCheck },
  { id: 'quick-links', label: '快捷入口', icon: Rocket },
];

const quickLinks = [
  {
    icon: LayoutDashboard,
    title: '管理控制台',
    description: '项目/动态总览、搜索筛选与快捷入口',
    href: '/admin',
  },
  {
    icon: FolderPlus,
    title: '新建项目',
    description: '内置 AI 提示词 + JSON 回填，3 分钟建好一个项目',
    href: '/admin/projects/create',
  },
  {
    icon: Calendar,
    title: '发布动态',
    description: '记录版本更新、里程碑与日常进展',
    href: '/admin/dynamic',
  },
  {
    icon: Settings,
    title: '系统设置',
    description: '个人资料、工作经历、联系方式与技术栈',
    href: '/admin/settings',
  },
];

/* ------------------------------ 新建项目子任务 ----------------------------- */

const CREATE_SUBTASKS: SubTask[] = [
  {
    id: '3.1',
    icon: Type,
    title: '填写基本信息（必填）',
    goal: '决定项目卡片在画廊中的第一眼印象。',
    details: [
      '项目名称（必填）：建议 2~20 字，会显示在卡片标题与详情页大标题',
      '项目简介（必填）：一句话概括功能与亮点，用于卡片摘要和分享预览',
      '项目标签：0~6 个短词（如 React、全栈、开源），支持回车快速添加',
      '小抄：三项都有「*」标记，AI 生成的 JSON 会自动填好，你只需润色语气',
    ],
  },
  {
    id: '3.2',
    icon: Package,
    title: '选择状态 / 类型 / 特性徽章',
    goal: '三个下拉选择器，全部支持「边用边建」自定义选项。',
    details: [
      '项目状态：默认有活跃项目 / 施工中 / 已迭代 / 已归档，自定义状态可挑选颜色，会实时保存到个人配置',
      '项目类型：默认公司项目 / 个人项目 / 创业项目，自定义类型可搭配 lucide 图标',
      '项目特性：首页徽章（如高性能、安全可靠），支持 12 种特效预设（golden-glow、aurora 等）',
      '新建的选项会写入后台设置（projectStatuses / projectTypes / projectFeatures），全站复用',
    ],
    warning: 'AI 生成 JSON 时若写了自定义 statusId/typeId，应用后表单会自动识别并展示对应选项。',
  },
  {
    id: '3.3',
    icon: Link2,
    title: '配置访问链接',
    goal: '让访客一键跳转预览与源码。',
    details: [
      '项目预览地址：PC 端在线演示 URL，会渲染成详情页的「在线预览」按钮',
      '移动端预览地址（可选）：手机端专属演示链接',
      '项目源码地址：开启「项目开源」开关后必填，未开启时输入框自动禁用',
      '左右侧栏 Markdown：详情页两侧的附加信息区，支持代码高亮，适合放部署方式、API 说明',
    ],
  },
  {
    id: '3.4',
    icon: ImageIcon,
    title: '上传作品截图',
    goal: '截图是项目详情的门面，支持批量上传与排序。',
    details: [
      '支持直接选择本地图片上传，后端自动存入腾讯云 COS（未配置 COS 时回落本地存储）',
      '每张截图可单独填写名称与描述，访客放大查看时会展示',
      '可拖拽调整顺序，第一张通常作为卡片封面',
      'AI 生成 JSON 时可先用外链图片占位，后续再替换为本站上传的地址',
    ],
  },
  {
    id: '3.5',
    icon: LayoutList,
    title: '编排项目概览信息（动态 JS 值）',
    goal: '首页卡片 / 详情侧栏 / Hero 区的信息条，可静态也可实时计算。',
    details: [
      '每条信息 = 图标 + 名称 + 一段 JavaScript「信息值代码」，return 什么就显示什么',
      '三个展示位独立开关：首页（最多 4 条）、侧边栏（最多 8 条）、Hero 区（建议 ≤3 条）',
      '颜色主题内置 24 种 Tailwind 组合，也支持自定义类名（text/bg/border 三段式）',
      '支持 fetch 实时拉数据：GitHub Star 数、运行天数、服务健康状态……结果缓存 6 小时',
      '表单底部有「预览效果」区，实时展示代码执行结果，所见即所得',
    ],
    warning: '信息值代码在 Node vm 沙箱中执行：限时 24 秒、禁止文件系统/DOM、禁止携带鉴权头。',
  },
  {
    id: '3.6',
    icon: FileText,
    title: '撰写项目介绍（Markdown）',
    goal: '详情页正文，AI 最擅长替你写这部分。',
    details: [
      '使用内置 Markdown 编辑器，支持代码块高亮、表格、任务列表',
      '提交时会自动映射到 longDescription 字段，前台完整渲染',
      '建议结构：项目背景 → 核心功能 → 技术架构 → 亮点数据 → 未来规划',
      '提示词里已要求 AI「详细总结、简洁明了、不要废话」，生成后微调即可',
    ],
  },
  {
    id: '3.7',
    icon: Sparkles,
    title: '配置特色功能演示',
    goal: '为项目的核心卖点做独立展示位。',
    details: [
      '每个亮点包含：标题 + 描述 + 彩色技术栈标签（渐变配色）',
      '可为每个亮点单独上传截图、配置桌面/移动端演示地址',
      '左右栏 Markdown 可自由发挥，适合做功能对比、架构图解',
      '亮点会生成独立的演示详情页（demo 路由），适合放交互式 Demo',
    ],
  },
  {
    id: '3.8',
    icon: Braces,
    title: 'JSON 数据预览与回填',
    goal: '表单的「第二形态」，批量修改与 AI 协作的核心入口。',
    details: [
      '底部 JSON 编辑器与上方表单实时双向同步，任何修改都能互相覆盖',
      'AI 返回 JSON 后：整段粘贴进来 → 点击「应用到表单」→ 上方所有字段瞬间填好',
      '应用时会自动剔除 homeAttributes / sidebarAttributes / heroAttributes / timeline_items 四个展示派生字段，避免脏数据',
      '点击「重置 JSON」可放弃当前编辑，恢复为表单最新状态',
    ],
    warning: 'JSON 必须是一个对象；格式错误时会在下方给出具体报错行，修正后再应用即可。',
  },
  {
    id: '3.9',
    icon: ListOrdered,
    title: '调整展示顺序',
    goal: '控制多个项目在画廊中的先后。',
    details: [
      '「展示顺序」是一个数字，越小越靠前',
      '保存后仍可在控制台项目列表中用按钮快速调序，无需重新编辑',
      '建议按重要程度以 10 为间隔编号（0、10、20…），方便后续插入新项目',
    ],
  },
  {
    id: '3.10',
    icon: Save,
    title: '保存草稿（防丢）',
    goal: '新建模式专属，写到一半随时离开。',
    details: [
      '点击「保存草稿」将表单快照存入浏览器 localStorage（key：project-draft）',
      '下次进入新建页会自动恢复，并提示最后保存时间',
      '发布动态页也有同样的草稿机制（自动保存 + 恢复确认）',
    ],
    warning: '草稿只存在当前浏览器，换设备/清缓存会丢失；正式提交后会自动清空草稿。',
  },
  {
    id: '3.11',
    icon: Send,
    title: '提交发布',
    goal: '最后一击，让项目上线。',
    details: [
      '点击「创建作品集」，提交前自动校验：名称/简介必填、开源必须填源码地址',
      '成功后 Toast 提示并自动清空草稿，约 1.2 秒后跳回控制台',
      '回到控制台即可看到新卡片，访问 /project/<你的站点地址> 欣赏成果',
      '项目 ID 可不填由后端自动生成；AI 若生成了 id 也会沿用',
    ],
  },
];

/* ------------------------------- AI 工作流步骤 ------------------------------ */

const AI_FLOW_STEPS: TutorialStep[] = [
  {
    icon: Clipboard,
    title: '复制内置 AI 提示词',
    description:
      '打开「新建项目」，滚动到「JSON 提示词信息」卡片，点击右上角「复制提示词」按钮。系统会自动选中全文并写入剪贴板（同时弹出成功提示）。',
    tips: [
      '提示词约 400 行，包含：完整示例 JSON + 全字段约束说明 + JS 执行器指南 + 生成要求',
      '复制按钮会自动全选文本，手动框选复制也完全可行',
      '该提示词针对本表单的 ProjectFormData 结构量身定制，别的项目抄不走这么精准',
    ],
    action: { label: '去复制提示词', href: '/admin/projects/create' },
  },
  {
    icon: BrainCircuit,
    title: '粘贴给你常用的 AI',
    description:
      '把提示词粘贴到 Kimi、ChatGPT、Claude、DeepSeek 等任意对话式 AI，并在开头补一句你的项目背景（README、仓库地址、几句介绍都行）。',
    tips: [
      '推荐附带上项目的 README 或主要文件列表，AI 生成的描述会更贴实际',
      '提示词已内置三条硬规则：概览信息写 30 条候选、介绍要详细简洁、三个展示位数量受限',
      '可以多轮对话微调，比如「把 Hero 区的 3 条改成体现性能的数据」',
    ],
  },
  {
    icon: ClipboardPaste,
    title: '粘贴 JSON 回填表单',
    description:
      'AI 输出完整 JSON 后，回到新建项目页，整段粘贴进底部「JSON 数据预览与编辑」输入框，点击「应用到表单」。',
    tips: [
      '应用成功会弹出「JSON 已成功应用到表单」，上方所有卡片瞬间填好',
      'timeline_items 等派生字段会被自动剔除，无需手动清理',
      '解析失败会给出具体错误信息，通常是 AI 多输出了 markdown 代码块围栏（三个反引号），删掉首尾两行即可',
    ],
  },
  {
    icon: MousePointerClick,
    title: '人工微调与替换素材',
    description:
      'AI 负责 90% 的体力活，你负责最后的灵魂：替换截图、校对链接、调整文案语气。',
    tips: [
      '把占位图替换成本站上传的真实截图（截图组件会自动上传到 COS）',
      '检查 previewUrl / sourceUrl 是否为真实地址',
      '项目概览信息的 valueCode 可以直接在预览区看到执行结果，不满意就改代码',
    ],
  },
  {
    icon: Send,
    title: '提交，大功告成',
    description:
      '点击「创建作品集」，一个包含概览信息、亮点演示、Markdown 介绍的完整项目就上线了。整套流程熟练后 3~5 分钟即可完成。',
    tips: [
      '提交后草稿自动清空，随时可以在控制台继续编辑',
      '同一套提示词可反复复用，每个新项目只需替换背景描述',
      '接下来去「发布动态」为项目发第一条更新记录吧',
    ],
    action: { label: '去发布动态', href: '/admin/dynamic' },
  },
];

/* ------------------------------ 提示词解剖数据 ------------------------------ */

const PROMPT_SECTIONS = [
  {
    icon: Braces,
    title: '① 完整示例 JSON',
    description:
      '一个真实可用的项目数据样板（SparkAI Frontend），覆盖 name、status、type、features、screenshots、projectInfos、featureHighlights 等全部字段，AI 照葫芦画瓢即可保证结构正确。',
  },
  {
    icon: FileCode,
    title: '② 全字段约束说明',
    description:
      '逐个解释 ProjectFormData 顶层字段与嵌套结构（ProjectStatus / ProjectType / ProjectFeature / Screenshot / ProjectInfo / FeatureHighlight），标注必填项、枚举值与 Tailwind 颜色写法。',
  },
  {
    icon: TerminalSquare,
    title: '③ JS 执行器指南',
    description:
      '告诉 AI「信息值代码」的运行环境：Node vm 沙箱、24 秒超时、可用 fetch、缓存 6 小时、禁止鉴权头，并附带 GitHub Stars、运行天数等实用示例。',
  },
  {
    icon: Zap,
    title: '④ 三条生成硬规则',
    description:
      '概览信息生成 30 条候选（值要短）、projectIntroduction 要详细且简洁、homeAttributes ≤4 / heroAttributes ≤3 / sidebarAttributes ≤8，并把结果写入 JSON 文件交付。',
  },
];

/* --------------------------------- 主组件 --------------------------------- */

export function AdminTutorial() {
  const user = useAuthStore((state) => state.user);
  const boundUsername = user?.bound_username ?? '';
  const [promptCopied, setPromptCopied] = useState(false);

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_JSON_PROMPT_GUIDE);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (error) {
      console.error('复制提示词失败:', error);
    }
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const steps: TutorialStep[] = [
    {
      icon: Link2,
      title: '绑定用户名与站点地址',
      description:
        '首次登录会进入欢迎页，完成用户名、站点标题和站点地址的绑定。站点地址决定你作品集的访问路径，提交后系统会自动初始化你的专属空间。',
      tips: [
        '站点地址规则：3~20 位小写字母/数字/连字符，不能以连字符开头结尾、不能有连续连字符，实时检测可用性',
        '如果登录账号的用户名是中文，系统会自动转换为拼音作为默认站点地址（如「张三」→ zhang-san），避免出现很长的编码 URL',
        'GitHub 登录用户会自动同步头像、简介等公开资料',
      ],
      action: { label: '前往欢迎页', href: '/admin/welcome' },
    },
    {
      icon: User,
      title: '完善个人资料',
      description:
        '在「系统设置」中维护基本信息、关于我、工作经历、联系方式与技术栈分类。这些内容会渲染到主页的个人资料区与时间线。',
      tips: [
        '技术栈分类可自定义，并关联到具体项目',
        '社交链接与联系方式会显示在主页页脚与侧边栏',
        '所有资料分区保存，互不影响',
      ],
      action: { label: '进入系统设置', href: '/admin/settings' },
    },
    {
      icon: FolderPlus,
      title: '创建项目（本教程重点）',
      description:
        '项目是作品集的核心。新建项目页内置了一份「AI 提示词」，复制给任意 AI 即可生成完整项目 JSON，一键回填表单。下面有 11 个子任务的详细拆解。',
      tips: [
        'AI 提示词 + JSON 回填：3 分钟建好一个信息完整的项目',
        '支持截图上传、特性亮点、动态 JS 信息值等高级玩法',
        '草稿自动保存，写到一半离开也不怕',
      ],
      action: { label: '查看 11 个子任务', href: '#create-project' },
    },
    {
      icon: Calendar,
      title: '发布动态与时间线',
      description:
        '通过「动态管理」记录项目的每次更新：新功能、重构、问题修复……动态会以时间线形式展示在主页，让访客看到你的持续活跃。',
      tips: [
        '动态可关联到具体项目，并附上演示/源码链接',
        '支持自定义动态类型与标签（颜色、图标均可配置）',
        '草稿自动保存在本地，刷新页面后可选择恢复',
      ],
      action: { label: '发布动态', href: '/admin/dynamic' },
    },
    {
      icon: Globe2,
      title: '访问并分享你的主页',
      description:
        '一切就绪后，你的公开作品集就上线了。主页包含项目画廊、时间线、技能标签与关于我页面，支持暗色模式与移动端自适应。',
      tips: boundUsername
        ? [
            `你的主页地址：/project/${boundUsername}`,
            '控制台顶部的绿色横幅可随时复制/访问站点地址',
            '项目详情页支持生成分享链接，把作品一键分享出去',
          ]
        : [
            '绑定站点地址后，主页路径为 /project/<你的站点地址>',
            '控制台顶部的绿色横幅可随时复制/访问站点地址',
            '项目详情页支持生成分享链接，把作品一键分享出去',
          ],
      action: boundUsername
        ? { label: '打开我的主页', href: `/project/${encodeURIComponent(boundUsername)}` }
        : undefined,
    },
  ];

  return (
    <div className="relative z-10 container mx-auto max-w-6xl space-y-10 px-4 py-10">
      {/* 页头 */}
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary/80">使用教程</p>
        <h1 className="text-3xl font-semibold tracking-tight">从零到一搭建你的作品集</h1>
        <p className="text-muted-foreground leading-relaxed">
          PanelShow 是一套真实可用的多用户作品集系统。本教程按「上手流程 → 新建项目 11 个子任务详解 →
          AI 一键建站」层层递进，核心亮点是：<span className="font-medium text-foreground">新建项目页内置了一份精心编写的
          AI 提示词，复制粘贴给任意 AI，3 分钟即可生成并回填整个项目</span>。
        </p>
      </header>

      {/* 返回控制台 */}
      <div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回管理控制台
          </Link>
        </Button>
      </div>

      {/* 区块导航 */}
      <div className="sticky top-16 z-20 -mx-1 px-1 py-2 bg-background/80 backdrop-blur-md rounded-xl">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5">
            {SECTION_NAV.map((item) => {
              const NavIcon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <NavIcon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* ================= 0. 项目概览 ================= */}
      <section id="overview" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={BookOpen} title="这是一个什么样的系统？" subtitle="先建立信任：它不是 Demo，是生产级完整系统" />
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Cpu, title: '完整技术栈', desc: 'Next.js 15 + FastAPI + Redis + Nginx，Docker 一键部署' },
                { icon: ShieldCheck, title: '三种登录', desc: '管理员账号密码 / GitHub OAuth / TDP OIDC' },
                { icon: Upload, title: '图片上传', desc: '腾讯云 COS 对象存储，未配置时自动回落本地' },
                { icon: Globe2, title: '多用户', desc: '每位用户绑定独立站点地址，拥有专属作品集主页' },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              你在管理后台所做的一切 —— 建项目、发动态、传截图、写资料 —— 都会实时渲染到公开主页
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">/project/&lt;站点地址&gt;</code>
              上，支持暗色模式与移动端自适应。放心大胆地往里填内容，这个系统完全是为真实使用而设计的。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ================= 1. 上手流程 ================= */}
      <section id="steps" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={LayoutList} title="五步上手流程" subtitle="全局视角：从绑定账号到分享主页" />
        <div className="space-y-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isAnchor = step.action?.href.startsWith('#');
            return (
              <Card key={step.title} className="bg-card/30 backdrop-blur-sm border border-white/20 relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        步骤 {index + 1}
                      </span>
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                    </div>
                    {step.action && (
                      isAnchor ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => scrollTo(step.action!.href.slice(1))}
                        >
                          {step.action.label}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" asChild className="shrink-0">
                          <Link href={step.action.href}>
                            {step.action.label}
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-[4.75rem]">
                  <ul className="space-y-1.5">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= 2. 新建项目详解（11 子任务） ================= */}
      <section id="create-project" className="scroll-mt-32 space-y-4">
        <SectionTitle
          icon={FolderPlus}
          title="新建项目 · 11 个子任务详解"
          subtitle="表单共 6 大卡片 + 底部操作区，这里把它拆成 11 个可独立完成的子任务"
          badge="本教程重点"
        />

        {/* AI 高光横幅 */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Wand2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">不想手填？这页内置了一份 AI 提示词</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                新建项目页底部「JSON 提示词信息」卡片里有一份为这张表单量身定制的提示词，复制给任意
                AI（Kimi / ChatGPT / Claude / DeepSeek），把返回的 JSON 粘贴进「JSON
                数据预览与编辑」一键回填 —— 子任务 3.1 ~ 3.7 的大部分内容瞬间完成。详见下文「AI 一键建站」。
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => scrollTo('ai-workflow')}>
                查看 AI 流程
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
              <Button size="sm" asChild>
                <Link href="/admin/projects/create">
                  <FolderPlus className="mr-1.5 h-4 w-4" />
                  去新建项目
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 子任务卡片 */}
        <div className="grid grid-cols-1 gap-5">
          {CREATE_SUBTASKS.map((task) => {
            const TaskIcon = task.icon;
            return (
              <Card key={task.id} className="bg-card/30 backdrop-blur-sm border border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                        <TaskIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-medium text-muted-foreground">{task.id}</span>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.goal}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <ul className="space-y-1.5">
                    {task.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {task.warning && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
                      <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{task.warning}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= 3. AI 一键建站 ================= */}
      <section id="ai-workflow" className="scroll-mt-32 space-y-4">
        <SectionTitle
          icon={Wand2}
          title="AI 一键建站 · 5 步操作流"
          subtitle="复制提示词 → AI 生成 JSON → 粘贴回填 → 微调 → 发布"
          badge="效率神器"
        />

        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <div className="relative space-y-6 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-px before:bg-border/70">
              {AI_FLOW_STEPS.map((step, index) => {
                const FlowIcon = step.icon;
                return (
                  <div key={step.title} className="relative flex gap-4">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full border border-primary/30 bg-background text-primary flex items-center justify-center shadow-sm">
                        <FlowIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium">
                          <span className="mr-2 text-xs font-mono text-muted-foreground">STEP {index + 1}</span>
                          {step.title}
                        </p>
                        {step.action && (
                          <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-primary">
                            <Link href={step.action.href}>
                              {step.action.label}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      <ul className="mt-2 space-y-1">
                        {step.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary/60" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 提示词现场复制 */}
        <Card className="border-primary/30 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">现在就试试：复制这份提示词</CardTitle>
                  <CardDescription>与新建项目页内置的提示词完全一致，复制后粘贴给任意 AI 即可</CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant={promptCopied ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={handleCopyPrompt}
              >
                {promptCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    已复制！
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    复制提示词
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-56 w-full rounded-md border bg-muted/40">
              <pre className="whitespace-pre-wrap px-4 py-3 text-xs leading-5 text-muted-foreground">
                {PROJECT_JSON_PROMPT_GUIDE}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

      {/* ================= 4. 提示词解剖 ================= */}
      <section id="prompt-anatomy" className="scroll-mt-32 space-y-4">
        <SectionTitle
          icon={BrainCircuit}
          title="提示词解剖室"
          subtitle="这份提示词为什么好用？它由四个精密部件组成"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROMPT_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Card key={section.title} className="bg-card/30 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">进阶玩法：</span>
              除了项目 JSON，「项目概览信息」里的每一条信息值都是一段真实可执行的 JavaScript
              （在 Node vm 沙箱中运行，支持 fetch、限时 24 秒、结果缓存 6 小时）。
              你可以让 AI 生成诸如「实时 GitHub Star 数」「项目运行天数」「服务健康检查」这样的动态信息条，
              让你的主页看起来像有后端在实时供数 —— 实际上只是几行会定时刷新的前端代码。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ================= 5. 发布动态 ================= */}
      <section id="dynamic" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={Calendar} title="发布动态 · 让主页活起来" subtitle="时间线是展示持续活跃度的最佳方式" />
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <Tabs defaultValue="what" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="what">能发什么</TabsTrigger>
                <TabsTrigger value="how">怎么发</TabsTrigger>
                <TabsTrigger value="tips">实用技巧</TabsTrigger>
              </TabsList>
              <TabsContent value="what" className="mt-4 space-y-2">
                {[
                  '新功能发布：关联项目，附演示链接与截图，自动进入项目时间线',
                  '问题修复 / 重构记录：让访客看到项目的维护频率与工程质量',
                  '里程碑动态：自定义动态类型与标签（颜色、图标均可配置）',
                  '每条动态支持图片资产、左右栏演示介绍、仓库/演示/移动端三组链接',
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </p>
                ))}
              </TabsContent>
              <TabsContent value="how" className="mt-4 space-y-2">
                {[
                  '进入「发布动态」页，选择关联项目与动态类型（新功能/修复BUG 等）',
                  '填写更新摘要（changelog）与详细说明（支持 Markdown）',
                  '按需上传配图、填写演示链接，标签可自由组合',
                  '点击发布，动态即刻出现在主页时间线与项目详情中',
                ].map((item, i) => (
                  <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {item}
                  </p>
                ))}
              </TabsContent>
              <TabsContent value="tips" className="mt-4 space-y-2">
                {[
                  '草稿自动保存到本地（panelshow-admin-dynamic-draft），刷新页面会询问是否恢复',
                  '动态支持点赞与评论计数，访客互动一目了然',
                  '建议保持节奏：哪怕是小修复也值得记录，时间线越密越显活跃',
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                    {item}
                  </p>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* ================= 6. 个人资料 ================= */}
      <section id="settings" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={Settings} title="个人资料 · 系统设置" subtitle="主页的「关于我」区域全部由这里驱动" />
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, title: '基本信息', desc: '昵称、头衔、邮箱、GitHub 等，渲染到主页头部与页脚' },
                { icon: FileText, title: '关于我', desc: 'Markdown 长文本，主页 /about 页面的主体内容' },
                { icon: Star, title: '工作经历', desc: '按时间线展示的职业经历，支持公司、职位、描述' },
                { icon: Tags, title: '技术栈分类', desc: '自定义技能分组并关联项目，主页技能墙的数据源' },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button size="sm" variant="outline" asChild>
                <Link href="/admin/settings">
                  进入系统设置
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ================= 7. 常见问题 ================= */}
      <section id="faq" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={BadgeCheck} title="常见问题" subtitle="初次使用最常遇到的几个问题" />
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="space-y-5 pt-6">
            <FaqItem
              icon={BadgeCheck}
              iconClass="text-emerald-500"
              question="这个项目能用吗？还是只是个演示 Demo？"
              answer="完全可用。PanelShow 是完整的前后端系统（Next.js 15 + FastAPI + Redis），支持多用户、Docker 一键部署、GitHub/TDP OAuth 登录、文件上传与实时通知，已在生产环境运行。"
            />
            <FaqItem
              icon={Wand2}
              iconClass="text-primary"
              question="AI 提示词在哪里？一定要用 AI 吗？"
              answer="在「新建项目」页底部的「JSON 提示词信息」卡片，点「复制提示词」即可。AI 不是必须的 —— 所有字段都可以手动填写，但用 AI 生成 JSON 再回填能把 30 分钟的录入压缩到 3 分钟，强烈建议试试。"
            />
            <FaqItem
              icon={Braces}
              iconClass="text-violet-500"
              question="AI 返回的 JSON 粘贴后报错怎么办？"
              answer="最常见原因是 AI 在 JSON 外面包了一层 markdown 代码块围栏（三个反引号），把首尾两行删掉再应用即可。应用时系统会自动剔除 homeAttributes / sidebarAttributes / heroAttributes / timeline_items 四个派生字段，无需手工清理。"
            />
            <FaqItem
              icon={ShieldCheck}
              iconClass="text-blue-500"
              question="支持哪些登录方式？"
              answer="管理员用户名密码、GitHub OAuth、TDP OIDC 三种方式。普通访客使用 GitHub/TDP 登录后绑定自己的站点地址，即可拥有独立的作品集空间。"
            />
            <FaqItem
              icon={Upload}
              iconClass="text-purple-500"
              question="项目截图和图片存在哪里？"
              answer="图片通过后端上传到腾讯云 COS 对象存储；未配置 COS 时会回落到本地存储，保证开箱即用。业务数据以 JSON 文件持久化，并由 Redis 提供缓存加速。"
            />
            <FaqItem
              icon={Github}
              iconClass="text-orange-500"
              question="主页地址是什么？可以分享吗？"
              answer={
                boundUsername
                  ? `你的主页地址是 /project/${boundUsername} ，控制台顶部横幅可随时复制，项目详情页支持生成分享链接。`
                  : '绑定站点地址后，主页地址为 /project/<你的站点地址> ，控制台顶部横幅可随时复制，项目详情页支持生成分享链接。'
              }
            />
          </CardContent>
        </Card>
      </section>

      {/* ================= 8. 快捷入口 ================= */}
      <section id="quick-links" className="scroll-mt-32 space-y-4">
        <SectionTitle icon={Rocket} title="快捷入口" subtitle="常用功能一键直达" />
        <Card className="bg-card/30 backdrop-blur-sm border border-white/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const LinkIcon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-background border border-border/60 flex items-center justify-center text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{link.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* --------------------------------- 子组件 --------------------------------- */

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {badge && (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function FaqItem({
  icon: Icon,
  iconClass,
  question,
  answer,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  question: string;
  answer: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        {question}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}
