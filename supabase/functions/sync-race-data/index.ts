// Supabase Edge Function: sync-race-data
// 트리거: Cron (매일 07:00 KST) 또는 관리자 수동 호출
// 역할: 마사회 데이터 수집 → DB 저장

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // JWT 검증 (관리자만)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // JWT에서 사용자 확인
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 관리자 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 수집 시작 로그
    const { data: log } = await supabase
      .from('data_sync_logs')
      .insert({ sync_type: 'races', status: 'in_progress' })
      .select()
      .single()

    // TODO: 실제 마사회 API 호출 구현
    // 마사회 API 연동 시 다음 순서로 구현:
    // 1. KRA API에서 오늘 경주 목록 조회
    // 2. 각 경주의 출전마/기수 정보 조회
    // 3. horses UPSERT (name, age, sex, total_races, win_count, place_count, show_count, rating)
    // 4. jockeys UPSERT (name, win_rate, recent_form)
    // 5. races UPSERT (race_date, race_number, venue, distance, track_condition, track_type, start_time, status)
    // 6. race_entries UPSERT (race_id, horse_id, jockey_id, gate_number, horse_weight, odds)
    // 7. races.entries_count UPDATE

    let recordsCount = 0

    // Placeholder: 실제 구현 시 아래 주석을 해제하고 fetchFromKRA() 구현
    // const raceData = await fetchFromKRA()
    // recordsCount = raceData.length

    // 수집 완료 로그
    await supabase
      .from('data_sync_logs')
      .update({
        status: 'success',
        records_count: recordsCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', log?.id)

    // run-predictions 체이닝 호출
    await supabase.functions.invoke('run-predictions', {
      headers: { Authorization: authHeader },
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Sync completed', records_count: recordsCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
