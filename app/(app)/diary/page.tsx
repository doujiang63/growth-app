'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatFullDate } from '@/lib/utils'
import { MOODS } from '@/lib/constants'
import { TagBadge } from '@/components/shared/tag-badge'
import type { Diary } from '@/lib/types'

export default function DiaryListPage() {
  const router = useRouter()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('diaries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDiaries(data || [])
        setLoading(false)
      })
  }, [])

  const getMoodEmoji = (mood: string) => MOODS.find(m => m.value === mood)?.emoji || '📝'

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif text-lg text-ink">日记列表</h2>
        <button
          onClick={() => router.push('/diary/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
        >
          ✏️ 写日记
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : diaries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-ink-muted text-sm">还没有日记，开始记录你的第一天吧</p>
          <button
            onClick={() => router.push('/diary/new')}
            className="mt-4 px-6 py-2.5 rounded-button text-sm bg-ink text-cream hover:bg-[#2A2520] transition-all"
          >
            写第一篇日记
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {diaries.map(diary => (
            <div
              key={diary.id}
              onClick={() => router.push(`/diary/${diary.id}`)}
              className="bg-warm-white rounded-card border border-border overflow-hidden transition-all cursor-pointer hover:shadow-card-lg hover:-translate-y-0.5 animate-fadeIn"
            >
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-button flex items-center justify-center text-base"
                    style={{ background: `rgba(201,168,76,0.1)` }}
                  >
                    {getMoodEmoji(diary.mood || '')}
                  </div>
                  <span className="text-[15px] font-medium text-ink">
                    {formatFullDate(diary.created_at)}
                  </span>
                </div>
                {diary.mood && <TagBadge value={diary.mood} />}
              </div>
              <div className="px-5 py-4">
                {diary.title && (
                  <h3 className="font-serif text-base text-ink mb-2">{diary.title}</h3>
                )}
                <p className="text-sm text-ink-light leading-[1.8] line-clamp-3">
                  {diary.body || '（无内容）'}
                </p>
                {(diary.important_thing || diary.gain) && (
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-muted">
                    {diary.important_thing && (
                      <span>🎯 最重要的事：{diary.important_thing}</span>
                    )}
                    {diary.gain && (
                      <span>💡 学到：{diary.gain}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
