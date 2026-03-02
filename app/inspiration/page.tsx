'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { INSPIRATION_TYPES, INSPIRATION_STATUSES } from '@/lib/constants'
import { TagBadge } from '@/components/shared/tag-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { X } from 'lucide-react'
import type { Inspiration } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

export default function InspirationPage() {
  const [items, setItems] = useState<Inspiration[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState<Inspiration['type']>('创意想法')
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    const supabase = createClient()
    supabase
      .from('inspirations')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = items.filter(item => {
    if (typeFilter !== '全部' && item.type !== typeFilter) return false
    if (statusFilter !== '全部' && item.status !== statusFilter) return false
    return true
  })

  const handleSave = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('inspirations').insert({
        user_id: user.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        type: formType,
      })

      setShowModal(false)
      setFormTitle('')
      setFormDescription('')
      setFormType('创意想法')
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条灵感吗？')) return
    const supabase = createClient()
    await supabase.from('inspirations').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleStatusChange = async (id: string, newStatus: Inspiration['status']) => {
    const supabase = createClient()
    await supabase.from('inspirations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item))
  }

  const handleConvert = async (item: Inspiration) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('career').insert({
      user_id: user.id,
      type: 'learning',
      title: item.title,
      content: item.description,
      progress: 0,
    })

    await handleStatusChange(item.id, '已深入')
  }

  const totalCount = items.length
  const pendingCount = items.filter(i => i.status === '待挖掘').length
  const doneCount = items.filter(i => i.status === '已深入').length

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-gold/15 via-cream to-lavender/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-gold/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-gold/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-lavender/[0.06]" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
                💡 灵感捕捉
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                捕捉每一个闪光的想法，让灵感不再流失
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
            >
              ✨ 记录灵感
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">💡 总灵感</div>
              <div className="font-serif text-lg text-ink">{totalCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">🌱 待挖掘</div>
              <div className="font-serif text-lg text-ink">{pendingCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">✅ 已深入</div>
              <div className="font-serif text-lg text-ink">{doneCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['全部', ...INSPIRATION_TYPES.map(t => t.value)].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={cn(
              'px-3.5 py-2 rounded-button border-[1.5px] border-border text-[13px] transition-all',
              typeFilter === type
                ? 'border-gold bg-gold/[0.08] text-ink'
                : 'bg-transparent text-ink-light hover:border-gold/50'
            )}
          >
            {type === '全部' ? '全部类型' : `${INSPIRATION_TYPES.find(t => t.value === type)?.emoji} ${type}`}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['全部', ...INSPIRATION_STATUSES.map(s => s.value)].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3.5 py-2 rounded-button border-[1.5px] border-border text-[13px] transition-all',
              statusFilter === status
                ? 'border-sage bg-sage/[0.08] text-ink'
                : 'bg-transparent text-ink-light hover:border-sage/50'
            )}
          >
            {status === '全部' ? '全部状态' : `${INSPIRATION_STATUSES.find(s => s.value === status)?.emoji} ${status}`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="💡"
          title={items.length === 0 ? '还没有灵感记录' : '没有匹配的灵感'}
          description="点击上方按钮记录你的第一个灵感"
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const typeConfig = INSPIRATION_TYPES.find(t => t.value === item.type)
            return (
              <div
                key={item.id}
                className="border border-border rounded-card bg-white p-4 hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-cream">
                    {typeConfig?.emoji || '💡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-serif text-[14px] font-semibold text-ink leading-snug">
                        {item.title}
                      </h4>
                      <TagBadge value={item.type} />
                      <TagBadge value={item.status} />
                    </div>
                    {item.description && (
                      <p className="text-[12px] text-ink-muted leading-relaxed mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        {item.status === '待挖掘' && (
                          <>
                            <button
                              onClick={() => handleConvert(item)}
                              className="text-[11px] px-2.5 py-1 rounded-button bg-sage/10 text-sage border border-sage/20 hover:bg-sage/20 transition-all"
                            >
                              🚀 转化为学习
                            </button>
                            <button
                              onClick={() => handleStatusChange(item.id, '已放弃')}
                              className="text-[11px] px-2.5 py-1 rounded-button bg-cream text-ink-muted border border-border hover:bg-border transition-all"
                            >
                              放弃
                            </button>
                          </>
                        )}
                        {item.status === '已放弃' && (
                          <button
                            onClick={() => handleStatusChange(item.id, '待挖掘')}
                            className="text-[11px] px-2.5 py-1 rounded-button bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
                          >
                            恢复
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[11px] text-ink-muted hover:text-terracotta transition-colors"
                        >
                          删除
                        </button>
                        <span className="text-[11px] text-ink-muted">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
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
              <h3 className="font-serif text-xl text-ink">记录灵感</h3>
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
                灵感类型
              </label>
              <div className="flex flex-wrap gap-2">
                {INSPIRATION_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormType(type.value as Inspiration['type'])}
                    className={cn(
                      'px-3 py-1.5 rounded-button border-[1.5px] border-border text-xs transition-all',
                      formType === type.value
                        ? 'border-gold bg-gold/[0.08] text-ink'
                        : 'text-ink-light hover:border-gold/50'
                    )}
                  >
                    {type.emoji} {type.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                灵感标题
              </label>
              <input
                type="text"
                placeholder="一句话描述你的灵感..."
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                详细描述（可选）
              </label>
              <textarea
                placeholder="更多的想法和联想..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full min-h-[100px] px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold resize-none leading-relaxed placeholder:text-ink-muted/50"
              />
            </div>

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
                {saving ? '保存中...' : '保存灵感'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
