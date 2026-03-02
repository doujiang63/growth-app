import { NextResponse } from 'next/server'
import { summarizeContent } from '@/lib/claude'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    let title = ''
    let content = ''

    try {
      const { extract } = await import('@extractus/article-extractor')
      const article = await extract(url)
      if (article) {
        title = article.title || ''
        content = article.content || ''
      }
    } catch {
      // extraction failed, try basic fetch
      try {
        const res = await fetch(url)
        const html = await res.text()
        const titleMatch = html.match(/<title>(.*?)<\/title>/i)
        title = titleMatch ? titleMatch[1] : new URL(url).hostname
      } catch {
        title = new URL(url).hostname
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        title: title || new URL(url).hostname,
        summary: '请配置 ANTHROPIC_API_KEY 以启用AI摘要',
        category: '其他'
      })
    }

    const result = await summarizeContent(title, content)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process content' }, { status: 500 })
  }
}
