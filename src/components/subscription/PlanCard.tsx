import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { SUBSCRIPTION_PRICE_LABEL } from '@/lib/constants'

const FEATURES = [
  '모든 경기 전략별 Top3 열람',
  '나만의 픽 만들기',
  '가중치 프리셋 저장 (최대 3개)',
  '매일 업데이트되는 분석 데이터',
]

interface PlanCardProps {
  onCheckout: () => void
}

export function PlanCard({ onCheckout }: PlanCardProps) {
  return (
    <Card className="mt-6 p-6">
      <div className="text-center">
        <Badge className="mb-4 bg-primary text-primary-foreground">프리미엄</Badge>
        <h2 className="text-title font-bold">{SUBSCRIPTION_PRICE_LABEL}</h2>
        <p className="mt-1 text-caption text-muted-foreground">모든 기능을 무제한으로</p>
      </div>

      <ul className="mt-6 space-y-3">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-body">
            <Check className="h-5 w-5 text-chart-3" />
            {f}
          </li>
        ))}
      </ul>

      <Button onClick={onCheckout} className="mt-6 w-full" size="lg">
        구독 시작하기
      </Button>

      <p className="mt-4 text-center text-caption text-muted-foreground">
        언제든 해지 가능 | Paddle 결제
      </p>
    </Card>
  )
}
