# 📝 Changelog - Система заявок

## Дата: 21.10.2025

### 🎯 Исправленные проблемы:

#### 1. ❌ Ошибка "Cannot GET /"
**Проблема:** При открытии http://localhost:4000/ появлялась ошибка "Cannot GET /"

**Решение:**
- Добавлен корневой маршрут в `api-server.js`
- Теперь корневой URL перенаправляет на красивую landing page

**Файлы:**
- `api-server.js` - добавлен маршрут `app.get('/', ...)`

---

#### 2. ❌ undefined в заявках
**Проблема:** В Google Sheets появлялись undefined значения вместо данных

**Решение:**
- Переписана функция `addApplication()` в `applications-database.js`
- Теперь функция принимает объект данных вместо отдельных параметров
- Добавлена правильная обработка всех полей

**Файлы:**
- `applications-database.js` - функция `addApplication(data)`
- `api-server.js` - endpoint `POST /api/applications`

**Было:**
```javascript
async addApplication(discord, minecraft, age, experience, why) {
  // ...
  values: [[discord, minecraft, age, experience, why, today, 'pending', '', '']]
}
```

**Стало:**
```javascript
async addApplication(data) {
  const rowData = [
    data.discord || '',
    data.minecraft || '',
    data.age || '',
    data.experience || '',
    data.why || '',
    data.position || 'хелпер',
    today,
    'На рассмотрении'
  ];
  // ...
}
```

---

#### 3. ❌ Неправильные ники Discord и Minecraft
**Проблема:** Ники сохранялись неправильно или не сохранялись вообще

**Решение:**
- Добавлена валидация обязательных полей
- Добавлена очистка данных от лишних пробелов (`.trim()`)
- Добавлены подсказки в форме для пользователей

**Файлы:**
- `api-server.js` - валидация в endpoint
- `apply.html` - подсказки для полей

**Код валидации:**
```javascript
if (!discord || !minecraft) {
  return res.status(400).json({ 
    success: false, 
    error: 'Discord и Minecraft ники обязательны' 
  });
}

const applicationData = {
  discord: discord.trim(),
  minecraft: minecraft.trim(),
  // ...
};
```

---

#### 4. ❌ Ошибка "Unable to parse range: Персонал!A:G"
**Проблема:** Код пытался работать с листом "Персонал", но таблица называлась "Заявки"

**Решение:**
- Заменены все вхождения "Персонал" на "Заявки" в `staff-database.js`
- Всего исправлено 6 мест в коде

**Файлы:**
- `staff-database.js` - все диапазоны изменены на "Заявки!"

**Изменения:**
- `Персонал!A2:G` → `Заявки!A2:G`
- `Персонал!A:G` → `Заявки!A:G`
- `Персонал!A:A` → `Заявки!A:A`
- И т.д.

---

### ✨ Новые функции:

#### 1. 🎨 Landing Page
**Файл:** `public/landing.html`

Красивая главная страница с:
- Градиентным дизайном
- Анимациями
- Описанием вакансий (Хелпер и Медия)
- Требованиями к кандидатам
- Кнопкой "Подать заявку"

#### 2. 📝 Улучшенная форма заявки
**Файл:** `public/apply.html`

Улучшения:
- Подсказки для каждого поля
- Валидация на клиенте
- Красивые анимации
- Сообщение об успешной отправке
- Адаптивный дизайн

#### 3. 🔧 Улучшенный API
**Файл:** `api-server.js`

Новые возможности:
- Валидация данных на сервере
- Подробные сообщения об ошибках
- Логирование всех операций
- Правильная обработка должностей (helper → хелпер, media → медия)

---

### 📊 Структура данных:

#### Google Sheets - Лист "Заявки":

| Колонка | Название | Описание |
|---------|----------|----------|
| A | Discord | Discord ник пользователя |
| B | Minecraft | Minecraft ник пользователя |
| C | Возраст | Возраст пользователя |
| D | Опыт | Опыт работы в персонале |
| E | Почему | Почему хочет присоединиться |
| F | Должность | Должность (хелпер/медия) |
| G | Дата | Дата подачи заявки |
| H | Статус | Статус заявки |

---

### 📚 Новая документация:

1. **QUICK_START_APPLICATIONS.md** - Быстрый старт для системы заявок
2. **APPLICATION_FORM_GUIDE.md** - Руководство по форме заявок
3. **GOOGLE_SHEETS_SETUP.md** - Настройка Google Sheets
4. **CHANGELOG_APPLICATIONS.md** - Этот файл с описанием изменений

---

### 🔄 Измененные файлы:

1. `api-server.js` - корневой маршрут, улучшенный endpoint заявок
2. `applications-database.js` - исправлена функция addApplication
3. `staff-database.js` - заменены все "Персонал" на "Заявки"
4. `public/apply.html` - добавлены подсказки
5. `public/apply.js` - динамический API URL

### ➕ Новые файлы:

1. `public/landing.html` - главная страница
2. `QUICK_START_APPLICATIONS.md` - руководство
3. `APPLICATION_FORM_GUIDE.md` - документация
4. `GOOGLE_SHEETS_SETUP.md` - инструкция по настройке
5. `CHANGELOG_APPLICATIONS.md` - этот файл

---

### 🚀 Как использовать:

1. Настройте Google Sheets (см. `GOOGLE_SHEETS_SETUP.md`)
2. Запустите серверы:
   ```bash
   npm start      # Discord бот
   npm run api    # API сервер
   ```
3. Откройте http://localhost:4000/
4. Нажмите "Подать заявку"
5. Заполните форму
6. Проверьте Google Sheets!

---

### ✅ Итог:

Все проблемы решены:
- ✅ Нет ошибки "Cannot GET /"
- ✅ Нет undefined в заявках
- ✅ Ники сохраняются правильно
- ✅ Работает с таблицей "Заявки"
- ✅ Красивый UI
- ✅ Полная документация

Система готова к использованию! 🎉
