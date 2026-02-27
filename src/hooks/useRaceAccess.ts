'use client'

import { useState, useEffect } from 'react'
import { checkRaceAccess } from '@/actions/prediction'
import { useAuth } from '@/hooks/useAuth'

export interface RaceAccess {
  canView: boolean
  isFreeRace: boolean
  isPremium: boolean
  remainingFree: number
}

export function useRaceAccess(raceId: string) {
  const { profile } = useAuth()
  const [access, setAccess] = useState<RaceAccess>({
    canView: false,
    isFreeRace: false,
    isPremium: false,
    remainingFree: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) {
      setLoading(false)
      return
    }

    const isPremium = profile.subscriptionStatus === 'premium'

    if (isPremium) {
      setAccess({ canView: true, isFreeRace: false, isPremium: true, remainingFree: 0 })
      setLoading(false)
      return
    }

    checkRaceAccess(raceId).then((canView) => {
      const isFreeRace = canView && !isPremium
      setAccess({
        canView,
        isFreeRace,
        isPremium: false,
        remainingFree: isFreeRace ? 0 : 1,
      })
      setLoading(false)
    })
  }, [raceId, profile])

  return { access, loading }
}
