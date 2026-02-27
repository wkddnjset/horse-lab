# Design: 경마연구소 (Horse Lab)

> Plan 문서 기반 기술 설계 명세. 구현에 필요한 모든 기술적 결정과 상세 스펙을 정의한다.

**Plan 참조**: `docs/01-plan/features/horse-lab.plan.md`

---

## 1. 프로젝트 구조

```
horse-lab/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, providers)
│   ├── page.tsx                  # S-01: 홈 (오늘 경기 리스트)
│   ├── login/
│   │   └── page.tsx              # S-02: 카카오 로그인
│   ├── race/
│   │   └── [raceId]/
│   │       ├── page.tsx          # S-03: 경기 상세 (전략별 Top3)
│   │       └── my-pick/
│   │           └── page.tsx      # S-04: 나만의 픽 (프리미엄)
│   ├── subscription/
│   │   └── page.tsx              # S-05: 구독 관리
│   ├── mypage/
│   │   └── page.tsx              # S-06: 마이페이지
│   ├── admin/
│   │   ├── layout.tsx            # Admin 레이아웃 (권한 체크)
│   │   └── page.tsx              # S-07: 관리자 대시보드
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts      # 카카오 OAuth callback
│       ├── race/
│       │   └── [id]/
│       │       └── my-pick/
│       │           └── route.ts  # 나만의 픽 생성 API
│       ├── subscription/
│       │   └── checkout/
│       │       └── route.ts      # Paddle checkout 세션
│       └── webhook/
│           └── paddle/
│               └── route.ts      # Paddle webhook 수신
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx        # 공통 헤더 (로고, 로그인 버튼)
│   │   │   ├── MobileNav.tsx     # 하단 네비게이션
│   │   │   └── PageContainer.tsx # 페이지 래퍼 (max-width)
│   │   ├── race/
│   │   │   ├── RaceCard.tsx      # 경기 카드 (홈 리스트용)
│   │   │   ├── RaceHeader.tsx    # 경기 상세 헤더
│   │   │   ├── StrategyTabs.tsx  # 전략 탭 전환
│   │   │   ├── StrategyTop3.tsx  # 전략별 Top3 결과
│   │   │   ├── HorseRankCard.tsx # 개별 말 순위 카드
│   │   │   └── BlurOverlay.tsx   # 유료 블러 + CTA
│   │   ├── pick/
│   │   │   ├── WeightSlider.tsx  # 전략 가중치 슬라이더
│   │   │   ├── PickResult.tsx    # 나만의 픽 결과
│   │   │   └── PresetSelector.tsx# 프리셋 선택/저장
│   │   ├── auth/
│   │   │   └── KakaoLoginButton.tsx # 카카오 로그인 버튼
│   │   └── subscription/
│   │       ├── PlanCard.tsx      # 구독 플랜 카드
│   │       └── PaywallCTA.tsx    # 결제 유도 CTA
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # 브라우저 Supabase 클라이언트
│   │   │   ├── server.ts         # 서버 Supabase 클라이언트
│   │   │   ├── middleware.ts     # Auth 미들웨어 헬퍼
│   │   │   └── types.ts          # DB 타입 (generated)
│   │   ├── paddle.ts             # Paddle 클라이언트 초기화
│   │   ├── constants.ts          # 상수 정의
│   │   └── utils.ts              # 유틸리티 함수
│   ├── hooks/
│   │   ├── useAuth.ts            # 인증 상태 훅
│   │   ├── useSubscription.ts    # 구독 상태 훅
│   │   ├── useRaceAccess.ts      # 무료/유료 접근 제어 훅
│   │   └── useMyPick.ts          # 나만의 픽 로직 훅
│   ├── actions/
│   │   ├── race.ts               # 경기 데이터 Server Actions
│   │   ├── prediction.ts         # 전략 예측 Server Actions
│   │   ├── pick.ts               # 나만의 픽 Server Actions
│   │   └── subscription.ts       # 구독 Server Actions
│   └── types/
│       ├── database.ts           # Supabase DB 타입
│       ├── race.ts               # 경기 관련 타입
│       ├── strategy.ts           # 전략 관련 타입
│       └── subscription.ts       # 구독 관련 타입
├── supabase/
│   ├── migrations/
│   │   └── 00001_initial_schema.sql
│   └── functions/
│       ├── sync-race-data/
│       │   └── index.ts
│       ├── run-predictions/
│       │   └── index.ts
│       └── paddle-webhook/
│           └── index.ts
├── middleware.ts                  # Next.js middleware (auth redirect)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 2. 데이터베이스 스키마 (SQL)

### 2.1 Core Tables

```sql
-- ============================================
-- profiles: 사용자 프로필 (auth.users 확장)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_id TEXT UNIQUE,
  nickname TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  free_race_date DATE,
  free_race_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, avatar_url, kakao_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'preferred_username', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- races: 경주 정보
