-- Добавляем колонку position в таблицу applications
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'хелпер';

-- Обновляем существующие записи (если есть)
UPDATE applications 
SET position = 'хелпер' 
WHERE position IS NULL;

-- Проверяем результат
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'applications' 
ORDER BY ordinal_position;
