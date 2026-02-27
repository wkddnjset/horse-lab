export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'inactive'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  isPremium: boolean
  currentPeriodEnd: string | null
  cancelledAt: string | null
  manageUrl: string | null
}

export interface UserProfile {
  id: string
  kakaoId: string | null
  nickname: string
  avatarUrl: string | null
  subscriptionStatus: 'free' | 'premium'
  isAdmin: boolean
  freeRaceDate: string | null
  freeRaceId: string | null
}
