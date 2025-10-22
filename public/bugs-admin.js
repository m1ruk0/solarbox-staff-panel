// API URL
const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

let allBugs = [];
let currentBug = null;
let currentUser = null;

// Проверка авторизации
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(userStr);
    
    // Проверка прав (ZAM.CURATOR и выше)
    const allowedPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    if (!allowedPositions.includes(currentUser.position)) {
        alert('У вас нет доступа к этой странице');
        window.location.href = 'index.html';
        return false;
    }
    
    // Показываем кнопку удаления только для ADMIN+
    const adminPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN'];
    if (!adminPositions.includes(currentUser.position)) {
        const deleteBtn = document.getElementById('deleteBugBtn');
        if (deleteBtn) deleteBtn.style.display = 'none';
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
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

// Загрузка багов
async function loadBugs() {
    try {
        const response = await fetch(`${API_URL}/bugs`);
        const data = await response.json();
        
        if (data.success) {
            allBugs = data.data;
            renderBugs(allBugs);
            updateStats();
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки багов:', error);
        document.getElementById('loading').innerHTML = `
            <i class="fas fa-exclamation-circle text-4xl text-red-600"></i>
            <p class="text-red-600 mt-4">Ошибка подключения к серверу</p>
        `;
    }
}

// Обновление статистики
function updateStats() {
    const total = allBugs.length;
    const newBugs = allBugs.filter(b => b.status === 'Новый').length;
    const resolved = allBugs.filter(b => b.status === 'Решен').length;
    const critical = allBugs.filter(b => b.priority === 'Критический').length;
    
    document.getElementById('totalBugs').textContent = total;
    document.getElementById('newBugs').textContent = newBugs;
    document.getElementById('resolvedBugs').textContent = resolved;
    document.getElementById('criticalBugs').textContent = critical;
}

// Отрисовка багов
function renderBugs(bugs) {
    const container = document.getElementById('bugsContainer');
    const noBugs = document.getElementById('noBugs');
    
    if (bugs.length === 0) {
        container.style.display = 'none';
        noBugs.style.display = 'block';
        return;
    }
    
    noBugs.style.display = 'none';
    container.style.display = 'block';
    
    const html = bugs.map(bug => {
        const statusColors = {
            'Новый': 'bg-yellow-100 text-yellow-800',
            'В работе': 'bg-blue-100 text-blue-800',
            'Решен': 'bg-green-100 text-green-800',
            'Отклонен': 'bg-red-100 text-red-800'
        };
        
        const priorityIcons = {
            'Критический': '🔴',
            'Высокий': '🟠',
            'Средний': '🟡',
            'Низкий': '🟢'
        };
        
        const date = new Date(bug.created_at).toLocaleString('ru-RU');
        
        return `
            <div class="glass-card mb-4 cursor-pointer hover:shadow-lg transition-all" onclick="openBugModal(${bug.id})">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-semibold text-gray-500">#${bug.id}</span>
                            <span class="badge ${statusColors[bug.status] || 'bg-gray-100 text-gray-800'}">${bug.status}</span>
                            <span class="text-sm">${priorityIcons[bug.priority]} ${bug.priority}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${bug.title}</h3>
                        <p class="text-gray-600 text-sm mb-2">${bug.description.substring(0, 150)}${bug.description.length > 150 ? '...' : ''}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <div class="flex items-center gap-4">
                        <span><i class="fab fa-discord mr-1"></i>${bug.discord}</span>
                        ${bug.minecraft ? `<span><i class="fas fa-gamepad mr-1"></i>${bug.minecraft}</span>` : ''}
                    </div>
                    <span><i class="fas fa-clock mr-1"></i>${date}</span>
                </div>
                ${bug.admin_comment ? `
                    <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p class="text-sm text-blue-800"><i class="fas fa-comment mr-1"></i> <strong>Комментарий:</strong> ${bug.admin_comment}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Фильтрация багов
function filterBugs() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    let filtered = allBugs;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(b => b.priority === priorityFilter);
    }
    
    renderBugs(filtered);
}

// Открыть модальное окно
function openBugModal(id) {
    currentBug = allBugs.find(b => b.id === id);
    if (!currentBug) return;
    
    document.getElementById('bugId').textContent = currentBug.id;
    document.getElementById('bugTitle').textContent = currentBug.title;
    document.getElementById('bugDiscord').textContent = currentBug.discord;
    document.getElementById('bugMinecraft').textContent = currentBug.minecraft || 'Не указан';
    document.getElementById('bugPriority').textContent = currentBug.priority;
    document.getElementById('bugDescription').textContent = currentBug.description;
    document.getElementById('bugStatus').value = currentBug.status;
    document.getElementById('bugComment').value = currentBug.admin_comment || '';
    
    document.getElementById('bugModal').classList.add('active');
}

// Закрыть модальное окно
function closeBugModal() {
    document.getElementById('bugModal').classList.remove('active');
    currentBug = null;
}

// Обновить статус бага
async function updateBugStatus() {
    if (!currentBug) return;
    
    const status = document.getElementById('bugStatus').value;
    const comment = document.getElementById('bugComment').value.trim();
    
    try {
        const response = await fetch(`${API_URL}/bugs/${currentBug.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: status,
                resolvedBy: currentUser.discord,
                adminComment: comment,
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Статус бага обновлен!', 'success');
            closeBugModal();
            loadBugs();
        } else {
            showToast(data.error || 'Ошибка обновления', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Удалить баг
async function deleteBug() {
    if (!currentBug) return;
    
    if (!confirm(`Вы уверены что хотите удалить баг #${currentBug.id}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/bugs/${currentBug.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                moderatorPosition: currentUser.position
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Баг удален!', 'success');
            closeBugModal();
            loadBugs();
        } else {
            showToast(data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadBugs();
    }
});
