-- ============================================
-- 경마연구소 (Horse Lab) Initial Schema
-- ============================================

-- profiles: 사용자 프로필
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

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- races: 경주 정보
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

-- horses: 말 정보
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
  total_places INT DEFAULT 0,
  total_shows INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_horses_name ON horses(name);

-- jockeys: 기수 정보
CREATE TABLE jockeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  win_rate NUMERIC DEFAULT 0,
  total_races INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- race_entries: 출전마 정보
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

-- race_results: 경주 결과
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

-- strategy_predictions: 전략별 Top3 예측 결과
CREATE TABLE strategy_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('stats', 'record', 'chemistry', 'health')),
  rank INT NOT NULL CHECK (rank BETWEEN 1 AND 3),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  factors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(race_id, strategy_type, rank)
);

CREATE INDEX idx_predictions_race ON strategy_predictions(race_id);
CREATE INDEX idx_predictions_race_strategy ON strategy_predictions(race_id, strategy_type);

-- user_picks: 나만의 픽 결과
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

-- user_pick_presets: 가중치 프리셋
CREATE TABLE user_pick_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weights JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_presets_user ON user_pick_presets(user_id);

-- subscriptions: Paddle 구독 정보
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

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle ON subscriptions(paddle_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- data_sync_logs: 데이터 수집 로그
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

-- prediction_logs: 전략 생성 로그
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

-- ============================================
-- RLS 정책
-- ============================================

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

-- profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
    AND subscription_status = (SELECT p.subscription_status FROM profiles p WHERE p.id = auth.uid())
  );
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- public tables
CREATE POLICY "public_read_races" ON races FOR SELECT USING (TRUE);
CREATE POLICY "public_read_horses" ON horses FOR SELECT USING (TRUE);
CREATE POLICY "public_read_jockeys" ON jockeys FOR SELECT USING (TRUE);
CREATE POLICY "public_read_entries" ON race_entries FOR SELECT USING (TRUE);
CREATE POLICY "public_read_results" ON race_results FOR SELECT USING (TRUE);

-- strategy_predictions: 인증 사용자 읽기
CREATE POLICY "authenticated_read_predictions" ON strategy_predictions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_picks, user_pick_presets: 본인만
CREATE POLICY "own_picks" ON user_picks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_presets" ON user_pick_presets
  FOR ALL USING (auth.uid() = user_id);

-- subscriptions: 본인 읽기
CREATE POLICY "own_subscription_select" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- admin tables
CREATE POLICY "admin_only_sync_logs" ON data_sync_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
CREATE POLICY "admin_only_prediction_logs" ON prediction_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
