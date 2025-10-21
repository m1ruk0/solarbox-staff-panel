-- Таблица персонала
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  discord TEXT UNIQUE NOT NULL,
  minecraft TEXT NOT NULL,
  position TEXT NOT NULL,
  warns INTEGER DEFAULT 0,
  vacation BOOLEAN DEFAULT FALSE,
  vacation_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Активен',
  hire_date TEXT,
  fire_reason TEXT,
  fired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица паролей
CREATE TABLE IF NOT EXISTS passwords (
  id BIGSERIAL PRIMARY KEY,
  discord TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица заявок
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  discord TEXT NOT NULL,
  minecraft TEXT NOT NULL,
  age TEXT,
  experience TEXT,
  reason TEXT,
  position TEXT DEFAULT 'хелпер',
  status TEXT DEFAULT 'На рассмотрении',
  comment TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица логов
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  moderator TEXT NOT NULL,
  target TEXT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_staff_discord ON staff(discord);
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_passwords_discord ON passwords(discord);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Включаем Row Level Security (RLS)
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем все операции для service_role)
DROP POLICY IF EXISTS "Enable all for service role" ON staff;
DROP POLICY IF EXISTS "Enable all for service role" ON passwords;
DROP POLICY IF EXISTS "Enable all for service role" ON applications;
DROP POLICY IF EXISTS "Enable all for service role" ON logs;

CREATE POLICY "Enable all for service role" ON staff FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON passwords FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON applications FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON logs FOR ALL USING (true);
