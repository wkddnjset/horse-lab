// Supabase Edge Function: paddle-webhook
// 트리거: Paddle Webhook
// 역할: 구독 상태 변경 → subscriptions, profiles 업데이트
// Note: Next.js API route(/api/webhook/paddle)도 동일 역할. 환경에 맞게 선택.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac, timingSafeEqual } from 'node:crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paddle-signature',
}

function verifyPaddleSignature(rawBody: string, signature: string, secret: string): boolean {
  const parts = signature.split(';').reduce((acc: Record<string, string>, part) => {
    const [key, val] = part.split('=')
    acc[key] = val
    return acc
  }, {})

  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false

  const payload = `${ts}:${rawBody}`
  const computed = createHmac('sha256', secret).update(payload).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(h1), Buffer.from(computed))
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text()

    // Paddle 서명 검증
    const signature = req.headers.get('paddle-signature')
    const webhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing signature or webhook secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!verifyPaddleSignature(rawBody, signature, webhookSecret)) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = JSON.parse(rawBody)
    const eventType = body.event_type
    const data = body.data

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const userId = data.custom_data?.user_id
    const paddleSubId = data.id

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id in custom_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.resumed': {
        const status = eventType === 'subscription.resumed' ? 'active' : (data.status ?? 'active')

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          paddle_subscription_id: paddleSubId,
          paddle_customer_id: data.customer_id,
          status,
          current_period_start: data.current_billing_period?.starts_at,
          current_period_end: data.current_billing_period?.ends_at,
        }, { onConflict: 'paddle_subscription_id' })

        await supabase
          .from('profiles')
          .update({ subscription_status: status === 'active' ? 'premium' : 'free' })
          .eq('id', userId)
        break
      }

      case 'subscription.cancelled':
      case 'subscription.paused': {
        await supabase.from('subscriptions').update({
          status: eventType.includes('cancelled') ? 'cancelled' : 'paused',
          cancelled_at: new Date().toISOString(),
        }).eq('paddle_subscription_id', paddleSubId)

        await supabase
          .from('profiles')
          .update({ subscription_status: 'free' })
          .eq('id', userId)
        break
      }

      case 'subscription.past_due': {
        await supabase.from('subscriptions').update({
          status: 'past_due',
        }).eq('paddle_subscription_id', paddleSubId)
        break
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
