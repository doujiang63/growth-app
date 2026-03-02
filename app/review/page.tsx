'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Review } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Current week form
  const [highlights, setHighlights] = useState('')
  const [biggestChallenge, setBiggestChallenge] = useState('')
  const [peakEnergyMoment, setPeakEnergyMoment] = useState('')
  const [nextPlans, setNextPlans] = useState('')
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null)

  // Detail modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const weekRange = getWeekRange()

  const loadData = async () => {
    const supabase = createClient()
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    setReviews(allReviews || [])

    // Load current week review if exists
    const currentWeek = (allReviews || []).find(
      r => r.period_start === weekRange.start && r.period_end === weekRange.end
    )
    if (currentWeek) {
      setCurrentReviewId(currentWeek.id)
      setHighlights(currentWeek.highlights || '')
      setBiggestChallenge(currentWeek.biggest_challenge || '')
      setPeakEnergyMoment(currentWeek.peak_energy_moment || '')
      setNextPlans(currentWeek.next_plans || '')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDeleteReview = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条复盘吗？')) return
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    if (id === currentReviewId) {
      setCurrentReviewId(null)
      setHighlights('')
      setBiggestChallenge('')
      setPeakEnergyMoment('')
      setNextPlans('')
    }
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const reviewData = {
        user_id: user.id,
        type: 'weekly' as const,
        period_start: weekRange.start,
        period_end: weekRange.end,
        highlights,
        biggest_challenge: biggestChallenge,
        peak_energy_moment: peakEnergyMoment,
        next_plans: nextPlans,
        improvements: '',
        stats: {},
      }

      if (currentReviewId) {
        await supabase.from('reviews').update(reviewData).eq('id', currentReviewId)
      } else {
        const { data } = await supabase.from('reviews').insert(reviewData).select('id').single()
        if (data) setCurrentReviewId(data.id)
      }

      loadData()
    } finally {
      setSaving(false)
    }
  }

  const now = new Date()
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7
  )

  // Past reviews (excluding current week)
  const pastReviews = reviews.filter(
    r => !(r.period_start === weekRange.start && r.period_end === weekRange.end)
  )

  if (loading) {
    return (
      <WithShell>
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      </WithShell>
    )
  }

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-lavender/15 via-cream to-sage/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-lavender/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-lavender/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-sage/[0.06]" />

        <div className="relative z-10">
          <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
            🔁 周复盘
          </h2>
          <p className="text-[13px] text-ink-muted mt-1">
            {now.getFullYear()}年第{weekNumber}周 · {weekRange.start} ~ {weekRange.end}
          </p>
        </div>
      </div>

      {/* Current Week Review */}
      <div className="mb-8">
        <h3 className="font-serif text-base text-ink mb-4">本周复盘</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              🌟 本周最大亮点
            </label>
            <textarea
              placeholder="这周做得最好的一件事是什么？"
              value={highlights}
              onChange={e => setHighlights(e.target.value)}
              className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              🔥 最大挑战
            </label>
            <textarea
              placeholder="这周遇到的最大挑战是什么？如何面对的？"
              value={biggestChallenge}
              onChange={e => setBiggestChallenge(e.target.value)}
              className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              ⚡ 能量最高时刻
            </label>
            <textarea
              placeholder="这周哪个时刻让你觉得充满能量？"
              value={peakEnergyMoment}
              onChange={e => setPeakEnergyMoment(e.target.value)}
              className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
          <div className="bg-warm-white rounded-card border border-border p-4">
            <label className="block text-[11px] tracking-wider uppercase text-ink-muted mb-2">
              🎯 下周最重要的事
            </label>
            <textarea
              placeholder="下周最想达成的目标是什么？"
              value={nextPlans}
              onChange={e => setNextPlans(e.target.value)}
              className="w-full min-h-[100px] bg-transparent border-none outline-none text-sm text-ink-light leading-relaxed resize-none placeholder:text-ink-muted/40"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all disabled:opacity-50"
          >
            {saving ? '保存中...' : currentReviewId ? '💾 更新复盘' : '💾 保存复盘'}
          </button>
        </div>
      </div>

      {/* Past Reviews */}
      {pastReviews.length > 0 && (
        <div>
          <h3 className="font-serif text-base text-ink mb-4">历史复盘</h3>
          <div className="space-y-3">
            {pastReviews.map(review => (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="border border-border rounded-card bg-white p-4 cursor-pointer hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-[14px] font-semibold text-ink">
                    {review.period_start} ~ {review.period_end}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteReview(e, review.id)}
                      className="text-[11px] text-ink-muted hover:text-terracotta transition-colors"
                    >
                      删除
                    </button>
                    <span className="text-[11px] text-ink-muted">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                {review.highlights && (
                  <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-2">
                    🌟 {review.highlights}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-warm-white rounded-modal p-9 w-[640px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-serif text-xl text-ink">
                {selectedReview.period_start} ~ {selectedReview.period_end}
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedReview.highlights && (
                <div className="bg-cream rounded-input p-4">
                  <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-2">🌟 最大亮点</div>
                  <p className="text-sm text-ink-light leading-relaxed">{selectedReview.highlights}</p>
                </div>
              )}
              {selectedReview.biggest_challenge && (
                <div className="bg-cream rounded-input p-4">
                  <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-2">🔥 最大挑战</div>
                  <p className="text-sm text-ink-light leading-relaxed">{selectedReview.biggest_challenge}</p>
                </div>
              )}
              {selectedReview.peak_energy_moment && (
                <div className="bg-cream rounded-input p-4">
                  <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-2">⚡ 能量最高时刻</div>
                  <p className="text-sm text-ink-light leading-relaxed">{selectedReview.peak_energy_moment}</p>
                </div>
              )}
              {selectedReview.next_plans && (
                <div className="bg-cream rounded-input p-4">
                  <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-2">🎯 下周计划</div>
                  <p className="text-sm text-ink-light leading-relaxed">{selectedReview.next_plans}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
