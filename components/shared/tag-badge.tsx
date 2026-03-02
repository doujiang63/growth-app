import { cn } from '@/lib/utils'

const TAG_COLOR_MAP: Record<string, string> = {
  '职场': 'text-terracotta bg-terracotta/[0.12]',
  '育儿': 'text-rose bg-rose/[0.12]',
  '理财': 'text-gold bg-gold/[0.12]',
  '个人成长': 'text-lavender bg-lavender/[0.12]',
  '思考': 'text-gold bg-gold/[0.12]',
  '充实': 'text-sage bg-sage/[0.12]',
  '疲惫': 'text-lavender bg-lavender/[0.12]',
  '焦虑': 'text-terracotta bg-terracotta/[0.12]',
  '幸福': 'text-rose bg-rose/[0.12]',
  '开心': 'text-gold bg-gold/[0.12]',
}

interface TagBadgeProps {
  value: string
  size?: 'sm' | 'md'
}

export function TagBadge({ value, size = 'sm' }: TagBadgeProps) {
  const colorClass = TAG_COLOR_MAP[value] || 'text-ink-muted bg-ink-muted/[0.12]'

  return (
    <span
      className={cn(
        'inline-block rounded font-medium',
        colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      {value}
    </span>
  )
}
