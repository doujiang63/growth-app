'use client'

import { cn } from '@/lib/utils'

interface VideoCardProps {
  title: string
  date: string
  emoji?: string
  gradient?: string
  onClick?: () => void
}

export function VideoCard({
  title,
  date,
  emoji = '🎬',
  gradient = 'from-sage/30 to-lavender/30',
  onClick,
}: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border border-border rounded-card bg-white overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Thumbnail area */}
      <div
        className={cn(
          'relative h-28 bg-gradient-to-br flex items-center justify-center',
          gradient
        )}
      >
        <span className="text-3xl">{emoji}</span>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-card">
            <span className="text-ink ml-0.5 text-sm">&#9654;</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] text-ink-muted font-sans mb-1">{date}</p>
        <h3 className="font-serif text-[13px] font-semibold text-ink leading-snug line-clamp-2">
          {title}
        </h3>
      </div>
    </div>
  )
}
