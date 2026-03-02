export const MOODS = [
  { value: '开心', emoji: '😊', color: 'gold' },
  { value: '思考', emoji: '🤔', color: 'lavender' },
  { value: '疲惫', emoji: '😴', color: 'lavender' },
  { value: '充实', emoji: '💪', color: 'sage' },
  { value: '焦虑', emoji: '😰', color: 'terracotta' },
  { value: '幸福', emoji: '🥰', color: 'rose' },
] as const

export const CATEGORIES = [
  { value: '职场', emoji: '💼', color: 'terracotta' },
  { value: '育儿', emoji: '👶', color: 'rose' },
  { value: '理财', emoji: '💰', color: 'gold' },
  { value: '个人成长', emoji: '🌱', color: 'lavender' },
  { value: '其他', emoji: '📌', color: 'ink-muted' },
] as const

export const NAV_ITEMS = [
  { label: '今日总览', emoji: '🏡', href: '/', section: '日常' },
  { label: '日记·复盘', emoji: '📝', href: '/diary', section: '日常' },
  { label: '视频日记', emoji: '🎬', href: '/video', section: '日常' },
  { label: '内容收藏', emoji: '📚', href: '/content', section: '日常' },
  { label: '灵感捕捉', emoji: '💡', href: '/inspiration', section: '日常' },
  { label: '育儿', emoji: '👶', href: '/parenting', section: '成长板块' },
  { label: '职场', emoji: '💼', href: '/career', section: '成长板块' },
  { label: '理财', emoji: '💰', href: '/finance', section: '成长板块' },
  { label: '周·月复盘', emoji: '🔁', href: '/review', section: '回顾' },
] as const

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const

export const SOURCE_TYPES = [
  { value: 'wechat', name: '微信公众号', color: 'sage' },
  { value: 'youtube', name: 'YouTube', color: 'terracotta' },
  { value: 'web', name: '网页', color: 'lavender' },
] as const

export const INSPIRATION_TYPES = [
  { value: '新词概念', emoji: '📖', color: 'lavender' },
  { value: '新工具', emoji: '🔧', color: 'sage' },
  { value: '创意想法', emoji: '✨', color: 'gold' },
  { value: '待深挖话题', emoji: '🔍', color: 'terracotta' },
  { value: '其他', emoji: '📌', color: 'ink-muted' },
] as const

export const INSPIRATION_STATUSES = [
  { value: '待挖掘', emoji: '🌱', color: 'gold' },
  { value: '已深入', emoji: '✅', color: 'sage' },
  { value: '已放弃', emoji: '💤', color: 'ink-muted' },
] as const
