import { cn } from '@/lib/utils'

interface ProgressBarProps {
  label: string
  percentage: number
  color?: string
}

export function ProgressBar({ label, percentage, color = 'sage' }: ProgressBarProps) {
  const colorClasses: Record<string, string> = {
    sage: 'bg-sage',
    terracotta: 'bg-terracotta',
    gold: 'bg-gold',
    lavender: 'bg-lavender',
    rose: 'bg-rose',
  }

  const fillClass = colorClasses[color] || 'bg-sage'

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[12px] text-ink-light font-sans min-w-[60px]">{label}</span>
      <div className="w-20 h-[5px] bg-cream rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', fillClass)}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <span className="text-[11px] text-ink-muted font-sans">{percentage}%</span>
    </div>
  )
}
