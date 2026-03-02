'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { MobileNav } from './mobile-nav'
import { Fab } from './fab'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-[240px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-5 md:p-10 pb-[100px] md:pb-10 max-w-content">
          {children}
        </main>
      </div>
      <MobileNav />
      <Fab />
    </div>
  )
}
