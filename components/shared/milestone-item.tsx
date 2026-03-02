export function MilestoneItem({
  age,
  emoji,
  text,
}: {
  age: string
  emoji: string
  text: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[11px] text-rose font-sans w-10 flex-shrink-0 pt-0.5">{age}</span>
      <span className="text-sm flex-shrink-0">{emoji}</span>
      <span className="text-[12px] text-ink-light font-sans leading-relaxed">{text}</span>
    </div>
  )
}
