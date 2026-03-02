import { NextResponse } from 'next/server'
import { generatePresignedUrl } from '@/lib/r2'

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json()
    if (!filename) return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    const result = await generatePresignedUrl(filename, contentType || 'video/mp4')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 })
  }
}
