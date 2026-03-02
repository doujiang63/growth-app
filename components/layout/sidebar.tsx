'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, ENERGY_LEVELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [energy, setEnergy] = useState(0)
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekdays[now.getDay()]}`

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('energy_logs')
        .select('level')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lte('created_at', today + 'T23:59:59')
        .single()
      if (data) setEnergy(data.level)
    })
  }, [])

  const handleEnergy = async (level: number) => {
    setEnergy(level)
    try {
      const res = await fetch('/api/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      })
      if (!res.ok) setEnergy(0)
    } catch {
      setEnergy(0)
    }
  }

  const sections = Array.from(new Set(NAV_ITEMS.map(i => i.section)))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[99] md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'w-[240px] min-h-screen bg-ink flex flex-col fixed left-0 top-0 bottom-0 z-[100] transition-transform duration-300',
          'max-md:-translate-x-full',
          open && 'max-md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/[0.08]">
          <div className="font-serif text-lg text-cream leading-snug tracking-wide">
            我的成长系统
            <span className="block text-[11px] text-ink-muted font-sans font-light tracking-[0.15em] uppercase mt-1">
              Personal Growth OS
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="text-5xl font-light text-white/[0.15] leading-none font-sans">
            {day}
          </div>
          <div className="text-xs text-ink-muted mt-1 tracking-wider">
            {dateText}
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-4 flex-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section}>
              <div className="px-6 py-2 text-[10px] tracking-[0.15em] uppercase text-white/25 font-medium">
                {section}
              </div>
              {NAV_ITEMS.filter(i => i.section === section).map(item => {
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-6 py-2.5 border-l-2 border-transparent text-white/50 text-sm transition-all hover:text-white/90 hover:bg-white/[0.04]',
                      isActive && 'text-cream border-l-gold bg-gold/[0.08]'
                    )}
                  >
                    <span className="text-base w-5 text-center opacity-80">{item.emoji}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Energy Widget */}
        <div className="px-6 py-5 border-t border-white/[0.06]">
          <div className="bg-white/[0.04] rounded-input p-3.5">
            <div className="text-[11px] text-white/30 tracking-wider mb-2.5">
              今日能量状态
            </div>
            <div className="flex gap-1.5">
              {ENERGY_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => handleEnergy(level)}
                  className={cn(
                    'w-7 h-7 rounded-full border-[1.5px] border-white/15 flex items-center justify-center text-[11px] text-white/30 cursor-pointer transition-all',
                    energy >= level && 'border-gold bg-gold/20 text-gold'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
