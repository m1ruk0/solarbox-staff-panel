-- Создание таблицы логов
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  moderator VARCHAR(100) NOT NULL,
  target VARCHAR(100),
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Индекс для быстрого поиска
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX idx_logs_moderator ON logs(moderator);
