# 🚀 Деплой панели управления

## Вариант 1: Render.com (Рекомендуется)

### Шаг 1: Подготовка GitHub

1. Создайте репозиторий на GitHub (если еще нет)
2. Загрузите ваш проект:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/staff-panel.git
git push -u origin main
```

### Шаг 2: Деплой на Render

1. Зарегистрируйтесь на https://render.com
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите GitHub и выберите ваш репозиторий
4. Настройки:
   - **Name:** `staff-management-panel`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node api-server-mongo.js`
   - **Instance Type:** `Free`

5. **Environment Variables** (нажмите "Add Environment Variable"):
   ```
   MONGODB_URI = mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/staff_management
   API_PORT = 4000
   ```

6. Нажмите **"Create Web Service"**

### Шаг 3: Получите URL

После деплоя вы получите URL:
```
https://staff-management-panel.onrender.com
```

Теперь кураторы могут заходить на:
```
https://staff-management-panel.onrender.com/login.html
```

---

## Вариант 2: Railway.app

### Шаг 1: Деплой

1. Зарегистрируйтесь на https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Выберите ваш репозиторий
4. Railway автоматически определит настройки

### Шаг 2: Добавьте переменные

В разделе **Variables** добавьте:
```
MONGODB_URI = mongodb+srv://admin:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/staff_management
API_PORT = 4000
```

### Шаг 3: Получите домен

1. Перейдите в **Settings** → **Networking**
2. Нажмите **Generate Domain**
3. Получите URL типа: `https://your-app.up.railway.app`

---

## Вариант 3: VPS (Для продвинутых)

Если хотите свой домен и полный контроль:

### Хостинги:
- **Timeweb** (Россия) - от 150₽/мес
- **Reg.ru** (Россия) - от 200₽/мес
- **DigitalOcean** (США) - от $4/мес

### Настройка VPS:

1. Подключитесь по SSH
2. Установите Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Клонируйте проект:
```bash
git clone https://github.com/ВАШ_USERNAME/staff-panel.git
cd staff-panel
npm install
```

4. Создайте `.env` файл:
```bash
nano .env
```

Добавьте:
```env
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/staff_management
API_PORT=4000
```

5. Установите PM2 (для автозапуска):
```bash
sudo npm install -g pm2
pm2 start api-server-mongo.js --name staff-panel
pm2 save
pm2 startup
```

6. Настройте Nginx (опционально):
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/staff-panel
```

Добавьте:
```nginx
server {
    listen 80;
    server_name ваш-домен.ru;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/staff-panel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Безопасность

### Обязательно:

1. **HTTPS** - Render и Railway дают автоматически
2. **Переменные окружения** - никогда не коммитьте `.env` в Git
3. **MongoDB Network Access** - ограничьте IP (или оставьте 0.0.0.0/0 для облачных хостингов)

### Добавьте в .gitignore:

```
.env
node_modules/
*.log
.DS_Store
```

---

## 📱 Обновление после деплоя

### Render/Railway (автоматически):
1. Внесите изменения в код
2. Сделайте commit и push в GitHub
3. Render/Railway автоматически обновят приложение

### VPS (вручную):
```bash
cd staff-panel
git pull
npm install
pm2 restart staff-panel
```

---

## 🎯 Рекомендация

**Для начала используйте Render.com:**
- ✅ Бесплатно
- ✅ Автоматический деплой
- ✅ HTTPS
- ✅ Легко настроить

**Когда вырастете - переходите на VPS с собственным доменом**

---

## 💡 Совет

После деплоя обновите URL в коде:

В файлах `app.js`, `applications.js`, `admin-passwords.js` замените:
```javascript
const API_URL = 'http://localhost:4000/api';
```

На:
```javascript
const API_URL = window.location.origin + '/api';
```

Это позволит коду работать и локально, и на хостинге!
