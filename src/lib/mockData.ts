import type { RaceWithAccess, RaceDetail, RaceEntry, Venue } from '@/types/race'
import type { StrategyPrediction, StrategyType, StrategyMetric, MyPickResult } from '@/types/strategy'

// 오늘 날짜 (KST)
function getTodayKST(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().split('T')[0]
}

const today = getTodayKST()

// ══════════════════════════════════════════════════════════════
// 서울 경기 (렛츠런파크 서울 — 2026.02.15 기준 실제 경주구조 참고)
// 세계일보배(L, 1200m) 7R 포함 총 11경주
// ══════════════════════════════════════════════════════════════
const seoulRaces: RaceWithAccess[] = [
  {
    id: 'race-seoul-1',
    raceDate: today,
    raceNumber: 1,
    venue: 'seoul' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T01:35:00Z`, // KST 10:35
    entriesCount: 10,
    status: 'scheduled',
    accessStatus: 'free',
  },
  {
    id: 'race-seoul-2',
    raceDate: today,
    raceNumber: 2,
    venue: 'seoul' as Venue,
    distance: 1400,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:05:00Z`, // KST 11:05
    entriesCount: 11,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-3',
    raceDate: today,
    raceNumber: 3,
    venue: 'seoul' as Venue,
    distance: 1000,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:35:00Z`, // KST 11:35
    entriesCount: 12,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-4',
    raceDate: today,
    raceNumber: 4,
    venue: 'seoul' as Venue,
    distance: 1400,
    trackCondition: '양호',
    trackType: '잔디',
    startTime: `${today}T03:05:00Z`, // KST 12:05
    entriesCount: 9,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-5',
    raceDate: today,
    raceNumber: 5,
    venue: 'seoul' as Venue,
    distance: 1800,
    trackCondition: '양호',
    trackType: '잔디',
    startTime: `${today}T03:35:00Z`, // KST 12:35
    entriesCount: 10,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-6',
    raceDate: today,
    raceNumber: 6,
    venue: 'seoul' as Venue,
    distance: 1600,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T04:05:00Z`, // KST 13:05
    entriesCount: 11,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-7',
    raceDate: today,
    raceNumber: 7,
    venue: 'seoul' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T04:40:00Z`, // KST 13:40 — 세계일보배(L)
    entriesCount: 14,
    status: 'scheduled',
    accessStatus: 'free', // 대상경주는 무료 공개
  },
  {
    id: 'race-seoul-8',
    raceDate: today,
    raceNumber: 8,
    venue: 'seoul' as Venue,
    distance: 1600,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T05:15:00Z`, // KST 14:15
    entriesCount: 10,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-9',
    raceDate: today,
    raceNumber: 9,
    venue: 'seoul' as Venue,
    distance: 1800,
    trackCondition: '양호',
    trackType: '잔디',
    startTime: `${today}T05:50:00Z`, // KST 14:50
    entriesCount: 8,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-10',
    raceDate: today,
    raceNumber: 10,
    venue: 'seoul' as Venue,
    distance: 1400,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T06:25:00Z`, // KST 15:25
    entriesCount: 12,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-seoul-11',
    raceDate: today,
    raceNumber: 11,
    venue: 'seoul' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T07:00:00Z`, // KST 16:00
    entriesCount: 11,
    status: 'scheduled',
    accessStatus: 'locked',
  },
]

// ══════════════════════════════════════════════════════════════
// 부산경남 경기 (렛츠런파크 부산경남)
// ══════════════════════════════════════════════════════════════
const busanRaces: RaceWithAccess[] = [
  {
    id: 'race-busan-1',
    raceDate: today,
    raceNumber: 1,
    venue: 'busan' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T01:40:00Z`,
    entriesCount: 10,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-busan-2',
    raceDate: today,
    raceNumber: 2,
    venue: 'busan' as Venue,
    distance: 1400,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:10:00Z`,
    entriesCount: 11,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-busan-3',
    raceDate: today,
    raceNumber: 3,
    venue: 'busan' as Venue,
    distance: 1600,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:40:00Z`,
    entriesCount: 9,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-busan-4',
    raceDate: today,
    raceNumber: 4,
    venue: 'busan' as Venue,
    distance: 1300,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T03:10:00Z`,
    entriesCount: 10,
    status: 'scheduled',
    accessStatus: 'locked',
  },
]

