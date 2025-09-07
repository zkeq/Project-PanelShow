
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, User, Briefcase, Phone, Settings, PanelLeft } from "lucide-react"
import Link from "next/link"
import { BasicInformation } from "@/components/admin/settings/BasicInformation"
import { WorkExperience } from "@/components/admin/settings/WorkExperience"
import { ContactInformation } from "@/components/admin/settings/ContactInformation"

const sidebarSections = [
  {
    title: "个人资料",
    items: [
      { id: "basic-info", label: "基本信息", icon: User, description: "管理个人基本信息和头像" },
      { id: "work-experience", label: "工作经历", icon: Briefcase, description: "编辑工作经验和职业历程" },
      { id: "contact-info", label: "联系方式", icon: Phone, description: "更新联系信息和社交链接" },
    ],
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("basic-info")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case "basic-info":
        return <BasicInformation />
      case "work-experience":
        return <WorkExperience />
      case "contact-info":
        return <ContactInformation />
      default:
        return <BasicInformation />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
          className={`${sidebarCollapsed ? "w-0" : "w-80"} bg-card border-r border-border h-full transition-all duration-300 ease-in-out relative shadow-sm flex-shrink-0`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">系统设置</h1>
                  <p className="text-sm text-muted-foreground">管理系统配置和个人信息</p>
                </div>
              </div>
              
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                返回管理控制台
              </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-8">
              {sidebarSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`group w-full flex items-start gap-4 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 border border-primary/20 shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                          }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isActive 
                              ? "bg-primary/15 text-primary shadow-sm" 
                              : "bg-muted/50 text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}>
                              {item.label}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative overflow-y-auto">
          {/* Content Area */}
          <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 relative z-0">
            {renderContent()}
          </div>
        </div>
      </div>
    )
  }


