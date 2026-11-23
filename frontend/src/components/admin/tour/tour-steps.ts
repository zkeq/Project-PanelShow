import {
  Bell,
  FolderPlus,
  Globe2,
  LayoutDashboard,
  Layers,
  Rocket,
  Send,
  Settings,
  Sparkles,
  UserRound,
  Wand2,
} from 'lucide-react';
import type { TourChapter, TourStep } from './tour-types';

/** 控制台章节 */
const dashboardSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到你的创作后台',
    subtitle: 'PanelShow · 交互式上手引导',
    body: '这是一套真实可用的个人作品集系统：你在这里维护的项目与动态，会实时渲染成对外公开的个人主页。右侧窗口是你真实的后台页面，引导所用的页面会一起预加载。接下来 2 分钟，我们边看边学。',
    icon: Rocket,
    route: '/admin',
  },
  {
    id: 'site-url',
    target: 'site-banner',
    title: '这是你的公开站点地址',
    body: '绑定站点后，这里会显示作品集地址。每条地址都可以复制分享，也可以直接打开预览。',
    icon: Globe2,
    route: '/admin',
  },
  {
    id: 'stats',
    target: 'stats-grid',
    title: '实时统计面板',
    body: '预览窗中部的四张卡片：总项目数、活跃项目、总动态、本月动态，全部来自后端实时接口。发布内容后回到这里，数字会立刻变化——这就是你的作品在持续「活着」的证明。',
    icon: LayoutDashboard,
    route: '/admin',
  },
  {
    id: 'quick-actions',
    target: 'quick-actions',
    title: '一切从这里开始',
    body: '「新建项目」可以发布一个作品，「新建动态」可以记录项目进展。下一步会进入新建项目页，找到 Agent 发布入口。',
    icon: FolderPlus,
    route: '/admin',
    actions: [
      { label: '去看看新建项目', href: '/admin/projects/create', icon: FolderPlus },
    ],
  },
];

/** 站点资料与作品集展示设置 */
const settingsSteps: TourStep[] = [
  {
    id: 'settings-intro',
    target: 'settings-navigation',
    title: '先把你的站点资料补完整',
    subtitle: '设置会直接影响公开主页',
    body: '右侧已进入系统设置。这里分为个人资料与作品集两组：基本信息、关于我、工作经历、联系方式决定访客如何认识你，技术栈分类决定项目如何被组织和浏览。',
    icon: Settings,
    route: '/admin/settings',
  },
  {
    id: 'settings-basic-info',
    target: 'settings-nav-basic-info',
    title: '基本信息：先完成主页门面',
    body: '点击高亮的「基本信息」，优先填写网站标题、头像、作者名称和一句话介绍；填入 GitHub 用户名后还能一键同步关注者、Star 与公开仓库数据。修改完成后记得点击页面底部「保存更改」。',
    icon: UserRound,
    route: '/admin/settings',
  },
  {
    id: 'settings-profile-sections',
    target: 'settings-profile-navigation',
    title: '补充关于我、经历与联系方式',
    body: '左侧这组入口共同组成你的个人叙事：在「关于我」介绍自己，在「工作经历」维护职业历程，在「联系方式」添加邮箱与社交链接。你可以直接在预览中点击切换并填写。',
    icon: UserRound,
    route: '/admin/settings',
  },
  {
    id: 'settings-tech-stacks',
    target: 'settings-nav-tech-stacks',
    title: '最后整理技术栈分类',
    subtitle: '分类、二级菜单与项目关联',
    body: '点击高亮的「技术栈分类」，可以自定义主页的技术分类和二级菜单，并把已发布项目分配进去。保存配置后，访客就能按技术方向快速浏览你的作品。',
    icon: Layers,
    route: '/admin/settings',
  },
];

/** 新建项目章节（重点） */
const createProjectSteps: TourStep[] = [
  {
    id: 'create-intro',
    target: 'agent-publishing',
    title: '新建项目',
    body: '新建项目页顶部可以打开 Agent 工作台。编辑已有作品时，顶部入口会打开针对当前作品的工作台。',
    icon: Sparkles,
    route: '/admin/projects/create',
  },
  {
    id: 'agent-key',
    target: 'agent-key',
    title: '在 Agent 工作台生成密钥',
    body: '打开工作台并点击「生成密钥」，下方的提示词会自动带上这把密钥。',
    icon: Wand2,
    route: '/admin/agent',
    actions: [{ label: '打开 Agent 发布工作台', href: '/admin/agent', icon: Wand2 }],
  },
  {
    id: 'agent-prompt',
    target: 'agent-prompt',
    title: '把提示词交给能访问仓库的 Agent',
    body: '点击「复制提示词」，粘贴给能访问仓库的 Agent。它会整理技术说明和素材，提交后给出作品链接。',
    icon: Rocket,
    route: '/admin/agent',
  },
  {
    id: 'basic-info',
    target: 'basic-info',
    title: '核对作品信息',
    body: '用项目名称和一句话简介说明作品的用途，再选择状态、类型和特性徽章。新建的选项可在其他作品里复用。',
    icon: FolderPlus,
    route: '/admin/projects/create',
  },
  {
    id: 'screenshots',
    target: 'screenshots',
    title: '整理作品截图',
    body: '上传项目的实际运行画面，把最能说明核心功能的一张放在首位。拖拽即可调整图集顺序。',
    icon: FolderPlus,
    route: '/admin/projects/create',
  },
  {
    id: 'overview',
    target: 'overview',
    title: '安排项目概览',
    body: '把关键技术和功能排在前面，再选择各项的展示位置。首页卡片最多 4 项，详情侧栏最多 8 项，详情顶部最多 3 项。',
    icon: FolderPlus,
    route: '/admin/projects/create',
  },
  {
    id: 'submit',
    target: 'submit',
    title: '保存作品',
    body: '手动填写完成后，点「创建作品集」发布。点击「保存草稿」可将进度留在当前浏览器。',
    icon: Send,
    route: '/admin/projects/create',
  },
];

/** 发布动态章节 */
const dynamicSteps: TourStep[] = [
  {
    id: 'dynamic-intro',
    title: '发布动态：让主页「呼吸」起来',
    body: '右侧预览窗已切到动态管理页。项目是骨架，动态是心跳：版本更新、里程碑、踩坑记录，随时发一条，主页时间线立刻刷新，访客能直观感受到这个项目正在被持续维护。',
    icon: Bell,
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
    body: '完善站点资料后，可以在 Agent 工作台发布第一个作品，再发布首条动态。点控制台顶部的「前往」打开公开主页。',
    icon: Sparkles,
    route: '/admin',
  },
];

const TOUR_CHAPTERS: TourChapter[] = [
  { id: 'dashboard', label: '认识控制台', title: '第一章 · 认识控制台', steps: dashboardSteps },
  { id: 'settings', label: '完善站点资料', title: '第二章 · 完善站点资料', steps: settingsSteps },
  { id: 'create', label: '新建项目', title: '第三章 · 新建项目与 Agent 发布', steps: createProjectSteps },
  { id: 'dynamic', label: '发布动态', title: '第四章 · 发布动态', steps: dynamicSteps },
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
