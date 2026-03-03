'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'
import { X, Check, Trash2, Clock } from 'lucide-react'
import type { Task } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

type TaskGroup = {
  label: string
  emoji: string
  color: string
  items: Task[]
}

function formatRemindTime(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

function groupTasks(tasks: Task[]): TaskGroup[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart.getTime() + 86400000)
  const dayAfterTomorrow = new Date(todayStart.getTime() + 86400000 * 2)

  const overdue: Task[] = []
  const today: Task[] = []
  const tomorrow: Task[] = []
  const later: Task[] = []
  const done: Task[] = []

  for (const task of tasks) {
    if (task.status === 'done') {
      done.push(task)
      continue
    }
    if (!task.remind_at) {
      later.push(task)
      continue
    }
    const remindDate = new Date(task.remind_at)
    if (remindDate < todayStart) {
      overdue.push(task)
    } else if (remindDate < tomorrowStart) {
      today.push(task)
    } else if (remindDate < dayAfterTomorrow) {
      tomorrow.push(task)
    } else {
      later.push(task)
    }
  }

  const groups: TaskGroup[] = []
  if (overdue.length > 0) groups.push({ label: '已过期', emoji: '🔴', color: 'terracotta', items: overdue })
  if (today.length > 0) groups.push({ label: '今天', emoji: '📌', color: 'gold', items: today })
  if (tomorrow.length > 0) groups.push({ label: '明天', emoji: '📅', color: 'lavender', items: tomorrow })
  if (later.length > 0) groups.push({ label: '之后', emoji: '🗓️', color: 'sage', items: later })
  if (done.length > 0) groups.push({ label: '已完成', emoji: '✅', color: 'ink-muted', items: done })

  return groups
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formRemindAt, setFormRemindAt] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    const supabase = createClient()
    supabase
      .from('tasks')
      .select('*')
      .order('remind_at', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setTasks(data || [])
        setLoading(false)
      })
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

      await supabase.from('tasks').insert({
        user_id: user.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        remind_at: formRemindAt || null,
      })

      setShowModal(false)
      setFormTitle('')
      setFormDescription('')
      setFormRemindAt('')
      loadData()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'done' : 'pending'
    const supabase = createClient()
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const doneCount = tasks.filter(t => t.status === 'done').length
  const overdueCount = tasks.filter(t => {
    if (t.status !== 'pending' || !t.remind_at) return false
    return new Date(t.remind_at) < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  }).length

  const groups = groupTasks(tasks)

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-lavender/15 via-cream to-gold/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-lavender/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-lavender/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-gold/[0.06]" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
                ⏰ 任务提醒
              </h2>
              <p className="text-[13px] text-ink-muted mt-1">
                记录待办事项，设置提醒时间，不错过每一件重要的事
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
            >
              ➕ 新建任务
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">📋 待办</div>
              <div className="font-serif text-lg text-ink">{pendingCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">🔴 已过期</div>
              <div className={cn('font-serif text-lg', overdueCount > 0 ? 'text-terracotta' : 'text-ink')}>{overdueCount}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-input p-3 border border-white/50">
              <div className="text-[11px] tracking-wider uppercase text-ink-muted mb-1">✅ 已完成</div>
              <div className="font-serif text-lg text-ink">{doneCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="⏰"
          title="还没有任务"
          description="点击上方按钮创建你的第一个任务提醒"
        />
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{group.emoji}</span>
                <h3 className="font-serif text-[15px] font-semibold text-ink">{group.label}</h3>
                <span className="text-[12px] text-ink-muted">({group.items.length})</span>
              </div>
              <div className="space-y-2">
                {group.items.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      'border rounded-card bg-white p-4 hover:shadow-card hover:-translate-y-0.5 transition-all',
                      task.status === 'done' ? 'border-border/60 opacity-60' : 'border-border',
                      group.label === '已过期' && task.status === 'pending' && 'border-terracotta/30 bg-terracotta/[0.02]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={cn(
                          'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                          task.status === 'done'
                            ? 'border-sage bg-sage text-white'
                            : 'border-border hover:border-sage'
                        )}
                      >
                        {task.status === 'done' && <Check size={12} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          'font-serif text-[14px] font-semibold leading-snug',
                          task.status === 'done' ? 'text-ink-muted line-through' : 'text-ink'
                        )}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[12px] text-ink-muted leading-relaxed mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            {task.remind_at && (
                              <span className={cn(
                                'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full',
                                group.label === '已过期' && task.status === 'pending'
                                  ? 'bg-terracotta/10 text-terracotta'
                                  : 'bg-lavender/10 text-ink-muted'
                              )}>
                                <Clock size={10} />
                                {formatRemindTime(task.remind_at)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-ink-muted hover:text-terracotta transition-colors p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              <h3 className="font-serif text-xl text-ink">新建任务</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                任务内容
              </label>
              <input
                type="text"
                placeholder="例如：张三找我开会"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            {/* Remind At */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                提醒时间（可选）
              </label>
              <input
                type="datetime-local"
                value={formRemindAt}
                onChange={e => setFormRemindAt(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                备注（可选）
              </label>
              <textarea
                placeholder="补充说明..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
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
                disabled={saving || !formTitle.trim()}
                className="px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存任务'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
