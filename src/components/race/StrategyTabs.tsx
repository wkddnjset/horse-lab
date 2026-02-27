'use client'

import { useState } from 'react'
import { StrategyTop3 } from './StrategyTop3'
import { BlurOverlay } from './BlurOverlay'
import { STRATEGIES, STRATEGY_LABELS, type StrategyType, type StrategyPrediction } from '@/types/strategy'
import { cn } from '@/lib/utils'

interface StrategyTabsProps {
  predictions: Record<StrategyType, StrategyPrediction[]>
  canView: boolean
}

export function StrategyTabs({ predictions, canView }: StrategyTabsProps) {
  const [active, setActive] = useState<StrategyType>('stats')

  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-hide -mx-1">
        <div className="inline-flex gap-2 px-1 py-1">
          {STRATEGIES.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={cn(
                'rounded-full px-4 py-2 text-body font-medium transition-all whitespace-nowrap',
                'border-2 shadow-sm',
                active === s
                  ? 'border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground active:scale-95'
              )}
            >
              {STRATEGY_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {canView ? (
          <StrategyTop3
            predictions={predictions[active]}
            strategyType={active}
          />
        ) : (
          <BlurOverlay />
        )}
      </div>
    </div>
  )
}
