import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageContainer } from '@/components/layout/PageContainer'
import { RaceHeader } from '@/components/race/RaceHeader'
import { StrategyTabs } from '@/components/race/StrategyTabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { IS_DEMO, MOCK_RACE_DETAIL, MOCK_PREDICTIONS } from '@/lib/mockData'
import { STRATEGIES } from '@/types/strategy'
import type { StrategyType, StrategyPrediction } from '@/types/strategy'

interface Props {
  params: Promise<{ raceId: string }>
}

async function getPageData(raceId: string) {
  if (IS_DEMO) {
    const race = MOCK_RACE_DETAIL[raceId]
    const preds = MOCK_PREDICTIONS[raceId]
    const predictions = {} as Record<StrategyType, StrategyPrediction[]>
    for (const s of STRATEGIES) {
      predictions[s] = preds?.[s] || []
    }
    return {
      race: race || MOCK_RACE_DETAIL['race-seoul-1'],
      predictions: { ...predictions, canView: true },
      headerUser: { nickname: '데모 사용자', avatarUrl: null },
      isPremium: true,
    }
  }

  const { notFound } = await import('next/navigation')
  const { getRaceDetail, claimFreeRace } = await import('@/actions/race')
  const { getAllPredictions } = await import('@/actions/prediction')
  const { createClient } = await import('@/lib/supabase/server')

  const race = await getRaceDetail(raceId)
  if (!race) return notFound()

  await claimFreeRace(raceId)
  const predictions = await getAllPredictions(raceId)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let headerUser = null
  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_url, subscription_status')
      .eq('id', user.id)
      .single()
    if (profile) {
      headerUser = { nickname: profile.nickname, avatarUrl: profile.avatar_url }
      isPremium = profile.subscription_status === 'premium'
    }
  }

  return { race, predictions, headerUser, isPremium }
}

export default async function RaceDetailPage({ params }: Props) {
  const { raceId } = await params
  const { race, predictions, headerUser, isPremium } = await getPageData(raceId)

  return (
    <>
      <Header user={headerUser} />
      <PageContainer>
        {IS_DEMO && (
          <div className="mb-4 rounded-lg bg-chart-3/10 px-4 py-2.5 text-caption text-chart-3">
            데모 모드 — 샘플 분석 데이터입니다
          </div>
        )}

        <RaceHeader race={race} />

        <div className="mt-6">
          <StrategyTabs
            predictions={predictions}
            canView={predictions.canView}
          />
        </div>

        {predictions.canView && (
          <div className="mt-6">
            {isPremium ? (
              <Link href={`/race/${raceId}/my-pick`}>
                <Button className="w-full gap-2" size="lg">
                  <Sparkles className="h-5 w-5" />
                  나만의 픽 만들기
                </Button>
              </Link>
            ) : (
              <Link href="/subscription">
                <Button variant="outline" className="w-full gap-2" size="lg">
                  <Sparkles className="h-5 w-5" />
                  프리미엄 구독으로 나만의 픽 이용하기
                </Button>
              </Link>
            )}
          </div>
        )}
      </PageContainer>
      <MobileNav />
    </>
  )
}
