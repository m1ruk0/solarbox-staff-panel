// API URL
// API URL - работает и в браузере и в Electron
const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

let allStaff = [];
let filteredStaff = [];
let currentFilter = 'all';

// Роли с цветами и иконками
const roleConfig = {
    'OWNER': { color: 'bg-red-100 text-red-800', icon: 'fa-crown' },
    'RAZRAB': { color: 'bg-purple-100 text-purple-800', icon: 'fa-code' },
    'TEX.ADMIN': { color: 'bg-blue-100 text-blue-800', icon: 'fa-server' },
    'ADMIN': { color: 'bg-indigo-100 text-indigo-800', icon: 'fa-shield' },
    'CURATOR': { color: 'bg-green-100 text-green-800', icon: 'fa-user-tie' },
    'ZAM.CURATOR': { color: 'bg-teal-100 text-teal-800', icon: 'fa-user-check' },
    'GL.STAFF': { color: 'bg-yellow-100 text-yellow-800', icon: 'fa-star' },
    'MODER': { color: 'bg-orange-100 text-orange-800', icon: 'fa-gavel' },
    'CT.HELPER': { color: 'bg-pink-100 text-pink-800', icon: 'fa-handshake' },
    'HELPER': { color: 'bg-gray-100 text-gray-800', icon: 'fa-heart' }
};

// Загрузка данных
document.addEventListener('DOMContentLoaded', () => {
    loadStaff();
    
    // Автообновление каждые 30 секунд
    setInterval(() => {
        loadStaff(true); // true = тихое обновление без показа загрузки
    }, 30000);
    
    // Поиск
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterStaff(e.target.value);
    });
});

async function loadStaff(silent = false) {
    try {
        const response = await fetch(`${API_URL}/staff`);
        const data = await response.json();
        
        if (data.success) {
            allStaff = data.data;
            filteredStaff = allStaff;
            renderStaff();
            updateStats();
            updateLastUpdateTime();
            
            if (!silent) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('tableContainer').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        if (!silent) {
            document.getElementById('loading').innerHTML = `
                <i class="fas fa-exclamation-circle text-4xl text-red-600"></i>
                <p class="text-red-600 mt-4">Ошибка загрузки данных</p>
            `;
        }
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('updateTime').textContent = timeString;
}

function renderStaff() {
    const tbody = document.getElementById('staffTableBody');
    
    if (filteredStaff.length === 0) {
        document.getElementById('tableContainer').style.display = 'none';
        document.getElementById('noData').style.display = 'block';
        return;
    }
    
    document.getElementById('tableContainer').style.display = 'block';
    document.getElementById('noData').style.display = 'none';
    
    tbody.innerHTML = filteredStaff.map(staff => {
        const roleInfo = roleConfig[staff.position] || { color: 'bg-gray-100 text-gray-800', icon: 'fa-user' };
        const statusClass = staff.status === 'Активен' ? 'status-active' : 
                           staff.vacation === 'Да' ? 'status-vacation' : 
                           'status-fired';
        
        const vacationText = staff.vacation === 'Да' 
            ? `<span class="text-orange-600"><i class="fas fa-umbrella-beach mr-1"></i>${staff.vacation_days || 0} дней</span>`
            : '<span class="text-gray-400">Нет</span>';
        
        const warnsText = staff.warns > 0 
            ? `<span class="warn-badge">${staff.warns} ⚠️</span>`
            : '<span class="text-gray-400">0</span>';
        
        return `
            <tr>
                <td class="font-medium text-gray-900">
                    <i class="fab fa-discord text-indigo-500 mr-2"></i>
                    ${staff.discord}
                </td>
                <td class="text-gray-700">
                    <i class="fas fa-cube text-green-500 mr-2"></i>
                    ${staff.minecraft}
                </td>
                <td>
                    <span class="role-badge ${roleInfo.color}">
                        <i class="fas ${roleInfo.icon} mr-1"></i>
                        ${staff.position}
                    </span>
                </td>
                <td>${warnsText}</td>
                <td>${vacationText}</td>
                <td class="text-gray-600 text-sm">
                    ${staff.hire_date || 'Не указано'}
                </td>
                <td>
                    <span class="${statusClass} font-semibold">
                        ${staff.status}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('totalCount').textContent = allStaff.length;
    document.getElementById('activeCount').textContent = allStaff.filter(s => s.status === 'Активен').length;
    document.getElementById('vacationCount').textContent = allStaff.filter(s => s.vacation === 'Да').length;
    document.getElementById('warnedCount').textContent = allStaff.filter(s => s.warns > 0).length;
}

function filterByStatus(status) {
    currentFilter = status;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Фильтруем
    if (status === 'all') {
        filteredStaff = allStaff;
    } else if (status === 'vacation') {
        filteredStaff = allStaff.filter(s => s.vacation === 'Да');
    } else {
        filteredStaff = allStaff.filter(s => s.status === status);
    }
    
    // Применяем поиск если есть
    const searchValue = document.getElementById('searchInput').value;
    if (searchValue) {
        filterStaff(searchValue);
    } else {
        renderStaff();
    }
}

function filterStaff(searchTerm) {
    const term = searchTerm.toLowerCase();
    
    let baseStaff = currentFilter === 'all' ? allStaff :
                    currentFilter === 'vacation' ? allStaff.filter(s => s.vacation === 'Да') :
                    allStaff.filter(s => s.status === currentFilter);
    
    filteredStaff = baseStaff.filter(staff => 
        staff.discord.toLowerCase().includes(term) ||
        staff.minecraft.toLowerCase().includes(term) ||
        staff.position.toLowerCase().includes(term)
    );
    
    renderStaff();
}
