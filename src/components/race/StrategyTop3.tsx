import { Info } from 'lucide-react'
import { HorseRankCard } from './HorseRankCard'
import { STRATEGY_LABELS, STRATEGY_DESCRIPTIONS, type StrategyType, type StrategyPrediction } from '@/types/strategy'

interface StrategyTop3Props {
  predictions: StrategyPrediction[]
  strategyType: StrategyType
}

export function StrategyTop3({ predictions, strategyType }: StrategyTop3Props) {
  if (predictions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-subtitle">아직 분석 결과가 없습니다</p>
        <p className="mt-1 text-caption">경기 데이터가 업데이트되면 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-caption leading-relaxed text-muted-foreground">
          {STRATEGY_DESCRIPTIONS[strategyType]}
        </p>
      </div>
      <h3 className="text-subtitle font-semibold">
        {STRATEGY_LABELS[strategyType]} 기반 Top3
      </h3>
      {predictions.map((p) => (
        <HorseRankCard key={p.id} prediction={p} />
      ))}
    </div>
  )
}
