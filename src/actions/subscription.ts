'use server'

import { createClient } from '@/lib/supabase/server'
import { getPaddleClient } from '@/lib/paddle'
import type { SubscriptionInfo } from '@/types/subscription'

export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultInfo: SubscriptionInfo = {
    status: 'inactive',
    isPremium: false,
    currentPeriodEnd: null,
    cancelledAt: null,
    manageUrl: null,
  }

  if (!user) return defaultInfo

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!sub) return defaultInfo

  // Paddle 구독 관리 URL 생성
  let manageUrl: string | null = null
  if (sub.paddle_subscription_id && sub.status === 'active') {
    try {
      manageUrl = await getManageUrl()
    } catch {
      // Paddle API 실패 시 무시
    }
  }

  return {
    status: sub.status,
    isPremium: sub.status === 'active',
    currentPeriodEnd: sub.current_period_end,
    cancelledAt: sub.cancelled_at,
    manageUrl,
  }
}

export async function createCheckoutSession(): Promise<{ url: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
  if (!priceId) return null

  try {
    const paddle = getPaddleClient()

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { user_id: user.id },
      checkout: {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription?checkout=success`,
      },
    })

    return { url: transaction.checkout?.url ?? '' }
  } catch (error) {
    console.error('Paddle checkout error:', error)
    return null
  }
}

export async function getManageUrl(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paddle_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!sub?.paddle_subscription_id) return null

  try {
    const paddle = getPaddleClient()
    const subscription = await paddle.subscriptions.get(sub.paddle_subscription_id)
    return subscription.managementUrls?.cancel ?? null
  } catch (error) {
    console.error('Paddle manage URL error:', error)
    return null
  }
}
