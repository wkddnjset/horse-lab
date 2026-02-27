'use client'

import { Slider } from '@/components/ui/slider'
import { STRATEGY_LABELS, type StrategyType } from '@/types/strategy'

interface WeightSliderProps {
  strategyType: StrategyType
  value: number
  onChange: (value: number) => void
}

export function WeightSlider({ strategyType, value, onChange }: WeightSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-body font-medium">{STRATEGY_LABELS[strategyType]}</span>
        <span className="text-body font-bold text-primary">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        min={0}
        step={5}
        className="w-full"
      />
    </div>
  )
}
