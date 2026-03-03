import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.QUICK_SAVE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = process.env.QUICK_SAVE_USER_ID
    if (!userId) {
      return NextResponse.json({ error: 'User ID not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { title, remind_at, description } = body as {
      title?: string
      remind_at?: string
      description?: string
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title,
        description: description || '',
        remind_at: remind_at || null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Insert task error:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Task API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
