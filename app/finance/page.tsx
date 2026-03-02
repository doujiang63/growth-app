'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ProgressBar } from '@/components/shared/progress-bar'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import { X } from 'lucide-react'
import type { Finance } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

const PROGRESS_COLORS = ['sage', 'gold', 'terracotta', 'lavender', 'rose']

export default function FinancePage() {
  const [goals, setGoals] = useState<Finance[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Finance | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formCurrent, setFormCurrent] = useState('')
  const [formNote, setFormNote] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    const supabase = createClient()
    supabase
      .from('finance')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setGoals(data || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const openEditModal = (goal: Finance) => {
    setEditingGoal(goal)
    setFormName(goal.goal_name)
    setFormTarget(String(goal.target_amount))
    setFormCurrent(String(goal.current_amount))
    setFormNote(goal.note || '')
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingGoal(null)
    setFormName('')
    setFormTarget('')
    setFormCurrent('')
    setFormNote('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formTarget) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        user_id: user.id,
        goal_name: formName.trim(),
        target_amount: Number(formTarget) || 0,
        current_amount: Number(formCurrent) || 0,
        note: formNote.trim(),
      }

      if (editingGoal) {
        const { error } = await supabase.from('finance').update(payload).eq('id', editingGoal.id)
        if (error) {
          console.error('Update finance error:', error)
          return
        }
      } else {
        const { error } = await supabase.from('finance').insert(payload)
        if (error) {
          console.error('Save finance error:', error)
          return
        }
      }

      setShowModal(false)
      setEditingGoal(null)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const totalTarget = goals.reduce((sum, g) => sum + (g.target_amount || 0), 0)
  const totalCurrent = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)}万`
    }
    return amount.toLocaleString()
  }

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-gold/15 via-cream to-sage/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-gold/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-gold/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-sage/[0.06]" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
                💰 理财 · 目标管理
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                设定财务目标，追踪你的储蓄和投资进度
              </p>
            </div>
            <button
              onClick={openNewModal}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
            >
              ✏️ 添加目标
            </button>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                总目标
              </div>
              <div className="font-serif text-lg text-ink">
                {totalTarget > 0 ? `${formatAmount(totalTarget)}` : '---'}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                已完成
              </div>
              <div className="font-serif text-lg text-ink">
                {totalCurrent > 0 ? `${formatAmount(totalCurrent)}` : '---'}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">
                总进度
              </div>
              <div className="font-serif text-lg text-ink">{overallProgress}%</div>
            </div>
          </div>

          {/* Overall progress bar */}
          {totalTarget > 0 && (
            <div className="mt-4">
              <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals List */}
      <SectionHeader title="财务目标" />
      <div className="mt-3 mb-8">
        {loading ? (
          <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon="💰"
            title="还没有理财目标"
            description="点击上方按钮设定你的第一个财务目标"
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal, i) => {
              const pct = goal.target_amount
                ? Math.round((goal.current_amount / goal.target_amount) * 100)
                : 0
              const color = PROGRESS_COLORS[i % PROGRESS_COLORS.length]
              const colorClasses: Record<string, string> = {
                sage: 'bg-sage',
                terracotta: 'bg-terracotta',
                gold: 'bg-gold',
                lavender: 'bg-lavender',
                rose: 'bg-rose',
              }
              const fillClass = colorClasses[color] || 'bg-sage'

              return (
                <div
                  key={goal.id}
                  onClick={() => openEditModal(goal)}
                  className="border border-border rounded-card bg-white p-5 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-serif text-[15px] font-semibold text-ink">
                      {goal.goal_name}
                    </h4>
                    <span className={cn(
                      'text-[12px] font-medium px-2 py-0.5 rounded',
                      pct >= 100
                        ? 'text-sage bg-sage/10'
                        : pct >= 50
                        ? 'text-gold bg-gold/10'
                        : 'text-ink-muted bg-cream'
                    )}>
                      {pct >= 100 ? '已达成!' : `${pct}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-cream rounded-full overflow-hidden mb-3">
                    <div
                      className={cn('h-full rounded-full transition-all', fillClass)}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-ink-muted">
                      当前：<span className="text-ink-light font-medium">{formatAmount(goal.current_amount)}</span>
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      目标：<span className="text-ink-light font-medium">{formatAmount(goal.target_amount)}</span>
                    </span>
                  </div>

                  {/* Note */}
                  {goal.note && (
                    <div className="mt-3 bg-cream/50 rounded-lg px-3 py-2">
                      <p className="text-[12px] text-ink-light leading-relaxed italic">
                        {goal.note}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex justify-end mt-2">
                    <span className="text-[11px] text-ink-muted">{formatDate(goal.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-warm-white rounded-modal p-9 w-[520px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-serif text-xl text-ink">
                {editingGoal ? '编辑目标' : '添加理财目标'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Goal Name */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                目标名称
              </label>
              <input
                type="text"
                placeholder="例如：应急基金、旅行基金"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                  目标金额
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                  className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                  当前金额
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formCurrent}
                  onChange={e => setFormCurrent(e.target.value)}
                  className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
                />
              </div>
            </div>

            {/* Preview progress */}
            {formTarget && Number(formTarget) > 0 && (
              <div className="bg-cream rounded-input p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-ink-muted">进度预览</span>
                  <span className="text-[12px] text-ink font-medium">
                    {Math.round(((Number(formCurrent) || 0) / Number(formTarget)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round(((Number(formCurrent) || 0) / Number(formTarget)) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                备注（可选）
              </label>
              <textarea
                placeholder="关于这个目标的想法..."
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold resize-none leading-relaxed placeholder:text-ink-muted/50"
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
                disabled={saving || !formName.trim() || !formTarget}
                className="px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : editingGoal ? '更新目标' : '添加目标'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
