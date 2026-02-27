'use client'

import { useState, useEffect } from 'react'
import { getSubscriptionStatus } from '@/actions/subscription'
import { useAuth } from '@/hooks/useAuth'
import type { SubscriptionInfo } from '@/types/subscription'

export function useSubscription() {
  const { profile } = useAuth()
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSubscriptionStatus()
      .then(setSubInfo)
      .finally(() => setLoading(false))
  }, [])

  const isPremium = subInfo?.isPremium || profile?.subscriptionStatus === 'premium'

  return { subInfo, isPremium, loading }
}
