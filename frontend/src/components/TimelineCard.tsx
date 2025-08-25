'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Github, 
  ChevronDown,
  ChevronUp,
  Code2,
  Zap
} from 'lucide-react'
import { TimelineItem } from '@/types/timeline'

interface TimelineCardProps {
  item: TimelineItem
}

export default function TimelineCard({ item }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(item.isLiked || false)
  const [likes, setLikes] = useState(item.likes)
  const [showAllImages, setShowAllImages] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  
  const contentRef = useRef<HTMLDivElement>(null)

  // 检测内容是否超出容器
  useEffect(() => {
    if (contentRef.current && item.project.readme) {
      const element = contentRef.current
      // 检查内容的scrollHeight是否大于clientHeight
      setShowExpandButton(element.scrollHeight > element.clientHeight)
    }
  }, [item.project.readme])

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  // 更新类型对应的徽章样式
  const updateTypeBadges = {
    new: { color: 'bg-green-500', label: '新项目' },
    update: { color: 'bg-blue-500', label: '更新' },
    fix: { color: 'bg-orange-500', label: '修复' },
    feature: { color: 'bg-purple-500', label: '新功能' },
    refactor: { color: 'bg-cyan-500', label: '重构' }
  }

  const updateBadge = updateTypeBadges[item.updateType]

  // 格式化时间
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
    locale: zhCN
  })

  // 显示的图片数量
  const displayImages = showAllImages ? item.project.previewImages : item.project.previewImages.slice(0, 4)
  const hasMoreImages = item.project.previewImages.length > 4

  return (
    <Card className="py-0 w-full bg-background border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 space-y-4">
        {/* 头部信息：时间、昵称 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {timeAgo} · {item.author.name}
          </div>
          <Badge 
            className={`${updateBadge.color} text-white border-0 text-xs`}
          >
            {updateBadge.label}
          </Badge>
        </div>

        {/* 项目信息行：logo + 项目名 */}
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border border-border/60">
            <Image
              src={item.project.logo}
              alt={item.project.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">
              {item.project.name}
            </h3>
          </div>
        </div>

        {/* 项目描述 */}
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {item.project.description}
          </p>

          {/* 技术栈标签 */}
          <div className="flex flex-wrap gap-2">
            {item.project.techStack.map((tech, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="text-xs px-2 py-1"
              >
                <Code2 className="w-3 h-3 mr-1" />
                {tech}
              </Badge>
            ))}
          </div>

          {/* README详情 - 可展开 */}
          {item.project.readme && (
            <div className="space-y-2">
              <div 
                ref={contentRef}
                className={`text-sm text-muted-foreground leading-relaxed transition-all duration-300 ${
                  isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'
                }`}
              >
                <p className="whitespace-pre-line">
                  {item.project.readme}
                </p>
              </div>
              
              {/* 渐变遮罩 */}
              {!isExpanded && showExpandButton && (
                <div className="relative">
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent" />
                </div>
              )}
              
              {/* 展开按钮 */}
              {showExpandButton && (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary hover:text-primary/80 h-6 px-2"
                  >
                    {isExpanded ? (
                      <>
                        收起
                        <ChevronUp className="w-3 h-3 ml-1" />
                      </>
                    ) : (
                      <>
                        展开
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 预览图片网格 */}
        {item.project.previewImages.length > 0 && (
          <div className="space-y-3">
            <div className={`grid gap-2 ${
              displayImages.length === 1 ? 'grid-cols-1' :
              displayImages.length === 2 ? 'grid-cols-2' :
              displayImages.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {displayImages.map((image, index) => (
                <div 
                  key={index}
                  className={`relative overflow-hidden rounded-lg cursor-pointer group ${
                    displayImages.length === 1 ? 'aspect-video' :
                    displayImages.length === 3 && index === 0 ? 'col-span-3 aspect-video' :
                    displayImages.length >= 4 && index < 2 ? 'aspect-square' :
                    'aspect-square'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${item.project.name} 预览 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* 点击打开全屏预览的遮罩 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* 查看更多图片按钮 */}
            {hasMoreImages && !showAllImages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllImages(true)}
                className="w-full text-sm text-muted-foreground hover:text-foreground border border-dashed border-border"
              >
                查看全部 {item.project.previewImages.length} 张图片
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between">
          {/* 左侧：交互按钮 */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-8 px-3 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likes > 0 && <span className="text-xs">{likes}</span>}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {item.comments > 0 && <span className="text-xs">{item.comments}</span>}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="text-xs">分享</span>
            </Button>
          </div>

          {/* 右侧：项目链接 */}
          <div className="flex items-center space-x-2">
            {item.project.repositoryUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3"
              >
                <a href={item.project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-1" />
                  <span className="text-xs">代码</span>
                </a>
              </Button>
            )}
            
            {item.project.liveUrl && (
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-8 px-3"
              >
                <a href={item.project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="text-xs">演示</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}