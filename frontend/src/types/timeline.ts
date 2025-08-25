export interface TimelineItem {
  id: string
  // 发布信息
  publishedAt: string // 发布时间 
  author: {
    name: string     // 发布者昵称
    avatar: string   // 头像URL
    username: string // 用户名
  }
  
  // 项目信息
  project: {
    name: string           // 项目名称，如: sparkai-frontend
    logo: string          // 项目圆形logo
    description: string   // 本次项目的描述
    techStack: string[]   // 使用的技术栈
    readme?: string      // 详细的readme文件内容
    previewImages: string[] // 预览图片数组
    repositoryUrl?: string  // 项目仓库地址
    liveUrl?: string       // 项目演示地址
  }
  
  // 更新信息
  updateType: 'new' | 'update' | 'fix' | 'feature' | 'refactor' // 更新类型
  changelog?: string // 更新日志
  
  // 交互数据
  likes: number
  comments: number
  isLiked?: boolean
}