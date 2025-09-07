
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-8">
      {/* 工作经历列表 */}
      {experiences.map((exp, index) => (
        <Card key={exp.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                工作经历 #{index + 1}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`position-${exp.id}`} className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  职位
                </Label>
                <Input
                  id={`position-${exp.id}`}
                  defaultValue={exp.position}
                  placeholder="例如：高级开发工程师"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`company-${exp.id}`}>公司</Label>
                <Input
                  id={`company-${exp.id}`}
                  defaultValue={exp.company}
                  placeholder="例如：科技公司"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`location-${exp.id}`} className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                工作地点
              </Label>
              <Input
                id={`location-${exp.id}`}
                defaultValue={exp.location}
                placeholder="例如：北京，中国"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${exp.id}`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  开始时间
                </Label>
                <Input
                  id={`startDate-${exp.id}`}
                  type="month"
                  defaultValue={exp.startDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${exp.id}`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  结束时间
                </Label>
                <Input
                  id={`endDate-${exp.id}`}
                  type="month"
                  defaultValue={exp.endDate}
                  placeholder="至今"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`responsibilities-${exp.id}`}>工作职责</Label>
              <Textarea
                id={`responsibilities-${exp.id}`}
                defaultValue={exp.responsibilities}
                placeholder="描述您的主要职责和成就..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 添加按钮 */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={addExperience}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加工作经历
          </Button>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          重置更改
        </Button>
        <Button>
          保存更改
        </Button>
      </div>
    </div>
  )
}