-- ============================================
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_date DATE NOT NULL,
  race_number INT NOT NULL,
  venue TEXT NOT NULL CHECK (venue IN ('seoul', 'busan', 'jeju')),
  distance INT NOT NULL,
  track_condition TEXT DEFAULT 'good',
  track_type TEXT DEFAULT 'dirt' CHECK (track_type IN ('dirt', 'turf')),
  start_time TIMESTAMPTZ,
  entries_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(race_date, race_number, venue)
);

CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_races_date_venue ON races(race_date, venue);
CREATE INDEX idx_races_status ON races(status);

-- ============================================
-- horses: 말 정보
-- ============================================
CREATE TABLE horses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT,
  sex TEXT CHECK (sex IN ('male', 'female', 'gelding')),
  weight NUMERIC,
  trainer TEXT,
  owner TEXT,
  total_races INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_places INT DEFAULT 0,       -- 2위
  total_shows INT DEFAULT 0,        -- 3위
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_horses_name ON horses(name);

-- ============================================
-- jockeys: 기수 정보
-- ============================================
CREATE TABLE jockeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  win_rate NUMERIC DEFAULT 0,
  total_races INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- race_entries: 출전마 정보 (경기 ↔ 말 ↔ 기수)
-- ============================================
CREATE TABLE race_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  jockey_id UUID REFERENCES jockeys(id) ON DELETE SET NULL,
  gate_number INT NOT NULL,
  horse_weight NUMERIC,
  odds NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(race_id, horse_id),
  UNIQUE(race_id, gate_number)
);

CREATE INDEX idx_race_entries_race ON race_entries(race_id);
CREATE INDEX idx_race_entries_horse ON race_entries(horse_id);

-- ============================================
-- race_results: 경주 결과
-- ============================================
CREATE TABLE race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  finish_position INT NOT NULL,
  finish_time TEXT,
  prize_money NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(race_id, horse_id)
);

CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_horse ON race_results(horse_id);
CREATE INDEX idx_race_results_position ON race_results(finish_position);

-- ============================================
-- strategy_predictions: 전략별 Top3 예측 결과
-- ============================================
CREATE TABLE strategy_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('stats', 'record', 'chemistry', 'health')),
  rank INT NOT NULL CHECK (rank BETWEEN 1 AND 3),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  factors JSONB DEFAULT '{}',      -- 점수 산정에 사용된 세부 요인
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(race_id, strategy_type, rank)
);

CREATE INDEX idx_predictions_race ON strategy_predictions(race_id);
CREATE INDEX idx_predictions_race_strategy ON strategy_predictions(race_id, strategy_type);

-- ============================================
-- user_picks: 나만의 픽 결과
-- ============================================
CREATE TABLE user_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  strategy_weights JSONB NOT NULL DEFAULT '{"stats":25,"record":25,"chemistry":25,"health":25}',
  result_horses JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_picks_user ON user_picks(user_id);
CREATE INDEX idx_user_picks_race ON user_picks(race_id);

-- ============================================
-- user_pick_presets: 가중치 프리셋
-- ============================================
CREATE TABLE user_pick_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weights JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_presets_user ON user_pick_presets(user_id);

-- ============================================
-- subscriptions: Paddle 구독 정보
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'cancelled', 'paused', 'inactive')),
  plan_name TEXT DEFAULT 'premium',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle ON subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 2.2 Admin / Logging Tables

```sql
-- ============================================
-- data_sync_logs: 데이터 수집 로그
-- ============================================
CREATE TABLE data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('races', 'results', 'horses', 'jockeys')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  records_count INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_type ON data_sync_logs(sync_type);
CREATE INDEX idx_sync_logs_created ON data_sync_logs(created_at DESC);

-- ============================================
-- prediction_logs: 전략 생성 로그
-- ============================================
CREATE TABLE prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  execution_time_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prediction_logs_race ON prediction_logs(race_id);
```

