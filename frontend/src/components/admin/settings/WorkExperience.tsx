
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Briefcase, MapPin, Calendar } from "lucide-react"

export function WorkExperience() {
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      position: "高级全栈开发工程师",
      company: "科技创新有限公司",
      location: "北京，中国",
      startDate: "2022-01",
      endDate: "至今",
      responsibilities: "负责微服务架构开发，指导初级开发人员，实施CI/CD流水线",
    },
  ])

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      responsibilities: "",
    }
    setExperiences([...experiences, newExp])
  }

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">工作经历</h1>
      <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl shadow-lg shadow-black/5 p-8 backdrop-blur-sm">
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            /* Enhanced individual experience cards with better visual hierarchy */
            <div
              key={exp.id}
              className="group relative bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl p-7 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 hover:border-border"
            >
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-white-500 to-black-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-start justify-between mb-6">
              <h3 className="text-lg font-medium">工作经历 #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-200 opacity-70 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      职位
                    </Label>
                    <Input
                      defaultValue={exp.position}
                      placeholder="例如：高级开发工程师"
                      className="bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">公司</Label>
                    <Input
                      defaultValue={exp.company}
                      placeholder="例如：科技公司"
                      className="bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    工作地点
                  </Label>
                  <Input
                    defaultValue={exp.location}
                    placeholder="例如：北京，中国"
                    className="bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      开始时间
                    </Label>
                    <Input
                      type="month"
                      defaultValue={exp.startDate}
                      className="bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      结束时间
                    </Label>
                    <Input
                      type="month"
                      defaultValue={exp.endDate}
                      placeholder="至今"
                      className="bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">工作职责</Label>
                  <Textarea
                    defaultValue={exp.responsibilities}
                    placeholder="描述您的主要职责和成就..."
                    className="min-h-[120px] bg-background/50 border-border/60 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

<Button onClick={addExperience} variant="outline" className="w-full bg-muted/20 hover:bg-muted/40 border-dashed" > <Plus className="h-4 w-4 mr-2" /> 添加工作经历 </Button>
          <div className="pt-8 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">确保所有信息准确无误后保存</p>
              </div>
          <div className="pt-6 border-t border-border">
            <Button>保存更改</Button>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
