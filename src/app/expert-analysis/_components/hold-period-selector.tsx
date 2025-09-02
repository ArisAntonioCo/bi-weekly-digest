"use client"

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type HoldPeriod = 3 | 5 | 10

interface HoldPeriodSelectorProps {
  value: HoldPeriod
  onChange: (value: HoldPeriod) => void
  disabled?: boolean
}

export function HoldPeriodSelector({ value, onChange, disabled }: HoldPeriodSelectorProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={String(value)} 
      onValueChange={(v) => {
        if (!v) return
        const num = Number(v) as HoldPeriod
        if (num === 3 || num === 5 || num === 10) onChange(num)
      }}
      className="w-full max-w-xs"
      disabled={disabled}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="3" aria-label="3 years">3 Years</ToggleGroupItem>
      <ToggleGroupItem value="5" aria-label="5 years">5 Years</ToggleGroupItem>
      <ToggleGroupItem value="10" aria-label="10 years">10 Years</ToggleGroupItem>
    </ToggleGroup>
  )
}
