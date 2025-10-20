# 🔒 Настройка MongoDB Atlas

## Шаг 1: Создание аккаунта MongoDB Atlas

1. Перейдите на https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйтесь (можно через Google)
3. Выберите **FREE** план (M0 Sandbox)

## Шаг 2: Создание кластера

1. После регистрации нажмите **"Build a Database"**
2. Выберите **FREE** (M0)
3. Выберите регион (рекомендую **Frankfurt** или **Amsterdam** для России)
4. Нажмите **"Create"**

## Шаг 3: Настройка доступа

### 3.1 Создание пользователя базы данных

1. В разделе **"Security"** → **"Database Access"**
2. Нажмите **"Add New Database User"**
3. Выберите **"Password"**
4. Введите:
   - Username: `admin`
   - Password: `создайте надежный пароль` (сохраните его!)
5. Database User Privileges: **"Atlas admin"**
6. Нажмите **"Add User"**

### 3.2 Настройка IP адресов

1. В разделе **"Security"** → **"Network Access"**
2. Нажмите **"Add IP Address"**
3. Выберите **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Нажмите **"Confirm"**

⚠️ **Для продакшена**: Укажите конкретный IP вашего сервера!

## Шаг 4: Получение Connection String

1. Вернитесь в **"Database"**
2. Нажмите **"Connect"** на вашем кластере
3. Выберите **"Connect your application"**
4. Скопируйте **Connection String**

Он будет выглядеть так:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Шаг 5: Настройка проекта

### 5.1 Установка зависимостей

```bash
npm install
```

### 5.2 Обновление .env файла

Откройте файл `.env` и добавьте/измените:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/staff_management?retryWrites=true&w=majority

# API Port
API_PORT=4000
```

⚠️ **ВАЖНО**: Замените `ВАШ_ПАРОЛЬ` на пароль, который вы создали в шаге 3.1!

## Шаг 6: Запуск сервера

```bash
node api-server-mongo.js
```

Или через npm:

```bash
npm run api-mongo
```

## Шаг 7: Создание первого пользователя

Создайте файл `setup-first-user.js`:

```javascript
require('dotenv').config();
const { connectDB, closeDB } = require('./mongodb-setup');
const staffDB = require('./staff-database-mongo');
const passwordsDB = require('./passwords-database-mongo');

async function setup() {
  try {
    await connectDB();
    
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
    
    console.log('\n🎉 Готово! Можете войти на http://localhost:4000/login.html');
    
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

setup();
```

Запустите:
```bash
node setup-first-user.js
```

## 🎉 Готово!

Теперь ваши данные хранятся в безопасной облачной базе данных MongoDB Atlas!

### Преимущества MongoDB Atlas:

✅ **Безопасность** - шифрование данных
✅ **Бесплатно** - до 512 МБ хранилища
✅ **Резервное копирование** - автоматические бэкапы
✅ **Быстродействие** - индексы и оптимизация
✅ **Масштабируемость** - легко увеличить при росте

### Мониторинг базы данных:

1. Откройте MongoDB Atlas
2. Перейдите в **"Database"** → **"Browse Collections"**
3. Увидите коллекции:
   - `staff` - персонал
   - `passwords` - пароли (зашифрованы)
   - `applications` - заявки

## 🔧 Troubleshooting

### Ошибка подключения?

1. Проверьте правильность пароля в `.env`
2. Убедитесь что IP разрешен в Network Access
3. Проверьте что кластер запущен

### Медленное подключение?

- Выберите ближайший регион при создании кластера

### Нужна помощь?

- Документация: https://docs.mongodb.com/atlas/
- Поддержка: https://support.mongodb.com/