// ══════════════════════════════════════════════════════════════
// 제주 경기 (렛츠런파크 제주)
// ══════════════════════════════════════════════════════════════
const jejuRaces: RaceWithAccess[] = [
  {
    id: 'race-jeju-1',
    raceDate: today,
    raceNumber: 1,
    venue: 'jeju' as Venue,
    distance: 1000,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:00:00Z`,
    entriesCount: 8,
    status: 'scheduled',
    accessStatus: 'locked',
  },
  {
    id: 'race-jeju-2',
    raceDate: today,
    raceNumber: 2,
    venue: 'jeju' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T02:30:00Z`,
    entriesCount: 9,
    status: 'scheduled',
    accessStatus: 'locked',
  },
]

export const MOCK_RACES: RaceWithAccess[] = [
  ...seoulRaces,
  ...busanRaces,
  ...jejuRaces,
]

// ══════════════════════════════════════════════════════════════
// 서울 1R 출전마 상세 (5등급 1200m 모래)
// 실제 한국경마 등록마 네이밍 패턴 참고
// ══════════════════════════════════════════════════════════════
const seoul1Entries: RaceEntry[] = [
  { id: 'e1', horseId: 'h1', horseName: '빈체로카발로', jockeyId: 'j1', jockeyName: '김영록', gateNumber: 1, horseWeight: 472, odds: 4.8 },
  { id: 'e2', horseId: 'h2', horseName: '한강클래스', jockeyId: 'j2', jockeyName: '정정희', gateNumber: 2, horseWeight: 465, odds: 3.2 },
  { id: 'e3', horseId: 'h3', horseName: '은파사랑', jockeyId: 'j3', jockeyName: '문세영', gateNumber: 3, horseWeight: 458, odds: 2.4 },
  { id: 'e4', horseId: 'h4', horseName: '보령라이트퀸', jockeyId: 'j4', jockeyName: '박태종', gateNumber: 4, horseWeight: 445, odds: 8.6 },
  { id: 'e5', horseId: 'h5', horseName: '판타스틱밸류', jockeyId: 'j5', jockeyName: '유승완', gateNumber: 5, horseWeight: 478, odds: 5.1 },
  { id: 'e6', horseId: 'h6', horseName: '이클립스베리', jockeyId: 'j6', jockeyName: '송재철', gateNumber: 6, horseWeight: 462, odds: 12.0 },
  { id: 'e7', horseId: 'h7', horseName: '석세스백파', jockeyId: 'j7', jockeyName: '김동수', gateNumber: 7, horseWeight: 490, odds: 6.3 },
  { id: 'e8', horseId: 'h8', horseName: '오아시스블루', jockeyId: 'j8', jockeyName: '곽봉석', gateNumber: 8, horseWeight: 468, odds: 15.0 },
  { id: 'e9', horseId: 'h9', horseName: '세이렌', jockeyId: 'j9', jockeyName: '김태호', gateNumber: 9, horseWeight: 475, odds: 7.7 },
  { id: 'e10', horseId: 'h10', horseName: '지모션', jockeyId: 'j10', jockeyName: '정태훈', gateNumber: 10, horseWeight: 483, odds: 22.0 },
]

