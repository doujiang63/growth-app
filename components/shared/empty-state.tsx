interface EmptyStateProps {
  icon: string
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <span className="text-3xl mb-3">{icon}</span>
      <p className="text-sm text-ink-muted font-sans font-medium mb-1">{title}</p>
      {description && (
        <p className="text-[12px] text-ink-muted/70 font-sans text-center max-w-[220px]">
          {description}
        </p>
      )}
    </div>
  )
}
