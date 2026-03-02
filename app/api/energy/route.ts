import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { level, peak_time } = await request.json()
    const today = new Date().toISOString().split('T')[0]

    // Check if exists
    const { data: existing } = await supabase
      .from('energy_logs')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59')
      .single()

    const updateData: Record<string, unknown> = {}
    if (level !== undefined) updateData.level = level
    if (peak_time !== undefined) updateData.peak_time = peak_time

    if (existing) {
      await supabase.from('energy_logs').update(updateData).eq('id', existing.id)
    } else {
      await supabase.from('energy_logs').insert({ user_id: user.id, ...updateData })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('energy_logs')
      .select('level, peak_time')
      .eq('user_id', user.id)
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59')
      .single()

    return NextResponse.json({ level: data?.level || 0, peak_time: data?.peak_time || null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
