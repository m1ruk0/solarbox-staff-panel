const API_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:4000/api' 
    : window.location.origin + '/api';

// Проверка авторизации
if (!localStorage.getItem('user')) {
    window.location.href = 'login.html';
}

const currentUser = JSON.parse(localStorage.getItem('user'));

// Загрузка баланса
async function loadBalance() {
    try {
        const response = await fetch(`${API_URL}/staff/${currentUser.discord}`);
        const data = await response.json();
        
        console.log('Ответ сервера:', data); // Отладка
        
        if (data.success && data.staff) {
            const balance = data.staff.solariki || 0;
            console.log('Баланс:', balance); // Отладка
            
            document.getElementById('userBalance').textContent = balance;
            
            // Обновляем в localStorage
            currentUser.solariki = balance;
            localStorage.setItem('user', JSON.stringify(currentUser));
        } else {
            console.error('Ошибка данных:', data);
            document.getElementById('userBalance').textContent = '0';
        }
    } catch (error) {
        console.error('Ошибка загрузки баланса:', error);
        document.getElementById('userBalance').textContent = '0';
    }
}

// Передача соляриков
let isTransferring = false;

async function transferSolariki(event) {
    event.preventDefault();
    
    if (isTransferring) {
        showToast('Ожидайте, запрос уже выполняется...', 'info');
        return;
    }
    
    const recipient = document.getElementById('recipientDiscord').value.trim();
    const amount = parseInt(document.getElementById('amount').value);
    const comment = document.getElementById('comment').value.trim();
    
    // Проверки
    if (recipient === currentUser.discord) {
        showToast('Нельзя передать самому себе!', 'error');
        return;
    }
    
    if (amount < 1) {
        showToast('Минимум 1 солярик!', 'error');
        return;
    }
    
    if (amount > currentUser.solariki) {
        showToast('Недостаточно соляриков!', 'error');
        return;
    }
    
    isTransferring = true;
    const submitBtn = event.target.querySelector('button[type="submit"]') || event.submitter;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Отправка...';
    
    try {
        // Передаем солярики через новый endpoint
        const response = await fetch(`${API_URL}/staff/solariki/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: currentUser.discord,
                to: recipient,
                amount: amount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Передано ${amount} соляриков пользователю ${recipient}!`, 'success');
            resetForm();
            loadBalance();
            loadHistory();
        } else {
            showToast(data.error || 'Ошибка передачи соляриков', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    } finally {
        isTransferring = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Загрузка истории (заглушка)
async function loadHistory() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('historyList').innerHTML = `
        <div class="text-center py-8 text-gray-500">
            <i class="fas fa-info-circle text-4xl mb-3"></i>
            <p>История передач пока недоступна</p>
        </div>
    `;
}

// Очистка формы
function resetForm() {
    document.getElementById('transferForm').reset();
}

// Toast уведомления
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

// Инициализация
loadBalance();
loadHistory();
