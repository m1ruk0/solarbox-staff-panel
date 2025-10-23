-- Таблица паролей для входа в систему
CREATE TABLE IF NOT EXISTS passwords (
  id BIGSERIAL PRIMARY KEY,
  discord TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Политика доступа
DROP POLICY IF EXISTS "Enable all for service role" ON passwords;
CREATE POLICY "Enable all for service role" ON passwords FOR ALL USING (true);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_passwords_discord ON passwords(discord);
CREATE INDEX IF NOT EXISTS idx_passwords_created_at ON passwords(created_at DESC);