// ══════════════════════════════════════════════════════════════
// 서울 7R 세계일보배(L) 출전마 상세
// 2026.02.15 실제 경주결과 기반
// 우승 스피드영(조인권, 3.7배), 2위 영광의월드, 3위 지구라트
// ══════════════════════════════════════════════════════════════
const seoul7Entries: RaceEntry[] = [
  { id: 'e7-1', horseId: 'h7-1', horseName: '크라운함성', jockeyId: 'j7-1', jockeyName: '김동수', gateNumber: 1, horseWeight: 478, odds: 6.2 },
  { id: 'e7-2', horseId: 'h7-2', horseName: '스피드영', jockeyId: 'j7-2', jockeyName: '조인권', gateNumber: 2, horseWeight: 470, odds: 3.7 },
  { id: 'e7-3', horseId: 'h7-3', horseName: '마이티네오', jockeyId: 'j7-3', jockeyName: '문세영', gateNumber: 3, horseWeight: 462, odds: 8.4 },
  { id: 'e7-4', horseId: 'h7-4', horseName: '영광의월드', jockeyId: 'j7-4', jockeyName: '유승완', gateNumber: 4, horseWeight: 475, odds: 4.1 },
  { id: 'e7-5', horseId: 'h7-5', horseName: '아이엠짱', jockeyId: 'j7-5', jockeyName: '박태종', gateNumber: 5, horseWeight: 455, odds: 15.0 },
  { id: 'e7-6', horseId: 'h7-6', horseName: '플라잉스타', jockeyId: 'j7-6', jockeyName: '정정희', gateNumber: 6, horseWeight: 448, odds: 9.8 },
  { id: 'e7-7', horseId: 'h7-7', horseName: '빅스고', jockeyId: 'j7-7', jockeyName: '김영록', gateNumber: 7, horseWeight: 492, odds: 5.5 },
  { id: 'e7-8', horseId: 'h7-8', horseName: '블랙벨트', jockeyId: 'j7-8', jockeyName: '송재철', gateNumber: 8, horseWeight: 480, odds: 7.3 },
  { id: 'e7-9', horseId: 'h7-9', horseName: '위너스맨', jockeyId: 'j7-9', jockeyName: '김태호', gateNumber: 9, horseWeight: 486, odds: 11.0 },
  { id: 'e7-10', horseId: 'h7-10', horseName: '돌콩', jockeyId: 'j7-10', jockeyName: '곽봉석', gateNumber: 10, horseWeight: 458, odds: 18.5 },
  { id: 'e7-11', horseId: 'h7-11', horseName: '트리플나인', jockeyId: 'j7-11', jockeyName: '정태훈', gateNumber: 11, horseWeight: 473, odds: 4.5 },
  { id: 'e7-12', horseId: 'h7-12', horseName: '문학치프', jockeyId: 'j7-12', jockeyName: '최범현', gateNumber: 12, horseWeight: 465, odds: 13.0 },
  { id: 'e7-13', horseId: 'h7-13', horseName: '지구라트', jockeyId: 'j7-13', jockeyName: '김준호', gateNumber: 13, horseWeight: 470, odds: 6.8 },
  { id: 'e7-14', horseId: 'h7-14', horseName: '석세스백파', jockeyId: 'j7-14', jockeyName: '도준호', gateNumber: 14, horseWeight: 482, odds: 25.0 },
]

