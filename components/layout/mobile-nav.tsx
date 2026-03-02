'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const MOBILE_NAV_ITEMS = [
  { label: '总览', emoji: '🏡', href: '/' },
  { label: '日记', emoji: '📝', href: '/diary' },
  { label: '收藏', emoji: '📚', href: '/content' },
  { label: '育儿', emoji: '👶', href: '/parenting' },
  { label: '更多', emoji: '📊', href: '/career' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-warm-white border-t border-border pb-[env(safe-area-inset-bottom)] z-[100]">
      <div className="flex justify-around py-2">
        {MOBILE_NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] text-ink-muted transition-colors',
                isActive && 'text-ink'
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
