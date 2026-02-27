import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { STRATEGY_LABELS, type StrategyType, type MyPickResult } from '@/types/strategy'

interface PickResultProps {
  result: MyPickResult
}

export function PickResult({ result }: PickResultProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-subtitle font-semibold">나만의 픽 Top3</h3>
      {result.horses.map((h) => (
        <Card key={h.horseId} className="border-l-4 border-l-primary p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-body font-bold text-primary">
              {h.rank === 1 ? (
                <Trophy className="h-5 w-5 text-chart-3" />
              ) : (
                h.rank
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                {h.gateNumber > 0 && (
                  <span className="text-caption text-muted-foreground">{h.gateNumber}번</span>
                )}
                <span className="text-subtitle font-semibold">{h.horseName}</span>
              </div>
              <span className="text-body font-bold text-primary">
                종합 {h.totalScore.toFixed(1)}점
              </span>
              <div className="mt-1 flex flex-wrap gap-2 text-caption text-muted-foreground">
                {Object.entries(h.breakdown).map(([key, score]) => (
                  <span key={key}>
                    {STRATEGY_LABELS[key as StrategyType]}
                    {' '}{(score as number).toFixed(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
