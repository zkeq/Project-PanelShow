'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import HeaderNavigation from '@/components/layout/HeaderNavigation'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectHero from '@/components/project/ProjectHero'
import ProjectContent from '@/components/project/ProjectContent'
import BackgroundDecorations from '@/components/layout/BackgroundDecorations'

// 模拟项目数据
const projectData = {
  id: 'zkeq',
  name: 'E-Commerce Platform',
  description: '现代化的全栈电商解决方案，具有实时库存管理和支付集成',
  techStack: 'Vue + Python',
  projectType: '公司',
  monthlyPV: '10w',
  developmentPeriod: '3个月',
  uiLibrary: 'Tailwind CSS',
  componentLibrary: 'shadcn/ui',
  status: 'active' as const,
  previewImage: '/Snipaste_2025-08-23_22-52-13.png',
  previewUrl: 'http://localhost:3000/project/zkeq/1',
  longDescription: `
# 项目说明

这是一个现代化的全栈电商解决方案，采用最新的技术栈构建。项目包含完整的购物流程，从商品展示到支付完成，提供了优秀的用户体验。

## 核心功能

- 🛍️ 完整的购物车功能
- 💳 多种支付方式支持
- 📦 实时库存管理
- 👤 用户账户体系
- 📊 数据统计分析

## 技术特色

采用微服务架构，前后端分离，支持高并发访问。前端使用Vue 3 + TypeScript，后端采用Python Django框架。
  `,
  images: [
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: 'E-Commerce Platform 主页',
      label: '主页',
      description: '项目主页展示，包含产品列表和导航功能'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '用户登录页面',
      label: '登录',
      description: '用户登录界面，支持多种登录方式'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: '管理后台仪表板',
      label: '仪表板',
      description: '管理员后台仪表板，显示关键业务指标'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '用户管理页面',
      label: '用户',
      description: '用户信息管理和权限设置'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: '系统设置页面',
      label: '设置',
      description: '系统配置和个性化设置'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '数据图表页面',
      label: '图表',
      description: '销售数据和用户行为分析图表'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: '产品列表页面',
      label: '列表',
      description: '产品列表管理和搜索功能'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '产品详情页面',
      label: '详情',
      description: '产品详细信息和用户评价'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: '移动端界面',
      label: '移动',
      description: '移动端响应式界面展示'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '购物车页面',
      label: '购物车',
      description: '购物车管理和结算流程'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-13.png',
      alt: '订单管理页面',
      label: '订单',
      description: '订单状态跟踪和管理'
    },
    {
      src: '/Snipaste_2025-08-23_22-52-25.png',
      alt: '支付界面',
      label: '支付',
      description: '安全的支付流程和多种支付方式'
    }
  ],
  features: [
    {
      title: '响应式设计',
      description: '适配各种设备尺寸，提供一致的用户体验，支持多种屏幕规格的完美适配',
      icon: '📱',
      techStack: [
        { name: 'CSS Grid', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
        { name: 'Flexbox', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50 hover:bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
        { name: 'Tailwind CSS', color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50 hover:bg-cyan-100', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
        { name: 'Mobile First', color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50 hover:bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' }
      ],
      images: [
        {
          src: '/Snipaste_2025-08-23_22-52-13.png',
          alt: '桌面端响应式展示',
          label: '桌面端',
          description: '桌面端完整界面展示'
        },
        {
          src: '/Snipaste_2025-08-23_22-52-25.png',
          alt: '平板端适配',
          label: '平板端',
          description: '平板设备界面适配'
        },
        {
          src: '/Snipaste_2025-08-23_22-52-13.png',
          alt: '手机端界面',
          label: '手机端',
          description: '移动端优化界面'
        }
      ]
    },
    {
      title: '高性能缓存',
      description: '使用Redis缓存系统，配合智能缓存策略，大幅提升系统响应速度和用户体验',
      icon: '⚡',
      techStack: [
        { name: 'Redis', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 hover:bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200' },
        { name: 'Memory Cache', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
        { name: 'CDN', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
        { name: 'HTTP Cache', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50 hover:bg-pink-100', textColor: 'text-pink-700', borderColor: 'border-pink-200' }
      ],
      images: [
        {
          src: '/Snipaste_2025-08-23_22-52-25.png',
          alt: '缓存监控页面',
          label: '监控',
          description: 'Redis缓存状态监控'
        },
        {
          src: '/Snipaste_2025-08-23_22-52-13.png',
          alt: '性能分析图表',
          label: '性能',
          description: '系统性能分析报告'
        }
      ]
    },
    {
      title: '安全支付',
      description: '集成多种主流支付方式，采用端到端加密和多重验证，保障每笔交易的安全性',
      icon: '🔒',
      techStack: [
        { name: 'SSL/TLS', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 hover:bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200' },
        { name: 'OAuth 2.0', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
        { name: 'JWT Token', color: 'from-violet-500 to-violet-600', bgColor: 'bg-violet-50 hover:bg-violet-100', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
        { name: 'AES Encryption', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50 hover:bg-teal-100', textColor: 'text-teal-700', borderColor: 'border-teal-200' }
      ],
      images: [
        {
          src: '/Snipaste_2025-08-23_22-52-13.png',
          alt: '支付页面',
          label: '支付',
          description: '安全支付界面'
        },
        {
          src: '/Snipaste_2025-08-23_22-52-25.png',
          alt: '订单确认',
          label: '订单',
          description: '订单确认页面'
        },
        {
          src: '/Snipaste_2025-08-23_22-52-13.png',
          alt: '支付成功',
          label: '成功',
          description: '支付成功反馈'
        }
      ]
    }
  ],
  timeline: {
    '2025': {
      '08': [
        { title: '项目启动', date: '2025-08-01', status: 'completed' },
        { title: '需求分析完成', date: '2025-08-05', status: 'completed' },
        { title: '原型设计', date: '2025-08-10', status: 'completed' }
      ],
      '07': [
        { title: '前端开发', date: '2025-07-01', status: 'completed' },
        { title: '后端API开发', date: '2025-07-15', status: 'completed' }
      ],
      '06': [
        { title: '测试阶段', date: '2025-06-01', status: 'completed' },
        { title: '上线发布', date: '2025-06-20', status: 'completed' }
      ]
    }
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const username = params.username as string
  const projectId = params.projectId as string
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'description', 'features', 'timeline']
      const scrollPosition = window.scrollY + 150 // 添加偏移量，让导航更早切换
      
      let current = 'overview'
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          
          if (scrollPosition >= elementTop) {
            current = section
          }
        }
      }

      if (current !== activeSection) {
        setActiveSection(current)
      }
    }

    // 初始检查
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const handleSectionChange = (section: string) => {
    const element = document.getElementById(section)
    if (element) {
      const headerOffset = 100 // 给固定头部留出空间
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <HeaderNavigation username={username} />

      {/* 主体内容区 */}
      <div className="flex">
        {/* 左侧固定侧边栏 */}
        <ProjectSidebar
          project={projectData}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* 右侧内容区 */}
        <main className="flex-1 min-w-0 relative min-h-[calc(100vh-3.5rem)] ml-80">
          {/* 背景装饰 */}
          <BackgroundDecorations />

          <div className="relative z-10">
            <div className="w-full p-4 sm:p-6 lg:p-8">
              {/* 项目Hero区段作为内容的一部分 */}
              <ProjectHero project={projectData} username={username} />
              
              <ProjectContent project={projectData} username={username} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}