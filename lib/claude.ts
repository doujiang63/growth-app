import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function summarizeContent(title: string, content: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `请分析以下文章内容，返回JSON格式：
{"title": "文章标题（如果提供的标题为空则生成一个）", "summary": "10字以内的核心摘要", "category": "分类（只能是：职场、育儿、理财、个人成长、其他之一）", "key_points": ["要点1", "要点2", "要点3"]}

key_points 提取3-5条核心要点，每条15字以内。

文章标题：${title}
文章内容：${content.slice(0, 3000)}`,
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as {
      title: string
      summary: string
      category: string
      key_points: string[]
    }
  }

  return { title: title || '未知标题', summary: '内容摘要', category: '其他', key_points: [] }
}
