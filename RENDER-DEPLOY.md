# 🚀 Инструкция по развертыванию на Render

## 📋 Что такое Render?

Render - это бесплатная платформа для хостинга веб-приложений. Идеально подходит для вашей панели управления персоналом!

---

## 🎯 Что будет доступно после развертывания:

### Публичные страницы (без авторизации):
- ✅ **Подача заявки** - `https://ваш-сайт.onrender.com/apply.html`
- ✅ **Список персонала** - `https://ваш-сайт.onrender.com/staff-list.html`
- ✅ **Главная страница** - `https://ваш-сайт.onrender.com/`

### Защищенные страницы (с авторизацией):
- 🔐 **Панель управления** - `https://ваш-сайт.onrender.com/index.html`
- 🔐 **Управление заявками** - `https://ваш-сайт.onrender.com/applications.html`
- 🔐 **Логи** - `https://ваш-сайт.onrender.com/logs.html`

---

## 🛠️ Шаг 1: Подготовка проекта

### 1.1 Создайте GitHub репозиторий

1. Зайдите на https://github.com
2. Нажмите "New repository"
3. Название: `solarbox-staff-panel`
4. Сделайте репозиторий **Private** (важно!)
5. Нажмите "Create repository"

### 1.2 Загрузите код на GitHub

Откройте терминал в папке проекта:

```bash
# Инициализируйте Git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте коммит
git commit -m "Initial commit - SolarBox Staff Panel"

# Подключите к GitHub (замените YOUR_USERNAME на ваш логин)
git remote add origin https://github.com/YOUR_USERNAME/solarbox-staff-panel.git

# Загрузите код
git branch -M main
git push -u origin main
```

---

## 🌐 Шаг 2: Развертывание на Render

### 2.1 Создайте аккаунт на Render

1. Зайдите на https://render.com
2. Нажмите "Get Started for Free"
3. Войдите через GitHub

### 2.2 Создайте новый Web Service

1. На главной странице Render нажмите **"New +"**
2. Выберите **"Web Service"**
3. Подключите ваш GitHub репозиторий `solarbox-staff-panel`
4. Нажмите **"Connect"**

### 2.3 Настройте сервис

Заполните форму:

**Name:** `solarbox-staff-panel`

**Region:** `Frankfurt (EU Central)` (ближайший к вам)

**Branch:** `main`

**Root Directory:** оставьте пустым

**Runtime:** `Node`

**Build Command:**
```
npm install
```

**Start Command:**
```
node api-server-supabase.js
```

**Instance Type:** `Free`

### 2.4 Добавьте переменные окружения

Нажмите **"Advanced"** → **"Add Environment Variable"**

Добавьте следующие переменные:

| Key | Value |
|-----|-------|
| `PORT` | `4000` |
| `SUPABASE_URL` | `ваш_supabase_url` |
| `SUPABASE_KEY` | `ваш_supabase_key` |
| `DISCORD_TOKEN` | `ваш_discord_token` (опционально) |
| `NODE_VERSION` | `18.17.0` |

**Где взять значения:**
- `SUPABASE_URL` и `SUPABASE_KEY` - из вашего файла `.env`
- `DISCORD_TOKEN` - если используете Discord бота

### 2.5 Запустите развертывание

1. Нажмите **"Create Web Service"**
2. Подождите 3-5 минут пока Render соберет и запустит приложение
3. Статус изменится на **"Live"** 🟢

---

## ✅ Шаг 3: Проверка

После успешного развертывания вы получите URL:
```
https://solarbox-staff-panel.onrender.com
```

### Проверьте страницы:

**Публичные (работают сразу):**
- https://solarbox-staff-panel.onrender.com/apply.html
- https://solarbox-staff-panel.onrender.com/staff-list.html
- https://solarbox-staff-panel.onrender.com/

**Защищенные (требуют авторизации):**
- https://solarbox-staff-panel.onrender.com/login.html
- https://solarbox-staff-panel.onrender.com/index.html

---

## 🔗 Шаг 4: Настройка домена (опционально)

### Вариант 1: Бесплатный поддомен Render
Используйте: `https://solarbox-staff-panel.onrender.com`

### Вариант 2: Свой домен
1. Купите домен (например, `solarbox-panel.xyz`)
2. В Render перейдите в **Settings** → **Custom Domain**
3. Добавьте ваш домен
4. Настройте DNS записи у регистратора домена

---

## 📱 Шаг 5: Поделитесь ссылкой

Теперь отправьте ссылку игрокам для подачи заявок:

```
https://solarbox-staff-panel.onrender.com/apply.html
```

Или для просмотра списка персонала:

```
https://solarbox-staff-panel.onrender.com/staff-list.html
```

---

## ⚠️ Важные моменты:

### Бесплатный план Render:
- ✅ 750 часов работы в месяц (достаточно!)
- ⚠️ Засыпает после 15 минут неактивности
- ⚠️ Первый запрос после сна занимает ~30 секунд

### Чтобы сайт не засыпал:
Используйте сервис пингов (например, UptimeRobot):
1. Зайдите на https://uptimerobot.com
2. Добавьте монитор для вашего URL
3. Интервал проверки: 5 минут

---

## 🔄 Обновление сайта:

Когда вы вносите изменения в код:

```bash
# Добавьте изменения
git add .

# Сделайте коммит
git commit -m "Описание изменений"

# Загрузите на GitHub
git push

# Render автоматически обновит сайт!
```

---

## 🐛 Решение проблем:

### Сайт не запускается?
1. Проверьте логи в Render Dashboard
2. Убедитесь что все переменные окружения добавлены
3. Проверьте что `SUPABASE_URL` и `SUPABASE_KEY` правильные

### Ошибка подключения к базе данных?
Проверьте переменные `SUPABASE_URL` и `SUPABASE_KEY`

### Страница не загружается?
Подождите 30 секунд - сервис может просыпаться после сна

---

## 💰 Стоимость:

**Бесплатный план:**
- 0₽ в месяц
- 750 часов работы
- Автоматический SSL
- Неограниченный трафик

**Платный план ($7/месяц):**
- Не засыпает
- Быстрее работает
- Больше ресурсов

---

## 🎉 Готово!

Теперь ваша панель управления персоналом доступна онлайн!

**Ссылка для подачи заявок:**
```
https://solarbox-staff-panel.onrender.com/apply.html
```

**Ссылка для панели управления:**
```
https://solarbox-staff-panel.onrender.com/login.html
```

---

## 📞 Поддержка:

Если возникли проблемы:
1. Проверьте логи в Render Dashboard
2. Убедитесь что все переменные окружения добавлены
3. Проверьте что код загружен на GitHub

**Удачи!** 🚀
