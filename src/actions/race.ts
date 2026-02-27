'use server'

import { createClient } from '@/lib/supabase/server'
import { toKSTDateString } from '@/lib/utils'
import type { Race, RaceWithAccess, RaceDetail, RaceEntry, Venue } from '@/types/race'

function mapRace(row: any): Race {
  return {
    id: row.id,
    raceDate: row.race_date,
    raceNumber: row.race_number,
    venue: row.venue as Venue,
    distance: row.distance,
    trackCondition: row.track_condition,
    trackType: row.track_type,
    startTime: row.start_time,
    entriesCount: row.entries_count,
    status: row.status,
  }
}

export async function getTodayRaces(): Promise<RaceWithAccess[]> {
  const supabase = await createClient()
  const today = toKSTDateString()

  const { data: races, error } = await supabase
    .from('races')
    .select('*')
    .eq('race_date', today)
    .order('venue')
    .order('race_number')

  if (error || !races) return []

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return races.map((r) => ({ ...mapRace(r), accessStatus: 'none' as const }))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, free_race_date, free_race_id')
    .eq('id', user.id)
    .single()

  return races.map((r) => {
    const race = mapRace(r)

    if (profile?.subscription_status === 'premium') {
      return { ...race, accessStatus: 'premium' as const }
    }

    if (profile?.free_race_date === today && profile?.free_race_id) {
      if (profile.free_race_id === r.id) {
        return { ...race, accessStatus: 'free' as const }
      }
      return { ...race, accessStatus: 'locked' as const }
    }

    // 아직 무료 사용 안 함 → 첫 번째 경기를 무료로 표시
    return { ...race, accessStatus: 'free' as const }
  })
}

export async function getRaceDetail(raceId: string): Promise<RaceDetail | null> {
  const supabase = await createClient()

  const { data: race, error } = await supabase
    .from('races')
    .select('*')
    .eq('id', raceId)
    .single()

  if (error || !race) return null

  const { data: entries } = await supabase
    .from('race_entries')
    .select(`
      id,
      gate_number,
      horse_weight,
      odds,
      horses (id, name),
      jockeys (id, name)
    `)
    .eq('race_id', raceId)
    .order('gate_number')

  const mappedEntries: RaceEntry[] = (entries || []).map((e: any) => ({
    id: e.id,
    horseId: e.horses?.id ?? '',
    horseName: e.horses?.name ?? '',
    jockeyId: e.jockeys?.id ?? '',
    jockeyName: e.jockeys?.name ?? '',
    gateNumber: e.gate_number,
    horseWeight: e.horse_weight,
    odds: e.odds,
  }))

  return {
    ...mapRace(race),
    entries: mappedEntries,
  }
}

export async function claimFreeRace(raceId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const today = toKSTDateString()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, free_race_date, free_race_id')
    .eq('id', user.id)
    .single()

  if (!profile) return false
  if (profile.subscription_status === 'premium') return true

  // 이미 오늘 다른 경기 사용
  if (profile.free_race_date === today && profile.free_race_id && profile.free_race_id !== raceId) {
    return false
  }

  // 무료 경기 등록
  if (profile.free_race_date !== today) {
    await supabase
      .from('profiles')
      .update({ free_race_date: today, free_race_id: raceId })
      .eq('id', user.id)
  }

  return true
}