### 2.3 RLS 정책

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jockeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pick_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_logs ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 읽기/수정, 관리자 전체 접근
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
    AND subscription_status = (SELECT subscription_status FROM profiles WHERE id = auth.uid())
  );
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- races, horses, jockeys, race_entries, race_results: 인증 사용자 읽기
CREATE POLICY "public_read" ON races FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON horses FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON jockeys FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON race_entries FOR SELECT USING (TRUE);
CREATE POLICY "public_read" ON race_results FOR SELECT USING (TRUE);

-- strategy_predictions: 인증 사용자 읽기 (블러 처리는 프론트에서)
CREATE POLICY "authenticated_read" ON strategy_predictions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_picks, user_pick_presets: 본인만
CREATE POLICY "own_picks" ON user_picks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_presets" ON user_pick_presets
  FOR ALL USING (auth.uid() = user_id);

-- presets 개수 제한 (최대 3개) - Application level에서 체크
-- subscriptions: 본인 읽기
CREATE POLICY "own_subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- admin tables: 관리자만
CREATE POLICY "admin_only" ON data_sync_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
CREATE POLICY "admin_only" ON prediction_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- service_role은 모든 테이블에 RLS bypass (Edge Functions, webhooks용)
```

## 3. 인증 설계

### 3.1 카카오 OAuth 플로우

```
사용자 → [카카오 로그인 버튼] → Supabase Auth signInWithOAuth('kakao')
→ 카카오 인증 페이지 → 동의 → callback URL로 리다이렉트
→ /api/auth/callback → Supabase 세션 생성
→ profiles 트리거 → 자동 프로필 생성
→ 홈으로 리다이렉트
```

### 3.2 Supabase Auth 설정

```
Provider: Kakao
Redirect URL: {SITE_URL}/api/auth/callback
Scopes: profile_nickname, profile_image
```

### 3.3 미들웨어 (middleware.ts)

```typescript
// 보호 경로 정의
const protectedRoutes = ['/race', '/mypage', '/subscription']
const premiumRoutes = ['/race/*/my-pick']
const adminRoutes = ['/admin']

// 로직:
// 1. 세션 없음 + 보호 경로 → /login 리다이렉트
// 2. 세션 있음 + /login → / 리다이렉트
// 3. 관리자 아님 + /admin → / 리다이렉트
```

## 4. 구독/결제 설계 (Paddle)

### 4.1 Paddle 연동 구조

```
[프론트] Paddle.js overlay checkout
  → 결제 완료
  → Paddle 서버 → Webhook → /api/webhook/paddle
  → subscriptions 테이블 업데이트
  → profiles.subscription_status = 'premium'
```

### 4.2 Paddle Webhook 이벤트 처리

| 이벤트 | 처리 |
|--------|------|
| `subscription.created` | subscriptions INSERT, profiles.subscription_status = 'premium' |
| `subscription.updated` | subscriptions UPDATE (기간, 상태) |
| `subscription.cancelled` | subscriptions.status = 'cancelled', profiles = 'free' |
| `subscription.paused` | subscriptions.status = 'paused', profiles = 'free' |
| `subscription.resumed` | subscriptions.status = 'active', profiles = 'premium' |
| `subscription.past_due` | subscriptions.status = 'past_due' (유예기간 유지) |

### 4.3 Webhook 보안

```typescript
// Paddle 웹훅 서명 검증 (paddle-node-sdk)
import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk'

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.sandbox, // production으로 변경
})

// 요청 본문 + 서명 헤더로 검증
paddle.webhooks.unmarshal(requestBody, secretKey, signature)
```

### 4.4 Paddle 환경변수

```env
# Client-side (NEXT_PUBLIC_)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_PADDLE_PRICE_ID=pri_xxx     # 월 8,900원 상품 ID
NEXT_PUBLIC_PADDLE_ENV=sandbox           # sandbox | production

# Server-side
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...
```

## 5. 무료/유료 접근 제어 상세

### 5.1 useRaceAccess 훅

```typescript
type RaceAccess = {
  canView: boolean          // 열람 가능 여부
  isFreeRace: boolean       // 오늘 무료 경기인지
  isPremium: boolean        // 프리미엄 회원인지
  remainingFree: number     // 남은 무료 횟수 (0 or 1)
}

