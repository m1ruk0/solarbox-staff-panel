# 🚀 Быстрый старт - Система отчетов

## 1️⃣ Создание таблицы в Supabase

Откройте Supabase SQL Editor и выполните:

```sql
-- Таблица отчетов модераторов
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  author_position TEXT NOT NULL,
  report_type TEXT NOT NULL,
  player_nickname TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  screenshots TEXT[],
  status TEXT DEFAULT 'pending',
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
```

## 2️⃣ Запуск сервера

```bash
node api-server.js
```

Сервер запустится на порту 4000 (или указанном в `API_PORT`)

## 3️⃣ Доступ к страницам

### Для всех сотрудников:
- **Отправить отчет**: `http://localhost:4000/reports-submit.html`
- **Мои отчеты**: `http://localhost:4000/reports-my.html`

### Для ZAM.CURATOR и выше:
- **Управление отчетами**: `http://localhost:4000/reports-manage.html`

## 4️⃣ Использование

### Отправка отчета:
1. Откройте `reports-submit.html`
2. Заполните форму:
   - Discord ник
   - Тип отчета (бан/мут/варн/кик/другое)
   - Никнейм игрока
   - Причина
   - Описание (опционально)
   - Скриншоты (опционально)
3. Нажмите "Отправить отчет"

### Проверка статуса:
1. Откройте `reports-my.html`
2. Введите ваш Discord ник
3. Нажмите "Найти мои отчеты"
4. Просмотрите статус и комментарии

### Управление отчетами (для модераторов):
1. Откройте `reports-manage.html`
2. Просмотрите все отчеты
3. Используйте фильтры
4. Одобрите или отклоните отчеты

## 5️⃣ Проверка работы

### Тест API:
```bash
# Создать тестовый отчет
curl -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "author": "test_user",
    "reportType": "ban",
    "playerNickname": "cheater123",
    "reason": "Читы",
    "description": "Использование читов",
    "screenshots": []
  }'

# Получить свои отчеты
curl http://localhost:4000/api/reports/my?author=test_user
```

## ✅ Готово!

Система отчетов готова к использованию. Все отчеты сохраняются в Supabase и доступны через веб-интерфейс.

## 📋 Основные URL:

- Отправить отчет: `/reports-submit.html`
- Мои отчеты: `/reports-my.html`
- Управление (ZAM.CURATOR+): `/reports-manage.html`

## 🔐 Права доступа:

- **Все сотрудники**: могут отправлять и просматривать свои отчеты
- **ZAM.CURATOR и выше**: могут управлять всеми отчетами

---

Подробная документация: `REPORTS_SYSTEM.md`
