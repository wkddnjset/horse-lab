import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPaddleClient, getPaddleWebhookSecret } from '@/lib/paddle'
import type { EventName } from '@paddle/paddle-node-sdk'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()

    // Paddle 서명 검증
    const signature = request.headers.get('paddle-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing paddle-signature header' }, { status: 401 })
    }

    const paddle = getPaddleClient()
    const webhookSecret = getPaddleWebhookSecret()

    let eventData: any
    try {
      eventData = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
    } catch {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const eventType = eventData.eventType as EventName
    const data = eventData.data

    const supabase = await createServiceClient()

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.resumed': {
        const paddleSubId = data.id
        const customerId = data.customerId
        const status = eventType === 'subscription.resumed' ? 'active' : (data.status ?? 'active')

        const userId = data.customData?.user_id

        if (userId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            paddle_subscription_id: paddleSubId,
            paddle_customer_id: customerId,
            status,
            current_period_start: data.currentBillingPeriod?.startsAt,
            current_period_end: data.currentBillingPeriod?.endsAt,
          }, { onConflict: 'paddle_subscription_id' })

          const profileStatus = status === 'active' ? 'premium' : 'free'
          await supabase
            .from('profiles')
            .update({ subscription_status: profileStatus })
            .eq('id', userId)
        }
        break
      }

      case 'subscription.canceled':
      case 'subscription.paused': {
        const paddleSubId = data.id
        const userId = data.customData?.user_id

        await supabase
          .from('subscriptions')
          .update({
            status: eventType === 'subscription.canceled' ? 'cancelled' : 'paused',
            cancelled_at: new Date().toISOString(),
          })
          .eq('paddle_subscription_id', paddleSubId)

        if (userId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'free' })
            .eq('id', userId)
        }
        break
      }

      case 'subscription.past_due': {
        const paddleSubId = data.id
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('paddle_subscription_id', paddleSubId)
        break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Paddle webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
