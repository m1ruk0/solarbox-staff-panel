# Создание таблиц в Supabase

## Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (слева в меню)

## Шаг 2: Выполните SQL скрипт

1. Нажмите **New Query**
2. Скопируйте содержимое файла `supabase-schema.sql`
3. Вставьте в редактор
4. Нажмите **Run** (или Ctrl+Enter)

## Шаг 3: Проверьте таблицы

Перейдите в **Table Editor** и убедитесь, что созданы таблицы:
- ✅ `staff` - персонал
- ✅ `passwords` - пароли для входа
- ✅ `applications` - заявки (опционально, если не используете Google Sheets)
- ✅ `logs` - логи действий

## Шаг 4: Проверьте RLS (Row Level Security)

В каждой таблице должна быть политика:
- **Policy name:** "Enable all for service role"
- **Allowed operation:** ALL
- **Policy definition:** `true`

## Готово!

Теперь ваш API сможет работать с Supabase без ошибок.

## Если ошибка "Unable to parse range: Персонал!A2:G"

Это значит, что где-то используется старая база данных (Google Sheets).
Проверьте, что в `.env` файле на Render указаны:
```
SUPABASE_URL=ваш_url
SUPABASE_KEY=ваш_ключ
```

И что запускается именно `api-server-supabase.js`, а не `api-server.js`
