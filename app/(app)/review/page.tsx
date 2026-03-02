'use client'

export default function ReviewPage() {
  const now = new Date()
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7
  )

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-lavender/15 via-cream to-sage/10 rounded-[16px] p-6 md:p-8 mb-8 relative overflow-hidden border border-lavender/10">
        <div className="absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full bg-lavender/[0.06]" />
        <div className="absolute -bottom-[40px] right-16 w-[120px] h-[120px] rounded-full bg-sage/[0.06]" />

        <div className="relative z-10">
          <h2 className="font-serif text-xl text-ink leading-snug flex items-center gap-2">
            🔁 周 · 月复盘
          </h2>
          <p className="text-[13px] text-ink-muted mt-1">
            定期回顾，持续成长
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="text-6xl mb-6">🔮</div>
        <h3 className="font-serif text-2xl text-ink mb-3">复盘功能即将上线</h3>
        <p className="text-[14px] text-ink-muted leading-relaxed mb-8">
          我们正在为你打造智能复盘系统，帮助你进行周复盘和月复盘，
          自动汇总你的日记、收藏和各板块数据，生成有洞察力的成长报告。
        </p>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
          <div className="border border-border rounded-card bg-white p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-lavender/10 flex items-center justify-center text-base">
                📊
              </span>
              <span className="font-serif text-[14px] font-semibold text-ink">周复盘</span>
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed">
              每周日自动提醒，回顾本周心情变化、完成的目标和收藏的精华内容。
            </p>
            <div className="mt-3 bg-cream/50 rounded-lg px-3 py-2">
              <p className="text-[11px] text-ink-muted">
                当前是 {now.getFullYear()} 年第 {weekNumber} 周
              </p>
            </div>
          </div>

          <div className="border border-border rounded-card bg-white p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center text-base">
                📈
              </span>
              <span className="font-serif text-[14px] font-semibold text-ink">月复盘</span>
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed">
              每月末生成成长报告，包含能量值趋势、各模块进展和 AI 洞察建议。
            </p>
            <div className="mt-3 bg-cream/50 rounded-lg px-3 py-2">
              <p className="text-[11px] text-ink-muted">
                当前是 {now.getFullYear()} 年 {now.getMonth() + 1} 月
              </p>
            </div>
          </div>

          <div className="border border-border rounded-card bg-white p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-base">
                🤖
              </span>
              <span className="font-serif text-[14px] font-semibold text-ink">AI 洞察</span>
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed">
              Claude 分析你的数据模式，发现潜在的成长机会和需要注意的趋势。
            </p>
          </div>

          <div className="border border-border rounded-card bg-white p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center text-base">
                🎯
              </span>
              <span className="font-serif text-[14px] font-semibold text-ink">目标追踪</span>
            </div>
            <p className="text-[12px] text-ink-muted leading-relaxed">
              对比各阶段目标完成情况，可视化你的成长轨迹和里程碑。
            </p>
          </div>
        </div>

        {/* Decorative element */}
        <div className="inline-flex items-center gap-2 bg-cream rounded-button px-4 py-2.5">
          <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          <span className="text-[13px] text-ink-muted">
            开发中，敬请期待...
          </span>
        </div>
      </div>
    </div>
  )
}
