# 🔐 Настройка бесплатной подписи для SolarBox

## Вариант 1: Самоподписанный сертификат (БЕСПЛАТНО)

### Шаг 1: Создайте сертификат

Запустите PowerShell **от администратора** и выполните:

```powershell
cd C:\Users\Admin\CascadeProjects\windsurf-project
.\create-cert.ps1
```

Это создаст файл `solarbox-cert.pfx` с паролем `solarbox2025`

### Шаг 2: Обновите package.json

Файл уже настроен! Но если нужно, добавьте:

```json
"win": {
  "certificateFile": "solarbox-cert.pfx",
  "certificatePassword": "solarbox2025",
  "verifyUpdateCodeSignature": false,
  "sign": "./solarbox-cert.pfx",
  "signingHashAlgorithms": ["sha256"]
}
```

### Шаг 3: Соберите приложение

```bash
npm run build
```

Теперь `.exe` файл будет подписан!

---

## Вариант 2: Без подписи (текущий вариант)

Оставьте как есть:

```json
"win": {
  "verifyUpdateCodeSignature": false
}
```

**Плюсы:**
- ✅ Бесплатно
- ✅ Работает сразу
- ✅ Подходит для тестирования

**Минусы:**
- ⚠️ Windows SmartScreen будет показывать предупреждение
- ⚠️ Пользователи увидят "Неизвестный издатель"

---

## Вариант 3: Платный сертификат (для production)

Если хотите профессиональную подпись:

1. **Купите сертификат** (~$100-300/год):
   - [DigiCert](https://www.digicert.com/code-signing)
   - [Sectigo](https://sectigo.com/ssl-certificates-tls/code-signing)
   - [GlobalSign](https://www.globalsign.com/en/code-signing-certificate)

2. **Получите .pfx файл**

3. **Добавьте в package.json:**
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "your_password",
     "verifyUpdateCodeSignature": true
   }
   ```

---

## 🎯 Рекомендация для вас:

**Для тестирования:** Оставьте `verifyUpdateCodeSignature: false` (как сейчас)

**Для релиза:** Используйте самоподписанный сертификат (Вариант 1)

**Для коммерции:** Купите платный сертификат (Вариант 3)

---

## 📝 Текущая настройка:

Сейчас у вас `verifyUpdateCodeSignature: false` - это **идеально для тестирования**!

Автообновления работают, подпись не требуется. ✅
