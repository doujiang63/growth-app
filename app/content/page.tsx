'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ContentCard } from '@/components/shared/content-card'
import { Loader2, X, Search } from 'lucide-react'
import type { Content } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

export default function ContentPageWrapper() {
  return (
    <WithShell>
      <Suspense fallback={<div className="text-center py-20 text-ink-muted text-sm">加载中...</div>}>
        <ContentPage />
      </Suspense>
    </WithShell>
  )
}

function ContentPage() {
  const searchParams = useSearchParams()
  const showNew = searchParams.get('new') === '1'

  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(showNew)

  // Modal state
  const [url, setUrl] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [preview, setPreview] = useState<{ title: string; summary: string; category: string } | null>(null)
  const [myNote, setMyNote] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const loadContents = () => {
    const supabase = createClient()
    supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setContents(data || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadContents()
  }, [])

  const filteredContents = contents.filter(c => {
    if (filter !== '全部' && c.category !== filter) return false
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase()) && !c.summary?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleUrlSubmit = async () => {
    if (!url.trim()) return
    setAiLoading(true)
    setPreview(null)
    try {
      const res = await fetch('/api/content/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.title) {
        setPreview(data)
        setSelectedCategory(data.category || '其他')
      }
    } catch {
      setPreview({ title: '', summary: '无法提取内容，请手动填写', category: '其他' })
      setSelectedCategory('其他')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preview) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      let sourceType = 'web'
      if (url.includes('weixin') || url.includes('mp.weixin') || url.includes('wechat')) sourceType = 'wechat'
      else if (url.includes('youtube') || url.includes('youtu.be')) sourceType = 'youtube'

      const { error } = await supabase.from('contents').insert({
        user_id: user.id,
        url: url.trim(),
        title: preview.title,
        summary: preview.summary,
        my_note: myNote,
        category: selectedCategory,
        source_type: sourceType,
      })

      if (error) { console.error('Save error:', error); setSaving(false); return }

      setShowModal(false)
      setUrl('')
      setPreview(null)
      setMyNote('')
      setSelectedCategory('')
      loadContents()
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif text-lg text-ink">内容收藏库</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
        >
          📎 保存内容
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['全部', ...CATEGORIES.map(c => c.value)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3.5 py-2 rounded-button border-[1.5px] border-border text-[13px] transition-all',
              filter === cat
                ? 'border-gold bg-gold/[0.08] text-ink'
                : 'bg-transparent text-ink-light hover:border-gold/50'
            )}
          >
            {cat === '全部' ? '全部' : CATEGORIES.find(c => c.value === cat)?.emoji + ' ' + cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          placeholder="搜索收藏内容..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-ink-muted text-sm">
            {contents.length === 0 ? '还没有收藏内容' : '没有找到匹配的内容'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContents.map(c => (
            <ContentCard
              key={c.id}
              title={c.title || ''}
              summary={c.summary || ''}
              category={c.category || '其他'}
              sourceType={(c.source_type as 'wechat' | 'youtube' | 'web') || 'web'}
              sourceName=""
              myNote={c.my_note || undefined}
              date={formatDate(c.created_at)}
              aiSummary={!!c.summary}
            />
          ))}
        </div>
      )}

      {/* Save Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-warm-white rounded-modal p-9 w-[560px] max-w-[90vw] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-serif text-xl text-ink">保存内容</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* URL Input */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                文章链接
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="粘贴文章URL..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                  className="flex-1 px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={aiLoading || !url.trim()}
                  className="px-4 py-3 rounded-input bg-ink text-cream text-sm font-medium hover:bg-[#2A2520] transition-all disabled:opacity-50"
                >
                  提取
                </button>
              </div>
            </div>

            {/* AI Processing */}
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-ink-muted mt-2 mb-4">
                <div className="w-3.5 h-3.5 border-2 border-border border-t-gold rounded-full animate-spin" />
                AI 正在提取内容摘要...
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="bg-cream rounded-input p-4 mb-5">
                <div className="text-sm font-medium text-ink mb-1.5">{preview.title || '（无标题）'}</div>
                <div className="text-[13px] text-ink-light leading-relaxed">{preview.summary}</div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] text-ink-muted bg-cream border border-border px-1.5 py-0.5 rounded tracking-wider">AI摘要</span>
                </div>
              </div>
            )}

            {preview && (
              <>
                {/* Category */}
                <div className="mb-5">
                  <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">分类</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-button border-[1.5px] border-border text-xs transition-all',
                          selectedCategory === cat.value
                            ? 'border-gold bg-gold/[0.08] text-ink'
                            : 'text-ink-light hover:border-gold/50'
                        )}
                      >
                        {cat.emoji} {cat.value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* My Note */}
                <div className="mb-5">
                  <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                    为什么保存这篇？（可选）
                  </label>
                  <textarea
                    placeholder="记录你的想法或为什么觉得这篇有价值..."
                    value={myNote}
                    onChange={e => setMyNote(e.target.value)}
                    className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold resize-none leading-relaxed"
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
                    disabled={saving}
                    className="px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存收藏'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
