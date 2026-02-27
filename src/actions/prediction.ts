'use server'

import { createClient } from '@/lib/supabase/server'
import { toKSTDateString } from '@/lib/utils'
import { STRATEGIES, type StrategyPrediction, type StrategyType } from '@/types/strategy'

export async function checkRaceAccess(raceId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, free_race_date, free_race_id')
    .eq('id', user.id)
    .single()

  if (!profile) return false
  if (profile.subscription_status === 'premium') return true

  const today = toKSTDateString()

  if (profile.free_race_date === today && profile.free_race_id === raceId) return true
  if (profile.free_race_date !== today) return true // 아직 미사용 → 열람 가능

  return false
}

export async function getStrategyPredictions(
  raceId: string,
  strategyType: StrategyType
): Promise<{ predictions: StrategyPrediction[]; canView: boolean }> {
  const canView = await checkRaceAccess(raceId)

  if (!canView) {
    return { predictions: [], canView: false }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('strategy_predictions')
    .select(`
      id,
      race_id,
      strategy_type,
      rank,
      score,
      reason,
      horses (id, name),
      race_entries!inner (gate_number)
    `)
    .eq('race_id', raceId)
    .eq('strategy_type', strategyType)
    .eq('race_entries.race_id', raceId)
    .order('rank')

  if (error || !data) {
    // 조인 실패 시 심플 쿼리 fallback
    const { data: simpleData } = await supabase
      .from('strategy_predictions')
      .select('*, horses(id, name)')
      .eq('race_id', raceId)
      .eq('strategy_type', strategyType)
      .order('rank')

    const predictions: StrategyPrediction[] = (simpleData || []).map((p: any) => ({
      id: p.id,
      raceId: p.race_id,
      strategyType: p.strategy_type,
      rank: p.rank,
      horseId: p.horses?.id ?? p.horse_id,
      horseName: p.horses?.name ?? '',
      gateNumber: 0,
      score: p.score,
      reason: p.reason,
    }))

    return { predictions, canView: true }
  }

  const predictions: StrategyPrediction[] = data.map((p: any) => ({
    id: p.id,
    raceId: p.race_id,
    strategyType: p.strategy_type,
    rank: p.rank,
    horseId: p.horses?.id ?? '',
    horseName: p.horses?.name ?? '',
    gateNumber: p.race_entries?.gate_number ?? 0,
    score: p.score,
    reason: p.reason,
  }))

  return { predictions, canView: true }
}

export async function getAllPredictions(raceId: string): Promise<
  Record<StrategyType, StrategyPrediction[]> & { canView: boolean }
> {
  const canView = await checkRaceAccess(raceId)

  if (!canView) {
    const empty = {} as Record<StrategyType, StrategyPrediction[]>
    for (const s of STRATEGIES) empty[s] = []
    return { ...empty, canView: false }
  }

  const results = await Promise.all(
    STRATEGIES.map((s) => getStrategyPredictions(raceId, s))
  )

  const predictions = {} as Record<StrategyType, StrategyPrediction[]>
  STRATEGIES.forEach((s, i) => {
    predictions[s] = results[i].predictions
  })

  return { ...predictions, canView: true }
}
