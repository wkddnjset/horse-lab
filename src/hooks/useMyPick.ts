'use client'

import { useState, useCallback, useEffect } from 'react'
import { createMyPick, getPresets } from '@/actions/pick'
import { STRATEGIES, type StrategyWeights, type StrategyType, type MyPickResult } from '@/types/strategy'

const DEFAULT_WEIGHTS: StrategyWeights = {
  stats: 15, record: 15, chemistry: 15, health: 15,
  pace: 14, course: 13, weight: 13,
}

export function useMyPick(raceId: string) {
  const [weights, setWeights] = useState<StrategyWeights>(DEFAULT_WEIGHTS)
  const [result, setResult] = useState<MyPickResult | null>(null)
  const [presets, setPresets] = useState<{ id: string; name: string; weights: StrategyWeights }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getPresets().then(setPresets)
  }, [])

  const handleWeightChange = useCallback((type: StrategyType, newValue: number) => {
    setWeights((prev) => {
      const others = STRATEGIES.filter((s) => s !== type)
      const oldOtherSum = others.reduce((sum, s) => sum + prev[s], 0)
      const newOtherSum = 100 - newValue

      const updated = { ...prev, [type]: newValue }

      if (oldOtherSum === 0) {
        const each = Math.round(newOtherSum / others.length)
        others.forEach((s, i) => {
          updated[s] = i === others.length - 1 ? newOtherSum - each * (others.length - 1) : each
        })
      } else {
        let remaining = newOtherSum
        others.forEach((s, i) => {
          if (i === others.length - 1) {
            updated[s] = Math.max(0, remaining)
          } else {
            const ratio = prev[s] / oldOtherSum
            const val = Math.round(newOtherSum * ratio)
            updated[s] = Math.max(0, val)
            remaining -= updated[s]
          }
        })
      }

      return updated
    })
  }, [])

  const generate = async () => {
    setLoading(true)
    const res = await createMyPick(raceId, weights)
    setResult(res)
    setLoading(false)
  }

  return {
    weights,
    setWeights,
    result,
    presets,
    loading,
    handleWeightChange,
    generate,
  }
}
