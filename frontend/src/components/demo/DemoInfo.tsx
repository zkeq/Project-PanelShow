import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Markdown from "@/components/Markdown"
import type { DemoContent } from "@/types/demo"

interface DemoInfoProps {
  content: DemoContent
}

export default function DemoInfo({ content }: DemoInfoProps) {
  const { leftMarkdown, rightMarkdown, sourceUrl } = content

  return (
    <div className="w-full max-w-[1440px] mt-8">
      <Card className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">左侧信息</h3>
            {leftMarkdown ? (
              <Markdown>{leftMarkdown}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">暂无左侧栏信息</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">右侧信息</h3>
            {rightMarkdown ? (
              <Markdown>{rightMarkdown}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">暂无右侧栏信息</p>
            )}
          </div>
        </div>

        {sourceUrl && (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={sourceUrl} target="_blank" rel="noopener noreferrer">
                查看源码
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}