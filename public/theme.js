// Общий файл для управления темой на всех страницах

// Применяем темную тему ВСЕГДА (по умолчанию)
document.documentElement.classList.add('dark-theme');
if (document.body) {
    document.body.classList.add('dark-theme');
}
// Устанавливаем в localStorage
localStorage.setItem('theme', 'dark');

// Переключение темы
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Загрузка сохраненной темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    // Применение темы ДО загрузки DOM (убирает мигание)
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
    }
}

// Обновление иконки после загрузки
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
}

// Автоматически загружаем тему при загрузке любой страницы
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
});

// Также загружаем тему сразу (до DOMContentLoaded)
loadTheme();
