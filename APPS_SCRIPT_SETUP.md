# 🚀 Настройка Google Apps Script для заявок

## Шаг 1: Откройте Google Sheets

1. Откройте вашу таблицу с заявками
2. **Extensions** → **Apps Script**

## Шаг 2: Создайте скрипт

1. Удалите весь код в редакторе
2. Скопируйте код из файла `google-apps-script-applications.js`
3. Вставьте в редактор
4. Нажмите **💾 Save** (Ctrl+S)
5. Назовите проект: `Applications API`

## Шаг 3: Деплой как Web App

1. Нажмите **Deploy** → **New deployment**
2. Нажмите на **⚙️ шестеренку** → выберите **Web app**
3. Настройки:
   - **Description:** `Applications API`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Нажмите **Deploy**
5. **Authorize access** (разрешите доступ)
6. Скопируйте **Web app URL** (например: `https://script.google.com/macros/s/AKfycby.../exec`)

## Шаг 4: Обновите API URL в панели

Откройте файл `public/applications.js` и измените `API_URL`:

```javascript
const API_URL = 'https://script.google.com/macros/s/ВАШ_ID/exec';
```

## Шаг 5: Обновите методы API

В `public/applications.js` замените методы:

### Загрузка заявок:
```javascript
async function loadApplications() {
    try {
        const response = await fetch(`${API_URL}?action=getApplications`);
        const data = await response.json();
        
        if (data.success) {
            allApplications = data.data;
            renderApplications(allApplications);
            updateStats();
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}
```

### Одобрение заявки:
```javascript
async function approveApplication() {
    if (!currentApplication) return;
    
    const position = document.getElementById('positionSelect').value;
    const comment = document.getElementById('decisionComment').value.trim();
    
    if (!position) {
        showToast('Выберите должность!', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'approve',
                rowId: currentApplication.id,
                position: position,
                comment: comment
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Заявка одобрена!');
            closeDecisionModal();
            loadApplications();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения', 'error');
    }
}
```

### Отклонение заявки:
```javascript
async function rejectApplication() {
    if (!currentApplication) return;
    
    const comment = document.getElementById('decisionComment').value.trim();
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'reject',
                rowId: currentApplication.id,
                comment: comment
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Заявка отклонена', 'error');
            closeDecisionModal();
            loadApplications();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения', 'error');
    }
}
```

## Шаг 6: Загрузите на Render

```bash
git add .
git commit -m "Switch to Google Apps Script for applications"
git push
```

---

## ✅ Готово!

Теперь заявки работают через Google Apps Script - это 100% надежно!

**Преимущества:**
- ✅ Не нужны credentials
- ✅ Работает всегда
- ✅ Прямой доступ к таблице
- ✅ Никаких проблем с подключением

---

## 🔍 Тестирование:

Откройте в браузере:
```
https://ваш-apps-script-url/exec?action=getApplications
```

Должны увидеть JSON с заявками!
