'use client'

export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 min-h-[calc(100vh-3.5rem)] overflow-hidden pointer-events-none">
      {/* 点状背景层 */}
      <div 
        className="absolute inset-0 min-h-full dark:hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.4) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* 暗色模式下的点状背景 - 更淡 */}
      <div 
        className="absolute inset-0 min-h-full hidden dark:block"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* 渐变装饰元素 - 与现有设计系统颜色一致 */}
      <div className="absolute top-16 right-16 w-40 h-40 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-32 left-32 w-48 h-48 bg-gradient-to-tr from-purple-500/8 to-pink-500/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
    </div>
  )
}