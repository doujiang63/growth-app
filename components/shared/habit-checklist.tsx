'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/types'

interface HabitChecklistProps {
  compact?: boolean
}

interface HabitWithLog extends Habit {
  completed: boolean
}

export function HabitChecklist({ compact = false }: HabitChecklistProps) {
  const [habits, setHabits] = useState<HabitWithLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      const res = await fetch('/api/habits')
      const { habits: habitList } = await res.json()
      if (!habitList) { setLoading(false); return }

      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed')
        .in('habit_id', habitList.map((h: Habit) => h.id))
        .eq('date', today)

      const logMap = new Map((logs || []).map(l => [l.habit_id, l.completed]))
      setHabits(habitList.map((h: Habit) => ({ ...h, completed: logMap.get(h.id) || false })))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const newCompleted = !habit.completed
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: newCompleted } : h))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('habit_logs')
      .upsert(
        { user_id: user.id, habit_id: habitId, date: today, completed: newCompleted },
        { onConflict: 'habit_id,date' }
      )
  }

  if (loading) return null

  if (compact) {
    return (
      <div className="flex gap-2">
        {habits.map(h => (
          <button
            key={h.id}
            onClick={() => toggleHabit(h.id)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-button border-[1.5px] text-[12px] transition-all',
              h.completed
                ? 'border-sage bg-sage/10 text-sage'
                : 'border-white/15 text-white/40 hover:border-white/30'
            )}
          >
            <span>{h.emoji}</span>
            {h.completed && <span>✓</span>}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {habits.map(h => (
        <button
          key={h.id}
          onClick={() => toggleHabit(h.id)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-input border-[1.5px] text-left transition-all',
            h.completed
              ? 'border-sage bg-sage/[0.06] text-ink'
              : 'border-border bg-warm-white text-ink-light hover:border-sage/50'
          )}
        >
          <span className="text-lg">{h.emoji}</span>
          <span className="text-sm flex-1">{h.name}</span>
          <div className={cn(
            'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center text-[10px] transition-all',
            h.completed
              ? 'border-sage bg-sage text-white'
              : 'border-border'
          )}>
            {h.completed && '✓'}
          </div>
        </button>
      ))}
    </div>
  )
}
