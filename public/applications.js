// API URL - работает и в браузере и в Electron
const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

let allApplications = [];
let currentApplication = null;
let currentUser = null;

// Проверка авторизации
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(userStr);
    console.log('Текущий пользователь:', currentUser);
    
    // Показываем информацию о пользователе
    const userInfoEl = document.getElementById('currentUserInfo');
    const userNameEl = document.getElementById('currentUserName');
    if (userInfoEl && userNameEl && currentUser) {
        userNameEl.textContent = currentUser.discord || 'Неизвестно';
        userInfoEl.style.display = 'block';
    }
    
    return true;
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
    
    // Автоматическое удаление через 4 секунды
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Загрузка заявок при старте
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadApplications();
    }
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
    const pending = allApplications.filter(a => 
        a.status === 'pending' || 
        a.status === 'На рассмотрении'
    ).length;
    const approved = allApplications.filter(a => 
        a.status === 'approved' || 
        a.status === 'Принята'
    ).length;
    const rejected = allApplications.filter(a => 
        a.status === 'rejected' || 
        a.status === 'Отклонена'
    ).length;
    
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
        const aPending = a.status === 'pending' || a.status === 'На рассмотрении';
        const bPending = b.status === 'pending' || b.status === 'На рассмотрении';
        
        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;
        return new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp);
    });
    
    const html = `
        <div class="space-y-4">
            ${sorted.map(app => {
                const isPending = app.status === 'pending' || app.status === 'На рассмотрении';
                const isApproved = app.status === 'approved' || app.status === 'Принята';
                const isRejected = app.status === 'rejected' || app.status === 'Отклонена';
                
                return `
                <div class="bg-white rounded-xl p-6 shadow-md border-l-4 ${
                    isPending ? 'border-yellow-500' :
                    isApproved ? 'border-green-500' :
                    'border-red-500'
                }">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-2xl font-bold text-gray-900">
                                    <i class="fas fa-gamepad text-green-600 mr-2"></i>
                                    ${app.minecraft || 'Неизвестно'}
                                </h3>
                                <span class="badge ${
                                    isPending ? 'bg-yellow-100 text-yellow-800' :
                                    isApproved ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }">
                                    ${isPending ? '⏳ На рассмотрении' :
                                      isApproved ? '✅ Принята' :
                                      '❌ Отклонена'}
                                </span>
                                ${app.position ? `<span class="badge bg-indigo-100 text-indigo-800">
                                    <i class="fas fa-briefcase mr-1"></i>${app.position}
                                </span>` : ''}
                            </div>
                            <p class="text-gray-500 text-sm mb-3">
                                <i class="fab fa-discord text-indigo-500 mr-2"></i>
                                ${app.discord || 'Неизвестно'}
                            </p>
                            ${app.age ? `<p class="text-gray-500 text-sm mb-3">
                                <i class="fas fa-calendar text-blue-500 mr-2"></i>
                                Возраст: ${app.age} лет
                            </p>` : ''}
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date(app.created_at || app.timestamp).toLocaleString('ru-RU')}
                        </div>
                    </div>
                    
                    ${app.experience ? `
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 class="font-bold text-gray-800 mb-3">📋 Ответы на вопросы:</h4>
                        <div class="whitespace-pre-wrap text-gray-700">${app.experience}</div>
                    </div>
                    ` : ''}
                    
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
                    
                    ${isPending ? `
                        <div class="flex gap-3">
                            <button onclick="openDecisionModal('${app.id}')" class="btn btn-primary flex-1">
                                <i class="fas fa-gavel mr-2"></i>
                                Принять решение
                            </button>
                        </div>
                    ` : ''}
                </div>
            `}).join('')}
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
        // Используем текущего пользователя
        const moderator = currentUser ? currentUser.discord : 'Неизвестный';
        
        console.log('Отправка данных:', { position, comment, moderator });
        
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
        // Используем текущего пользователя
        const moderator = currentUser ? currentUser.discord : 'Неизвестный';
        
        console.log('Отправка данных отклонения:', { comment, moderator });
        
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
