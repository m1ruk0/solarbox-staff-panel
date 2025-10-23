// API URL - работает и в браузере и в Electron
const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

let allStaff = [];
let currentUser = null;

// Проверка авторизации
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(userStr);
    
    // Показываем информацию о пользователе
    updateUserInfo();
    
    return true;
}

// Получить красивый бейдж роли
function getRoleBadge(position) {
    const roleIcons = {
        'OWNER': 'fa-crown',
        'RAZRAB': 'fa-code',
        'TEX.ADMIN': 'fa-server',
        'ADMIN': 'fa-shield-halved',
        'CURATOR': 'fa-user-tie',
        'ZAM.CURATOR': 'fa-user-check',
        'GL.STAFF': 'fa-star',
        'MODER': 'fa-gavel',
        'CT.HELPER': 'fa-hands-helping',
        'HELPER': 'fa-hand-holding-heart'
    };
    
    const roleClasses = {
        'OWNER': 'role-owner',
        'RAZRAB': 'role-razrab',
        'TEX.ADMIN': 'role-tex-admin',
        'ADMIN': 'role-admin',
        'CURATOR': 'role-curator',
        'ZAM.CURATOR': 'role-zam-curator',
        'GL.STAFF': 'role-gl-staff',
        'MODER': 'role-moder',
        'CT.HELPER': 'role-ct-helper',
        'HELPER': 'role-helper'
    };
    
    const icon = roleIcons[position] || 'fa-user';
    const roleClass = roleClasses[position] || 'role-helper';
    
    return `<span class="role-badge ${roleClass}"><i class="fas ${icon}"></i>${position}</span>`;
}

// Обновление информации о пользователе
function updateUserInfo() {
    const userInfoHTML = `
        <div class="user-info-card glass-card mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-2">Вы вошли как:</p>
                    <p class="text-lg font-bold text-gray-800 mb-2">${currentUser.discord}</p>
                    ${getRoleBadge(currentUser.position)}
                </div>
                <button onclick="logout()" class="btn btn-secondary btn-sm">
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Выйти
                </button>
            </div>
        </div>
    `;
    
    const container = document.querySelector('.header-card');
    if (container) {
        container.insertAdjacentHTML('afterend', userInfoHTML);
    }
    
    // Показываем кнопки только для OWNER
    if (currentUser.position === 'OWNER') {
        const adminBtn = document.getElementById('adminPasswordsBtn');
        if (adminBtn) {
            adminBtn.style.display = 'inline-flex';
        }
        const logsBtn = document.getElementById('logsBtn');
        if (logsBtn) {
            logsBtn.style.display = 'inline-flex';
        }
    }
}

// Выход
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
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

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        if (document.getElementById('staffTable')) {
            loadStaff();
            loadStats();
            updatePositionSelects();
        }
    }
});

// Обновление списков должностей в зависимости от прав
function updatePositionSelects() {
    if (!currentUser || !currentUser.permissions) return;
    
    const availablePositions = currentUser.permissions.availablePositions || [];
    
    const roleEmojis = {
        'OWNER': '👑',
        'RAZRAB': '💻',
        'TEX.ADMIN': '🖥️',
        'ADMIN': '🛡️',
        'CURATOR': '👔',
        'ZAM.CURATOR': '✅',
        'GL.STAFF': '⭐',
        'MODER': '⚖️',
        'CT.HELPER': '🤝',
        'HELPER': '❤️'
    };
    
    // Обновляем select в модальном окне должности
    const positionSelect = document.getElementById('newPositionSelect');
    if (positionSelect) {
        positionSelect.innerHTML = '<option value="">📋 Выберите должность</option>';
        availablePositions.forEach(pos => {
            const emoji = roleEmojis[pos] || '👤';
            positionSelect.innerHTML += `<option value="${pos}">${emoji} ${pos}</option>`;
        });
    }
    
    // Обновляем select при добавлении сотрудника
    const newPositionSelect = document.getElementById('newPosition');
    if (newPositionSelect) {
        newPositionSelect.innerHTML = '<option value="">📋 Выберите должность</option>';
        availablePositions.forEach(pos => {
            const emoji = roleEmojis[pos] || '👤';
            newPositionSelect.innerHTML += `<option value="${pos}">${emoji} ${pos}</option>`;
        });
    }
}

