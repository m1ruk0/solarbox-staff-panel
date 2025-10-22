# 📡 API Примеры - Система отчетов

## Базовый URL
```
http://localhost:4000/api
```

---

## 1. Создание отчета

### POST `/api/reports`

**Описание**: Создать новый отчет о нарушении

**Body**:
```json
{
  "author": "m1ruk0",
  "reportType": "ban",
  "playerNickname": "Cheater123",
  "reason": "Использование читов",
  "description": "Игрок использовал fly и killaura на сервере. Есть доказательства в виде скриншотов.",
  "screenshots": [
    "https://i.imgur.com/example1.png",
    "https://i.imgur.com/example2.png"
  ]
}
```

**Ответ (успех)**:
```json
{
  "success": true,
  "message": "Отчет успешно отправлен!",
  "data": {
    "id": 1,
    "author": "m1ruk0",
    "author_position": "OWNER",
    "report_type": "ban",
    "player_nickname": "Cheater123",
    "reason": "Использование читов",
    "description": "Игрок использовал fly и killaura...",
    "screenshots": ["https://i.imgur.com/example1.png", "https://i.imgur.com/example2.png"],
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "author": "m1ruk0",
    "reportType": "ban",
    "playerNickname": "Cheater123",
    "reason": "Использование читов",
    "description": "Игрок использовал fly и killaura",
    "screenshots": ["https://i.imgur.com/example1.png"]
  }'
```

---

## 2. Получить свои отчеты

### GET `/api/reports/my?author={discord_nickname}`

**Описание**: Получить все отчеты конкретного автора

**Параметры**:
- `author` (обязательно) - Discord ник автора

**Пример запроса**:
```
GET /api/reports/my?author=m1ruk0
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "author": "m1ruk0",
      "author_position": "OWNER",
      "report_type": "ban",
      "player_nickname": "Cheater123",
      "reason": "Использование читов",
      "description": "Игрок использовал fly и killaura",
      "screenshots": ["https://i.imgur.com/example1.png"],
      "status": "approved",
      "reviewer": "admin_user",
      "reviewer_position": "ADMIN",
      "review_comment": "Отчет одобрен, игрок забанен",
      "reviewed_at": "2024-01-15T11:00:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL**:
```bash
curl http://localhost:4000/api/reports/my?author=m1ruk0
```

---

## 3. Получить все отчеты (для модераторов)

### GET `/api/reports?discord={discord_nickname}`

**Описание**: Получить все отчеты (требуется ZAM.CURATOR или выше)

**Параметры**:
- `discord` (обязательно) - Discord ник модератора для проверки прав

**Пример запроса**:
```
GET /api/reports?discord=admin_user
```

**Ответ**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "author": "m1ruk0",
      "author_position": "OWNER",
      "report_type": "ban",
      "player_nickname": "Cheater123",
      "reason": "Использование читов",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "author": "moderator1",
      "author_position": "MODER",
      "report_type": "mute",
      "player_nickname": "Spammer456",
      "reason": "Спам в чате",
      "status": "approved",
      "created_at": "2024-01-15T09:15:00.000Z"
    }
  ]
}
```

**Ошибка (недостаточно прав)**:
```json
{
  "success": false,
  "error": "Доступ только для ZAM.CURATOR и выше"
}
```

**cURL**:
```bash
curl http://localhost:4000/api/reports?discord=admin_user
```

---

## 4. Получить отчет по ID

### GET `/api/reports/:id`

**Описание**: Получить конкретный отчет по ID

**Пример запроса**:
```
GET /api/reports/1
```

**Ответ**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "author": "m1ruk0",
    "author_position": "OWNER",
    "report_type": "ban",
    "player_nickname": "Cheater123",
    "reason": "Использование читов",
    "description": "Игрок использовал fly и killaura",
    "screenshots": ["https://i.imgur.com/example1.png"],
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL**:
```bash
curl http://localhost:4000/api/reports/1
```

---

## 5. Одобрить отчет

### POST `/api/reports/:id/approve`

**Описание**: Одобрить отчет (требуется ZAM.CURATOR или выше)

**Body**:
```json
{
  "reviewer": "admin_user",
  "comment": "Отчет одобрен, игрок забанен на 30 дней"
}
```

**Ответ**:
```json
{
  "success": true,
  "message": "Отчет одобрен",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewer": "admin_user",
    "reviewer_position": "ADMIN",
    "review_comment": "Отчет одобрен, игрок забанен на 30 дней",
    "reviewed_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:4000/api/reports/1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer": "admin_user",
    "comment": "Отчет одобрен, игрок забанен на 30 дней"
  }'
```

---

## 6. Отклонить отчет

### POST `/api/reports/:id/reject`

**Описание**: Отклонить отчет (требуется ZAM.CURATOR или выше)

**Body**:
```json
{
  "reviewer": "admin_user",
  "comment": "Недостаточно доказательств, нужны дополнительные скриншоты"
}
```

**Ответ**:
```json
{
  "success": true,
  "message": "Отчет отклонен",
  "data": {
    "id": 1,
    "status": "rejected",
    "reviewer": "admin_user",
    "reviewer_position": "ADMIN",
    "review_comment": "Недостаточно доказательств, нужны дополнительные скриншоты",
    "reviewed_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:4000/api/reports/1/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer": "admin_user",
    "comment": "Недостаточно доказательств"
  }'
```

---

## 7. Получить статистику

### GET `/api/reports/stats`

**Описание**: Получить общую статистику по отчетам

**Пример запроса**:
```
GET /api/reports/stats
```

**Ответ**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 25,
    "approved": 100,
    "rejected": 25
  }
}
```

**cURL**:
```bash
curl http://localhost:4000/api/reports/stats
```

---

## 📊 Типы отчетов (report_type)

- `ban` - Бан игрока
- `mute` - Мут игрока
- `warn` - Варн игрока
- `kick` - Кик игрока
- `other` - Другое нарушение

## 🔐 Статусы отчетов (status)

- `pending` - На рассмотрении
- `approved` - Одобрен
- `rejected` - Отклонен

## ⚠️ Коды ошибок

- `400` - Неверные параметры запроса
- `403` - Недостаточно прав доступа
- `404` - Отчет не найден
- `500` - Внутренняя ошибка сервера

## 🔑 Требования к правам

| Endpoint | Требуемая должность |
|----------|---------------------|
| POST /api/reports | Любой сотрудник |
| GET /api/reports/my | Любой сотрудник |
| GET /api/reports | ZAM.CURATOR+ |
| GET /api/reports/:id | Любой сотрудник |
| POST /api/reports/:id/approve | ZAM.CURATOR+ |
| POST /api/reports/:id/reject | ZAM.CURATOR+ |
| GET /api/reports/stats | Любой сотрудник |

---

## 🧪 Полный пример использования

```bash
# 1. Создать отчет
REPORT_ID=$(curl -s -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "author": "test_user",
    "reportType": "ban",
    "playerNickname": "Cheater123",
    "reason": "Читы",
    "description": "Использование fly",
    "screenshots": ["https://example.com/screenshot.png"]
  }' | jq -r '.data.id')

echo "Создан отчет с ID: $REPORT_ID"

# 2. Получить отчет
curl http://localhost:4000/api/reports/$REPORT_ID

# 3. Одобрить отчет
curl -X POST http://localhost:4000/api/reports/$REPORT_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reviewer": "admin_user",
    "comment": "Отчет одобрен"
  }'

# 4. Проверить статус
curl http://localhost:4000/api/reports/my?author=test_user
```

---

**Документация**: `REPORTS_SYSTEM.md`
