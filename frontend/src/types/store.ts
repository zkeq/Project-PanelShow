// 时间线项目数据类型
export interface TimelineItem {
  id: string
  publishedAt: string
  author: {
    name: string
    avatar: string
    username: string
  }
  project: {
    name: string
    logo: string
    description: string
    techStack: string[]
    readme: string
    previewImages: string[]
    repositoryUrl: string
    liveUrl?: string
  }
  updateType: 'feature' | 'refactor' | 'new'
  changelog: string
  likes: number
  comments: number
  isLiked: boolean
}

// 可自定义的项目属性
export interface ProjectAttribute {
  key: string
  label: string
  value: string
  icon?: string
}

// 项目信息项类型
export interface ProjectInfo {
  id: string;
  icon: string;
  label: string;
  valueCode: string;
  showInHomepage: boolean;
  showInSidebar: boolean;
  showInHero?: boolean;
  color: string;
  order: number;
  value?: string;
}

// 项目数据类型
export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'maintained' | 'completed' | 'building'
  category: string
  previewImage: string
  updatedAt: string
  // 可自定义属性列表
  attributes: ProjectAttribute[]
  // 项目信息（原始数据）
  projectInfos?: ProjectInfo[]
  // 首页展示的属性
  homeAttributes?: ProjectInfo[]
  // 侧边栏展示的属性
  sidebarAttributes?: ProjectInfo[]
  // Hero 展示的属性
  heroAttributes?: ProjectInfo[]
  // 截图列表
  screenshots?: Array<{
    id: string
    url: string
    alt?: string
  }>
  // 卡片主题色配置
  themeColor: {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
  }
}

// 可自定义的展示数据项
export interface DisplayDataItem {
  key: string
  label: string
  value: string
  icon?: string
  color?: string
  bgColor?: string
  textColor?: string
  borderColor?: string
  type?: 'text' | 'badge' | 'progress' | 'link'
}

// 项目详情数据类型
export interface ProjectDetail {
  id: string
  name: string
  description: string
  status: 'active' | 'maintained' | 'completed' | 'building'
  previewImage: string
  previewUrl: string
  longDescription: string
  // 可自定义的展示数据列表（替换固定的 techStack, projectType 等）
  displayData: DisplayDataItem[]
  images: {
    src: string
    alt: string
    label: string
    description: string
  }[]
  features: {
    title: string
    description: string
    icon: string
    // 可自定义的技术栈标签
    techStack: {
      name: string
      color: string
      bgColor: string
      textColor: string
      borderColor: string
    }[]
    images: {
      src: string
      alt: string
      label: string
      description: string
    }[]
  }[]
  timeline: {
    [year: string]: {
      [month: string]: {
        title: string
        date: string
        status: 'completed' | 'in_progress' | 'planned'
      }[]
    }
  }
  // 卡片主题色配置
  themeColor: {
    primary: string
    secondary: string
    background: string
    text: string
    border: string
  }
}

// 演示项目数据类型
export interface DemoProject {
  id: number
  title: string
  description: string
  longDescription: string
  image: string
  images: string[]
  technologies: string[]
  status: "Live" | "In Development" | "Completed"
  demoUrl: string
  githubUrl: string
  category: string
  featured: boolean
  completedDate: string
  stars: number
  views: number
  challenges: string[]
  solutions: string[]
  features: string[]
  timeline: {
    phase: string
    duration: string
    description: string
  }[]
  embedUrl?: string
  allowIframe?: boolean
}

// 工作经历类型
export interface Experience {
  id: string
  title: string
  company: string
  location: string
  period: string
  responsibilities: string[]
}

// 个人资料类型
export interface SkillItem {
  id?: string
  label: string
  icon?: string
}

export interface SkillCategory {
  id: string
  title: string
  icon?: string
  items: SkillItem[]
}

export interface ProfileInfo {
  username: string
  name: string
  title: string
  email: string
  github: string
  website: string
  bio: string
  aboutSubtitle?: string
  skills: SkillCategory[]
  interests: string[]
}

// 快捷链接类型
export interface QuickLink {
  id: string
  name: string
  url: string
  icon: string
  description: string
}

// 用户信息类型
export interface User {
  username: string
  name: string
  avatar: string
  bio: string
  location: string
  website: string
  githubUrl: string
  twitterUrl: string
}

// 全局状态管理接口
export interface GlobalState {
  // 用户数据
  users: Record<string, User>
  
  // 时间线数据
  timelineItems: TimelineItem[]
  
  // 项目数据
  projects: Project[]
  
  // 项目详情数据
  projectDetails: Record<string, ProjectDetail>
  
  // 演示项目数据
  demoProjects: DemoProject[]
  
  // 个人资料数据
  profileInfo: ProfileInfo
  
  // 工作经历数据
  experiences: Experience[]
  
  // 快捷链接数据
  quickLinks: QuickLink[]
  
  // Actions
  getUserByUsername: (username: string) => User | undefined
  getTimelineItems: () => TimelineItem[]
  getProjectsByUsername: (username: string) => Project[]
  getProjectDetail: (username: string, projectId: string) => ProjectDetail | undefined
  getDemoProject: (id: number) => DemoProject | undefined
  getProjectsByCategory: (category: string) => Project[]
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void
  likeTimelineItem: (id: string) => void
  
  // 新增个人资料相关 actions
  getProfileInfo: () => ProfileInfo
  getExperiences: () => Experience[]
  getQuickLinks: () => QuickLink[]
  getExperienceById: (id: string) => Experience | undefined

  setProjects: (projects: Project[]) => void
  setTimelineItems: (items: TimelineItem[]) => void

  // 项目 CRUD 操作
  createProject: (project: Omit<Project, 'id' | 'updatedAt'>) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProjectById: (id: string) => Project | undefined

  // 动态 CRUD 操作  
  createTimelineItem: (item: Omit<TimelineItem, 'id' | 'publishedAt' | 'likes' | 'comments' | 'isLiked'>) => TimelineItem
  deleteTimelineItem: (id: string) => void
  getTimelineItemById: (id: string) => TimelineItem | undefined
}
