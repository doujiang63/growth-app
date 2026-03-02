'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { VideoCard } from '@/components/shared/video-card'
import { EmptyState } from '@/components/shared/empty-state'
import { X } from 'lucide-react'
import type { Video } from '@/lib/types'
import { WithShell } from '@/components/layout/with-shell'

const GRADIENTS = [
  'from-sage/30 to-lavender/30',
  'from-terracotta/20 to-gold/20',
  'from-rose/20 to-lavender/20',
  'from-gold/20 to-sage/20',
]

const EMOJIS = ['🎬', '🌟', '💭', '📸', '🎵', '🌈']

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDouyinDialog, setShowDouyinDialog] = useState(false)
  const [douyinUrl, setDouyinUrl] = useState('')
  const [douyinTitle, setDouyinTitle] = useState('')
  const [savingDouyin, setSavingDouyin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setVideos(data || [])
        setLoading(false)
      })
  }, [])

  const handleDeleteVideo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个视频吗？')) return
    const supabase = createClient()
    await supabase.from('videos').delete().eq('id', id)
    setVideos(prev => prev.filter(v => v.id !== id))
  }

  const handleSaveDouyin = async () => {
    if (!douyinUrl.trim()) return
    setSavingDouyin(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('videos').insert({
        user_id: user.id,
        title: douyinTitle || '抖音视频',
        douyin_url: douyinUrl.trim(),
        video_url: '',
        thumbnail_url: '',
        tags: [],
        description: '',
      })

      if (error) {
        console.error('Save video error:', error)
        return
      }

      setShowDouyinDialog(false)
      setDouyinUrl('')
      setDouyinTitle('')

      // Reload
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
      setVideos(data || [])
    } finally {
      setSavingDouyin(false)
    }
  }

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-lg text-ink">视频日记</h2>
          <p className="text-[13px] text-ink-muted mt-0.5">
            用视频记录生活中的珍贵瞬间
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDouyinDialog(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-button text-[13px] font-medium border-[1.5px] border-border text-ink-light hover:border-gold/50 transition-all"
          >
            🔗 粘贴抖音链接
          </button>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] hover:-translate-y-px transition-all"
          >
            🎬 添加视频
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-br from-ink to-[#2D2820] rounded-[16px] p-6 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-lavender/[0.08]" />
        <div className="absolute -bottom-[50px] right-24 w-[120px] h-[120px] rounded-full bg-gold/[0.06]" />
        <div className="relative z-10 flex items-center gap-8">
          <div>
            <div className="text-[11px] tracking-[0.1em] uppercase text-white/30 mb-1">
              视频总数
            </div>
            <div className="font-serif text-2xl text-cream">
              {videos.length}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-[11px] tracking-[0.1em] uppercase text-white/30 mb-1">
              本月新增
            </div>
            <div className="font-serif text-2xl text-cream">
              {videos.filter(v => {
                const d = new Date(v.created_at)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1">
            <div className="text-[11px] tracking-[0.1em] uppercase text-white/30 mb-1">
              小贴士
            </div>
            <div className="text-[13px] text-white/50 leading-relaxed">
              每天花1分钟录一段视频，记录你的心情和想法
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="text-center py-20 text-ink-muted text-sm">加载中...</div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon="🎬"
          title="还没有视频日记"
          description="点击上方按钮开始记录你的第一个视频日记"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((v, i) => (
            <div key={v.id} className="relative group">
              <VideoCard
                title={v.title || ''}
                date={formatDate(v.created_at)}
                emoji={EMOJIS[i % EMOJIS.length]}
                gradient={GRADIENTS[i % GRADIENTS.length]}
                onClick={() => {
                  if (v.douyin_url) {
                    window.open(v.douyin_url, '_blank')
                  } else if (v.video_url) {
                    window.open(v.video_url, '_blank')
                  }
                }}
              />
              <button
                onClick={(e) => handleDeleteVideo(e, v.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[11px] text-ink-muted hover:text-terracotta bg-white/80 backdrop-blur-sm px-2 py-1 rounded transition-all"
              >
                删除
              </button>
            </div>
          ))}

          {/* Add new card */}
          <div
            onClick={() => setShowUploadDialog(true)}
            className="border-2 border-dashed border-border rounded-card bg-cream/50 flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:border-gold/50 hover:bg-cream transition-all"
          >
            <span className="text-3xl mb-2 text-ink-muted">+</span>
            <span className="text-[13px] text-ink-muted">添加新视频</span>
          </div>
        </div>
      )}

      {/* Upload Dialog (Coming Soon) */}
      {showUploadDialog && (
        <div
          className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowUploadDialog(false)}
        >
          <div
            className="bg-warm-white rounded-modal p-9 w-[480px] max-w-[90vw] text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowUploadDialog(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-5xl mb-4">🎬</div>
            <h3 className="font-serif text-xl text-ink mb-2">视频上传</h3>
            <p className="text-[13px] text-ink-muted leading-relaxed mb-6">
              视频直传功能即将上线！需要配置 Cloudflare R2 存储服务后启用。
              <br />
              目前你可以通过"粘贴抖音链接"来保存视频记录。
            </p>

            <div className="bg-cream rounded-input p-4 mb-6">
              <div className="flex items-center gap-2 text-[13px] text-ink-light">
                <span>📋</span>
                <span>配置步骤：设置 R2_ACCOUNT_ID、R2_ACCESS_KEY_ID、R2_SECRET_ACCESS_KEY 环境变量</span>
              </div>
            </div>

            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => {
                  setShowUploadDialog(false)
                  setShowDouyinDialog(true)
                }}
                className="px-5 py-2.5 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all"
              >
                🔗 粘贴抖音链接
              </button>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2.5 rounded-button text-[13px] font-medium border border-border text-ink-light hover:bg-cream transition-all"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Douyin Link Dialog */}
      {showDouyinDialog && (
        <div
          className="fixed inset-0 bg-ink/60 z-[200] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowDouyinDialog(false)}
        >
          <div
            className="bg-warm-white rounded-modal p-9 w-[520px] max-w-[90vw]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-serif text-xl text-ink">粘贴抖音链接</h3>
              <button
                onClick={() => setShowDouyinDialog(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink-muted hover:bg-border hover:text-ink transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                视频标题
              </label>
              <input
                type="text"
                placeholder="给这个视频起个名字..."
                value={douyinTitle}
                onChange={e => setDouyinTitle(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs tracking-wider uppercase text-ink-muted mb-2">
                抖音链接
              </label>
              <input
                type="url"
                placeholder="粘贴抖音分享链接..."
                value={douyinUrl}
                onChange={e => setDouyinUrl(e.target.value)}
                className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-input text-sm text-ink bg-warm-white outline-none transition-colors focus:border-gold placeholder:text-ink-muted/50"
              />
            </div>

            <div className="flex gap-2.5 justify-end mt-7">
              <button
                onClick={() => setShowDouyinDialog(false)}
                className="px-4 py-2 rounded-button text-[13px] font-medium border border-border text-ink-light hover:bg-cream transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveDouyin}
                disabled={savingDouyin || !douyinUrl.trim()}
                className="px-5 py-2 rounded-button text-[13px] font-medium bg-ink text-cream hover:bg-[#2A2520] transition-all disabled:opacity-50"
              >
                {savingDouyin ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </WithShell>
  )
}
