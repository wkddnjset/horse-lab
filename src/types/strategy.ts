export type StrategyType = 'stats' | 'record' | 'chemistry' | 'health' | 'pace' | 'course' | 'weight'

export const STRATEGIES: StrategyType[] = ['stats', 'record', 'chemistry', 'health', 'pace', 'course', 'weight']

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  stats: '통계',
  record: '전적',
  chemistry: '궁합',
  health: '건강',
  pace: '페이스',
  course: '코스적성',
  weight: '부담중량',
}

export const STRATEGY_DESCRIPTIONS: Record<StrategyType, string> = {
  stats: '최근 경기 성적, 승률, 복승률 등 통계 지표를 종합 분석합니다. 해당 거리·주로 조건에서의 성적을 중점적으로 평가합니다.',
  record: '출전마 간 직접 맞대결 전적을 분석합니다. 동일 레이스 출전 이력에서 승패 패턴과 상대 전적 우위를 평가합니다.',
  chemistry: '기수-마 조합의 호흡과 시너지를 분석합니다. 기수 기승 시 해당 마의 성적 변화와 조교사-기수 조합 실적을 평가합니다.',
  health: '출전마의 체중 변화, 휴식 간격, 최근 컨디션을 분석합니다. 적정 체중 유지 여부와 출전 간격에 따른 피로도를 평가합니다.',
  pace: '레이스 전개(선행·선입·추입)를 예측 분석합니다. 출전마별 주행 스타일과 게이트 위치에 따른 유불리를 평가합니다.',
  course: '해당 경마장·거리·주로(모래/잔디)에서의 적성을 분석합니다. 코스별 성적 데이터와 좌/우회전 선호도를 평가합니다.',
  weight: '부담중량(핸디캡)이 경기력에 미치는 영향을 분석합니다. 체중 대비 부담중량 비율과 중량 변화에 따른 성적 패턴을 평가합니다.',
}

export interface StrategyMetric {
  label: string
  variant: 'default' | 'secondary' | 'outline'
}

export type StrategyWeights = Record<StrategyType, number>

export interface StrategyPrediction {
  id: string
  raceId: string
  strategyType: StrategyType
  rank: number
  horseId: string
  horseName: string
  gateNumber: number
  score: number
  reason: string
  metrics?: StrategyMetric[]
}

export interface MyPickResult {
  horses: {
    horseId: string
    horseName: string
    gateNumber: number
    totalScore: number
    rank: number
    breakdown: Record<StrategyType, number>
  }[]
  weights: StrategyWeights
}
