
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Briefcase, Phone, Settings, Globe, Key, PanelLeft } from "lucide-react"
import Link from "next/link"
import { BasicInformation } from "@/components/admin/settings/BasicInformation"
import { WorkExperience } from "@/components/admin/settings/WorkExperience"
import { ContactInformation } from "@/components/admin/settings/ContactInformation"
import { AdminHeader } from '@/components/admin/AdminHeader';

const sidebarSections = [
  {
    title: "个人资料",
    items: [
      { id: "basic-info", label: "基本信息", icon: User },
      { id: "work-experience", label: "工作经历", icon: Briefcase },
      { id: "contact-info", label: "联系方式", icon: Phone },
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
    <>
    <div className="min-h-screen bg-background">
       <div className="flex">
         {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-0" : "w-64"} bg-muted/30 border-r border-border min-h-screen transition-all duration-300 ease-in-out relative overflow-hidden`}
        >
  

          <div className="p-4 ">
  
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>

        {/* Navigation */}
        <nav className="space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        </div>
      </div>
        <div className="flex-1 flex justify-center relative">
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0 border-2 bg-background hover:bg-muted"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
          <div className="w-full max-w-4xl p-8">{renderContent()}</div>
        </div>
    </div>
    </div>
    </>
  )
}


