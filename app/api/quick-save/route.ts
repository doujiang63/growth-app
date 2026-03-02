import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function detectUrlType(url: string): 'video' | 'wechat' | 'web' {
  const lower = url.toLowerCase()
  if (lower.includes('douyin') || lower.includes('tiktok')) return 'video'
  if (lower.includes('weixin') || lower.includes('mp.weixin')) return 'wechat'
  return 'web'
}

export async function POST(request: Request) {
  try {
    // API Key auth
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.QUICK_SAVE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = process.env.QUICK_SAVE_USER_ID
    if (!userId) {
      return NextResponse.json({ error: 'User ID not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { url, title, type } = body as { url?: string; title?: string; type?: string }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const urlType = type || detectUrlType(url)

    if (urlType === 'video') {
      const { data, error } = await supabase.from('videos').insert({
        user_id: userId,
        title: title || '抖音视频',
        douyin_url: url.trim(),
        video_url: '',
        thumbnail_url: '',
        tags: [],
        description: '',
      }).select('id').single()

      if (error) {
        console.error('Insert video error:', error)
        return NextResponse.json({ error: 'Failed to save video' }, { status: 500 })
      }

      return NextResponse.json({ success: true, type: 'video', id: data.id })
    }

    // Content type (wechat or web)
    const sourceType = urlType === 'wechat' ? 'wechat' : 'web'
    let contentTitle = title || ''
    let summary = ''
    let category = '其他'
    let keyPoints: string[] = []

    // Try AI summarization for web content
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Fetch page content
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GrowthApp/1.0)' },
        })
        clearTimeout(timeout)
        const html = await res.text()

        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
        if (!contentTitle) {
          contentTitle = titleMatch ? titleMatch[1].trim() : ''
        }

        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        const bodyText = bodyMatch
          ? bodyMatch[1]
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 3000)
          : ''

        if (bodyText) {
          const { summarizeContent } = await import('@/lib/claude')
          const result = await summarizeContent(contentTitle, bodyText)
          contentTitle = contentTitle || result.title
          summary = result.summary
          category = result.category
          keyPoints = result.key_points || []
        }
      } catch (e) {
        console.error('AI summarization failed, saving without summary:', e)
      }
    }

    if (!contentTitle) {
      try {
        contentTitle = new URL(url).hostname
      } catch {
        contentTitle = '未知来源'
      }
    }

    const { data, error } = await supabase.from('contents').insert({
      user_id: userId,
      url: url.trim(),
      title: contentTitle,
      summary,
      my_note: '',
      key_points: keyPoints,
      category,
      source_type: sourceType,
    }).select('id').single()

    if (error) {
      console.error('Insert content error:', error)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    return NextResponse.json({ success: true, type: 'content', id: data.id })
  } catch (error) {
    console.error('Quick save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
