# 🔄 Сравнение баз данных

## Google Sheets vs MongoDB Atlas

### 📊 Google Sheets (текущая версия)

**Файлы:**
- `api-server.js` - API сервер
- `staff-database.js` - работа с персоналом
- `applications-database.js` - работа с заявками
- `passwords-database.js` - работа с паролями

**Запуск:**
```bash
node api-server.js
```

**Плюсы:**
✅ Простая настройка
✅ Визуальный интерфейс (таблицы)
✅ Легко редактировать вручную
✅ Бесплатно

**Минусы:**
❌ Медленнее при больших объемах
❌ Ограничения API (100 запросов/100 секунд)
❌ Меньше безопасности
❌ Нет индексов и оптимизации

---

### 🔒 MongoDB Atlas (новая версия)

**Файлы:**
- `api-server-mongo.js` - API сервер с MongoDB
- `staff-database-mongo.js` - работа с персоналом
- `applications-database-mongo.js` - работа с заявками
- `passwords-database-mongo.js` - работа с паролями
- `mongodb-setup.js` - подключение к базе

**Запуск:**
```bash
node api-server-mongo.js
```

**Плюсы:**
✅ **Быстрее** - индексы и оптимизация
✅ **Безопаснее** - шифрование данных
✅ **Масштабируемость** - миллионы записей
✅ **Резервное копирование** - автоматические бэкапы
✅ **Бесплатно** - до 512 МБ
✅ **Без ограничений API**
✅ **Профессиональное решение**

**Минусы:**
❌ Требует настройку MongoDB Atlas
❌ Нельзя редактировать вручную (только через интерфейс)

---

## 🎯 Рекомендация

### Используйте **MongoDB Atlas** если:
- ✅ Более 100 сотрудников
- ✅ Активное использование (много запросов)
- ✅ Нужна высокая безопасность
- ✅ Планируете масштабирование
- ✅ Хотите профессиональное решение

### Используйте **Google Sheets** если:
- ✅ Небольшая команда (до 50 человек)
- ✅ Редкое использование
- ✅ Нужен визуальный доступ к данным
- ✅ Простота важнее производительности

---

## 🔄 Миграция данных

### Из Google Sheets в MongoDB:

Создайте файл `migrate-to-mongo.js`:

```javascript
require('dotenv').config();
const { connectDB, closeDB } = require('./mongodb-setup');
const sheetsDB = require('./staff-database');
const mongoDB = require('./staff-database-mongo');

async function migrate() {
  try {
    await connectDB();
    
    // Получаем данные из Google Sheets
    const staff = await sheetsDB.getAllStaff();
    
    console.log(`Найдено ${staff.length} сотрудников`);
    
    // Переносим в MongoDB
    for (const member of staff) {
      await mongoDB.addStaff(
        member.discord,
        member.minecraft,
        member.position
      );
      
      // Обновляем дополнительные поля
      if (member.warns > 0) {
        await mongoDB.addWarn(member.discord, member.warns);
      }
      
      if (member.status !== 'Активен') {
        await mongoDB.updateStatus(member.discord, member.status);
      }
      
      console.log(`✅ Перенесен: ${member.discord}`);
    }
    
    console.log('🎉 Миграция завершена!');
    await closeDB();
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  }
}

migrate();
```

Запустите:
```bash
node migrate-to-mongo.js
```

---

## 📝 Переключение между версиями

### На Google Sheets:
```bash
node api-server.js
```

### На MongoDB:
```bash
node api-server-mongo.js
```

**Важно:** Не запускайте оба сервера одновременно!

---

## 🔧 Настройка

### Google Sheets:
Требуется в `.env`:
```env
GOOGLE_SHEET_ID=ваш_id
GOOGLE_CREDENTIALS={"type":"service_account",...}
```

### MongoDB Atlas:
Требуется в `.env`:
```env
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/staff_management
```

---

## 💡 Совет

Начните с **MongoDB Atlas** - это современное, безопасное и бесплатное решение!

Следуйте инструкции: `QUICK_START_MONGODB.md`
