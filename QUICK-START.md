# 🚀 Быстрый старт веб-панели

## ❌ Ошибка: "Не удалось добавить сотрудника"

Эта ошибка означает что **Google Sheets API не настроен**.

## ✅ Решение (2 минуты):

### Шаг 1: Проверьте файл .env

Откройте файл `.env` в корне проекта и убедитесь что там есть:

```env
# Discord бот
DISCORD_TOKEN=ваш_токен
DISCORD_CLIENT_ID=ваш_id

# Google Sheets
GOOGLE_SHEET_ID=ваш_id_таблицы
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

### Шаг 2: Если переменных нет - добавьте

1. **Получите ID таблицы:**
   - Откройте вашу Google Sheets таблицу
   - Скопируйте ID из URL:
   ```
   https://docs.google.com/spreadsheets/d/[ЭТО_ID]/edit
   ```

2. **Получите credentials:**
   - Следуйте инструкции в `GOOGLE-SHEETS-SETUP.md`
   - Или используйте существующий файл `google-credentials.json`

3. **Добавьте в .env:**
   ```env
   GOOGLE_SHEET_ID=ваш_id_таблицы
   GOOGLE_CREDENTIALS={"type":"service_account",...весь JSON...}
   ```

### Шаг 3: Перезапустите API сервер

```bash
# Остановите (Ctrl+C)
# Запустите снова
npm run api
```

---

## 🎯 Альтернатива: Тестовый режим

Если хотите просто посмотреть интерфейс без Google Sheets, создам mock данные.

Хотите чтобы я создал тестовый режим? 🤔
