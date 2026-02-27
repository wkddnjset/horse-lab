// Supabase Edge Function: run-predictions
// 트리거: sync-race-data 완료 후 호출
// 역할: 4개 전략 점수 산정 → strategy_predictions 저장

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 전략 알고리즘 인터페이스
interface ScoredHorse {
  horse_id: string
  score: number
  reason: string
}

// 전략 1: 통계 기반 점수 산정
// 과거 동일 조건(거리, 트랙, 경마장) 성적 기반
function scoreByStats(entries: any[], race: any): ScoredHorse[] {
  return entries.map((e: any) => {
    const horse = e.horses
    if (!horse) return { horse_id: e.horse_id, score: 50, reason: '데이터 부족' }

    const totalRaces = horse.total_races || 0
    const winRate = totalRaces > 0 ? (horse.win_count / totalRaces) * 100 : 0
    const placeRate = totalRaces > 0 ? ((horse.win_count + horse.place_count + horse.show_count) / totalRaces) * 100 : 0
    const rating = horse.rating || 50

    // 종합 점수: 승률(40%) + 복승률(30%) + 레이팅(30%)
    const score = Math.min(100, Math.round(winRate * 0.4 + placeRate * 0.3 + rating * 0.3))

    return {
      horse_id: e.horse_id,
      score,
      reason: `승률 ${winRate.toFixed(1)}%, 복승률 ${placeRate.toFixed(1)}%, 레이팅 ${rating}`,
    }
  })
}

// 전략 2: 맞대결 기록 기반
// 같은 경기 출전마 간 직접 대결 기록
function scoreByRecord(entries: any[], _race: any): ScoredHorse[] {
  return entries.map((e: any) => {
    const horse = e.horses
    if (!horse) return { horse_id: e.horse_id, score: 50, reason: '데이터 부족' }

    const totalRaces = horse.total_races || 0
    const winCount = horse.win_count || 0
    // TODO: race_results 테이블에서 실제 맞대결 기록 조회
    // 현재는 전체 출전 성적 기반 근사치
    const competitiveScore = totalRaces > 0
      ? Math.min(100, Math.round((winCount / totalRaces) * 100 + (horse.rating || 0) * 0.3))
      : 50

    return {
      horse_id: e.horse_id,
      score: competitiveScore,
      reason: `${totalRaces}전 ${winCount}승, 상대전적 기반 분석`,
    }
  })
}

// 전략 3: 말-기수 케미스트리
// 특정 말-기수 조합의 과거 성적
function scoreByChemistry(entries: any[], _race: any): ScoredHorse[] {
  return entries.map((e: any) => {
    const horse = e.horses
    const jockey = e.jockeys
    if (!horse || !jockey) return { horse_id: e.horse_id, score: 50, reason: '데이터 부족' }

    const jockeyWinRate = jockey.win_rate || 0
    const horseRating = horse.rating || 50
    // TODO: 실제 말-기수 조합별 성적 조회
    // 현재는 기수 승률 + 말 레이팅 가중 평균
    const chemistryScore = Math.min(100, Math.round(jockeyWinRate * 0.5 + horseRating * 0.5))

    return {
      horse_id: e.horse_id,
      score: chemistryScore,
      reason: `기수 ${jockey.name} 승률 ${jockeyWinRate.toFixed(1)}%, 말 레이팅 ${horseRating}`,
    }
  })
}

// 전략 4: 건강/컨디션 기반
// 체중 변화, 휴식 기간, 최근 폼
function scoreByHealth(entries: any[], _race: any): ScoredHorse[] {
  return entries.map((e: any) => {
    const horse = e.horses
    if (!horse) return { horse_id: e.horse_id, score: 50, reason: '데이터 부족' }

    const weight = e.horse_weight || 0
    const rating = horse.rating || 50
    // TODO: 체중 변화율, 최근 출전 간격 등 실제 건강 지표 반영
    // 적정 체중 범위(450-500kg) 기준 점수, 레이팅 반영
    let weightScore = 70
    if (weight >= 450 && weight <= 500) weightScore = 90
    else if (weight >= 430 && weight <= 520) weightScore = 75
    else if (weight > 0) weightScore = 60

    const healthScore = Math.min(100, Math.round(weightScore * 0.4 + rating * 0.6))

    return {
      horse_id: e.horse_id,
      score: healthScore,
      reason: `체중 ${weight}kg, 컨디션 지수 ${healthScore}`,
    }
  })
}

const STRATEGY_SCORERS: Record<string, (entries: any[], race: any) => ScoredHorse[]> = {
  stats: scoreByStats,
  record: scoreByRecord,
  chemistry: scoreByChemistry,
  health: scoreByHealth,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 오늘 경기 조회
    const today = new Date().toISOString().split('T')[0]
    const { data: races } = await supabase
      .from('races')
      .select('*')
      .eq('race_date', today)
      .eq('status', 'scheduled')

    if (!races || races.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No races today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const strategies = Object.keys(STRATEGY_SCORERS)
    const strategiesUsed: string[] = []

    for (const race of races) {
      // 출전마 조회
      const { data: entries } = await supabase
        .from('race_entries')
        .select('*, horses(*), jockeys(*)')
        .eq('race_id', race.id)

      if (!entries || entries.length === 0) continue

      for (const strategy of strategies) {
        const startTime = Date.now()

        try {
          const scorer = STRATEGY_SCORERS[strategy]
          const scored = scorer(entries, race)

          scored.sort((a, b) => b.score - a.score)
          const top3 = scored.slice(0, 3)

          // strategy_predictions UPSERT
          for (let i = 0; i < top3.length; i++) {
            await supabase.from('strategy_predictions').upsert({
              race_id: race.id,
              strategy_type: strategy,
              rank: i + 1,
              horse_id: top3[i].horse_id,
              score: Math.round(top3[i].score * 10) / 10,
              reason: top3[i].reason,
            }, { onConflict: 'race_id,strategy_type,rank' })
          }

          // prediction_logs
          await supabase.from('prediction_logs').insert({
            race_id: race.id,
            strategy_type: strategy,
            status: 'success',
            execution_time_ms: Date.now() - startTime,
          })

          strategiesUsed.push(strategy)
        } catch (error) {
          await supabase.from('prediction_logs').insert({
            race_id: race.id,
            strategy_type: strategy,
            status: 'failed',
            error_message: error.message,
            execution_time_ms: Date.now() - startTime,
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        races_processed: races.length,
        strategies_used: [...new Set(strategiesUsed)],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
