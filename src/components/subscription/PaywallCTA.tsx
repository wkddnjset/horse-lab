import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaywallCTAProps {
  message?: string
}

export function PaywallCTA({ message = '프리미엄 구독으로\n모든 경기를 확인하세요' }: PaywallCTAProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted py-10">
      <Lock className="mb-3 h-9 w-9 text-muted-foreground" />
      <p className="mb-4 whitespace-pre-line text-center text-body font-medium text-foreground">
        {message}
      </p>
      <Link href="/subscription">
        <Button>구독하기</Button>
      </Link>
    </div>
  )
}
