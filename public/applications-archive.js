// API URL
const API_URL = window.location.origin + '/api';

let allArchive = [];
let currentFilter = 'all';

// Проверка авторизации
const userDiscord = localStorage.getItem('userDiscord');
const userPosition = localStorage.getItem('userPosition');

if (!userDiscord) {
    window.location.href = 'login.html';
}

// Отображение информации о пользователе
document.getElementById('userInfo').textContent = `${userDiscord} (${userPosition})`;

// Показать логи только для OWNER
if (userPosition === 'OWNER') {
    document.getElementById('logsLink').classList.remove('hidden');
}

// Toast уведомления
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Загрузка архива
document.addEventListener('DOMContentLoaded', () => {
    loadArchive();
});

async function loadArchive() {
    try {
        const response = await fetch(`${API_URL}/applications`);
        const data = await response.json();
        
        if (data.success) {
            // Фильтруем только обработанные заявки
            allArchive = data.data.filter(app => 
                app.status === 'Принята' || app.status === 'Отклонена' ||
                app.status === 'approved' || app.status === 'rejected'
            );
            
            renderArchive(allArchive);
            updateStats();
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showToast('Ошибка загрузки архива', 'error');
    }
}

// Обновление статистики
function updateStats() {
    const approved = allArchive.filter(a => 
        a.status === 'Принята' || a.status === 'approved'
    ).length;
    const rejected = allArchive.filter(a => 
        a.status === 'Отклонена' || a.status === 'rejected'
    ).length;
    
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
}

// Фильтрация
function filterApplications(filter) {
    currentFilter = filter;
    
    // Обновляем кнопки
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    // Фильтруем данные
    let filtered = allArchive;
    if (filter !== 'all') {
        filtered = allArchive.filter(app => app.status === filter);
    }
    
    renderArchive(filtered);
}

// Отрисовка архива
function renderArchive(archive) {
    const container = document.getElementById('archiveList');
    const noData = document.getElementById('noData');
    
    if (archive.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    // Сортируем по дате (новые сверху)
    const sorted = [...archive].sort((a, b) => {
        const dateA = a.allFields?.['Дата обработки'] || a.timestamp;
        const dateB = b.allFields?.['Дата обработки'] || b.timestamp;
        return new Date(dateB) - new Date(dateA);
    });
    
    const html = sorted.map(app => {
        const isApproved = app.status === 'Принята' || app.status === 'approved';
        const statusColor = isApproved ? 'green' : 'red';
        const statusIcon = isApproved ? 'check-circle' : 'times-circle';
        const statusText = isApproved ? 'Принята' : 'Отклонена';
        
        return `
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border-l-4 border-${statusColor}-500">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-${statusColor}-500/20 p-3 rounded-full">
                            <i class="fas fa-${statusIcon} text-2xl text-${statusColor}-400"></i>
                        </div>
                        <div>
                        <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-gamepad text-green-400"></i>
                            ${app.minecraft || app.allFields?.['Minecraft никнейм'] || 'Неизвестно'}
                        </h3>
                        <p class="text-white/60 text-sm flex items-center gap-2 mt-1">
                            <i class="fab fa-discord text-indigo-400"></i>
                            ${app.discord || app.allFields?.['Discord'] || 'Неизвестно'}
                        </p>
                    </div>
                    </div>
                    <span class="px-4 py-2 rounded-full text-sm font-semibold bg-${statusColor}-500/20 text-${statusColor}-400">
                        ${statusText}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    ${Object.entries(app.allFields || {}).map(([key, value]) => `
                        <div>
                            <p class="text-white/60 text-sm">${key}</p>
                            <p class="text-white">${value}</p>
                        </div>
                    `).join('')}
                </div>
                
                ${app.position ? `
                    <div class="bg-white/5 rounded-lg p-3 mb-3">
                        <p class="text-white/60 text-sm">Должность</p>
                        <p class="text-white font-semibold">${app.position}</p>
                    </div>
                ` : ''}
                
                ${app.comment ? `
                    <div class="bg-white/5 rounded-lg p-3 mb-3">
                        <p class="text-white/60 text-sm">Комментарий</p>
                        <p class="text-white">${app.comment}</p>
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between text-sm text-white/60 pt-3 border-t border-white/10">
                    <span><i class="fas fa-user mr-2"></i>Модератор: ${app.allFields?.['Модератор'] || 'Неизвестно'}</span>
                    <span><i class="fas fa-clock mr-2"></i>${app.allFields?.['Дата обработки'] || app.timestamp}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Выход
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
