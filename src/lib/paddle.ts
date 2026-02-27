import { Paddle, Environment } from '@paddle/paddle-node-sdk'

let paddleInstance: Paddle | null = null

export function getPaddleClient(): Paddle {
  if (paddleInstance) return paddleInstance

  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) throw new Error('PADDLE_API_KEY is not set')

  const env = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
    ? Environment.production
    : Environment.sandbox

  paddleInstance = new Paddle(apiKey, { environment: env })
  return paddleInstance
}

export function getPaddleWebhookSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not set')
  return secret
}
