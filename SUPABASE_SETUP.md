# 🚀 Настройка Supabase

## Шаг 1: Создайте аккаунт Supabase

1. Перейдите на https://supabase.com
2. Нажмите **"Start your project"**
3. Войдите через **GitHub**

## Шаг 2: Создайте новый проект

1. Нажмите **"New Project"**
2. Заполните:
   - **Name:** `staff-management`
   - **Database Password:** придумайте надежный пароль (сохраните!)
   - **Region:** `Europe (Frankfurt)` или `Europe (London)`
3. Нажмите **"Create new project"**
4. Подождите 1-2 минуты пока проект создается

## Шаг 3: Создайте таблицы

1. В левом меню нажмите **"SQL Editor"**
2. Нажмите **"+ New query"**
3. Скопируйте содержимое файла `supabase-schema.sql`
4. Вставьте в редактор
5. Нажмите **"Run"** (или Ctrl+Enter)

Вы должны увидеть: ✅ Success. No rows returned

## Шаг 4: Получите API ключи

1. В левом меню нажмите **"Settings"** (⚙️)
2. Выберите **"API"**
3. Найдите раздел **"Project API keys"**

Вам нужны:
- **Project URL** (например: `https://xxxxx.supabase.co`)
- **anon public** ключ (начинается с `eyJ...`)

⚠️ **НЕ используйте `service_role` ключ в клиентском коде!**

Для сервера используйте **`service_role`** ключ (он ниже).

## Шаг 5: Настройте .env файл

Добавьте в `.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=ваш_service_role_ключ
API_PORT=4000
```

⚠️ **Используйте `service_role` ключ, не `anon`!**

## Шаг 6: Обновите Railway

В Railway → Variables:

**Удалите:**
- `MONGODB_URI`

**Добавьте:**
- `SUPABASE_URL` = `https://xxxxx.supabase.co`
- `SUPABASE_KEY` = ваш `service_role` ключ
- `API_PORT` = `4000`

## Шаг 7: Измените Start Command

В Railway → Settings → Start Command:

```
node api-server-supabase.js
```

## Шаг 8: Создайте первого пользователя

Создайте файл `setup-first-user-supabase.js`:

```javascript
require('dotenv').config();
const staffDB = require('./staff-database-supabase');
const passwordsDB = require('./passwords-database-supabase');

async function setup() {
  try {
    console.log('🚀 Начинаем настройку...\n');
    
    // Добавляем OWNER
    await staffDB.addStaff('m1ruk0_', 'Owner', 'OWNER');
    console.log('✅ Сотрудник добавлен');
    
    // Добавляем пароль
    await passwordsDB.addUser(
      'm1ruk0_',
      '123123',
      'Любимая игрушка в детстве?',
      'машинка'
    );
    console.log('✅ Пароль создан');
    
    console.log('\n🎉 Готово!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

setup();
```

Запустите локально:
```bash
node setup-first-user-supabase.js
```

Или в Railway Shell:
```bash
node setup-first-user-supabase.js
```

## 🎉 Готово!

Теперь ваше приложение использует Supabase (PostgreSQL)!

### Преимущества Supabase:

✅ **Бесплатно** - 500 МБ базы данных
✅ **Быстро** - PostgreSQL с индексами
✅ **Надежно** - автоматические бэкапы
✅ **Работает везде** - нет проблем с SSL
✅ **Удобно** - веб-интерфейс для просмотра данных

### Просмотр данных:

1. Откройте Supabase
2. Перейдите в **"Table Editor"**
3. Увидите таблицы: `staff`, `passwords`, `applications`

---

**Нужна помощь?** Документация: https://supabase.com/docs
