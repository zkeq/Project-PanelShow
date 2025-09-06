
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, X } from "lucide-react"

export function ContactInformation() {
  const [hobbies, setHobbies] = useState(["编程", "摄影", "旅行", "阅读"])
  const [newHobby, setNewHobby] = useState("")

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, name: "GitHub", url: "https://github.com/alexchen", icon: "github" },
    { id: 2, name: "LinkedIn", url: "https://linkedin.com/in/alexchen", icon: "linkedin" },
  ])

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()])
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby))
  }

  const addSocialLink = () => {
    const newLink = {
      id: Date.now(),
      name: "",
      url: "",
      icon: "link",
    }
    setSocialLinks([...socialLinks, newLink])
  }

  const removeSocialLink = (id: number) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">联系方式</h1>
      <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl shadow-lg shadow-black/5 p-8 backdrop-blur-sm">
      <div className="space-y-8">
        {/* Basic Contact */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">基本联系方式</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" defaultValue="alex.chen@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input id="github" defaultValue="https://github.com/alexchen" />
            </div>
          </div>
        </div>

        {/* Hobbies */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">兴趣爱好</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <Badge key={hobby} variant="secondary" className="flex items-center gap-1">
                  {hobby}
                  <button onClick={() => removeHobby(hobby)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="添加新的兴趣爱好..."
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHobby()}
                className="max-w-xs"
              />
              <Button onClick={addHobby} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">社交链接</h2>
          {socialLinks.map((link, index) => (
            <div
              key={link.id}
              className="group relative bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl p-7 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 hover:border-border"
            >
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-white-500 to-black-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-medium">链接 #{index + 1}</h3>
                {socialLinks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(link.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>平台名称</Label>
                  <Input defaultValue={link.name} placeholder="例如：GitHub" />
                </div>
                <div className="space-y-2">
                  <Label>图标类型</Label>
                  <Select defaultValue={link.icon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="link">通用链接</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>网址</Label>
                <Input defaultValue={link.url} placeholder="https://..." />
              </div>
            </div>
          ))}
           <Button
              onClick={addSocialLink}
              variant="outline"
              className="w-full bg-muted/20 hover:bg-muted/40 border-dashed"
            >
            <Plus className="h-4 w-4 mr-2" />
            添加社交链接
          </Button>
        </div>
          <div className="pt-6 border-t border-border">
            <Button>保存更改</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
