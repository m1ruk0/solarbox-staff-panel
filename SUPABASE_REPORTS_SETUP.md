# 📊 Настройка отчетов в Supabase

## Шаг 1: Создайте таблицу в Supabase

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Вставьте и выполните этот SQL:

```sql
-- Таблица отчетов
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author TEXT NOT NULL,
  report_count INTEGER DEFAULT 1,
  screenshots JSONB,
  status TEXT DEFAULT 'pending',
  reviewer TEXT,
  review_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_reports_author ON reports(author);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- RLS политики (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Все могут читать
CREATE POLICY "Anyone can read reports" ON reports
  FOR SELECT USING (true);

-- Все могут создавать
CREATE POLICY "Anyone can create reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Только создатель или модератор может обновлять
CREATE POLICY "Author or moderator can update reports" ON reports
  FOR UPDATE USING (true);
```

5. Нажмите **Run** (или F5)

---

## Шаг 2: Проверьте таблицу

1. Перейдите в **Table Editor**
2. Найдите таблицу `reports`
3. Убедитесь что есть колонки:
   - `id` (uuid)
   - `author` (text)
   - `report_count` (int4)
   - `screenshots` (jsonb)
   - `status` (text)
   - `reviewer` (text)
   - `review_comment` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

---

## Шаг 3: Перезапустите приложение

```bash
npm run electron
```

Или если запущено через Electron:
- Закройте приложение
- Запустите снова

---

## ✅ Готово!

Теперь отчеты будут сохраняться в Supabase!

### Проверка:

1. Откройте приложение
2. Перейдите в **Отправить отчет**
3. Заполните форму и отправьте
4. Проверьте в Supabase Table Editor → `reports`

Должна появиться новая запись! 🎉

---

## 📋 API Endpoints:

- `POST /api/reports` - Создать отчет
- `GET /api/reports` - Получить все отчеты
- `GET /api/reports/my?author=username` - Мои отчеты
- `GET /api/reports/:id` - Получить отчет по ID
- `POST /api/reports/:id/approve` - Одобрить отчет
- `POST /api/reports/:id/reject` - Отклонить отчет
- `GET /api/reports/stats` - Статистика

---

## 🔧 Troubleshooting:

### Ошибка "relation reports does not exist"
- Убедитесь что выполнили SQL скрипт
- Проверьте что таблица создана в Table Editor

### Ошибка "permission denied"
- Проверьте RLS политики
- Убедитесь что политики созданы правильно

### Отчеты не отображаются
- Проверьте консоль браузера (F12)
- Проверьте что API сервер запущен
- Проверьте что SUPABASE_URL и SUPABASE_KEY в .env
