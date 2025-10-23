-- Создание таблицы заявок на вывод соляриков
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord TEXT NOT NULL,
  minecraft TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer TEXT,
  comment TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_withdrawals_discord ON withdrawals(discord);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- ОТКЛЮЧАЕМ RLS (Row Level Security) для простоты
ALTER TABLE withdrawals DISABLE ROW LEVEL SECURITY;

-- Комментарии к таблице
COMMENT ON TABLE withdrawals IS 'Заявки на вывод соляриков';
COMMENT ON COLUMN withdrawals.id IS 'Уникальный идентификатор заявки';
COMMENT ON COLUMN withdrawals.discord IS 'Discord пользователя';
COMMENT ON COLUMN withdrawals.minecraft IS 'Никнейм в Minecraft';
COMMENT ON COLUMN withdrawals.amount IS 'Количество соляриков для вывода';
COMMENT ON COLUMN withdrawals.status IS 'Статус заявки: pending, approved, rejected';
COMMENT ON COLUMN withdrawals.reviewer IS 'Кто проверил заявку';
COMMENT ON COLUMN withdrawals.comment IS 'Комментарий при отклонении';
COMMENT ON COLUMN withdrawals.reviewed_at IS 'Дата и время проверки';
COMMENT ON COLUMN withdrawals.created_at IS 'Дата и время создания заявки';
