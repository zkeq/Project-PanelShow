"use client"

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import domtoimage from 'dom-to-image'
import { Download, Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

interface ProjectExportDialogProps {
  getTargetNode: () => HTMLElement | null
  fileName: string
}

const SCALE_MIN = 2
const SCALE_MAX = 8

const sanitizeFileName = (source: string) => {
  const trimmed = source.trim()
  if (!trimmed) return '导出图片'
  return trimmed
}

const formatDimension = (value: number) => {
  if (value < 1000) return `${Math.round(value)}`
  return `${(value / 1000).toFixed(1)}k`
}

export default function ProjectExportDialog({ getTargetNode, fileName }: ProjectExportDialogProps) {
  const { resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(SCALE_MIN)
  const [exporting, setExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [baseDimensions, setBaseDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  const safeFileName = useMemo(() => `${sanitizeFileName(fileName)}.png`, [fileName])

  useEffect(() => {
    if (!open) return

    const node = getTargetNode()
    if (!node) {
      setBaseDimensions({ width: 0, height: 0 })
      return
    }

    setBaseDimensions({ width: node.scrollWidth, height: node.scrollHeight })
  }, [open, getTargetNode])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (exporting) return
      setOpen(nextOpen)
      if (nextOpen) {
        setErrorMessage(null)
      }
    },
    [exporting]
  )

  const handleScaleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setScale(Number(event.target.value))
  }

  const exportImage = async () => {
    const node = getTargetNode()

    if (!node) {
      setErrorMessage('未找到可以导出的页面内容，请稍后重试。')
      return
    }

    setExporting(true)
    setErrorMessage(null)

    const backgroundColor = resolvedTheme === 'dark' ? '#202020' : '#F8F8F8'

    try {
      const width = node.scrollWidth
      const height = node.scrollHeight
      const blob = await domtoimage.toBlob(node, {
        bgcolor: backgroundColor,
        width: width * scale,
        height: height * scale,
        style: {
          transform: `scale(${scale})`,
          'transform-origin': 'top left',
          width: `${width}px`,
          height: `${height}px`
        },
        filter: (subNode) => {
          if (subNode instanceof HTMLImageElement && subNode.src) {
            try {
              const imageUrl = new URL(subNode.src, window.location.href)
              const isSameOrigin = imageUrl.origin === window.location.origin
              const isAllowedHost = imageUrl.hostname === 'source.imyaigc.com'
              if (!isSameOrigin && !isAllowedHost) {
                return false
              }
            } catch (error) {
              console.warn('无法校验图片地址，默认包含在导出中', error)
            }
          }
          return true
        }
      })

      if (!(blob instanceof Blob)) {
        throw new Error('导出失败：生成的文件无效，请尝试降低导出倍率后再试。')
      }

      if (blob.size === 0) {
        throw new Error('导出失败：图片数据为空。')
      }

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = safeFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      setStatusMessage('导出成功，图片已开始下载。')
      setOpen(false)
    } catch (error) {
      console.error('导出失败', error)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('导出过程出现未知错误，请稍后重试。')
      }
    } finally {
      setExporting(false)
    }
  }

  const estimatedWidth = baseDimensions.width * scale
  const estimatedHeight = baseDimensions.height * scale

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="px-8 border-2" disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            导出图片
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出项目详情为图片</DialogTitle>
            <DialogDescription>选择导出倍率后，我们会生成整页图片供您下载。</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>导出倍率</span>
                <span className="font-medium text-foreground">{scale}x</span>
              </div>
              <input
                type="range"
                min={SCALE_MIN}
                max={SCALE_MAX}
                step={1}
                value={scale}
                onChange={handleScaleChange}
                className="w-full accent-primary"
                aria-label="导出倍率"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{SCALE_MIN}x</span>
                <span>{SCALE_MAX}x</span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                预计导出尺寸：
                <span className="ml-1 font-medium text-foreground">
                  {estimatedWidth > 0 && estimatedHeight > 0
                    ? `${formatDimension(estimatedWidth)} × ${formatDimension(estimatedHeight)}`
                    : '准备中...'}
                  px
                </span>
              </p>
              <p className="mt-2">导出倍率越大，图片越清晰，同时生成时间也会更长。</p>
            </div>

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={exporting}>
              取消
            </Button>
            <Button onClick={exportImage} disabled={exporting}>
              {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              下载图片
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {statusMessage && <p className="text-xs text-muted-foreground">{statusMessage}</p>}
    </div>
  )
}
