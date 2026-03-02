'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoodSelector } from '@/components/shared/mood-selector'
import { useAutoSave } from '@/hooks/use-auto-save'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react'
import type { Diary } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

interface DiaryFormData {
  title: string
  body: string
  mood: string
  important_thing: string
  gain: string
  tomorrow: string
  self_note: string
}

export default function DiaryEditorPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'
  const [diaryId, setDiaryId] = useState<string | null>(isNew ? null : params.id as string)
  const [loading, setLoading] = useState(!isNew)
  const [form, setForm] = useState<DiaryFormData>({
    title: '',
    body: '',
    mood: '',
    important_thing: '',
    gain: '',
    tomorrow: '',
    self_note: '',
  })
  const initializedRef = useRef(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (isNew || initializedRef.current) return
    initializedRef.current = true
    const supabase = createClient()
    supabase
      .from('diaries')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title || '',
            body: data.body || '',
            mood: data.mood || '',
            important_thing: data.important_thing || '',
            gain: data.gain || '',
            tomorrow: data.tomorrow || '',
            self_note: data.self_note || '',
          })
        }
        setLoading(false)
      })
  }, [isNew, params.id])

  const saveFn = useCallback(async (data: DiaryFormData) => {
    if (savingRef.current) return
    savingRef.current = true
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (!diaryId) {
        const { data: newDiary, error } = await supabase
          .from('diaries')
          .insert({
            user_id: user.id,
            ...data,
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (newDiary && !error) {
          setDiaryId(newDiary.id)
          window.history.replaceState(null, '', `/diary/${newDiary.id}`)
        }
      } else {
        await supabase
          .from('diaries')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', diaryId)
      }
    } finally {
      savingRef.current = false
    }
  }, [diaryId])

  const saveStatus = useAutoSave(form, saveFn)

  const wordCount = form.body.length

  const updateField = (field: keyof DiaryFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-ink-muted" size={24} />
      </div>
    )
  }

  return (
    <WithShell>
    <div className="animate-fadeIn max-w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/diary')}
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          返回日记列表
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>保存中...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={12} className="text-sage" />
                <span className="text-sage">已保存</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle size={12} className="text-terracotta" />
                <span className="text-terracotta">保存失败</span>
              </>
            )}
            <span className="ml-1">{wordCount} 字</span>
          </div>
          <button
            onClick={() => saveFn(form)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
          >
            💾 保存
          </button>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-6">
        <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
          今天的心情
        </label>
        <MoodSelector value={form.mood} onChange={v => updateField('mood', v)} />
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="给今天取个标题..."
        value={form.title}
        onChange={e => updateField('title', e.target.value)}
        className="w-full font-serif text-xl text-ink bg-transparent border-none outline-none placeholder:text-ink-muted/50 mb-4"
      />

      {/* Body */}
      <textarea
        placeholder="今天发生了什么？写下你的所思所想..."
        value={form.body}
        onChange={e => updateField('body', e.target.value)}
        className="w-full min-h-[300px] p-4 bg-warm-white border-[1.5px] border-border rounded-input text-sm text-ink leading-[1.8] outline-none resize-none transition-colors focus:border-gold placeholder:text-ink-muted/40"
      />

      {/* Review Four Grid */}
      <div className="mt-8">
        <h3 className="font-serif text-base text-ink mb-4">每日复盘</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              🎯 今天最重要的事
            </label>
            <textarea
              placeholder="今天最重要的一件事是什么？"
              value={form.important_thing}
              onChange={e => updateField('important_thing', e.target.value)}
              className="w-full min-h-[80px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              💡 今天的收获
            </label>
            <textarea
              placeholder="今天学到了什么？"
              value={form.gain}
              onChange={e => updateField('gain', e.target.value)}
              className="w-full min-h-[80px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              📌 明天的重点
            </label>
            <textarea
              placeholder="明天最想完成什么？"
              value={form.tomorrow}
              onChange={e => updateField('tomorrow', e.target.value)}
              className="w-full min-h-[80px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              💝 对自己说的话
            </label>
            <textarea
              placeholder="今天辛苦了，对自己说句话吧..."
              value={form.self_note}
              onChange={e => updateField('self_note', e.target.value)}
              className="w-full min-h-[80px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
        </div>
      </div>
    </div>
    </WithShell>
  )
}
