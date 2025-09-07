import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children, // 将是一个页面或嵌套布局
}: {
  children: React.ReactNode
}) {
  return (
    <>
   {/* 顶部导航栏 - 独立于背景容器外 */}
      <AdminHeader />
      
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-background dark:via-background dark:to-muted/50">
        {/* 背景装饰网格 */}
        <div className="absolute inset-0 bg-grid-gray-100/40 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        
        {/* 动态背景元素 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-muted/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-muted/15 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-muted/10 rounded-full blur-2xl animate-pulse delay-1000" />
        </div> 
      {children}
      </div>
    </>
  )
}
