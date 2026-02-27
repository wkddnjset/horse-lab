'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { PlanCard } from '@/components/subscription/PlanCard'
import { PADDLE_CLIENT_TOKEN, PADDLE_PRICE_ID, PADDLE_ENV } from '@/lib/constants'

declare global {
  interface Window {
    Paddle?: any
  }
}

export default function SubscriptionPage() {
  const { profile, user } = useAuth()
  const { subInfo, isPremium } = useSubscription()

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Paddle) {
      const script = document.createElement('script')
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
      script.async = true
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Initialize({
            token: PADDLE_CLIENT_TOKEN,
            environment: PADDLE_ENV,
          })
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  const handleCheckout = () => {
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
        customData: { user_id: user?.id },
        customer: {
          email: user?.email ?? undefined,
        },
      })
    }
  }

  return (
    <>
      <Header user={profile ? { nickname: profile.nickname, avatarUrl: profile.avatarUrl } : null} />
      <PageContainer>
        <h1 className="text-title font-bold">구독 관리</h1>

        {isPremium ? (
          <Card className="mt-6 border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-subtitle font-semibold text-primary">프리미엄 구독 중</h2>
            </div>
            {subInfo?.currentPeriodEnd && (
              <p className="mt-2 text-body text-muted-foreground">
                다음 결제일: {new Date(subInfo.currentPeriodEnd).toLocaleDateString('ko-KR')}
              </p>
            )}
            {subInfo?.manageUrl && (
              <a
                href={subInfo.manageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block"
              >
                <Button variant="outline" size="sm">구독 관리</Button>
              </a>
            )}
            <p className="mt-4 text-caption text-muted-foreground">
              구독 관리는 Paddle 고객 포털에서 가능합니다.
            </p>
          </Card>
        ) : (
          <PlanCard onCheckout={handleCheckout} />
        )}
      </PageContainer>
      <MobileNav />
    </>
  )
}
