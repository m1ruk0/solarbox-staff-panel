-- Добавление колонки solariki в таблицу staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS solariki INTEGER DEFAULT 0;

-- Обновление существующих записей (если нужно)
UPDATE staff SET solariki = 0 WHERE solariki IS NULL;
