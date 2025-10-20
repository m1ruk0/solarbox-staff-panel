# 🚀 Быстрый старт с MongoDB Atlas

## 1️⃣ Создайте бесплатный кластер

Перейдите на: **https://www.mongodb.com/cloud/atlas/register**

1. Зарегистрируйтесь (можно через Google)
2. Создайте **FREE** кластер (M0)
3. Выберите регион: **Frankfurt** или **Amsterdam**

## 2️⃣ Настройте доступ

### Создайте пользователя:
- Username: `admin`
- Password: `придумайте надежный пароль`
- Права: **Atlas admin**

### Разрешите доступ:
- Network Access → Add IP Address
- Выберите: **Allow Access from Anywhere** (0.0.0.0/0)

## 3️⃣ Получите Connection String

1. Database → Connect → Connect your application
2. Скопируйте строку подключения:

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## 4️⃣ Настройте проект

### Установите MongoDB:
```bash
npm install
```

### Обновите .env файл:

Добавьте в файл `.env`:

```env
MONGODB_URI=mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/staff_management?retryWrites=true&w=majority
API_PORT=4000
```

⚠️ **Замените `ВАШ_ПАРОЛЬ` на реальный пароль!**

## 5️⃣ Создайте первого пользователя

```bash
node setup-first-user.js
```

## 6️⃣ Запустите сервер

```bash
node api-server-mongo.js
```

## 7️⃣ Войдите в систему

Откройте: **http://localhost:4000/login.html**

Данные для входа:
- Discord: `m1ruk0_`
- Пароль: `123123`

---

## 🎉 Готово!

Теперь все данные хранятся в безопасной облачной базе MongoDB Atlas!

### 📊 Просмотр данных:

Откройте MongoDB Atlas → Database → Browse Collections

Вы увидите:
- **staff** - персонал
- **passwords** - пароли (зашифрованы SHA-256)
- **applications** - заявки

### 🔒 Безопасность:

✅ Все пароли хешируются
✅ Данные в облаке с шифрованием
✅ Автоматические бэкапы
✅ До 512 МБ бесплатно

---

**Нужна помощь?** Смотрите полную инструкцию в `MONGODB_SETUP.md`
