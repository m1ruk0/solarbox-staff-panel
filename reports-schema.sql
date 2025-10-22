-- Таблица отчетов модераторов
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  author_position TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'ban', 'mute', 'warn', 'other'
  player_nickname TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  screenshots TEXT[], -- Массив URL скриншотов
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewer TEXT,
  reviewer_position TEXT,
  review_comment TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Политика доступа
DROP POLICY IF EXISTS "Enable all for service role" ON reports;
CREATE POLICY "Enable all for service role" ON reports FOR ALL USING (true);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_reports_author ON reports(author);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
