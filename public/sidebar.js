// Боковая панель навигации

// Создание сайдбара
function createSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const sidebarHTML = `
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <img src="icon.ico" alt="SolarBox" style="width: 32px; height: 32px; object-fit: contain;">
                    <span>SolarBox</span>
                </div>
            </div>
            
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
                    <a href="#" onclick="toggleTheme(); return false;" class="sidebar-link">
                        <i class="fas fa-moon" id="sidebarThemeIcon"></i>
                        <span id="sidebarThemeText">Темная тема</span>
                    </a>
                    <a href="#" onclick="toggleSnow(); return false;" class="sidebar-link">
                        <i class="fas fa-snowflake"></i>
                        <span>Снегопад</span>
                    </a>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <div class="sidebar-user-avatar">
                        ${user.discord ? user.discord.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">${user.discord || 'Пользователь'}</div>
                        <div class="sidebar-user-role">${user.position || 'STAFF'}</div>
                    </div>
                    <button onclick="logout()" class="btn btn-secondary btn-sm" style="padding: 0.5rem;">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Не создаем сайдбар на странице логина
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('apply.html') &&
        !window.location.pathname.includes('landing.html')) {
        createSidebar();
    }
});

// Переопределяем toggleTheme чтобы обновлять иконку в сайдбаре
const originalToggleTheme = window.toggleTheme;
window.toggleTheme = function() {
    if (originalToggleTheme) originalToggleTheme();
    updateSidebarThemeIcon();
};
