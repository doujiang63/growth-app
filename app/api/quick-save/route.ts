import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s\u4e00-\u9fff]+/i)
  return match ? match[0].replace(/[，。！？、]+$/, '') : null
}

function detectSourceType(url: string): string {
  const lower = url.toLowerCase()
  if (lower.includes('douyin') || lower.includes('tiktok')) return 'douyin'
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

    // Extract URL from share text (e.g. Douyin copies "7.87 复制打开抖音... https://v.douyin.com/xxx/")
    const cleanUrl = extractUrl(url) || url.trim()

    const supabase = createAdminClient()
    const sourceType = type || detectSourceType(cleanUrl)
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
        const res = await fetch(cleanUrl, {
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
        contentTitle = new URL(cleanUrl).hostname
      } catch {
        contentTitle = '未知来源'
      }
    }

    const { data, error } = await supabase.from('contents').insert({
      user_id: userId,
      url: cleanUrl,
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
