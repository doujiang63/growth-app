'use client'

import { MOODS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MoodSelectorProps {
  value?: string
  onChange: (mood: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {MOODS.map(mood => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            'px-3.5 py-2 rounded-button border-[1.5px] border-border bg-transparent text-[13px] transition-all font-sans cursor-pointer',
            value === mood.value
              ? 'border-gold bg-gold/[0.08] text-ink'
              : 'text-ink-light hover:border-gold/50'
          )}
        >
          {mood.emoji} {mood.value}
        </button>
      ))}
    </div>
  )
}