// 로직 (Server Action에서 처리)
async function checkRaceAccess(userId: string, raceId: string): RaceAccess {
  const profile = await getProfile(userId)

  if (profile.subscription_status === 'premium') {
    return { canView: true, isFreeRace: false, isPremium: true, remainingFree: 0 }
  }

  const today = getKSTDate() // KST 기준 오늘
  if (profile.free_race_date === today && profile.free_race_id) {
    // 이미 오늘 무료 사용함
    if (profile.free_race_id === raceId) {
      return { canView: true, isFreeRace: true, isPremium: false, remainingFree: 0 }
    }
    return { canView: false, isFreeRace: false, isPremium: false, remainingFree: 0 }
  }

  // 아직 오늘 무료 사용 안 함 → 이 경기를 무료로 등록
  await updateFreeRace(userId, today, raceId)
  return { canView: true, isFreeRace: true, isPremium: false, remainingFree: 0 }
}
```

### 5.2 블러 처리 컴포넌트

```typescript
// BlurOverlay.tsx
// - CSS: backdrop-filter: blur(8px) + 반투명 오버레이
// - 실제 데이터를 서버에서 전송하지 않음 (보안)
// - 무료 사용자에게는 strategy_predictions 데이터 자체를 미전송
// - 대신 빈 배열 + canView: false 반환
```

**중요**: 블러 처리는 CSS만이 아닌 **서버 레벨에서 데이터 미전송**으로 구현. 프론트에서는 빈 데이터 + 블러 UI만 표시.

## 6. 컴포넌트 상세 설계

### 6.1 RaceCard (홈 리스트)

```
Props:
  race: Race
  accessStatus: 'free' | 'locked' | 'premium' | 'none'

표시 정보:
  - 경주번호 (1R, 2R, ...)
  - 거리 (1200m)
  - 출발시간 (15:00)
  - 출전마 수 (12두)
  - 접근 배지: 🆓 무료 | 🔒 잠금 | 없음 (프리미엄)

클릭 동작:
  - free/premium → /race/[raceId] 이동
  - locked → 블러 모달 or 구독 페이지
  - none (비회원) → /login 이동
```

### 6.2 StrategyTabs + StrategyTop3

```
StrategyTabs:
  - 탭: 통계 | 전적 | 궁합 | 건강
  - 기본 선택: 통계
  - 탭 전환 시 해당 전략 Top3 표시

StrategyTop3:
  Props:
    predictions: StrategyPrediction[]  // 3개 (rank 1-3)
    strategyType: 'stats' | 'record' | 'chemistry' | 'health'

  각 항목 표시:
    - 순위 (1, 2, 3)
    - 마번 + 말이름
    - 점수 (소수점 1자리)
    - 추천 이유 (reason 텍스트)
```

### 6.3 WeightSlider (나만의 픽)

```
Props:
  strategyType: string
  label: string
  value: number (0-100)
  onChange: (value: number) => void

제약:
  - 4개 전략 가중치 합계 = 100
  - 하나를 올리면 나머지를 비례 감소
  - 최소 0, 최대 100
```

## 7. Server Actions 설계

### 7.1 race.ts

```typescript
'use server'

// 오늘 경기 목록 (홈용)
async function getTodayRaces(): Promise<RaceWithAccess[]>
// → races WHERE race_date = KST today, ORDER BY venue, race_number
// → 각 경기에 사용자 접근 상태 첨부

// 경기 상세 + 출전마
async function getRaceDetail(raceId: string): Promise<RaceDetail | null>
// → race + race_entries JOIN horses, jockeys
```

### 7.2 prediction.ts

```typescript
'use server'

// 전략별 Top3 조회 (접근 제어 포함)
async function getStrategyPredictions(
  raceId: string,
  strategyType: StrategyType
): Promise<{ predictions: StrategyPrediction[], canView: boolean }>
// → canView = false이면 predictions = [] (서버에서 데이터 차단)

// 전체 전략 Top3 조회 (4개 전략 한번에)
async function getAllPredictions(
  raceId: string
): Promise<{ [key in StrategyType]: StrategyPrediction[] } | null>
```

### 7.3 pick.ts

```typescript
'use server'

// 나만의 픽 생성
async function createMyPick(
  raceId: string,
  weights: StrategyWeights
): Promise<MyPickResult>
// → 가중치로 종합 점수 계산 → Top3 반환 + user_picks 저장

