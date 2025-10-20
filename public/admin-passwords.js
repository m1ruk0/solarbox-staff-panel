const API_URL = window.location.origin + '/api';

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
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Проверка прав (только OWNER)
function checkAdminAccess() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = JSON.parse(userStr);
    if (user.position !== 'OWNER') {
        showToast('Доступ запрещен! Только для OWNER', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return false;
    }
    
    return true;
}

// Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/passwords/users`);
        const data = await response.json();
        
        if (data.success) {
            renderUsers(data.users);
        }
    } catch (error) {
        showToast('Ошибка загрузки пользователей', 'error');
    }
}

// Отображение пользователей
function renderUsers(users) {
    const container = document.getElementById('usersList');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-gray-600">Нет пользователей</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="border-b border-gray-200 py-4 flex items-center justify-between">
            <div>
                <p class="font-bold text-gray-800">${user.discord}</p>
                <p class="text-sm text-gray-600">Вопрос: ${user.question}</p>
                <p class="text-xs text-gray-500">Создан: ${user.createdAt}</p>
            </div>
            <button onclick="deleteUser('${user.discord}')" class="btn btn-danger btn-sm">
                <i class="fas fa-trash mr-2"></i>
                Удалить
            </button>
        </div>
    `).join('');
}

// Модальное окно
function openAddPasswordModal() {
    document.getElementById('addPasswordModal').classList.add('active');
}

function closeAddPasswordModal() {
    document.getElementById('addPasswordModal').classList.remove('active');
    document.getElementById('newUserDiscord').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserQuestion').value = '';
    document.getElementById('newUserAnswer').value = '';
}

// Добавить пользователя
async function addPasswordUser() {
    const discord = document.getElementById('newUserDiscord').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const question = document.getElementById('newUserQuestion').value;
    const answer = document.getElementById('newUserAnswer').value.trim();
    
    if (!discord || !password || !question || !answer) {
        showToast('Заполните все поля!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/passwords/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discord, password, question, answer })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Пользователь добавлен!');
            closeAddPasswordModal();
            loadUsers();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка добавления', 'error');
    }
}

// Модальное окно удаления пользователя
let currentDeleteUser = '';

function deleteUser(discord) {
    currentDeleteUser = discord;
    document.getElementById('deleteUserDiscord').textContent = discord;
    document.getElementById('deleteUserModal').classList.add('active');
}

function closeDeleteUserModal() {
    document.getElementById('deleteUserModal').classList.remove('active');
    currentDeleteUser = '';
}

async function submitDeleteUser() {
    try {
        const response = await fetch(`${API_URL}/admin/passwords/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discord: currentDeleteUser })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Пользователь удален!');
            closeDeleteUserModal();
            loadUsers();
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
}

// Загрузка при старте
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAccess()) {
        loadUsers();
    }
});
