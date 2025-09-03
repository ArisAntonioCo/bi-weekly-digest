"use client"

interface ExpertSelectionFooterProps {
  count: number
  min?: number
  max?: number
}

export function ExpertSelectionFooter({ count, min = 3, max = 5 }: ExpertSelectionFooterProps) {
  const inRange = count >= min && count <= max
  return (
    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
      <p className="text-muted-foreground">
        Choose {min}–{max} experts
      </p>
      <p className={inRange ? 'text-muted-foreground' : 'text-destructive'}>
        {count} selected
      </p>
    </div>
  )
}

