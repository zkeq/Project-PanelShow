
export interface Project {
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

export const allProjects: Project[] = [
  {
    id: 1,
    title: "SaaS 平台",
    description:
      "使用 Next.js 和 PostgreSQL 构建的综合 SaaS 平台，具有用户认证、订阅管理和实时分析功能。",
    longDescription:
      "这个综合 SaaS 平台是一个全栈解决方案，旨在处理企业级需求。采用现代技术和最佳实践构建，为订阅制业务提供了强大的基础。平台包括高级用户管理、支付处理、实时分析和可扩展架构，能够处理数千个并发用户。",
    image: "/modern-saas-dashboard.png",
    images: ["/modern-saas-dashboard.png", "/api-architecture-diagram.png", "/data-visualization-dashboard.png"],
    technologies: ["Next.js", "PostgreSQL", "Stripe", "Tailwind CSS", "TypeScript"],
    status: "Live",
    demoUrl: "https://icodeq.com/",
    embedUrl: "https://icodeq.com/",
    allowIframe: true,
    githubUrl: "#",
    category: "Web 开发",
    featured: true,
    completedDate: "2024-12",
    stars: 24,
    views: 1250,
    challenges: [
      "使用 Stripe 实现安全支付处理",
      "构建实时分析仪表板",
      "优化大型数据集的数据库查询",
      "为所有设备尺寸创建响应式设计",
    ],
    solutions: [
      "集成 Stripe webhooks 进行安全支付处理",
      "使用 WebSocket 连接进行实时数据更新",
      "实施数据库索引和查询优化",
      "应用 Tailwind CSS 的移动优先设计原则",
    ],
    features: [
      "用户认证和授权",
      "使用 Stripe 进行订阅管理",
      "实时分析仪表板",
      "多租户架构",
      "API 速率限制和安全",
      "自动邮件通知",
    ],
    timeline: [
      {
        phase: "规划与设计",
        duration: "2 周",
        description: "需求收集、系统架构设计和 UI/UX 原型",
      },
      {
        phase: "后端开发",
        duration: "4 周",
        description: "API 开发、数据库模式、认证系统和支付集成",
      },
      {
        phase: "前端开发",
        duration: "3 周",
        description: "用户界面实现、仪表板创建和响应式设计",
      },
      {
        phase: "测试与部署",
        duration: "1 周",
        description: "质量保证测试、性能优化和生产部署",
      },
    ],
  },
  {
    id: 2,
    title: "电子商务平台",
    description:
      "使用 Vue.js 前端和 Python 后端的全栈电子商务解决方案，包括库存管理和支付处理。",
    longDescription:
      "一个完整的电子商务解决方案，旨在处理现代在线零售需求。该平台将响应式 Vue.js 前端与强大的 Python Django 后端相结合，为客户提供无缝的购物体验，为管理员提供全面的管理工具。系统处理从产品目录管理到订单履行和客户支持的一切事务。",
    image: "/ecommerce-website-interface.png",
    images: [
      "/ecommerce-website-interface.png",
      "/mobile-app-backend-architecture.png",
      "/task-management-interface.png",
    ],
    technologies: ["Vue.js", "Python", "Django", "Redis", "PostgreSQL"],
    status: "Live",
    demoUrl: "https://ecommerce-demo.vercel.app",
    embedUrl: "https://ecommerce-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "Web 开发",
    featured: true,
    completedDate: "2024-11",
    stars: 18,
    views: 980,
    challenges: [
      "管理带有变体的复杂产品目录",
      "实现高效的搜索和过滤",
      "处理销售活动期间的高流量",
      "集成多个支付网关",
    ],
    solutions: [
      "创建支持变体的灵活产品模型",
      "实施 Elasticsearch 进行快速产品搜索",
      "使用 Redis 缓存和负载均衡",
      "构建统一的支付网关抽象层",
    ],
    features: [
      "带有变体和类别的产品目录",
      "高级搜索和过滤",
      "购物车和愿望清单",
      "多个支付网关支持",
      "订单跟踪和管理",
      "客户评论和评级",
      "库存管理的管理员仪表板",
    ],
    timeline: [
      {
        phase: "研究与规划",
        duration: "1 周",
        description: "市场研究、竞争对手分析和技术需求",
      },
      {
        phase: "后端架构",
        duration: "3 周",
        description: "Django API 开发、数据库设计和支付集成",
      },
      {
        phase: "前端开发",
        duration: "4 周",
        description: "Vue.js 应用程序、购物车和用户界面",
      },
      {
        phase: "集成与测试",
        duration: "2 周",
        description: "API 集成、端到端测试和性能优化",
      },
    ],
  },
  {
    id: 3,
    title: "微服务 API",
    description:
      "使用 Go 和 Redis 构建的可扩展微服务架构，处理高流量应用和强大的错误处理。",
    longDescription:
      "一个复杂的微服务架构，旨在处理具有高可用性和性能要求的企业级应用。使用 Go 实现最佳性能，使用 Redis 进行缓存和会话管理，该系统展示了现代分布式系统原则，包括服务发现、负载均衡和容错能力。",
    image: "/api-architecture-diagram.png",
    images: ["/api-architecture-diagram.png", "/data-visualization-dashboard.png", "/modern-saas-dashboard.png"],
    technologies: ["Go", "Redis", "Docker", "Kubernetes", "gRPC"],
    status: "In Development",
    demoUrl: "https://api-docs.vercel.app",
    embedUrl: "https://api-docs.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "后端开发",
    featured: true,
    completedDate: "2025-01",
    stars: 12,
    views: 750,
    challenges: [
      "Designing service communication patterns",
      "Implementing distributed tracing",
      "Managing service discovery and load balancing",
      "Ensuring data consistency across services",
    ],
    solutions: [
      "Used gRPC for efficient inter-service communication",
      "Implemented OpenTelemetry for distributed tracing",
      "Deployed with Kubernetes for automatic scaling",
      "Applied event sourcing patterns for data consistency",
    ],
    features: [
      "Microservices architecture with Go",
      "gRPC inter-service communication",
      "Redis caching and session management",
      "Docker containerization",
      "Kubernetes orchestration",
      "Distributed tracing and monitoring",
      "API gateway with rate limiting",
    ],
    timeline: [
      {
        phase: "Architecture Design",
        duration: "2 weeks",
        description: "System design, service boundaries definition, and technology selection",
      },
      {
        phase: "Core Services Development",
        duration: "5 weeks",
        description: "Individual microservices implementation with Go and gRPC",
      },
      {
        phase: "Infrastructure Setup",
        duration: "2 weeks",
        description: "Docker containerization, Kubernetes deployment, and monitoring setup",
      },
      {
        phase: "Testing & Optimization",
        duration: "1 week",
        description: "Load testing, performance optimization, and documentation",
      },
    ],
  },
  {
    id: 4,
    title: "管理仪表板",
    description:
      "使用 Vue.js 和 Node.js 的现代管理仪表板，具有实时数据可视化和用户管理功能。",
    longDescription:
      "A comprehensive administrative dashboard designed for modern web applications. This project showcases advanced data visualization techniques, real-time updates, and intuitive user management interfaces. Built with Vue.js for reactive user interfaces and Node.js for robust backend services, it provides administrators with powerful tools to monitor and manage their applications effectively.",
    image: "/modern-admin-dashboard.png",
    images: ["/modern-admin-dashboard.png", "/data-visualization-dashboard.png", "/task-management-interface.png"],
    technologies: ["Vue.js", "Node.js", "Chart.js", "MongoDB", "Socket.io"],
    status: "Live",
    demoUrl: "https://admin-demo.vercel.app",
    embedUrl: "https://admin-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "前端开发",
    featured: false,
    completedDate: "2024-10",
    stars: 15,
    views: 650,
    challenges: [
      "Creating responsive data visualizations",
      "Implementing real-time data updates",
      "Managing complex user permissions",
      "Optimizing performance with large datasets",
    ],
    solutions: [
      "Used Chart.js with custom responsive configurations",
      "Implemented WebSocket connections for live updates",
      "Built role-based access control system",
      "Applied data pagination and virtual scrolling",
    ],
    features: [
      "Interactive data visualization charts",
      "Real-time dashboard updates",
      "User management and permissions",
      "Export functionality for reports",
      "Dark/light theme support",
      "Mobile-responsive design",
    ],
    timeline: [
      {
        phase: "UI/UX Design",
        duration: "1 week",
        description: "Dashboard layout design and user experience planning",
      },
      {
        phase: "Frontend Development",
        duration: "3 weeks",
        description: "Vue.js components, charts integration, and responsive design",
      },
      {
        phase: "Backend Integration",
        duration: "2 weeks",
        description: "Node.js API development and real-time data handling",
      },
      {
        phase: "Testing & Deployment",
        duration: "1 week",
        description: "Quality assurance and production deployment",
      },
    ],
  },
  {
    id: 5,
    title: "移动应用后端",
    description:
      "移动应用的 RESTful API 后端，具有认证、推送通知和数据同步功能。",
    longDescription:
      "A robust backend service specifically designed to support mobile applications with high performance and reliability requirements. This system handles user authentication, push notifications, data synchronization, and provides a comprehensive RESTful API that mobile clients can consume efficiently. Built with scalability in mind to support thousands of concurrent mobile users.",
    image: "/mobile-app-backend-architecture.png",
    images: ["/mobile-app-backend-architecture.png", "/api-architecture-diagram.png", "/modern-saas-dashboard.png"],
    technologies: ["Node.js", "Express", "MongoDB", "Socket.io", "JWT"],
    status: "Live",
    demoUrl: "https://mobile-api-docs.vercel.app",
    embedUrl: "https://mobile-api-docs.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "后端开发",
    featured: false,
    completedDate: "2024-09",
    stars: 9,
    views: 420,
    challenges: [
      "Implementing secure JWT authentication",
      "Managing offline data synchronization",
      "Optimizing API response times",
      "Handling push notification delivery",
    ],
    solutions: [
      "Built JWT refresh token mechanism",
      "Implemented conflict resolution for sync",
      "Added Redis caching for frequently accessed data",
      "Integrated Firebase Cloud Messaging",
    ],
    features: [
      "RESTful API with comprehensive endpoints",
      "JWT-based authentication system",
      "Push notification service",
      "Offline data synchronization",
      "File upload and management",
      "Real-time messaging with Socket.io",
    ],
    timeline: [
      {
        phase: "API Design",
        duration: "1 week",
        description: "RESTful API specification and database schema design",
      },
      {
        phase: "Core Development",
        duration: "4 weeks",
        description: "Express.js server, authentication, and core API endpoints",
      },
      {
        phase: "Advanced Features",
        duration: "2 weeks",
        description: "Push notifications, file handling, and real-time features",
      },
      {
        phase: "Testing & Documentation",
        duration: "1 week",
        description: "API testing, documentation, and deployment",
      },
    ],
  },
  {
    id: 6,
    title: "AI 聊天界面",
    description:
      "与 AI 集成的交互式聊天界面，具有实时消息传递和智能响应功能。",
    longDescription:
      "An advanced conversational AI interface that demonstrates the integration of modern AI technologies with responsive web design. This project showcases real-time messaging capabilities, intelligent response generation, and a user-friendly chat interface that can be adapted for various AI-powered applications including customer support, virtual assistants, and educational tools.",
    image: "/ai-chat-interface-design.png",
    images: ["/ai-chat-interface-design.png", "/modern-admin-dashboard.png", "/task-management-interface.png"],
    technologies: ["React", "TypeScript", "OpenAI", "WebSocket", "Tailwind CSS"],
    status: "In Development",
    demoUrl: "https://ai-chat-demo.vercel.app",
    embedUrl: "https://ai-chat-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "AI/机器学习",
    featured: false,
    completedDate: "2025-02",
    stars: 31,
    views: 1100,
    challenges: [
      "Integrating OpenAI API efficiently",
      "Managing real-time message delivery",
      "Implementing conversation context",
      "Optimizing response generation speed",
    ],
    solutions: [
      "Built streaming response handling for OpenAI",
      "Used WebSocket for instant message delivery",
      "Implemented conversation memory management",
      "Added response caching for common queries",
    ],
    features: [
      "Real-time chat interface",
      "AI-powered response generation",
      "Conversation history management",
      "Message typing indicators",
      "File attachment support",
      "Multi-language support",
    ],
    timeline: [
      {
        phase: "Interface Design",
        duration: "1 week",
        description: "Chat UI design and user experience planning",
      },
      {
        phase: "Frontend Development",
        duration: "3 weeks",
        description: "React components, real-time messaging, and responsive design",
      },
      {
        phase: "AI Integration",
        duration: "2 weeks",
        description: "OpenAI API integration and conversation management",
      },
      {
        phase: "Testing & Optimization",
        duration: "1 week",
        description: "Performance testing and response optimization",
      },
    ],
  },
  {
    id: 7,
    title: "任务管理应用",
    description:
      "具有实时更新、团队协作和项目跟踪功能的协作任务管理应用。",
    longDescription:
      "A comprehensive task management solution designed for modern teams and organizations. This application provides intuitive project organization, real-time collaboration features, and advanced tracking capabilities. Built with modern web technologies, it offers a seamless experience for managing complex projects with multiple team members and stakeholders.",
    image: "/task-management-interface.png",
    images: ["/task-management-interface.png", "/modern-admin-dashboard.png", "/data-visualization-dashboard.png"],
    technologies: ["React", "Node.js", "PostgreSQL", "Socket.io", "Material-UI"],
    status: "Live",
    demoUrl: "https://task-manager-demo.vercel.app",
    embedUrl: "https://task-manager-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "Web 开发",
    featured: false,
    completedDate: "2024-08",
    stars: 22,
    views: 890,
    challenges: [
      "Implementing real-time collaboration",
      "Managing complex project hierarchies",
      "Creating intuitive drag-and-drop interfaces",
      "Handling concurrent user modifications",
    ],
    solutions: [
      "Used Socket.io for real-time synchronization",
      "Implemented nested project structure with PostgreSQL",
      "Built custom drag-and-drop with React DnD",
      "Added optimistic updates with conflict resolution",
    ],
    features: [
      "Project and task organization",
      "Real-time team collaboration",
      "Drag-and-drop task management",
      "Time tracking and reporting",
      "File attachments and comments",
      "Team member assignment and notifications",
    ],
    timeline: [
      {
        phase: "Planning & Design",
        duration: "1 week",
        description: "Requirements analysis and UI/UX design",
      },
      {
        phase: "Backend Development",
        duration: "3 weeks",
        description: "Node.js API, database design, and real-time features",
      },
      {
        phase: "Frontend Implementation",
        duration: "3 weeks",
        description: "React components, Material-UI integration, and user interface",
      },
      {
        phase: "Testing & Launch",
        duration: "1 week",
        description: "Quality assurance testing and production deployment",
      },
    ],
  },
  {
    id: 8,
    title: "数据可视化工具",
    description:
      "用于业务分析的交互式数据可视化平台，具有可定制图表和实时数据处理功能。",
    longDescription:
      "A powerful data visualization platform designed to transform complex datasets into meaningful insights. This tool provides business analysts and decision-makers with interactive charts, customizable dashboards, and real-time data processing capabilities. Built with modern web technologies and optimized for performance, it can handle large datasets while maintaining responsive user interactions.",
    image: "/data-visualization-dashboard.png",
    images: ["/data-visualization-dashboard.png", "/modern-admin-dashboard.png", "/api-architecture-diagram.png"],
    technologies: ["D3.js", "React", "Python", "FastAPI", "PostgreSQL"],
    status: "Live",
    demoUrl: "https://dataviz-demo.vercel.app",
    embedUrl: "https://dataviz-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "数据科学",
    featured: false,
    completedDate: "2024-07",
    stars: 19,
    views: 720,
    challenges: [
      "Rendering large datasets efficiently",
      "Creating interactive chart components",
      "Implementing real-time data updates",
      "Building flexible dashboard layouts",
    ],
    solutions: [
      "Used D3.js with canvas rendering for performance",
      "Built reusable chart components with React",
      "Implemented WebSocket for live data streams",
      "Created drag-and-drop dashboard builder",
    ],
    features: [
      "Interactive data visualizations",
      "Customizable dashboard layouts",
      "Real-time data processing",
      "Multiple chart types and formats",
      "Data export and sharing capabilities",
      "Advanced filtering and drill-down",
    ],
    timeline: [
      {
        phase: "Data Analysis",
        duration: "1 week",
        description: "Requirements gathering and data source analysis",
      },
      {
        phase: "Backend Development",
        duration: "2 weeks",
        description: "Python FastAPI development and data processing",
      },
      {
        phase: "Visualization Development",
        duration: "4 weeks",
        description: "D3.js charts, React components, and interactive features",
      },
      {
        phase: "Integration & Testing",
        duration: "1 week",
        description: "System integration and performance testing",
      },
    ],
  },
  {
    id: 9,
    title: "作品集网站",
    description: "具有动态内容管理、博客功能和响应式设计的现代作品集网站。",
    longDescription:
      "A comprehensive portfolio website showcasing modern web development practices and design principles. This project demonstrates advanced frontend techniques, content management capabilities, and responsive design patterns. Built with Next.js and modern styling frameworks, it provides a professional platform for showcasing work and sharing insights through an integrated blog system.",
    image: "/portfolio-website-design.png",
    images: ["/portfolio-website-design.png", "/modern-admin-dashboard.png", "/ecommerce-website-interface.png"],
    technologies: ["Next.js", "Tailwind CSS", "MDX", "Vercel", "TypeScript"],
    status: "Live",
    demoUrl: "https://portfolio-demo.vercel.app",
    embedUrl: "https://portfolio-demo.vercel.app",
    allowIframe: true,
    githubUrl: "#",
    category: "前端开发",
    featured: false,
    completedDate: "2024-06",
    stars: 14,
    views: 560,
    challenges: [
      "Creating dynamic content management",
      "Implementing SEO optimization",
      "Building responsive design system",
      "Integrating blog functionality",
    ],
    solutions: [
      "Used MDX for flexible content authoring",
      "Implemented Next.js SEO best practices",
      "Built component-based design system",
      "Created static generation for blog posts",
    ],
    features: [
      "Responsive portfolio showcase",
      "Integrated blog with MDX",
      "SEO-optimized pages",
      "Dark/light theme support",
      "Contact form integration",
      "Performance-optimized loading",
    ],
    timeline: [
      {
        phase: "Design & Planning",
        duration: "1 week",
        description: "Visual design, content strategy, and technical planning",
      },
      {
        phase: "Frontend Development",
        duration: "3 weeks",
        description: "Next.js implementation, component development, and styling",
      },
      {
        phase: "Content Integration",
        duration: "1 week",
        description: "Blog setup, content management, and SEO optimization",
      },
      {
        phase: "Testing & Deployment",
        duration: "1 week",
        description: "Quality assurance and Vercel deployment",
      },
    ],
  },
]

export function getProjectById(id: number): Project | undefined {
  return allProjects.find((project) => project.id === id)
}

export function getRelatedProjects(currentProject: Project, limit = 3): Project[] {
  return allProjects
    .filter(
      (project) =>
        project.id !== currentProject.id && (project.category === currentProject.category || project.featured),
    )
    .slice(0, limit)
}

export const projects = allProjects
