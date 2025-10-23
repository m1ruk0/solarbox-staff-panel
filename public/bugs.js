// API URL
const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

// Проверка авторизации (опционально для отправки багов)
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Показываем кнопку истории багов для админов
if (user && user.position) {
    const adminPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (adminPositions.includes(user.position)) {
        const adminBtn = document.getElementById('adminBugsBtn');
        if (adminBtn) adminBtn.style.display = 'block';
    }
}

// Toast уведомления
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

let screenshots = [];

// Обработка загрузки файлов
function handleFileUpload(event) {
    const files = event.target.files;
    
    if (files.length === 0) return;
    
    showToast(`Загрузка ${files.length} файл(ов)...`, 'info');
    
    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            showToast(`Файл ${file.name} не является изображением`, 'error');
            continue;
        }
        
        // Проверка размера (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast(`Файл ${file.name} слишком большой! Максимум 2MB`, 'error');
            continue;
        }
        
        // Конвертируем в base64
        const reader = new FileReader();
        reader.onload = (e) => {
            screenshots.push({
                name: file.name,
                data: e.target.result
            });
            updateScreenshotPreview();
        };
        reader.readAsDataURL(file);
    }
    
    setTimeout(() => {
        showToast(`${files.length} скриншот(ов) загружено`, 'success');
    }, 500);
}

// Обновление превью скриншотов
function updateScreenshotPreview() {
    const preview = document.getElementById('screenshotPreview');
    
    if (screenshots.length === 0) {
        preview.innerHTML = '';
        return;
    }
    
    preview.innerHTML = screenshots.map((screenshot, index) => `
        <div class="relative group">
            <img src="${screenshot.data}" alt="${screenshot.name}" 
                 class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all cursor-pointer"
                 onclick="openImageModal(this.src)">
            <button type="button" onclick="removeScreenshot(${index})" 
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                <i class="fas fa-times"></i>
            </button>
            <p class="text-xs text-gray-500 mt-1 truncate">${screenshot.name}</p>
        </div>
    `).join('');
}

// Удалить скриншот
function removeScreenshot(index) {
    screenshots.splice(index, 1);
    updateScreenshotPreview();
    showToast('Скриншот удален', 'info');
}

// Открытие изображения в полном размере
function openImageModal(src) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;';
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';
    
    modal.appendChild(img);
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
}

// Отправка бага
async function submitBug(event) {
    event.preventDefault();
    
    const bugData = {
        discord: document.getElementById('discord').value.trim(),
        minecraft: document.getElementById('minecraft').value.trim() || null,
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        priority: document.getElementById('priority').value,
        screenshot: screenshots.length > 0 ? screenshots[0].data : null, // Первый скриншот для совместимости
        screenshots: screenshots.map(s => s.data) // Все скриншоты
    };
    
    if (!bugData.discord || !bugData.title || !bugData.description) {
        showToast('Заполните все обязательные поля!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/bugs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bugData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Баг отправлен! Спасибо за помощь!', 'success');
            resetForm();
        } else {
            showToast(data.error || 'Ошибка отправки бага', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Очистка формы
function resetForm() {
    document.getElementById('bugForm').reset();
    screenshots = [];
    updateScreenshotPreview();
}
