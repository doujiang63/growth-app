'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ContentCard } from '@/components/shared/content-card'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import { TagBadge } from '@/components/shared/tag-badge'
import { X } from 'lucide-react'
import type { Career, Content } from '@/lib/types'

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  goal: { label: '目标', emoji: '🎯', color: 'sage' },
  decision: { label: '决策', emoji: '📌', color: 'terracotta' },
  learning: { label: '学习', emoji: '💡', color: 'gold' },
}

export default function CareerPage() {
  const [items, setItems] = useState<Career[]>([])
  const [relatedContent, setRelatedContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('全部')
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formType, setFormType] = useState<'goal' | 'decision' | 'learning'>('goal')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formProgress, setFormProgress] = useState(0)
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    const supabase = createClient()
    supabase
      .from('career')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
    supabase
      .from('contents')
      .select('*')
      .eq('category', '职场')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setRelatedContent(data || []))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = items.filter(item => {
    if (filter === '全部') return true
    return item.type === filter
  })

  const handleSave = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('career').insert({
        user_id: user.id,
        type: formType,
        title: formTitle.trim(),
        content: formContent.trim(),
        progress: formProgress,
      })

      setShowModal(false)
      setFormTitle('')
      setFormContent('')
      setFormType('goal')
      setFormProgress(0)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const goalCount = items.filter(i => i.type === 'goal').length
  const decisionCount = items.filter(i => i.type === 'decision').length
  const learningCount = items.filter(i => i.type === 'learning').length

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-terracotta/15 via-cream to-gold/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-terracotta/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-terracotta/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-gold/[0.06]" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
                💼 职场 · 目标追踪
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                追踪职业目标，记录重要决策和学习心得
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
            >
              ✏️ 添加记录
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                🎯 目标
              </div>
              <div className="font-serif text-lg text-ink">{goalCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                📌 决策
              </div>
              <div className="font-serif text-lg text-ink">{decisionCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                💡 学习
              </div>
              <div className="font-serif text-lg text-ink">{learningCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['全部', 'goal', 'decision', 'learning'].map(type => {
          const config = TYPE_CONFIG[type]
          const label = type === '全部' ? '全部' : `${config?.emoji} ${config?.label}`
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'px-3.5 py-2 rounded-button border-[1.5px] border-border text-[13px] transition-all',
                filter === type
                  ? 'border-gold bg-gold/[0.08] text-ink'
                  : 'bg-transparent text-ink-light hover:border-gold/50'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Career Items */}
      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="💼"
          title={items.length === 0 ? '还没有职场记录' : '没有匹配的记录'}
          description="点击上方按钮添加你的第一条职场记录"
        />
      ) : (
        <div className="space-y-3 mb-8">
          {filteredItems.map(item => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.goal
            return (
              <div
                key={item.id}
                className="border border-border rounded-card bg-white p-4 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-cream">
                    {config.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-serif text-[14px] font-semibold text-ink leading-snug">
                        {item.title}
                      </h4>
                      <TagBadge value={config.label} />
                    </div>
                    {item.content && (
                      <p className="text-[12px] text-ink-muted leading-relaxed mb-2 line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    {item.type === 'goal' && item.progress !== undefined && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-[5px] bg-cream rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sage rounded-full transition-all"
                            style={{ width: `${Math.min(100, item.progress)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-ink-muted">{item.progress}%</span>
                      </div>
                    )}
                    <div className="flex items-center justify-end mt-2">
                      <span className="text-[11px] text-ink-muted">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Related Content */}
      {relatedContent.length > 0 && (
        <>
          <SectionHeader title="职场相关收藏" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {relatedContent.map(c => (
              <ContentCard
                key={c.id}
                title={c.title || ''}
                summary={c.summary || ''}
                category={c.category || '职场'}
                sourceType={(c.source_type as 'wechat' | 'youtube' | 'web') || 'web'}
                sourceName=""
                myNote={c.my_note || undefined}
                date={formatDate(c.created_at)}
                aiSummary={!!c.summary}
              />
            ))}
          </div>
        </>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-warm-white rounded-modal p-9 w-[560px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-serif text-xl text-ink">添加职场记录</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                记录类型
              </label>
              <div className="flex gap-2">
                {(['goal', 'decision', 'learning'] as const).map(type => {
                  const config = TYPE_CONFIG[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      className={cn(
                        'flex-1 px-3 py-2.5 rounded-button border-[1.5px] border-border text-[13px] transition-all',
                        formType === type
                          ? 'border-gold bg-gold/[0.08] text-ink'
                          : 'text-ink-light hover:border-gold/50'
                      )}
                    >
                      {config.emoji} {config.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                标题
              </label>
              <input
                type="text"
                placeholder={formType === 'goal' ? '例如：完成项目管理认证' : formType === 'decision' ? '例如：决定转向产品方向' : '例如：学习了 React Server Components'}
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Content */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                详细内容（可选）
              </label>
              <textarea
                placeholder="记录更多想法和细节..."
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                className="w-full min-h-[100px] px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold resize-none leading-relaxed placeholder:text-ink-muted/50"
              />
            </div>

            {/* Progress (only for goals) */}
            {formType === 'goal' && (
              <div className="mb-5">
                <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                  进度 ({formProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formProgress}
                  onChange={e => setFormProgress(Number(e.target.value))}
                  className="w-full accent-sage"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 justify-end mt-7">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-button text-[13px] font-medium border border-border text-ink-light hover:bg-cream transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formTitle.trim()}
                className="px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
