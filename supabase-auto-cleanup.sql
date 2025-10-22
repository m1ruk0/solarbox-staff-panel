-- ============================================
-- АВТОМАТИЧЕСКАЯ ОЧИСТКА ЗАЯВОК КАЖДЫЕ 5 ЧАСОВ
-- ============================================

-- 1. Создаем функцию для очистки заявок
CREATE OR REPLACE FUNCTION cleanup_applications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Удаляем все заявки
  DELETE FROM applications;
  
  -- Логируем действие
  RAISE NOTICE 'Все заявки очищены: %', NOW();
END;
$$;

-- 2. Создаем расширение pg_cron (если еще не создано)
-- Примечание: В Supabase это может потребовать прав администратора
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Планируем задачу на выполнение каждые 5 часов
SELECT cron.schedule(
  'cleanup-applications-every-5-hours',  -- Название задачи
  '0 */5 * * *',                         -- Cron выражение: каждые 5 часов
  $$SELECT cleanup_applications()$$      -- SQL команда
);

-- ============================================
-- АЛЬТЕРНАТИВА: Очистка старых заявок (старше 24 часов)
-- ============================================

-- Если хотите удалять только старые заявки, а не все:
CREATE OR REPLACE FUNCTION cleanup_old_applications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Удаляем заявки старше 24 часов
  DELETE FROM applications
  WHERE created_at < NOW() - INTERVAL '24 hours';
  
  -- Логируем действие
  RAISE NOTICE 'Старые заявки очищены: %', NOW();
END;
$$;

-- Планируем задачу для очистки старых заявок
SELECT cron.schedule(
  'cleanup-old-applications-every-5-hours',
  '0 */5 * * *',
  $$SELECT cleanup_old_applications()$$
);

-- ============================================
-- УПРАВЛЕНИЕ ЗАДАЧАМИ
-- ============================================

-- Посмотреть все запланированные задачи:
-- SELECT * FROM cron.job;

-- Удалить задачу (если нужно):
-- SELECT cron.unschedule('cleanup-applications-every-5-hours');

-- Вручную запустить очистку:
-- SELECT cleanup_applications();

-- ============================================
-- ПРИМЕЧАНИЯ
-- ============================================

/*
ВАЖНО:
1. pg_cron может быть недоступен в бесплатном плане Supabase
2. Если pg_cron не работает, используйте альтернативный метод (см. ниже)
3. Cron выражение '0 */5 * * *' означает:
   - 0 минут
   - Каждые 5 часов
   - Каждый день
   - Каждый месяц
   - Каждый день недели

АЛЬТЕРНАТИВА БЕЗ pg_cron:
Создайте Edge Function в Supabase и вызывайте её через внешний cron сервис:
- cron-job.org
- EasyCron
- GitHub Actions
*/
