import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-serif text-base text-ink font-semibold">{title}</h2>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-[13px] text-ink-muted hover:text-ink-light transition-colors cursor-pointer bg-transparent border-none font-sans"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