// 프리셋 CRUD
async function getPresets(): Promise<PickPreset[]>
async function savePreset(name: string, weights: StrategyWeights): Promise<PickPreset>
async function deletePreset(presetId: string): Promise<void>
// → 프리셋 최대 3개 체크 (application level)
```

### 7.4 subscription.ts

```typescript
'use server'

// Paddle checkout URL 생성
async function createCheckoutSession(): Promise<{ url: string }>
// → Paddle API로 checkout 링크 생성

// 구독 상태 조회
async function getSubscriptionStatus(): Promise<SubscriptionInfo>

// 구독 취소 (Paddle 포털 URL)
async function getManageUrl(): Promise<{ url: string }>
```

## 8. 타입 정의

### 8.1 strategy.ts

```typescript
export type StrategyType = 'stats' | 'record' | 'chemistry' | 'health'

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  stats: '통계',
  record: '전적',
  chemistry: '궁합',
  health: '건강',
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
```

### 8.2 race.ts

```typescript
export type Venue = 'seoul' | 'busan' | 'jeju'

export const VENUE_LABELS: Record<Venue, string> = {
  seoul: '서울',
  busan: '부산',
  jeju: '제주',
}

export interface Race {
  id: string
  raceDate: string
  raceNumber: number
  venue: Venue
  distance: number
  trackCondition: string
  trackType: string
  startTime: string
  entriesCount: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export type RaceAccessStatus = 'free' | 'locked' | 'premium' | 'none'

export interface RaceWithAccess extends Race {
  accessStatus: RaceAccessStatus
}

export interface RaceEntry {
  id: string
  horseId: string
  horseName: string
  jockeyId: string
  jockeyName: string
  gateNumber: number
  horseWeight: number | null
  odds: number | null
}

export interface RaceDetail extends Race {
  entries: RaceEntry[]
}
```

### 8.3 subscription.ts

```typescript
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'inactive'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  isPremium: boolean
  currentPeriodEnd: string | null
  cancelledAt: string | null
  manageUrl: string | null
}
```

## 9. Edge Functions 상세

### 9.1 sync-race-data

```
트리거: Cron (매일 07:00 KST) 또는 관리자 수동 호출
역할: 마사회 데이터 수집 → DB 저장

처리 순서:
1. data_sync_logs INSERT (status: in_progress)
2. 마사회 API / 크롤링으로 오늘 경기 데이터 수집
3. horses UPSERT (신규 말 등록)
4. jockeys UPSERT (신규 기수 등록)
5. races UPSERT (오늘 경기 등록)
6. race_entries UPSERT (출전마 등록)
7. races.entries_count 업데이트
8. data_sync_logs UPDATE (status: success, records_count)
9. run-predictions 호출 (체이닝)

에러 시: data_sync_logs UPDATE (status: failed, error_message)
```

### 9.2 run-predictions

```
트리거: sync-race-data 완료 후 호출
역할: 4개 전략 점수 산정 → strategy_predictions 저장

처리 순서 (경기별):
1. race_entries + horses + jockeys + race_results(과거) 조회
2. 전략별 점수 산정:
   a. stats: 과거 동일 조건(거리, 트랙, 게이트) 성적 기반 점수
   b. record: 출전마 간 맞대결 기록 기반 점수
   c. chemistry: 말-기수 조합 성적 기반 점수
   d. health: 체중 변화, 휴식 기간, 최근 출전 기록 기반 점수
3. 각 전략별 상위 3마 선정 → strategy_predictions UPSERT
4. prediction_logs INSERT (성공/실패)

점수 산정 공식 (전략별):
- 0-100 범위 정규화
- 각 전략 내 여러 팩터의 가중합
- factors JSONB에 세부 점수 기록
```

### 9.3 paddle-webhook

```
트리거: Paddle Webhook
역할: 구독 상태 변경 반영

처리 순서:
1. 서명 검증 (PADDLE_WEBHOOK_SECRET)
2. 이벤트 타입 분기
3. paddle_customer_id로 사용자 매칭
4. subscriptions 테이블 업데이트
5. profiles.subscription_status 동기화
```

## 10. 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...

# Supabase (서버 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJxx...

# Paddle (클라이언트)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_xxx
NEXT_PUBLIC_PADDLE_PRICE_ID=pri_xxx
NEXT_PUBLIC_PADDLE_ENV=sandbox

# Paddle (서버)
PADDLE_API_KEY=xxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxx

# Kakao OAuth (Supabase Dashboard에서 설정)
# KAKAO_CLIENT_ID=xxx (Supabase에서 관리)
# KAKAO_CLIENT_SECRET=xxx

# Site
NEXT_PUBLIC_SITE_URL=https://horse-lab.vercel.app
```

