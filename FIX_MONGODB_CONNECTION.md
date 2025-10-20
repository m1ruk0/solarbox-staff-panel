# 🔧 Исправление подключения к MongoDB

## Проблема
SSL ошибка при подключении Render к MongoDB Atlas

## Решение

### Шаг 1: Обновите строку подключения в Render

В MongoDB Atlas получите новую строку подключения:

1. Откройте MongoDB Atlas
2. Database → Connect → Drivers
3. Выберите **Driver: Node.js**, **Version: 5.5 or later**
4. Скопируйте строку подключения

Она должна выглядеть так:
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Шаг 2: Обновите переменную в Render

1. Откройте ваш сервис в Render
2. Перейдите в **Environment**
3. Найдите переменную `MONGODB_URI`
4. Обновите значение на новую строку (не забудьте заменить `<password>`)
5. Нажмите **Save Changes**

Render автоматически перезапустит сервис.

### Шаг 3: Проверьте Network Access в MongoDB Atlas

1. В MongoDB Atlas перейдите в **Security** → **Network Access**
2. Убедитесь что есть правило **0.0.0.0/0** (Allow access from anywhere)
3. Если нет - добавьте его

### Шаг 4: Загрузите обновленный код

```bash
git add .
git commit -m "Fix MongoDB SSL connection"
git push
```

---

## Альтернативное решение

Если проблема сохраняется, попробуйте использовать старую версию MongoDB драйвера:

В `package.json` измените:
```json
"mongodb": "^5.9.0"
```

Вместо:
```json
"mongodb": "^6.3.0"
```

Затем:
```bash
git add package.json
git commit -m "Downgrade MongoDB driver"
git push
```
