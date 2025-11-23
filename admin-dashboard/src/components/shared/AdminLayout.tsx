'use client'

import { cn } from '@/lib/utils'
import { useSidebarCollapsed } from '@/store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const isCollapsed = useSidebarCollapsed()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          isCollapsed ? 'pl-20' : 'pl-64'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
