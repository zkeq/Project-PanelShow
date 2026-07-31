import {
  Bell,
  Braces,
  FolderPlus,
  Globe2,
  LayoutDashboard,
  Rocket,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react';
import type { TourChapter, TourStep } from './tour-types';

/** 控制台章节 */
const dashboardSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到你的创作后台',
    subtitle: 'PanelShow · 交互式上手引导',
    body: '这是一套真实可用的个人作品集系统：你在这里维护的项目与动态，会实时渲染成对外公开的个人主页。接下来 2 分钟，我会像 Pair Programming 一样带你走一遍核心链路。',
    icon: Rocket,
    placement: 'center',
    route: '/admin',
  },
  {
    id: 'site-url',
    target: 'site-banner',
    title: '这是你的公开站点地址',
    body: '绑定用户名后，这里就是你的线上主页。点「前往」即可在新标签页实时预览访客的视角——改任何内容，刷新即生效。',
    icon: Globe2,
    placement: 'bottom',
    route: '/admin',
  },
  {
    id: 'stats',
    target: 'stats-grid',
    title: '实时统计面板',
    body: '总项目数、活跃项目、总动态、本月动态，全部来自后端实时接口。发布内容后回到这里，数字会立刻变化——这就是你的作品在持续「活着」的证明。',
    icon: LayoutDashboard,
    placement: 'bottom',
    route: '/admin',
  },
  {
    id: 'quick-actions',
    target: 'quick-actions',
    title: '一切从这里开始',
    body: '「新建项目」把一个作品放上主页，「新建动态」记录它的每次进展。下一步我们会直接进入新建项目页，重点看看那个能让 AI 帮你填表单的隐藏技能。',
    icon: FolderPlus,
    placement: 'bottom',
    route: '/admin',
    actions: [
      { label: '去看看新建项目', href: '/admin/projects/create', icon: FolderPlus },
    ],
  },
];

/** 新建项目章节（重点） */
const createProjectSteps: TourStep[] = [
  {
    id: 'create-intro',
    title: '新建项目 · 整页只干一件事',
    subtitle: '重头戏来了',
    body: '把一个项目讲清楚。这个表单看起来字段不少，但其实你只要会「复制 → 粘贴」两个快捷键，就能让 AI 在 30 秒内帮你填完 90%。往下的每一步我都会指给你看。',
    icon: Sparkles,
    placement: 'center',
    route: '/admin/projects/create',
  },
  {
    id: 'ai-prompt',
    target: 'ai-prompt',
    title: '核心武器：AI 提示词（重点）',
    subtitle: '一键复制 · 全字段约束 · 与表单严格对齐',
    body: '滑到这里的「JSON 提示词信息」卡片，点右上角「复制提示词」。这份提示词内置了完整示例 JSON、每个字段的约束规则、以及三条生成硬规则——它就是这个后台的「技术力浓缩体」。',
    icon: Wand2,
    placement: 'top',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
  {
    id: 'ai-json',
    target: 'ai-json',
    title: '粘贴回填：AI 的答案落到这里',
    subtitle: '双向同步 · 自动剔除派生字段',
    body: '把提示词发给任意 AI（ChatGPT / Claude / Kimi 都行），让它按你的项目生成 JSON，然后整段粘贴进这个编辑器，点「应用到表单」——上方所有字段瞬间填好，非法字段会被自动过滤。',
    icon: Braces,
    placement: 'top',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
  {
    id: 'basic-info',
    target: 'basic-info',
    title: '微调第一步：核对基本信息',
    body: '项目名称与简介是必填项，状态 / 类型 / 特性徽章支持自定义输入——你新增的选项会实时写入系统设置，下次还能复用。',
    icon: FolderPlus,
    placement: 'bottom',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
  {
    id: 'screenshots',
    target: 'screenshots',
    title: '微调第二步：上传作品截图',
    body: '支持拖拽上传与排序，图片优先走腾讯云 COS，未配置时自动回落到本地存储——开箱即用，绝不报错。',
    icon: FolderPlus,
    placement: 'top',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
  {
    id: 'overview',
    target: 'overview',
    title: '微调第三步：编排信息项（彩蛋）',
    subtitle: '内置 JS 沙箱 · 24s 超时 · 6h 缓存',
    body: '每个信息项都可以写一段动态 JS 代码，比如实时拉取 GitHub Star 数。后端用 Node vm 沙箱安全执行，首页卡片、侧栏、Hero 区分别最多展示 4 / 8 / 3 条。',
    icon: FolderPlus,
    placement: 'top',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
  {
    id: 'submit',
    target: 'submit',
    title: '最后一步：发布上线',
    body: '拿不准就先「保存草稿」（存在浏览器本地，下次自动恢复）；胸有成竹就直接「提交发布」——校验通过 Toast 提示后，主页立即更新。',
    icon: Send,
    placement: 'top',
    route: '/admin/projects/create',
    retry: { max: 30 },
  },
];

/** 发布动态章节 */
const dynamicSteps: TourStep[] = [
  {
    id: 'dynamic-intro',
    title: '发布动态：让主页「呼吸」起来',
    body: '项目是骨架，动态是心跳。版本更新、里程碑、踩坑记录，随时发一条，主页时间线立刻刷新，访客能直观感受到这个项目正在被持续维护。',
    icon: Bell,
    placement: 'center',
    route: '/admin/dynamic',
    actions: [
      { label: '去发一条动态', href: '/admin/dynamic', icon: Bell },
    ],
  },
];

/** 收尾章节 */
const finishSteps: TourStep[] = [
  {
    id: 'finish',
    title: '引导完成，去点亮你的主页吧',
    subtitle: '互动引导 · 随时可重播',
    body: '建议路径：新建项目（用 AI 提示词）→ 发布首条动态 → 点顶部横幅「前往」欣赏你的主页。这个引导随时可以点右上角「互动引导」重新播放，信息一次只给一步，绝不再糊你一脸。',
    icon: Sparkles,
    placement: 'center',
  },
];

export const TOUR_CHAPTERS: TourChapter[] = [
  { id: 'dashboard', label: '认识控制台', title: '第一章 · 认识控制台', steps: dashboardSteps },
  { id: 'create', label: '新建项目（重点）', title: '第二章 · 新建项目与 AI 提示词', steps: createProjectSteps },
  { id: 'dynamic', label: '发布动态', title: '第三章 · 发布动态', steps: dynamicSteps },
  { id: 'finish', label: '完成', title: '终章 · 出发', steps: finishSteps },
];

export interface FlatStep extends TourStep {
  chapterId: string;
  chapterTitle: string;
  /** 当前步骤在所属章节内的序号（从 1 开始） */
  indexInChapter: number;
  chapterSize: number;
}

export const FLAT_STEPS: FlatStep[] = TOUR_CHAPTERS.flatMap((chapter) =>
  chapter.steps.map((step, idx) => ({
    ...step,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    indexInChapter: idx + 1,
    chapterSize: chapter.steps.length,
  }))
);

/** 每个章节在扁平列表中的起始下标 */
export const CHAPTER_START_INDEX: Record<string, number> = TOUR_CHAPTERS.reduce(
  (acc, chapter, i) => {
    acc[chapter.id] = TOUR_CHAPTERS.slice(0, i).reduce((sum, c) => sum + c.steps.length, 0);
    return acc;
  },
  {} as Record<string, number>
);
