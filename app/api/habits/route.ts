import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_HABITS = [
  { name: '运动', emoji: '🏃', sort_order: 0 },
  { name: '读书', emoji: '📖', sort_order: 1 },
  { name: '冥想', emoji: '🧘', sort_order: 2 },
  { name: '早睡', emoji: '😴', sort_order: 3 },
]

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order')

    // Auto-create default habits if none exist
    if (!habits || habits.length === 0) {
      const toInsert = DEFAULT_HABITS.map(h => ({ ...h, user_id: user.id }))
      await supabase.from('habits').insert(toInsert)
      const { data: newHabits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order')
      habits = newHabits
    }

    return NextResponse.json({ habits: habits || [] })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, emoji } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: user.id, name, emoji: emoji || '' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ habit: data })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
