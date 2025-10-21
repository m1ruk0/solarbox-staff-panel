# 🚀 Запуск вашего сайта с Supabase

## ✅ Ваш сайт УЖЕ готов работать с Supabase!

Все файлы (`app.js`, `apply.js`, `applications.js` и т.д.) уже используют API, который мы переключили на Supabase.

## 📋 Что нужно сделать:

### 1️⃣ Настройте Supabase (5 минут)

1. Создайте проект на https://supabase.com
2. Откройте **SQL Editor**
3. Скопируйте весь код из `supabase-schema.sql`
4. Выполните (Run)

### 2️⃣ Получите ключи API

1. **Settings** → **API**
2. Скопируйте:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public** ключ

### 3️⃣ Создайте .env файл

```env
# Discord
DISCORD_TOKEN=ваш_токен_бота
APPLICATION_CHANNEL_ID=id_канала

# Supabase
SUPABASE_URL=https://ваш-проект.supabase.co
SUPABASE_KEY=ваш_anon_ключ

# Порты
PORT=3000
API_PORT=4000
```

### 4️⃣ Запустите серверы

```bash
# Терминал 1 - Discord бот (опционально)
npm start

# Терминал 2 - API сервер с Supabase
npm run api-supabase
```

### 5️⃣ Откройте ваш сайт

```
http://localhost:4000/
```

## 🌐 Страницы вашего сайта:

| URL | Описание | Работает с Supabase |
|-----|----------|---------------------|
| `/` | Главная (перенаправление) | ✅ |
| `/landing.html` | Landing page | ✅ |
| `/apply.html` | Форма заявки | ✅ |
| `/login.html` | Вход в систему | ✅ |
| `/index.html` | Панель управления | ✅ |
| `/applications.html` | Просмотр заявок | ✅ |
| `/applications-archive.html` | Архив заявок | ✅ |
| `/admin-passwords.html` | Управление паролями | ✅ |
| `/logs.html` | Логи действий | ✅ |

## 🔄 Как это работает:

```
Ваш сайт (HTML + JS)
         ↓
    API сервер (api-server-supabase-only.js)
         ↓
    Supabase (PostgreSQL база данных)
```

### Пример:

1. **Пользователь заполняет форму** на `/apply.html`
2. **JavaScript отправляет** на `POST /api/applications`
3. **API сервер сохраняет** в Supabase таблицу `applications`
4. **Модератор видит** заявку в `/applications.html`
5. **Модератор одобряет** → сохраняется в таблицу `staff`

## ✅ Что УЖЕ работает:

### Форма заявки (`apply.html` + `apply.js`):
```javascript
// apply.js уже использует API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api' 
    : '/api';

await fetch(`${API_URL}/applications`, {
    method: 'POST',
    body: JSON.stringify(formData)
});
```

### Панель управления (`index.html` + `app.js`):
```javascript
// app.js уже использует API
const API_URL = window.location.origin + '/api';

// Получение персонала
const response = await fetch(`${API_URL}/staff`);

// Добавление сотрудника
await fetch(`${API_URL}/staff`, {
    method: 'POST',
    body: JSON.stringify(data)
});
```

### Просмотр заявок (`applications.html` + `applications.js`):
```javascript
// Получение заявок
const response = await fetch(`${API_URL}/applications`);

// Одобрение заявки
await fetch(`${API_URL}/applications/${id}/approve`, {
    method: 'POST'
});
```

## 🎯 Всё готово!

**Ничего не нужно менять в HTML/JS файлах!**

Просто:
1. Настройте Supabase
2. Создайте `.env`
3. Запустите `npm run api-supabase`
4. Откройте `http://localhost:4000/`

**Ваш сайт уже работает с Supabase!** 🎉

## 📊 Структура вашего проекта:

```
windsurf-project/
├── public/                    ← ВАШ САЙТ (готов!)
│   ├── landing.html          ✅ Работает
│   ├── apply.html            ✅ Работает
│   ├── index.html            ✅ Работает
│   ├── applications.html     ✅ Работает
│   ├── app.js                ✅ Использует API
│   ├── apply.js              ✅ Использует API
│   └── applications.js       ✅ Использует API
│
├── api-server-supabase-only.js  ← API для вашего сайта
├── supabase-schema.sql          ← Схема БД
└── .env                         ← Настройки
```

## 🔧 Добавление первого админа:

После создания таблиц в Supabase:

1. Откройте **Table Editor** → `passwords`
2. Нажмите **Insert row**
3. Заполните:
   ```
   discord: ваш_discord_ник
   password: ваш_пароль
   question: Любимый цвет?
   answer: синий
   ```
4. Нажмите **Save**

Теперь можете войти на `/login.html`!

## 🎉 Готово!

Ваш сайт полностью готов работать с Supabase!

**Никаких изменений в коде не требуется!** 

Просто запустите API сервер и всё заработает! 🚀
