'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { getGreeting, getDaysRemaining, formatDate } from '@/lib/utils'
import { SectionHeader } from '@/components/shared/section-header'
import { ContentCard } from '@/components/shared/content-card'
import { VideoCard } from '@/components/shared/video-card'
import { ModuleCard } from '@/components/shared/module-card'
import { MilestoneItem } from '@/components/shared/milestone-item'
import { ProgressBar } from '@/components/shared/progress-bar'
import { WithShell } from '@/components/layout/with-shell'
import { HabitChecklist } from '@/components/shared/habit-checklist'
import type { Content, Video, Parenting, Career, Finance, Inspiration } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const authReady = useAuthGuard()
  const [contents, setContents] = useState<Content[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [parentingItems, setParentingItems] = useState<Parenting[]>([])
  const [careerItems, setCareerItems] = useState<Career[]>([])
  const [financeItems, setFinanceItems] = useState<Finance[]>([])
  const [diaryCount, setDiaryCount] = useState(0)
  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [energy, setEnergy] = useState(0)
  const [peakTime, setPeakTime] = useState<string | null>(null)

  const now = new Date()
  const greeting = getGreeting()
  const daysRemaining = getDaysRemaining()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

  useEffect(() => {
    if (!authReady) return
    const supabase = createClient()
    supabase.from('contents').select('*').order('created_at', { ascending: false }).limit(3).then(({ data }) => setContents(data || []))
    supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => setVideos(data || []))
    supabase.from('parenting').select('*').order('created_at', { ascending: false }).limit(3).then(({ data }) => setParentingItems(data || []))
    supabase.from('career').select('*').order('created_at', { ascending: false }).limit(3).then(({ data }) => setCareerItems(data || []))
    supabase.from('finance').select('*').order('created_at', { ascending: false }).limit(4).then(({ data }) => setFinanceItems(data || []))
    supabase.from('diaries').select('id', { count: 'exact', head: true }).then(({ count }) => setDiaryCount(count || 0))
    supabase.from('inspirations').select('*').order('created_at', { ascending: false }).limit(3).then(({ data }) => setInspirations(data || []))
    fetch('/api/energy').then(r => r.json()).then(data => {
      if (data.level) setEnergy(data.level)
      if (data.peak_time) setPeakTime(data.peak_time)
    }).catch(() => {})
  }, [authReady])

  return (
    <WithShell>
    <div className="animate-fadeIn">
      {/* Today Strip */}
      <div className="bg-gradient-to-br from-ink to-[#2D2820] rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full bg-gold/[0.08]" />
        <div className="absolute -bottom-[60px] right-20 w-[150px] h-[150px] rounded-full bg-sage/[0.08]" />

        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 relative z-10">
          <div>
            <h2 className="font-serif text-2xl text-cream leading-snug">
              {greeting}，成长中的你 ✨
            </h2>
            <p className="text-[13px] text-white/40 font-light mt-1">
              今天是{dateStr} · 距离{now.getFullYear()}年结束还有{daysRemaining}天
            </p>
          </div>
          <div className="flex gap-2.5 mt-4 md:mt-0">
            <button
              onClick={() => router.push('/video')}
              className="bg-white/[0.08] border border-white/[0.12] text-white/80 rounded-button px-3.5 py-2 text-xs cursor-pointer transition-all hover:bg-white/[0.14] hover:text-white flex items-center gap-1.5"
            >
              🎬 录视频
            </button>
            <button
              onClick={() => router.push('/content?new=1')}
              className="bg-white/[0.08] border border-white/[0.12] text-white/80 rounded-button px-3.5 py-2 text-xs cursor-pointer transition-all hover:bg-white/[0.14] hover:text-white flex items-center gap-1.5"
            >
              📎 存内容
            </button>
          </div>
        </div>

        {/* Energy & Peak Time Display */}
        {(energy > 0 || peakTime) && (
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {energy > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/30 tracking-wider">能量</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(l => (
                    <div key={l} className={`w-2 h-2 rounded-full ${energy >= l ? 'bg-gold' : 'bg-white/15'}`} />
                  ))}
                </div>
              </div>
            )}
            {peakTime && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/30 tracking-wider">高效时段</span>
                <span className="text-[11px] text-sage px-2 py-0.5 rounded bg-sage/15">
                  {peakTime === 'morning' ? '上午' : peakTime === 'afternoon' ? '下午' : '晚上'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Habit Checklist */}
        <div className="mb-4 relative z-10">
          <HabitChecklist compact />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
          <div
            onClick={() => router.push('/diary/new')}
            className="bg-white/[0.05] border border-white/[0.08] rounded-input p-4 cursor-pointer transition-all hover:bg-white/[0.09] hover:border-white/[0.15]"
          >
            <div className="text-[11px] tracking-[0.1em] uppercase text-white/30 mb-2">今日心情</div>
            <div className="text-sm text-white/35 italic leading-relaxed">
              今天感觉怎么样？记录一下当下的状态...
            </div>
          </div>
          <div
            onClick={() => router.push('/diary/new')}
            className="bg-white/[0.05] border border-white/[0.08] rounded-input p-4 cursor-pointer transition-all hover:bg-white/[0.09] hover:border-white/[0.15]"
          >
            <div className="text-[11px] tracking-[0.1em] uppercase text-white/30 mb-2">今日复盘</div>
            <div className="text-sm text-white/35 italic leading-relaxed">
              今天最重要的一件事是什么？
            </div>
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <SectionHeader title="最新收藏" actionLabel="查看全部 →" onAction={() => router.push('/content')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {contents.length > 0 ? (
          contents.map(c => (
            <ContentCard
              key={c.id}
              title={c.title || ''}
              summary={c.summary || ''}
              category={c.category || '其他'}
              sourceType={(c.source_type as 'wechat' | 'youtube' | 'web') || 'web'}
              sourceName=""
              keyPoints={c.key_points || []}
              date={formatDate(c.created_at)}
              aiSummary={!!c.summary}
              onClick={() => {}}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-ink-muted text-sm">
            还没有收藏内容，点击右上角"保存内容"开始收藏
          </div>
        )}
      </div>

      {/* Latest Inspirations */}
      {inspirations.length > 0 && (
        <>
          <SectionHeader title="最新灵感" actionLabel="查看全部 →" onAction={() => router.push('/inspiration')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {inspirations.map(item => (
              <div
                key={item.id}
                onClick={() => router.push('/inspiration')}
                className="border border-border rounded-card bg-white p-3.5 cursor-pointer hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{{ '新词概念': '📖', '新工具': '🔧', '创意想法': '✨', '待深挖话题': '🔍', '其他': '📌' }[item.type]}</span>
                  <h4 className="text-[13px] font-medium text-ink truncate">{item.title}</h4>
                </div>
                {item.description && (
                  <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-2">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Video Timeline */}
      <SectionHeader title="视频日记" actionLabel="查看全部 →" onAction={() => router.push('/video')} />
      <div className="flex gap-3.5 overflow-x-auto pb-2 mb-8 scrollbar-none">
        {videos.map(v => (
          <VideoCard key={v.id} title={v.title || ''} date={formatDate(v.created_at)} />
        ))}
        <div
          onClick={() => router.push('/video')}
          className="flex-shrink-0 w-[160px] cursor-pointer"
        >
          <div className="w-[160px] h-[95px] rounded-input bg-cream border-2 border-dashed border-border flex items-center justify-center text-[28px] text-ink-muted mb-2">
            ＋
          </div>
          <div className="text-[11px] text-ink-muted">录制新视频</div>
          <div className="text-xs text-ink-muted mt-0.5">记录今天</div>
        </div>
      </div>

      {/* Three Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parenting */}
        <ModuleCard
          icon="👶"
          title="育儿 · 成长记录"
          iconBg="rgba(181,114,106,0.1)"
          actionLabel="更多"
          onAction={() => router.push('/parenting')}
        >
          {parentingItems.length > 0 ? (
            parentingItems.map(p => (
              <MilestoneItem
                key={p.id}
                age={p.milestone_age || ''}
                emoji="📝"
                text={p.title}
              />
            ))
          ) : (
            <p className="text-sm text-ink-muted py-4 text-center">暂无记录</p>
          )}
        </ModuleCard>

        {/* Career */}
        <ModuleCard
          icon="💼"
          title="职场 · 目标追踪"
          iconBg="rgba(196,113,74,0.1)"
          actionLabel="更多"
          onAction={() => router.push('/career')}
        >
          {careerItems.length > 0 ? (
            careerItems.map(c => (
              <div key={c.id} className="py-2.5 border-b border-border last:border-b-0">
                <div className="text-[13px] text-ink font-medium mb-1">
                  {c.type === 'goal' ? '🎯' : c.type === 'decision' ? '📌' : '💡'} {c.title}
                </div>
                {c.content && <div className="text-xs text-ink-muted leading-relaxed">{c.content}</div>}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-muted py-4 text-center">暂无记录</p>
          )}
        </ModuleCard>

        {/* Finance */}
        <ModuleCard
          icon="💰"
          title="理财 · 年度进度"
          iconBg="rgba(201,168,76,0.1)"
          actionLabel="更多"
          onAction={() => router.push('/finance')}
        >
          {financeItems.length > 0 ? (
            financeItems.map((f, i) => {
              const pct = f.target_amount ? Math.round((f.current_amount / f.target_amount) * 100) : 0
              const colors = ['sage', 'gold', 'terracotta', 'lavender']
              return (
                <ProgressBar
                  key={f.id}
                  label={f.goal_name}
                  percentage={pct}
                  color={colors[i % colors.length]}
                />
              )
            })
          ) : (
            <p className="text-sm text-ink-muted py-4 text-center">暂无记录</p>
          )}
        </ModuleCard>
      </div>
    </div>
    </WithShell>
  )
}
