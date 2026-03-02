import { cn } from '@/lib/utils'

interface SourceIconProps {
  type: 'wechat' | 'youtube' | 'web'
}

const SOURCE_CONFIG: Record<SourceIconProps['type'], { label: string; bg: string; text: string }> = {
  wechat: { label: '微', bg: 'bg-sage', text: 'text-white' },
  youtube: { label: '\u25B6', bg: 'bg-terracotta', text: 'text-white' },
  web: { label: '\uD83D\uDD17', bg: 'bg-cream', text: 'text-ink-light' },
}

export function SourceIcon({ type }: SourceIconProps) {
  const config = SOURCE_CONFIG[type]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-[22px] h-[22px] rounded text-[11px] flex-shrink-0',
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  )
}
