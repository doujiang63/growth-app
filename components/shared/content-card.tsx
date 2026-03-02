'use client'

import { cn } from '@/lib/utils'
import { SourceIcon } from './source-icon'
import { TagBadge } from './tag-badge'
import { AiBadge } from './ai-badge'

const ACCENT_GRADIENTS: Record<string, string> = {
  wechat: 'from-sage to-sage-light',
  youtube: 'from-terracotta to-terracotta-light',
  web: 'from-lavender to-lavender-light',
}

interface ContentCardProps {
  title: string
  summary: string
  category: string
  sourceType: 'wechat' | 'youtube' | 'web'
  sourceName: string
  myNote?: string
  date: string
  aiSummary?: boolean
  onClick?: () => void
}

export function ContentCard({
  title,
  summary,
  category,
  sourceType,
  sourceName,
  myNote,
  date,
  aiSummary,
  onClick,
}: ContentCardProps) {
  const gradient = ACCENT_GRADIENTS[sourceType] || ACCENT_GRADIENTS.web

  return (
    <div
      onClick={onClick}
      className={cn(
        'border border-border rounded-card bg-white overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Accent bar */}
      <div className={cn('h-1 bg-gradient-to-r', gradient)} />

      <div className="p-4">
        {/* Source row */}
        <div className="flex items-center gap-2 mb-2.5">
          <SourceIcon type={sourceType} />
          <span className="text-[12px] text-ink-muted font-sans">{sourceName}</span>
          {aiSummary && (
            <span className="ml-auto">
              <AiBadge />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-[14px] font-semibold text-ink leading-snug mb-1.5">
          {title}
        </h3>

        {/* Summary */}
        <p className="text-[12px] text-ink-muted leading-relaxed mb-2.5 line-clamp-2">
          {summary}
        </p>

        {/* User note */}
        {myNote && (
          <div className="bg-cream/50 rounded-lg px-3 py-2 mb-2.5">
            <p className="text-[12px] text-ink-light leading-relaxed italic">
              &ldquo;{myNote}&rdquo;
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <TagBadge value={category} />
          <span className="text-[11px] text-ink-muted font-sans">{date}</span>
        </div>
      </div>
    </div>
  )
}
