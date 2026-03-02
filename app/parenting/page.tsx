'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MilestoneItem } from '@/components/shared/milestone-item'
import { ContentCard } from '@/components/shared/content-card'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import { TagBadge } from '@/components/shared/tag-badge'
import { X } from 'lucide-react'
import type { Parenting, Content } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

const MILESTONE_EMOJIS: Record<string, string> = {
  '语言': '🗣️',
  '运动': '🏃',
  '社交': '👋',
  '认知': '🧠',
  '饮食': '🍼',
  '睡眠': '😴',
  '健康': '💊',
  '默认': '📝',
}

export default function ParentingPage() {
  const [milestones, setMilestones] = useState<Parenting[]>([])
  const [relatedContent, setRelatedContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const tagOptions = ['语言', '运动', '社交', '认知', '饮食', '睡眠', '健康']

  const loadData = () => {
    const supabase = createClient()
    supabase
      .from('parenting')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMilestones(data || [])
        setLoading(false)
      })
    supabase
      .from('contents')
      .select('*')
      .eq('category', '育儿')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setRelatedContent(data || []))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formTitle.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('parenting').insert({
        user_id: user.id,
        title: formTitle.trim(),
        content: formContent.trim(),
        milestone_age: formAge.trim(),
        tags: formTags,
      })

      if (error) {
        console.error('Save parenting error:', error)
        return
      }

      setShowModal(false)
      setFormTitle('')
      setFormContent('')
      setFormAge('')
      setFormTags([])
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tag: string) => {
    setFormTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rose/20 via-cream to-lavender/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-rose/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-rose/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-lavender/[0.06]" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
                👶 育儿 · 成长记录
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                记录宝宝每一个珍贵的成长瞬间
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
            >
              ✏️ 记录成长
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                总记录
              </div>
              <div className="font-serif text-lg text-ink">{milestones.length}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                本月新增
              </div>
              <div className="font-serif text-lg text-ink">
                {milestones.filter(m => {
                  const d = new Date(m.created_at)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                相关收藏
              </div>
              <div className="font-serif text-lg text-ink">{relatedContent.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <SectionHeader title="成长里程碑" />
      <div className="mb-8 mt-3">
        {loading ? (
          <div className="text-center py-12 text-ink-muted text-sm">加载中...</div>
        ) : milestones.length === 0 ? (
          <EmptyState
            icon="👶"
            title="还没有成长记录"
            description="点击上方按钮记录宝宝的第一个里程碑"
          />
        ) : (
          <div className="space-y-1">
            {milestones.map(m => {
              const tags = m.tags || []
              const firstTag = tags[0] || '默认'
              const emoji = MILESTONE_EMOJIS[firstTag] || MILESTONE_EMOJIS['默认']
              return (
                <div
                  key={m.id}
                  className="border border-border rounded-card bg-white p-4 hover:shadow-card hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-lg">{emoji}</span>
                      {m.milestone_age && (
                        <span className="text-[11px] text-rose font-medium">{m.milestone_age}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-[14px] font-semibold text-ink leading-snug mb-1">
                        {m.title}
                      </h4>
                      {m.content && (
                        <p className="text-[12px] text-ink-muted leading-relaxed mb-2 line-clamp-2">
                          {m.content}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {tags.map(tag => (
                          <TagBadge key={tag} value={tag} />
                        ))}
                        <span className="text-[11px] text-ink-muted ml-auto">
                          {formatDate(m.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Related Content */}
      {relatedContent.length > 0 && (
        <>
          <SectionHeader title="育儿相关收藏" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {relatedContent.map(c => (
              <ContentCard
                key={c.id}
                title={c.title || ''}
                summary={c.summary || ''}
                category={c.category || '育儿'}
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

      {/* Add Milestone Modal */}
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
              <h3 className="font-serif text-xl text-ink">记录成长</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Age */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                宝宝月龄/年龄
              </label>
              <input
                type="text"
                placeholder="例如：8个月、1岁2个月"
                value={formAge}
                onChange={e => setFormAge(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                里程碑标题
              </label>
              <input
                type="text"
                placeholder="例如：第一次叫妈妈"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Content */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                详细记录（可选）
              </label>
              <textarea
                placeholder="记录更多细节..."
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                className="w-full min-h-[100px] px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold resize-none leading-relaxed placeholder:text-ink-muted/50"
              />
            </div>

            {/* Tags */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                标签
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-button border-[1.5px] border-border text-xs transition-all',
                      formTags.includes(tag)
                        ? 'border-rose bg-rose/[0.08] text-ink'
                        : 'text-ink-light hover:border-rose/50'
                    )}
                  >
                    {MILESTONE_EMOJIS[tag]} {tag}
                  </button>
                ))}
              </div>
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
                {saving ? '保存中...' : '保存记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
