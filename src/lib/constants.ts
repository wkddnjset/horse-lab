export const SITE_NAME = '경마연구소'
export const SITE_DESCRIPTION = '전략별 근거 있는 Top3 추천 서비스'

export const SUBSCRIPTION_PRICE = 8900
export const SUBSCRIPTION_PRICE_LABEL = '8,900원/월'
export const MAX_PRESETS = 3
export const FREE_RACE_LIMIT = 1

export const VENUE_ORDER = ['seoul', 'busan', 'jeju'] as const

export const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production' ?? 'sandbox'
export const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
export const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? ''
