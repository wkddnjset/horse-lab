'use server'

import { createClient } from '@/lib/supabase/server'
import { STRATEGIES, type StrategyWeights, type StrategyType, type MyPickResult } from '@/types/strategy'
import { MAX_PRESETS } from '@/lib/constants'

export async function createMyPick(
  raceId: string,
  weights: StrategyWeights
): Promise<MyPickResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 프리미엄 체크
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_status !== 'premium') return null

  // 4개 전략의 모든 예측 결과 조회
  const { data: predictions } = await supabase
    .from('strategy_predictions')
    .select('*, horses(id, name)')
    .eq('race_id', raceId)

  if (!predictions || predictions.length === 0) return null

  // 말별 종합 점수 계산
  const horseScores: Record<string, {
    horseId: string
    horseName: string
    totalScore: number
    breakdown: Record<StrategyType, number>
  }> = {}

  for (const p of predictions) {
    const horseId = (p as any).horses?.id ?? p.horse_id
    const horseName = (p as any).horses?.name ?? ''
    const strategyType = p.strategy_type as StrategyType
    const weight = weights[strategyType] / 100
    const weightedScore = p.score * weight

    if (!horseScores[horseId]) {
      const breakdown = {} as Record<StrategyType, number>
      for (const s of STRATEGIES) breakdown[s] = 0
      horseScores[horseId] = {
        horseId,
        horseName,
        totalScore: 0,
        breakdown,
      }
    }

    horseScores[horseId].totalScore += weightedScore
    horseScores[horseId].breakdown[strategyType] = weightedScore
  }

  // Top3 선정
  const sorted = Object.values(horseScores)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3)
    .map((h, i) => ({ ...h, rank: i + 1, gateNumber: 0 }))

  // 게이트 번호 조회
  const horseIds = sorted.map((h) => h.horseId)
  const { data: entries } = await supabase
    .from('race_entries')
    .select('horse_id, gate_number')
    .eq('race_id', raceId)
    .in('horse_id', horseIds)

  if (entries) {
    for (const entry of entries) {
      const horse = sorted.find((h) => h.horseId === entry.horse_id)
      if (horse) horse.gateNumber = entry.gate_number
    }
  }

  // 결과 저장
  await supabase.from('user_picks').insert({
    user_id: user.id,
    race_id: raceId,
    strategy_weights: weights,
    result_horses: sorted,
  })

  return { horses: sorted, weights }
}

export async function getPresets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_pick_presets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at')

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    weights: p.weights as StrategyWeights,
  }))
}

export async function savePreset(name: string, weights: StrategyWeights) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 프리셋 개수 체크
  const { count } = await supabase
    .from('user_pick_presets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= MAX_PRESETS) return null

  const { data } = await supabase
    .from('user_pick_presets')
    .insert({ user_id: user.id, name, weights })
    .select()
    .single()

  return data
}

export async function deletePreset(presetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('user_pick_presets')
    .delete()
    .eq('id', presetId)
    .eq('user_id', user.id)
}
