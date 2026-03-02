import { cn } from '@/lib/utils'

interface ModuleCardProps {
  icon: string
  title: string
  iconBg: string
  actionLabel?: string
  onAction?: () => void
  children: React.ReactNode
}

export function ModuleCard({
  icon,
  title,
  iconBg,
  actionLabel,
  onAction,
  children,
}: ModuleCardProps) {
  return (
    <div className="border border-border rounded-card bg-white hover:shadow-card hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </span>
          <span className="font-serif text-sm font-semibold text-ink">{title}</span>
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-[12px] text-ink-muted hover:text-ink-light transition-colors cursor-pointer bg-transparent border-none font-sans"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
