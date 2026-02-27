'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { WeightSlider } from '@/components/pick/WeightSlider'
import { PickResult } from '@/components/pick/PickResult'
import { PresetSelector } from '@/components/pick/PresetSelector'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMyPick } from '@/hooks/useMyPick'
import { IS_DEMO, MOCK_MYPICK_RESULT } from '@/lib/mockData'
import { STRATEGIES, type StrategyType, type StrategyWeights } from '@/types/strategy'
import Link from 'next/link'

const DEMO_DEFAULT_WEIGHTS: StrategyWeights = {
  stats: 15, record: 15, chemistry: 15, health: 15,
  pace: 14, course: 13, weight: 13,
}

export default function MyPickPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const { profile } = useAuth()
  const pickHook = useMyPick(raceId)
  const [demoResult, setDemoResult] = useState<typeof MOCK_MYPICK_RESULT | null>(null)

  const weights = IS_DEMO ? (demoResult?.weights || DEMO_DEFAULT_WEIGHTS) : pickHook.weights
  const result = IS_DEMO ? demoResult : pickHook.result
  const loading = IS_DEMO ? false : pickHook.loading
  const presets = IS_DEMO ? [] : pickHook.presets

  const handleWeightChange = (strategy: StrategyType, value: number) => {
    if (IS_DEMO) return
    pickHook.handleWeightChange(strategy, value)
  }

  const handleGenerate = () => {
    if (IS_DEMO) {
      setDemoResult(MOCK_MYPICK_RESULT)
      return
    }
    pickHook.generate()
  }

  const headerUser = IS_DEMO
    ? { nickname: '데모 사용자', avatarUrl: null }
    : profile ? { nickname: profile.nickname, avatarUrl: profile.avatarUrl } : null

  return (
    <>
      <Header user={headerUser} />
      <PageContainer>
        <Link
          href={`/race/${raceId}`}
          className="inline-flex items-center gap-1 text-body text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          돌아가기
        </Link>

        <h1 className="mt-4 text-title font-bold">나만의 픽 만들기</h1>
        <p className="text-body text-muted-foreground">전략별 가중치를 조정하고 나만의 Top3를 만드세요</p>

        {IS_DEMO && (
          <div className="mt-4 rounded-lg bg-chart-3/10 px-4 py-2.5 text-caption text-chart-3">
            데모 모드 — 바로 Top3 생성을 눌러보세요
          </div>
        )}

        <div className="mt-6 space-y-4">
          {STRATEGIES.map((s) => (
            <WeightSlider
              key={s}
              strategyType={s}
              value={weights[s]}
              onChange={(v) => handleWeightChange(s, v)}
            />
          ))}
        </div>

        <Separator className="my-6" />

        {!IS_DEMO && (
          <PresetSelector
            presets={presets}
            currentWeights={weights}
            onSelect={pickHook.setWeights}
          />
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full gap-2"
          size="lg"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? '분석 중...' : 'Top3 생성'}
        </Button>

        {result && (
          <div className="mt-6">
            <PickResult result={result} />
          </div>
        )}
      </PageContainer>
      <MobileNav />
    </>
  )
}
