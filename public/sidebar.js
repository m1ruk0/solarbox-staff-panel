// Боковая панель навигации

// Функция для получения иконки роли
function getRoleIcon(position) {
    const icons = {
        'OWNER': '👑',
        'RAZRAB': '💻',
        'TEX.ADMIN': '🔧',
        'ADMIN': '⚡',
        'CURATOR': '📚',
        'ZAM.CURATOR': '📖',
        'MODERATOR': '🛡️',
        'JR.MODERATOR': '🛡️',
        'HELPER': '💬',
        'BUILDER': '🏗️',
        'JR.BUILDER': '🏗️'
    };
    return icons[position] || '👤';
}

// Добавление блока пользователя в header
function addUserToHeader() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const headerCard = document.querySelector('.header-card');
    
    if (!headerCard || !user.discord) return;
    
    const userHTML = `
        <div class="header-user">
            <div class="header-user-avatar">
                ${user.discord ? user.discord.charAt(0).toUpperCase() : 'U'}
            </div>
            <div class="header-user-info">
                <div class="header-user-name">${user.discord || 'Пользователь'}</div>
                <div class="header-user-role">${getRoleIcon(user.position)} ${user.position || 'STAFF'}</div>
                <div class="header-user-solariki">☀️ ${user.solariki || 0} соляриков</div>
            </div>
            <button onclick="logout()" class="btn btn-danger btn-sm">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    `;
    
    headerCard.insertAdjacentHTML('beforeend', userHTML);
}

// Создание сайдбара
function createSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const sidebarHTML = `
        <div class="sidebar" id="sidebar">
            
            <nav class="sidebar-nav">
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Главное</div>
                    <a href="index.html" class="sidebar-link ${currentPage === 'index.html' ? 'active' : ''}">
                        <i class="fas fa-users"></i>
                        <span>Персонал</span>
                    </a>
                    <a href="applications.html" class="sidebar-link ${currentPage === 'applications.html' ? 'active' : ''}">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Заявки</span>
                        <span class="sidebar-link-badge" id="pendingBadge" style="display: none;">0</span>
                    </a>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Архивы</div>
                    <a href="applications-archive.html" class="sidebar-link ${currentPage === 'applications-archive.html' ? 'active' : ''}">
                        <i class="fas fa-archive"></i>
                        <span>Архив заявок</span>
                    </a>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Финансы</div>
                    <a href="balance.html" class="sidebar-link ${currentPage === 'balance.html' ? 'active' : ''}">
                        <i class="fas fa-coins"></i>
                        <span>Баланс</span>
                    </a>
                </div>
                
                <div class="sidebar-section" id="adminSection" style="display: none;">
                    <div class="sidebar-section-title">Администрирование</div>
                    <a href="admin-passwords.html" class="sidebar-link ${currentPage === 'admin-passwords.html' ? 'active' : ''}">
                        <i class="fas fa-key"></i>
                        <span>Пароли</span>
                    </a>
                    <a href="logs.html" class="sidebar-link ${currentPage === 'logs.html' ? 'active' : ''}">
                        <i class="fas fa-file-alt"></i>
                        <span>Логи</span>
                    </a>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Другое</div>
                    <a href="bugs.html" class="sidebar-link ${currentPage === 'bugs.html' ? 'active' : ''}">
                        <i class="fas fa-bug"></i>
                        <span>Сообщить о баге</span>
                    </a>
                    <a href="bugs-admin.html" class="sidebar-link ${currentPage === 'bugs-admin.html' ? 'active' : ''}" id="bugsAdminLink" style="display: none;">
                        <i class="fas fa-list"></i>
                        <span>История багов</span>
                    </a>
                </div>
                
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Настройки</div>
                    <a href="#" onclick="toggleSnow(); return false;" class="sidebar-link">
                        <i class="fas fa-snowflake"></i>
                        <span>Снегопад</span>
                    </a>
                </div>
            </nav>
        </div>
        
        <button class="sidebar-toggle" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i>
        </button>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // Оборачиваем контент в main-content
    const existingContent = document.body.innerHTML;
    document.body.innerHTML = sidebarHTML + '<div class="main-content">' + existingContent.replace(sidebarHTML, '') + '</div>';
    
    // Проверяем права для админ секции
    checkAdminRights();
    
    // Обновляем иконку темы
    updateSidebarThemeIcon();
    
    // Загружаем количество заявок
    loadPendingCount();
}

// Переключение сайдбара
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Проверка прав администратора
function checkAdminRights() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN'];
    const moderatorPositions = ['OWNER', 'RAZRAB', 'TEX.ADMIN', 'ADMIN', 'CURATOR', 'ZAM.CURATOR'];
    
    if (adminPositions.includes(user.position)) {
        const adminSection = document.getElementById('adminSection');
        if (adminSection) {
            adminSection.style.display = 'block';
        }
    }
    
    // Показываем историю багов для ZAM.CURATOR и выше
    if (moderatorPositions.includes(user.position)) {
        const bugsAdminLink = document.getElementById('bugsAdminLink');
        if (bugsAdminLink) {
            bugsAdminLink.style.display = 'flex';
        }
    }
}

// Обновление иконки и текста темы в сайдбаре
function updateSidebarThemeIcon() {
    const icon = document.getElementById('sidebarThemeIcon');
    const text = document.getElementById('sidebarThemeText');
    
    if (document.body.classList.contains('dark-theme')) {
        if (icon) icon.className = 'fas fa-sun';
        if (text) text.textContent = 'Светлая тема';
    } else {
        if (icon) icon.className = 'fas fa-moon';
        if (text) text.textContent = 'Темная тема';
    }
}

// Загрузка количества ожидающих заявок
async function loadPendingCount() {
    try {
        const API_URL = window.location.protocol === 'file:' 
            ? 'http://localhost:4000/api' 
            : window.location.origin + '/api';
            
        const response = await fetch(`${API_URL}/applications`);
        const data = await response.json();
        
        if (data.success) {
            const pending = data.data.filter(a => 
                a.status === 'pending' || a.status === 'На рассмотрении'
            ).length;
            
            const badge = document.getElementById('pendingBadge');
            if (badge && pending > 0) {
                badge.textContent = pending;
                badge.style.display = 'block';
            }
        }
    } catch (error) {
        console.log('Не удалось загрузить количество заявок');
    }
}

// Обновление баланса в header
async function updateHeaderBalance() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.discord) return;
        
        const API_URL = window.location.protocol === 'file:' 
            ? 'http://localhost:4000/api' 
            : window.location.origin + '/api';
            
        const response = await fetch(`${API_URL}/staff/${user.discord}`);
        const data = await response.json();
        
        if (data.success && data.staff) {
            const solariki = data.staff.solariki || 0;
            
            // Обновляем в localStorage
            user.solariki = solariki;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Обновляем в header
            const solarikiElement = document.querySelector('.header-user-solariki');
            if (solarikiElement) {
                solarikiElement.textContent = `☀️ ${solariki} соляриков`;
            }
        }
    } catch (error) {
        console.log('Не удалось обновить баланс');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Не создаем сайдбар на странице логина
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('apply.html') &&
        !window.location.pathname.includes('landing.html')) {
        createSidebar();
        
        // Обновляем баланс через 1 секунду после загрузки
        setTimeout(() => {
            updateHeaderBalance();
        }, 1000);
    }
});

// Переопределяем toggleTheme чтобы обновлять иконку в сайдбаре
const originalToggleTheme = window.toggleTheme;
window.toggleTheme = function() {
    if (originalToggleTheme) originalToggleTheme();
    updateSidebarThemeIcon();
};
