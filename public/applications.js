// API URL
const API_URL = window.location.origin + '/api';

let allApplications = [];
let currentApplication = null;

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
    
    // Автоматическое удаление через 4 секунды
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Загрузка заявок при старте
document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
});

// Загрузка заявок
async function loadApplications() {
    try {
        const response = await fetch(`${API_URL}/applications`);
        const data = await response.json();
        
        if (data.success) {
            allApplications = data.data;
            renderApplications(allApplications);
            updateStats();
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('loading').innerHTML = `
            <i class="fas fa-exclamation-circle text-4xl text-red-600"></i>
            <p class="text-red-600 mt-4">Ошибка подключения к серверу</p>
        `;
    }
}

// Обновление статистики
function updateStats() {
    const total = allApplications.length;
    const pending = allApplications.filter(a => a.status === 'pending').length;
    const approved = allApplications.filter(a => a.status === 'approved').length;
    const rejected = allApplications.filter(a => a.status === 'rejected').length;
    
    document.getElementById('totalApps').textContent = total;
    document.getElementById('pendingApps').textContent = pending;
    document.getElementById('approvedApps').textContent = approved;
    document.getElementById('rejectedApps').textContent = rejected;
}

// Отрисовка заявок
function renderApplications(applications) {
    const container = document.getElementById('applicationsTable');
    const noData = document.getElementById('noData');
    
    if (applications.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    // Сортируем: сначала pending, потом остальные
    const sorted = [...applications].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    const html = `
        <div class="space-y-4">
            ${sorted.map(app => `
                <div class="bg-white rounded-xl p-6 shadow-md border-l-4 ${
                    app.status === 'pending' ? 'border-yellow-500' :
                    app.status === 'approved' ? 'border-green-500' :
                    'border-red-500'
                }">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-2xl font-bold text-gray-900">
                                    <i class="fas fa-gamepad text-green-600 mr-2"></i>
                                    ${app.minecraft || app.allFields['Minecraft никнейм'] || 'Неизвестно'}
                                </h3>
                                <span class="badge ${
                                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }">
                                    ${app.status === 'pending' ? '⏳ Ожидает' :
                                      app.status === 'approved' ? '✅ Одобрено' :
                                      '❌ Отклонено'}
                                </span>
                            </div>
                            <p class="text-gray-500 text-sm mb-3">
                                <i class="fab fa-discord text-indigo-500 mr-2"></i>
                                ${app.discord || app.allFields['Discord'] || 'Неизвестно'}
                            </p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date(app.timestamp).toLocaleString('ru-RU')}
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 class="font-bold text-gray-800 mb-3">📋 Полная информация из анкеты:</h4>
                        <div class="space-y-2">
                            ${Object.entries(app.allFields || {}).map(([key, value]) => `
                                <div class="border-b border-gray-200 pb-2">
                                    <p class="text-sm text-gray-600 font-semibold">${key}:</p>
                                    <p class="text-gray-800">${value}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${app.status === 'approved' && app.position ? `
                        <div class="bg-green-50 p-3 rounded-lg mb-4">
                            <p class="text-green-800">
                                <i class="fas fa-briefcase mr-2"></i>
                                <strong>Назначена должность:</strong> ${app.position}
                            </p>
                        </div>
                    ` : ''}
                    
                    ${app.comment ? `
                        <div class="bg-gray-50 p-3 rounded-lg mb-4">
                            <p class="text-gray-700 mb-1"><strong>Комментарий:</strong></p>
                            <p class="text-gray-800">${app.comment}</p>
                        </div>
                    ` : ''}
                    
                    ${app.status === 'pending' ? `
                        <div class="flex gap-3">
                            <button onclick="openDecisionModal('${app.id}')" class="btn btn-primary flex-1">
                                <i class="fas fa-gavel mr-2"></i>
                                Принять решение
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

// Открыть модальное окно решения
function openDecisionModal(applicationId) {
    currentApplication = allApplications.find(a => a.id === applicationId);
    
    if (!currentApplication) return;
    
    // Показываем только основную информацию
    document.getElementById('modalDiscord').textContent = currentApplication.discord || 'Не указан';
    document.getElementById('modalMinecraft').textContent = currentApplication.minecraft || 'Не указан';
    
    document.getElementById('positionSelect').value = '';
    document.getElementById('decisionComment').value = '';
    
    document.getElementById('decisionModal').classList.add('active');
}

// Закрыть модальное окно
function closeDecisionModal() {
    document.getElementById('decisionModal').classList.remove('active');
    currentApplication = null;
}

// Одобрить заявку
async function approveApplication() {
    if (!currentApplication) return;
    
    const position = document.getElementById('positionSelect').value;
    const comment = document.getElementById('decisionComment').value.trim();
    
    if (!position) {
        showToast('Выберите должность!', 'error');
        return;
    }
    
    console.log('Принятие заявки:', {
        id: currentApplication.id,
        position,
        comment,
        discord: currentApplication.discord,
        minecraft: currentApplication.minecraft
    });
    
    try {
        // Получаем Discord модератора из localStorage
        const userStr = localStorage.getItem('user');
        const moderator = userStr ? JSON.parse(userStr).discord : 'Неизвестный';
        
        const response = await fetch(`${API_URL}/applications/${currentApplication.id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position, comment, moderator })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Заявка одобрена! Сотрудник добавлен в базу.');
            closeDecisionModal();
            loadApplications();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Отклонить заявку
async function rejectApplication() {
    if (!currentApplication) return;
    
    const comment = document.getElementById('decisionComment').value.trim();
    
    try {
        // Получаем Discord модератора из localStorage
        const userStr = localStorage.getItem('user');
        const moderator = userStr ? JSON.parse(userStr).discord : 'Неизвестный';
        
        const response = await fetch(`${API_URL}/applications/${currentApplication.id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment, moderator })
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
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}
