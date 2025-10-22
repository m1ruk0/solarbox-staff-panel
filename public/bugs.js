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

// Отправка бага
async function submitBug(event) {
    event.preventDefault();
    
    const bugData = {
        discord: document.getElementById('discord').value.trim(),
        minecraft: document.getElementById('minecraft').value.trim() || null,
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        priority: document.getElementById('priority').value
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
}
