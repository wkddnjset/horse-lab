import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StrategyPrediction } from '@/types/strategy'

interface HorseRankCardProps {
  prediction: StrategyPrediction
}

const rankStyles = {
  1: 'border-l-chart-3 bg-chart-3/10',
  2: 'border-l-secondary bg-secondary/10',
  3: 'border-l-chart-5 bg-chart-5/10',
} as Record<number, string>

export function HorseRankCard({ prediction }: HorseRankCardProps) {
  return (
    <Card
      className={`border-l-4 p-4 ${rankStyles[prediction.rank] ?? 'border-l-border'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-body font-bold shadow-sm">
          {prediction.rank === 1 ? (
            <Trophy className="h-5 w-5 text-chart-3" />
          ) : (
            prediction.rank
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-caption text-muted-foreground">
              {prediction.gateNumber > 0 ? `${prediction.gateNumber}번` : ''}
            </span>
            <span className="text-subtitle font-semibold">{prediction.horseName}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-body font-bold text-primary">
              {prediction.score.toFixed(1)}점
            </span>
          </div>
          {prediction.metrics && prediction.metrics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prediction.metrics.map((m, i) => (
                <Badge key={i} variant={m.variant} className="text-[12px]">
                  {m.label}
                </Badge>
              ))}
            </div>
          )}
          {prediction.reason && (
            <p className="mt-2 text-caption leading-relaxed text-muted-foreground">
              &quot;{prediction.reason}&quot;
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