export const MOCK_RACE_DETAIL: Record<string, RaceDetail> = {
  'race-seoul-1': {
    id: 'race-seoul-1',
    raceDate: today,
    raceNumber: 1,
    venue: 'seoul' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T01:35:00Z`,
    entriesCount: 10,
    status: 'scheduled',
    entries: seoul1Entries,
  },
  'race-seoul-7': {
    id: 'race-seoul-7',
    raceDate: today,
    raceNumber: 7,
    venue: 'seoul' as Venue,
    distance: 1200,
    trackCondition: '양호',
    trackType: '모래',
    startTime: `${today}T04:40:00Z`,
    entriesCount: 14,
    status: 'scheduled',
    entries: seoul7Entries,
  },
}

// ══════════════════════════════════════════════════════════════
// 전략별 예측 데이터
// ══════════════════════════════════════════════════════════════
function makePredictions(
  raceId: string,
  strategy: StrategyType,
  top3: { horseId: string; horseName: string; gate: number; score: number; reason: string; metrics?: StrategyMetric[] }[]
): StrategyPrediction[] {
  return top3.map((h, i) => ({
    id: `pred-${raceId}-${strategy}-${i + 1}`,
    raceId,
    strategyType: strategy,
    rank: i + 1,
    horseId: h.horseId,
    horseName: h.horseName,
    gateNumber: h.gate,
    score: h.score,
    reason: h.reason,
    metrics: h.metrics,
  }))
}

export const MOCK_PREDICTIONS: Record<string, Record<StrategyType, StrategyPrediction[]>> = {
  // ── 서울 1R (1200m 모래 5등급) ──
  'race-seoul-1': {
    stats: makePredictions('race-seoul-1', 'stats', [
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 89.2, reason: '최근 5경기 3승 1복, 1200m 모래 승률 60%. 문세영 기수 기승 시 연대율 80% 기록.',
        metrics: [{ label: '승률 60%', variant: 'default' }, { label: '연대율 80%', variant: 'secondary' }, { label: '최근 5전 3승', variant: 'outline' }] },
      { horseId: 'h2', horseName: '한강클래스', gate: 2, score: 83.7, reason: '통산 18전 6승, 복승률 67%. 서울 1200m 모래 코스 적성마. 최근 2연승 중.',
        metrics: [{ label: '복승률 67%', variant: 'default' }, { label: '2연승', variant: 'secondary' }] },
      { horseId: 'h5', horseName: '판타스틱밸류', gate: 5, score: 77.4, reason: '모래 트랙 승률 42%, 최근 3경기 연속 3착 이내. 1200m 평균주파기록 1분13초대.',
        metrics: [{ label: '모래 승률 42%', variant: 'outline' }, { label: '1:13 평균', variant: 'secondary' }] },
    ]),
    record: makePredictions('race-seoul-1', 'record', [
      { horseId: 'h2', horseName: '한강클래스', gate: 2, score: 91.5, reason: '은파사랑과 4회 대결 중 3승 1패. 판타스틱밸류 상대 전 3전 전승. 맞대결 강자.',
        metrics: [{ label: '대결 3승1패', variant: 'default' }, { label: '맞대결 강자', variant: 'secondary' }] },
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 85.1, reason: '석세스백파 상대 3전 2승. 이클립스베리와 2회 대결 전승. 상위권 마 상대 실적 우수.',
        metrics: [{ label: '상위권 전승', variant: 'default' }, { label: '3전 2승', variant: 'outline' }] },
      { horseId: 'h7', horseName: '석세스백파', gate: 7, score: 74.8, reason: '2024 연도대표마 출신. 보령라이트퀸 상대 2전 전승. 등급 하향 후 전적 유리.',
        metrics: [{ label: '전 대표마', variant: 'secondary' }, { label: '등급 하향', variant: 'outline' }] },
    ]),
    chemistry: makePredictions('race-seoul-1', 'chemistry', [
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 93.1, reason: '문세영 기수와 8회 호흡, 5승 2복. 2025 최우수기수 문세영의 주력마. 최고 궁합.',
        metrics: [{ label: '8회 5승', variant: 'default' }, { label: '최우수기수', variant: 'secondary' }] },
      { horseId: 'h1', horseName: '빈체로카발로', gate: 1, score: 84.6, reason: '김영록 기수와 5회 호흡, 3승. 김영록 기수 서울 1200m 승률 31% 상위권.',
        metrics: [{ label: '5회 3승', variant: 'default' }, { label: '승률 31%', variant: 'outline' }] },
      { horseId: 'h5', horseName: '판타스틱밸류', gate: 5, score: 79.3, reason: '유승완 기수와 4회 호흡, 2승 1복. 유승완 기수 모래트랙 연대율 45%.',
        metrics: [{ label: '4회 2승', variant: 'default' }, { label: '연대율 45%', variant: 'outline' }] },
    ]),
    health: makePredictions('race-seoul-1', 'health', [
      { horseId: 'h2', horseName: '한강클래스', gate: 2, score: 88.4, reason: '체중 465kg (적정 범위). 2주 간격 출전으로 컨디션 최상. 직전 경기 대비 +2kg 양호.',
        metrics: [{ label: '465kg 적정', variant: 'default' }, { label: '2주 간격', variant: 'secondary' }, { label: '+2kg', variant: 'outline' }] },
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 84.2, reason: '체중 458kg (적정). 3주 충분한 휴식 후 출전. 훈련기록 양호, 발목 상태 정상.',
        metrics: [{ label: '458kg 적정', variant: 'default' }, { label: '3주 휴식', variant: 'secondary' }] },
      { horseId: 'h9', horseName: '세이렌', gate: 9, score: 80.7, reason: '체중 475kg (적정). 4주 휴식 후 복귀전, 체력 회복 완료. 마방상태 좋음 보고.',
        metrics: [{ label: '475kg 적정', variant: 'default' }, { label: '복귀전', variant: 'outline' }] },
    ]),
    pace: makePredictions('race-seoul-1', 'pace', [
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 87.5, reason: '선행·선입 겸비 주행 스타일. 3번 게이트에서 빠른 초반 위치 선점 가능. 1200m 단거리 선행력 최상.',
        metrics: [{ label: '선행형', variant: 'default' }, { label: '3번 게이트', variant: 'secondary' }, { label: '초반 선점', variant: 'outline' }] },
      { horseId: 'h1', horseName: '빈체로카발로', gate: 1, score: 83.2, reason: '1번 게이트 최내곽 유리. 선행 주행 패턴으로 코너 안쪽 경제 코스 이용 가능.',
        metrics: [{ label: '선행형', variant: 'default' }, { label: '1번 최내곽', variant: 'secondary' }] },
      { horseId: 'h5', horseName: '판타스틱밸류', gate: 5, score: 78.9, reason: '중단 추입형. 중간 위치에서 직선 스퍼트 강점. 5번 게이트 무난한 위치.',
        metrics: [{ label: '추입형', variant: 'outline' }, { label: '직선 스퍼트', variant: 'secondary' }] },
    ]),
    course: makePredictions('race-seoul-1', 'course', [
      { horseId: 'h2', horseName: '한강클래스', gate: 2, score: 90.3, reason: '서울 1200m 모래 코스 6전 4승. 좌회전 적성 우수. 서울 전체 승률 44%로 홈코스 강자.',
        metrics: [{ label: '서울 모래 4승', variant: 'default' }, { label: '좌회전 적성', variant: 'secondary' }] },
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 86.1, reason: '서울 1200m 모래 5전 3승. 모래 트랙 전체 적성 우수. 단거리 집중 성적.',
        metrics: [{ label: '모래 적성 A', variant: 'default' }, { label: '단거리 집중', variant: 'outline' }] },
      { horseId: 'h7', horseName: '석세스백파', gate: 7, score: 79.4, reason: '서울 경마장 통산 25전 8승. 다양한 거리 소화 가능하나 1200m 최적. 모래 적성 양호.',
        metrics: [{ label: '서울 8승', variant: 'default' }, { label: '1200m 최적', variant: 'secondary' }] },
    ]),
    weight: makePredictions('race-seoul-1', 'weight', [
      { horseId: 'h3', horseName: '은파사랑', gate: 3, score: 85.8, reason: '부담중량 54kg, 체중 대비 비율 11.8%. 경량급으로 1200m 스프린트에 유리. 중량 감량 효과 기대.',
        metrics: [{ label: '54kg 경량', variant: 'default' }, { label: '비율 11.8%', variant: 'secondary' }] },
      { horseId: 'h4', horseName: '보령라이트퀸', gate: 4, score: 82.4, reason: '부담중량 52kg, 체중 445kg 대비 비율 11.7%. 최경량 부담으로 스피드 발휘 여지 큼.',
        metrics: [{ label: '52kg 최경량', variant: 'default' }, { label: '비율 11.7%', variant: 'outline' }] },
      { horseId: 'h2', horseName: '한강클래스', gate: 2, score: 80.1, reason: '부담중량 56kg, 체중 465kg 대비 비율 12.0%. 적정 범위이나 상위마 대비 소폭 불리.',
        metrics: [{ label: '56kg 적정', variant: 'secondary' }, { label: '비율 12.0%', variant: 'outline' }] },
    ]),
  },

  // ── 서울 7R 세계일보배(L, 1200m 모래) ──
  // 실제 결과: 스피드영 우승, 영광의월드 2위, 지구라트 3위
  'race-seoul-7': {
    stats: makePredictions('race-seoul-7', 'stats', [
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 92.4, reason: '통산 33전 12승, 1200m 승률 55%. 부산 → 서울 상경 후에도 안정적 성적. 단승 3.7배 인기 2위.',
        metrics: [{ label: '승률 55%', variant: 'default' }, { label: '12승', variant: 'secondary' }] },
      { horseId: 'h7-11', horseName: '트리플나인', gate: 11, score: 87.1, reason: '통산 G1 5승 보유. 대통령배 4연패 달성마. 1200m 평균기록 1분12초4.',
        metrics: [{ label: 'G1 5승', variant: 'default' }, { label: '1:12.4', variant: 'secondary' }] },
      { horseId: 'h7-4', horseName: '영광의월드', gate: 4, score: 83.6, reason: '최근 10경기 4승 3복, 복승률 70%. 선행력 강점으로 1200m 적성 우수.',
        metrics: [{ label: '복승률 70%', variant: 'default' }, { label: '선행력', variant: 'outline' }] },
    ]),
    record: makePredictions('race-seoul-7', 'record', [
      { horseId: 'h7-4', horseName: '영광의월드', gate: 4, score: 90.8, reason: '크라운함성과 5회 대결 중 3승 2패. 스피드영과 첫 대결이나 유사 상대 전적 우세.',
        metrics: [{ label: '대결 3승2패', variant: 'default' }, { label: '간접 전적 우세', variant: 'secondary' }] },
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 88.3, reason: '부산 대상경주 3승 보유. 지구라트 상대 2전 2승. 조인권 기수 기승 시 대상경주 승률 40%.',
        metrics: [{ label: '대상 3승', variant: 'default' }, { label: '승률 40%', variant: 'outline' }] },
      { horseId: 'h7-7', horseName: '빅스고', gate: 7, score: 79.5, reason: '통산 39전 8승, 1200m 대결 강점. 크라운함성 상대 3전 2승. 레이팅 100 최상위.',
        metrics: [{ label: '레이팅 100', variant: 'default' }, { label: '3전 2승', variant: 'outline' }] },
    ]),
    chemistry: makePredictions('race-seoul-7', 'chemistry', [
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 94.2, reason: '조인권 기수와 호흡 최상. 조교사 방동석 관리마. 조인권-방동석 조합 대상경주 승률 35%.',
        metrics: [{ label: '조인권 호흡', variant: 'default' }, { label: '대상 승률 35%', variant: 'secondary' }] },
      { horseId: 'h7-8', horseName: '블랙벨트', gate: 8, score: 85.7, reason: '정정희 기수와 4회 호흡 3승. 조교사 리카디 관리. 외국인 조교사-한국 기수 시너지.',
        metrics: [{ label: '4회 3승', variant: 'default' }, { label: '외국 조교사', variant: 'outline' }] },
      { horseId: 'h7-11', horseName: '트리플나인', gate: 11, score: 81.4, reason: '정태훈 기수와 대상경주 3회 호흡 2승. 중거리 이상 강점이나 1200m에서도 신뢰도 높음.',
        metrics: [{ label: '대상 2승', variant: 'default' }, { label: '신뢰도 높음', variant: 'secondary' }] },
    ]),
    health: makePredictions('race-seoul-7', 'health', [
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 89.6, reason: '체중 470kg (적정). 6세 전성기 컨디션. 부산에서 서울 이동 스트레스 최소화 훈련 완료.',
        metrics: [{ label: '470kg 적정', variant: 'default' }, { label: '전성기', variant: 'secondary' }] },
      { horseId: 'h7-4', horseName: '영광의월드', gate: 4, score: 86.3, reason: '체중 475kg (적정 범위). 2주 간격 출전, 직전 실전 감각 유지. 마방 컨디션 A등급.',
        metrics: [{ label: '475kg 적정', variant: 'default' }, { label: 'A등급', variant: 'secondary' }] },
      { horseId: 'h7-1', horseName: '크라운함성', gate: 1, score: 82.1, reason: '체중 478kg (소폭 증가). 전년도 세계일보배 우승마, 체력적 피크는 지났으나 경험 최상.',
        metrics: [{ label: '478kg 증가', variant: 'outline' }, { label: '전년 우승마', variant: 'secondary' }] },
    ]),
    pace: makePredictions('race-seoul-7', 'pace', [
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 91.3, reason: '선행·선입 겸비. 2번 게이트 내측 유리. 빠른 스타트로 초반 2~3번수 위치 선점 예상.',
        metrics: [{ label: '선행형', variant: 'default' }, { label: '2번 내측', variant: 'secondary' }, { label: '초반 선점', variant: 'outline' }] },
      { horseId: 'h7-4', horseName: '영광의월드', gate: 4, score: 86.7, reason: '전형적 선행마. 4번 게이트에서 무난한 선두 진입. 1200m 선행 시 3착 이내 확률 75%.',
        metrics: [{ label: '선행마', variant: 'default' }, { label: '3착내 75%', variant: 'secondary' }] },
      { horseId: 'h7-13', horseName: '지구라트', gate: 13, score: 80.4, reason: '추입형 말로 후방 대기 후 직선 스퍼트. 13번 외곽 게이트 불리하나 추입 시 영향 제한적.',
        metrics: [{ label: '추입형', variant: 'outline' }, { label: '13번 외곽', variant: 'outline' }] },
    ]),
    course: makePredictions('race-seoul-7', 'course', [
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 88.9, reason: '서울 1200m 모래 첫 출전이나 부산 1200m 모래 8전 5승. 모래 트랙 전반적 적성 최상.',
        metrics: [{ label: '모래 5승', variant: 'default' }, { label: '부산 실적', variant: 'secondary' }] },
      { horseId: 'h7-11', horseName: '트리플나인', gate: 11, score: 85.2, reason: '서울 경마장 통산 28전 9승. 서울 1200m 모래 특화 성적. 홈코스 강자.',
        metrics: [{ label: '서울 9승', variant: 'default' }, { label: '홈코스', variant: 'secondary' }] },
      { horseId: 'h7-1', horseName: '크라운함성', gate: 1, score: 81.6, reason: '서울 1200m 모래 12전 4승. 좌회전 적성 우수. 세계일보배 전년 우승 코스 경험.',
        metrics: [{ label: '모래 4승', variant: 'default' }, { label: '코스 경험', variant: 'outline' }] },
    ]),
    weight: makePredictions('race-seoul-7', 'weight', [
      { horseId: 'h7-6', horseName: '플라잉스타', gate: 6, score: 86.2, reason: '부담중량 54kg, 체중 448kg 대비 비율 12.1%. 대상경주 중 경량급으로 스피드 이점.',
        metrics: [{ label: '54kg 경량', variant: 'default' }, { label: '비율 12.1%', variant: 'secondary' }] },
      { horseId: 'h7-2', horseName: '스피드영', gate: 2, score: 83.8, reason: '부담중량 57kg, 체중 470kg 대비 비율 12.1%. 적정 범위 내. 과거 57kg 이상에서도 3승.',
        metrics: [{ label: '57kg 적정', variant: 'secondary' }, { label: '고중량 3승', variant: 'outline' }] },
      { horseId: 'h7-5', horseName: '아이엠짱', gate: 5, score: 80.5, reason: '부담중량 52kg, 체중 455kg 대비 비율 11.4%. 최경량 부담으로 상위권 진입 가능성.',
        metrics: [{ label: '52kg 최경량', variant: 'default' }, { label: '비율 11.4%', variant: 'outline' }] },
    ]),
  },
}

// ══════════════════════════════════════════════════════════════
// 나만의 픽 결과 예시 (서울 1R 기준, 7개 전략)
// ══════════════════════════════════════════════════════════════
export const MOCK_MYPICK_RESULT: MyPickResult = {
  horses: [
    {
      rank: 1,
      horseId: 'h3',
      horseName: '은파사랑',
      gateNumber: 3,
      totalScore: 87.9,
      breakdown: { stats: 89.2, record: 85.1, chemistry: 93.1, health: 84.2, pace: 87.5, course: 86.1, weight: 85.8 },
    },
    {
      rank: 2,
      horseId: 'h2',
      horseName: '한강클래스',
      gateNumber: 2,
      totalScore: 86.4,
      breakdown: { stats: 83.7, record: 91.5, chemistry: 72.3, health: 88.4, pace: 76.4, course: 90.3, weight: 80.1 },
    },
    {
      rank: 3,
      horseId: 'h5',
      horseName: '판타스틱밸류',
      gateNumber: 5,
      totalScore: 78.2,
      breakdown: { stats: 77.4, record: 68.9, chemistry: 79.3, health: 77.1, pace: 78.9, course: 72.5, weight: 76.3 },
    },
  ],
  weights: { stats: 15, record: 15, chemistry: 15, health: 15, pace: 14, course: 13, weight: 13 },
}

// ── 데모 모드 감지 ──
export const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === ''
