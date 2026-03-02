import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    let title = ''
    let content = ''

    // Try basic fetch with timeout
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GrowthApp/1.0)' },
      })
      clearTimeout(timeout)
      const html = await res.text()
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

      // Extract text content (strip HTML tags)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        content = bodyMatch[1]
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000)
      }
    } catch {
      try {
        title = new URL(url).hostname
      } catch {
        title = '未知来源'
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        title: title || '未知标题',
        summary: '请配置 ANTHROPIC_API_KEY 以启用AI摘要',
        category: '其他',
        key_points: []
      })
    }

    // Call Claude API
    const { summarizeContent } = await import('@/lib/claude')
    const result = await summarizeContent(title, content)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({
      title: '提取失败',
      summary: '无法提取内容，请手动编辑',
      category: '其他'
    })
  }
}
