'use client'

import { usePathname, useRouter } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/constants'
import { Menu } from 'lucide-react'

interface TopbarProps {
  onMenuClick?: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/': '今日总览',
  '/diary': '日记 · 复盘',
  '/video': '视频日记',
  '/content': '内容收藏',
  '/parenting': '育儿 · 成长记录',
  '/career': '职场 · 成长追踪',
  '/finance': '理财 · 年度进度',
  '/review': '周 · 月复盘',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] || '今日总览'

  return (
    <header className="bg-warm-white border-b border-border px-4 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-button border border-border text-ink-light hover:bg-cream transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-serif text-xl text-ink">{title}</h1>
      </div>
      <div className="flex gap-2.5 items-center">
        <button
          onClick={() => router.push('/content?new=1')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-transparent text-ink-light border border-border hover:bg-cream transition-all"
        >
          ＋ 保存内容
        </button>
        <button
          onClick={() => router.push('/diary/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
        >
          ✏️ 写日记
        </button>
      </div>
    </header>
  )
}
