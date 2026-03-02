import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatFullDate(date: string | Date): string {
  const d = new Date(date)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '早安'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function getDaysRemaining(): number {
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const diffTime = endOfYear.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()

  // Reset times to midnight for accurate day comparison
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffTime = today.getTime() - target.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays === 2) return '前天'
  if (diffDays > 0) return `${diffDays}天前`
  return formatDate(date)
}
