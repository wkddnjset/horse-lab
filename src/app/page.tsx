import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageContainer } from '@/components/layout/PageContainer'
import { RaceCard } from '@/components/race/RaceCard'
import { VENUE_LABELS, type Venue } from '@/types/race'
import { MapPin } from 'lucide-react'
import { IS_DEMO, MOCK_RACES } from '@/lib/mockData'

async function getPageData() {
  if (IS_DEMO) {
    return { headerUser: { nickname: '데모 사용자', avatarUrl: null }, races: MOCK_RACES }
  }

  const { getTodayRaces } = await import('@/actions/race')
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let headerUser = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', user.id)
      .single()
    if (profile) {
      headerUser = { nickname: profile.nickname, avatarUrl: profile.avatar_url }
    }
  }

  const races = await getTodayRaces()
  return { headerUser, races }
}

export default async function HomePage() {
  const { headerUser, races } = await getPageData()

  const today = new Date()
  const kst = new Date(today.getTime() + 9 * 60 * 60 * 1000)
  const dateStr = kst.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })

  // 경마장별 그룹핑
  const grouped = races.reduce((acc, race) => {
    if (!acc[race.venue]) acc[race.venue] = []
    acc[race.venue].push(race)
    return acc
  }, {} as Record<string, typeof races>)

  const venueOrder: Venue[] = ['seoul', 'busan', 'jeju']

  return (
    <>
      <Header user={headerUser} />
      <PageContainer>
        {IS_DEMO && (
          <div className="mb-4 rounded-lg bg-chart-3/10 px-4 py-2.5 text-caption text-chart-3">
            데모 모드 — 실제 데이터가 아닌 샘플 데이터입니다
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-title font-bold">오늘의 경기</h2>
          <p className="text-caption text-muted-foreground">{dateStr}</p>
        </div>

        {races.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-subtitle">오늘 예정된 경기가 없습니다</p>
            <p className="mt-1 text-caption">경기일에 다시 확인해주세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {venueOrder.map((venue) => {
              const venueRaces = grouped[venue]
              if (!venueRaces || venueRaces.length === 0) return null
              return (
                <section key={venue}>
                  <h3 className="mb-3 flex items-center gap-1.5 text-subtitle font-semibold text-foreground">
                    <MapPin className="h-4 w-4" />
                    {VENUE_LABELS[venue]}
                  </h3>
                  <div className="space-y-3">
                    {venueRaces.map((race) => (
                      <RaceCard key={race.id} race={race} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        <p className="mt-8 text-center text-caption text-muted-foreground">
          본 서비스는 참고용이며, 투자 판단의 책임은 사용자에게 있습니다.
        </p>
      </PageContainer>
      <MobileNav />
    </>
  )
}
