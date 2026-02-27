import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BlurOverlay() {
  return (
    <div className="relative">
      {/* 블러 처리된 더미 콘텐츠 */}
      <div className="pointer-events-none select-none blur-[8px]">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-l-4 border-l-secondary bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-secondary/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-secondary/50" />
                  <div className="h-3 w-16 rounded bg-secondary/50" />
                  <div className="h-3 w-48 rounded bg-secondary/50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오버레이 CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-card/70 backdrop-blur-sm">
        <Lock className="mb-3 h-9 w-9 text-muted-foreground" />
        <p className="mb-4 text-center text-body font-medium text-foreground">
          프리미엄 구독으로<br />모든 경기를 확인하세요
        </p>
        <Link href="/subscription">
          <Button>구독하기</Button>
        </Link>
      </div>
    </div>
  )
}