## 11. 구현 순서 (Implementation Order)

### Step 1: 프로젝트 초기화
- [ ] Next.js 15 프로젝트 생성 (App Router)
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] Supabase 프로젝트 생성 + 환경변수
- [ ] 기본 레이아웃 (Header, PageContainer, MobileNav)
- [ ] DB 마이그레이션 실행 (00001_initial_schema.sql)

### Step 2: 인증
- [ ] Supabase Auth 카카오 OAuth 설정
- [ ] /api/auth/callback 구현
- [ ] middleware.ts (보호 경로)
- [ ] useAuth 훅
- [ ] KakaoLoginButton 컴포넌트
- [ ] /login 페이지

### Step 3: 홈 화면
- [ ] getTodayRaces Server Action
- [ ] RaceCard 컴포넌트
- [ ] 홈 페이지 (경마장별 그룹, 경기 리스트)
- [ ] 무료/잠금 배지 표시

### Step 4: 경기 상세
- [ ] getRaceDetail Server Action
- [ ] getStrategyPredictions Server Action (접근 제어 포함)
- [ ] StrategyTabs 컴포넌트
- [ ] StrategyTop3 + HorseRankCard 컴포넌트
- [ ] BlurOverlay 컴포넌트
- [ ] useRaceAccess 훅
- [ ] /race/[raceId] 페이지

### Step 5: 결제 (Paddle)
- [ ] Paddle 프로젝트 설정 (상품, 가격)
- [ ] /api/webhook/paddle 구현 (서명 검증)
- [ ] /api/subscription/checkout 구현
- [ ] PlanCard, PaywallCTA 컴포넌트
- [ ] /subscription 페이지
- [ ] useSubscription 훅

### Step 6: 나만의 픽
- [ ] createMyPick Server Action (가중합 계산)
- [ ] WeightSlider 컴포넌트
- [ ] PickResult 컴포넌트
- [ ] PresetSelector 컴포넌트 (CRUD)
- [ ] /race/[raceId]/my-pick 페이지
- [ ] useMyPick 훅

### Step 7: 마이페이지
- [ ] /mypage 페이지 (프로필, 구독 상태, 로그아웃)

### Step 8: 데이터 파이프라인 (Edge Functions)
- [ ] sync-race-data Edge Function
- [ ] run-predictions Edge Function
- [ ] Cron 설정 (supabase)
- [ ] paddle-webhook Edge Function (또는 Next.js API route 유지)

### Step 9: 관리자
- [ ] /admin 레이아웃 (is_admin 체크)
- [ ] 관리자 대시보드 (데이터 수집 상태, 전략 생성 상태, 구독 현황)

### Step 10: 폴리싱
- [ ] 에러 핸들링 (Error Boundary, loading.tsx, error.tsx)
- [ ] 메타태그 / OG 태그
- [ ] PWA manifest (선택)
- [ ] 성능 최적화 (이미지, 번들)

## 12. 의존성 패키지

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@paddle/paddle-js": "^1.2.0",
    "@paddle/paddle-node-sdk": "^1.5.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "supabase": "^1.200.0"
  }
}
```

## 13. 디자인 가이드라인

### 13.1 모바일 퍼스트 레이아웃

```
- max-width: 430px (모바일), 센터 정렬
- padding: 16px 좌우
- 하단 안전 영역: env(safe-area-inset-bottom)
```

### 13.2 색상 팔레트

```
Primary: #1D4ED8 (blue-700)     -- 메인 브랜드
Secondary: #F59E0B (amber-500)  -- 강조, 순위
Background: #F9FAFB (gray-50)   -- 배경
Surface: #FFFFFF                 -- 카드
Text Primary: #111827 (gray-900)
Text Secondary: #6B7280 (gray-500)
Success: #10B981 (emerald-500)
Danger: #EF4444 (red-500)
```

### 13.3 폰트 크기 (50-60대 타겟)

```
Caption: 13px
Body: 15px
Subtitle: 17px
Title: 20px
Heading: 24px
```

---

**작성일**: 2026-02-28
**Plan 참조**: `docs/01-plan/features/horse-lab.plan.md`
**상태**: Draft
**다음 단계**: 구현 시작 (`/tokit do horse-lab`)
