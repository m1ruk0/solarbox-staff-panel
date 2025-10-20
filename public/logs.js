// API URL
const API_URL = window.location.origin + '/api';

let allLogs = [];

// Проверка авторизации и прав
const userDiscord = localStorage.getItem('userDiscord');
const userPosition = localStorage.getItem('userPosition');

if (!userDiscord) {
    window.location.href = 'login.html';
}

// Только OWNER может видеть логи
if (userPosition !== 'OWNER') {
    alert('У вас нет доступа к логам!');
    window.location.href = 'index.html';
}

// Отображение информации о пользователе
document.getElementById('userInfo').textContent = `${userDiscord} (${userPosition})`;

// Загрузка логов
document.addEventListener('DOMContentLoaded', () => {
    loadLogs();
    
    // Поиск в реальном времени
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterLogs(e.target.value);
    });
});

async function loadLogs() {
    try {
        const response = await fetch(`${API_URL}/logs?limit=200`);
        const data = await response.json();
        
        if (data.success) {
            allLogs = data.data;
            renderLogs(allLogs);
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки логов:', error);
        document.getElementById('loading').innerHTML = `
            <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <p class="text-white text-xl">Ошибка загрузки логов</p>
        `;
    }
}

// Фильтрация логов
function filterLogs(query) {
    if (!query) {
        renderLogs(allLogs);
        return;
    }
    
    const filtered = allLogs.filter(log => 
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.moderator.toLowerCase().includes(query.toLowerCase()) ||
        (log.target && log.target.toLowerCase().includes(query.toLowerCase()))
    );
    
    renderLogs(filtered);
}

// Отрисовка логов
function renderLogs(logs) {
    const container = document.getElementById('logsList');
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-inbox text-6xl text-white/50 mb-4"></i>
                <p class="text-white/80 text-xl">Логи не найдены</p>
            </div>
        `;
        return;
    }
    
    const html = logs.map(log => {
        const date = new Date(log.timestamp);
        const formattedDate = date.toLocaleString('ru-RU');
        
        // Определяем иконку и цвет по действию
        let icon = 'fa-info-circle';
        let color = 'blue';
        
        if (log.action.includes('Добавлен')) {
            icon = 'fa-plus-circle';
            color = 'green';
        } else if (log.action.includes('Удален') || log.action.includes('Уволен')) {
            icon = 'fa-trash';
            color = 'red';
        } else if (log.action.includes('Изменен')) {
            icon = 'fa-edit';
            color = 'yellow';
        } else if (log.action.includes('Принята')) {
            icon = 'fa-check-circle';
            color = 'green';
        } else if (log.action.includes('Отклонена')) {
            icon = 'fa-times-circle';
            color = 'red';
        }
        
        return `
            <div class="bg-white/10 backdrop-blur-md rounded-lg p-4 border-l-4 border-${color}-500 hover:bg-white/15 transition">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <div class="bg-${color}-500/20 p-2 rounded-full mt-1">
                            <i class="fas ${icon} text-${color}-400"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="text-white font-semibold">${log.action}</span>
                                ${log.target ? `<span class="text-white/60">→</span><span class="text-${color}-400">${log.target}</span>` : ''}
                            </div>
                            <div class="flex items-center space-x-4 text-sm text-white/60">
                                <span><i class="fas fa-user mr-1"></i>${log.moderator}</span>
                                <span><i class="fas fa-clock mr-1"></i>${formattedDate}</span>
                            </div>
                            ${log.details ? `<p class="text-white/80 text-sm mt-2">${log.details}</p>` : ''}
                        </div>
                    </div>
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