// Загрузка персонала
async function loadStaff() {
    try {
        const response = await fetch(`${API_URL}/staff`);
        const data = await response.json();
        
        if (data.success) {
            allStaff = data.data;
            renderStaff(allStaff);
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <i class="fas fa-exclamation-circle text-4xl text-red-600"></i>
                <p class="text-red-600 mt-4">Ошибка подключения к серверу</p>
                <p class="text-gray-600 text-sm mt-2">Убедитесь что API сервер запущен</p>
            `;
        }
    }
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        
        if (data.success) {
            const totalStaff = document.getElementById('totalStaff');
            const activeStaff = document.getElementById('activeStaff');
            const vacationStaff = document.getElementById('vacationStaff');
            const warnedStaff = document.getElementById('warnedStaff');
            
            if (totalStaff) totalStaff.textContent = data.data.total;
            if (activeStaff) activeStaff.textContent = data.data.active;
            if (vacationStaff) vacationStaff.textContent = data.data.vacation;
            if (warnedStaff) warnedStaff.textContent = data.data.warned;
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Отрисовка персонала
function renderStaff(staff) {
    const container = document.getElementById('staffTable');
    const noData = document.getElementById('noData');
    
    if (staff.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    const html = `
        <div class="staff-grid">
            ${staff.map(member => `
                <div class="staff-card">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <i class="fas fa-gamepad text-green-600"></i>
                                ${member.minecraft}
                            </h3>
                            <p class="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                <i class="fab fa-discord text-indigo-500"></i>
                                ${member.discord}
                            </p>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            ${getRoleBadge(member.position)}
                            <span class="badge status-${member.status === 'Активен' ? 'active' : member.status === 'ЧСП' ? 'blacklist' : 'fired'}">
                                ${member.status}
                            </span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 text-sm text-gray-600 mb-3">
                        <div class="flex items-center">
                            <i class="fas fa-coins w-5 text-yellow-500"></i>
                            <span>Солярики: <strong class="text-yellow-600">☀️ ${member.solariki || 0}</strong></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-triangle w-5 ${member.warns > 0 ? 'text-red-600' : 'text-gray-400'}"></i>
                            <span>Варны: <strong class="${member.warns >= 2 ? 'text-red-600' : ''}">${member.warns}/3</strong></span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-calendar w-5 text-gray-400"></i>
                            <span>Дата найма: ${member.hireDate}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-umbrella-beach w-5 ${member.vacation === 'Да' ? 'text-yellow-600' : 'text-gray-400'}"></i>
                            <span>Отпуск: ${member.vacation}</span>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        ${member.status === 'Уволен' ? `
                            <button onclick="restoreStaff('${member.discord}')" class="btn btn-success btn-sm">
                                <i class="fas fa-user-check mr-1"></i> Восстановить
                            </button>
                            <button onclick="deleteStaffPermanently('${member.discord}')" class="btn btn-danger btn-sm">
                                <i class="fas fa-trash mr-1"></i> Удалить навсегда
                            </button>
                        ` : `
                            <button onclick="manageSolariki('${member.discord}')" class="btn btn-warning btn-sm">
                                <i class="fas fa-coins mr-1"></i> Солярики
                            </button>
                            <button onclick="changePosition('${member.discord}')" class="btn btn-primary btn-sm">
                                <i class="fas fa-arrow-up mr-1"></i> Должность
                            </button>
                            <button onclick="addWarn('${member.discord}')" class="btn btn-warning btn-sm">
                                <i class="fas fa-exclamation mr-1"></i> Варн
                            </button>
                            <button onclick="removeWarn('${member.discord}')" class="btn btn-success btn-sm">
                                <i class="fas fa-check mr-1"></i> Снять
                            </button>
                            <button onclick="openVacationModal('${member.discord}')" class="btn btn-secondary btn-sm">
                                <i class="fas fa-umbrella-beach mr-1"></i> Отпуск
                            </button>
                            <button onclick="fireStaff('${member.discord}')" class="btn btn-danger btn-sm">
                                <i class="fas fa-user-times mr-1"></i> Уволить
                            </button>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    container.innerHTML = html;
}

// Фильтрация
function filterStaff() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const position = document.getElementById('positionFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filtered = allStaff;
    
    if (search) {
        filtered = filtered.filter(s => s.discord.toLowerCase().includes(search));
    }
    
    if (position) {
        filtered = filtered.filter(s => s.position === position);
    }
    
    if (status) {
        filtered = filtered.filter(s => s.status === status);
    }
    
    renderStaff(filtered);
}

// Модальные окна
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('newDiscord').value = '';
    document.getElementById('newMinecraft').value = '';
    document.getElementById('newPosition').value = '';
}

// Добавить сотрудника
async function addStaff() {
    const discord = document.getElementById('newDiscord').value.trim();
    const minecraft = document.getElementById('newMinecraft').value.trim();
    const position = document.getElementById('newPosition').value;
    
    if (!discord || !minecraft || !position) {
        showToast('Заполните все поля!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discord, minecraft, position })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Сотрудник добавлен!');
            closeAddModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно изменения должности
let currentPositionDiscord = '';

function changePosition(discord) {
    currentPositionDiscord = discord;
    document.getElementById('positionDiscord').textContent = discord;
    document.getElementById('newPositionSelect').value = '';
    document.getElementById('positionModal').classList.add('active');
}

function closePositionModal() {
    document.getElementById('positionModal').classList.remove('active');
    currentPositionDiscord = '';
}

// Обновить должность
async function updatePosition() {
    const newPosition = document.getElementById('newPositionSelect').value;
    
    if (!newPosition) {
        showToast('Выберите должность!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentPositionDiscord)}/position`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                position: newPosition,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Должность изменена!');
            closePositionModal();
            loadStaff();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно выдачи варна
let currentWarnDiscord = '';

function addWarn(discord) {
    currentWarnDiscord = discord;
    document.getElementById('warnDiscord').textContent = discord;
    document.getElementById('warnCount').value = 1;
    document.getElementById('warnReason').value = '';
    document.getElementById('addWarnModal').classList.add('active');
}

function closeAddWarnModal() {
    document.getElementById('addWarnModal').classList.remove('active');
    currentWarnDiscord = '';
}

async function submitAddWarn() {
    const count = parseInt(document.getElementById('warnCount').value);
    const reason = document.getElementById('warnReason').value.trim();
    
    if (!reason) {
        showToast('Укажите причину выдачи варна!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentWarnDiscord)}/warn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                count, 
                reason,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Выдано ${count} варн(ов)!`);
            closeAddWarnModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно снятия варна
let currentRemoveWarnDiscord = '';

function removeWarn(discord) {
    currentRemoveWarnDiscord = discord;
    document.getElementById('removeWarnDiscord').textContent = discord;
    document.getElementById('removeWarnCount').value = 1;
    document.getElementById('removeWarnReason').value = '';
    document.getElementById('removeWarnModal').classList.add('active');
}

function closeRemoveWarnModal() {
    document.getElementById('removeWarnModal').classList.remove('active');
    currentRemoveWarnDiscord = '';
}

async function submitRemoveWarn() {
    const count = parseInt(document.getElementById('removeWarnCount').value);
    const reason = document.getElementById('removeWarnReason').value.trim();
    
    if (!reason) {
        showToast('Укажите причину снятия варна!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentRemoveWarnDiscord)}/warn`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                count, 
                reason,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Снято ${count} варн(ов)!`);
            closeRemoveWarnModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно отпуска
let currentVacationDiscord = '';

function openVacationModal(discord) {
    currentVacationDiscord = discord;
    document.getElementById('vacationDiscord').textContent = discord;
    document.getElementById('vacationDays').value = '';
    document.getElementById('vacationModal').classList.add('active');
}

function closeVacationModal() {
    document.getElementById('vacationModal').classList.remove('active');
    currentVacationDiscord = '';
}

// Отправить в отпуск
async function setVacation() {
    const days = parseInt(document.getElementById('vacationDays').value);
    
    if (!days || days < 1) {
        showToast('Введите количество дней!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentVacationDiscord)}/vacation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                vacation: true, 
                days: days,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Сотрудник отправлен в отпуск на ${days} дней!`);
            closeVacationModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Вернуть из отпуска
async function removeVacation() {
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentVacationDiscord)}/vacation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                vacation: false,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Сотрудник вернулся из отпуска!');
            closeVacationModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно восстановления
let currentRestoreDiscord = '';

function restoreStaff(discord) {
    currentRestoreDiscord = discord;
    document.getElementById('restoreDiscord').textContent = discord;
    document.getElementById('restoreModal').classList.add('active');
}

function closeRestoreModal() {
    document.getElementById('restoreModal').classList.remove('active');
    currentRestoreDiscord = '';
}

async function submitRestore() {
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentRestoreDiscord)}/restore`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Сотрудник восстановлен на работу!');
            closeRestoreModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно удаления навсегда
let currentDeleteDiscord = '';

function deleteStaffPermanently(discord) {
    currentDeleteDiscord = discord;
    document.getElementById('deleteDiscord').textContent = discord;
    document.getElementById('deleteReason').value = '';
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteDiscord = '';
}

async function submitDelete() {
    const reason = document.getElementById('deleteReason').value.trim();
    
    if (!reason) {
        showToast('Укажите причину удаления!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentDeleteDiscord)}/permanent-delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reason: reason,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Сотрудник удален из базы данных!');
            closeDeleteModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Модальное окно увольнения
let currentFireDiscord = '';

// Управление соляриками
let currentSolarikiDiscord = '';

function manageSolariki(discord) {
    currentSolarikiDiscord = discord;
    document.getElementById('solarikiDiscord').textContent = discord;
    document.getElementById('solarikiAmount').value = '10';
    document.getElementById('solarikiModal').classList.add('active');
}

function closeSolarikiModal() {
    document.getElementById('solarikiModal').classList.remove('active');
    currentSolarikiDiscord = '';
}

let isSubmittingSolariki = false;

async function submitAddSolariki() {
    if (isSubmittingSolariki) {
        showToast('Ожидайте, запрос уже выполняется...', 'info');
        return;
    }
    
    const amount = parseInt(document.getElementById('solarikiAmount').value);
    
    if (!amount || amount < 1) {
        showToast('Укажите корректное количество соляриков!', 'error');
        return;
    }
    
    isSubmittingSolariki = true;
    const submitBtn = event.target;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Отправка...';
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentSolarikiDiscord)}/solariki/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: amount,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Выдано ${amount} соляриков!`, 'success');
            closeSolarikiModal();
            loadStaff();
        } else {
            showToast(data.error || 'Ошибка выдачи соляриков', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
    } finally {
        isSubmittingSolariki = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function submitRemoveSolariki() {
    if (isSubmittingSolariki) {
        showToast('Ожидайте, запрос уже выполняется...', 'info');
        return;
    }
    
    const amount = parseInt(document.getElementById('solarikiAmount').value);
    
    if (!amount || amount < 1) {
        showToast('Укажите корректное количество соляриков!', 'error');
        return;
    }
    
    isSubmittingSolariki = true;
    const submitBtn = event.target;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Отправка...';
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentSolarikiDiscord)}/solariki/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: amount,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Снято ${amount} соляриков!`, 'success');
            closeSolarikiModal();
            loadStaff();
        } else {
            showToast(data.error || 'Ошибка снятия соляриков', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
    } finally {
        isSubmittingSolariki = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function fireStaff(discord) {
    currentFireDiscord = discord;
    document.getElementById('fireDiscord').textContent = discord;
    document.getElementById('fireReason').value = '';
    document.getElementById('fireModal').classList.add('active');
}

function closeFireModal() {
    document.getElementById('fireModal').classList.remove('active');
    currentFireDiscord = '';
}

async function submitFire() {
    const reason = document.getElementById('fireReason').value.trim();
    
    if (!reason) {
        showToast('Укажите причину увольнения!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/staff/${encodeURIComponent(currentFireDiscord)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reason: reason,
                moderator: currentUser.discord,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Сотрудник уволен! Статус изменен на "Уволен"');
            closeFireModal();
            loadStaff();
            loadStats();
        } else {
            showToast('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}
