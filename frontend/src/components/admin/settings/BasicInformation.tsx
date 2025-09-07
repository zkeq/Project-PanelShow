
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, RefreshCw } from "lucide-react"

export function BasicInformation() {
  const [authorName, setAuthorName] = useState("Alex Chen")

  const generateLowercase = () => {
    setAuthorName(authorName.toLowerCase().replace(/\s+/g, ""))
  }

  return (
    <div className="space-y-8">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像 */}
          <div className="space-y-2">
            <Label>头像</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                上传头像
              </Button>
            </div>
          </div>

          {/* 基本信息表单字段 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" defaultValue="alexchen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website-title">网站标题</Label>
              <Input id="website-title" defaultValue="Alex Chen Portfolio" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author-name">作者名称</Label>
              <Input
                id="author-name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                defaultValue="Alex Chen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-lowercase">作者名称小写</Label>
              <div className="flex gap-2">
                <Input id="author-lowercase" value={authorName.toLowerCase().replace(/\s+/g, "")} readOnly />
                <Button variant="outline" size="sm" onClick={generateLowercase}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-description">作者描述</Label>
            <Textarea
              id="author-description"
              placeholder="介绍一下您自己、您的背景和创作理念..."
              className="min-h-[120px]"
              defaultValue="热情的全栈开发工程师，拥有5年以上构建现代Web应用程序的经验。专精于React、Node.js和云技术。"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-unit">工作单位</Label>
              <Input id="work-unit" defaultValue="科技创新有限公司" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-website">个人网站</Label>
              <Input id="personal-website" type="url" defaultValue="https://alexchen.dev" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">个人签名</Label>
            <Input id="signature" defaultValue="代码改变世界，创新驱动未来" />
          </div>
        </CardContent>
      </Card>

      {/* 社交数据 */}
      <Card>
        <CardHeader>
          <CardTitle>社交数据</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followers">关注者数量</Label>
              <Input id="followers" type="number" defaultValue="1250" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stars">Star 数量</Label>
              <Input id="stars" type="number" defaultValue="890" />
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">1.2K 关注者</Badge>
            <Badge variant="secondary">890 Stars</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 联系信息 */}
      <Card>
        <CardHeader>
          <CardTitle>联系信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>个人微信二维码</Label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <span className="text-sm text-muted-foreground">二维码预览</span>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                上传二维码
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" placeholder="其他备注信息..." className="min-h-[80px]" />
          </div>
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
