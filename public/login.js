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

// Переключение метода входа
function toggleLoginMethod() {
    const method = document.getElementById('loginMethod').value;
    const passwordField = document.getElementById('passwordField');
    const securityField = document.getElementById('securityField');
    
    if (method === 'password') {
        passwordField.style.display = 'block';
        securityField.style.display = 'none';
    } else {
        passwordField.style.display = 'none';
        securityField.style.display = 'block';
        loadSecurityQuestion();
    }
}

// Загрузить секретный вопрос
async function loadSecurityQuestion() {
    const discord = document.getElementById('discord').value.trim();
    
    if (!discord) {
        showToast('Сначала введите Discord ник!', 'error');
        return;
    }
    
    try {
        const response = await fetch(window.location.origin + '/api/auth/security-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discord })
        });
        
        const data = await response.json();
        
        if (data.success && data.question) {
            document.getElementById('questionContainer').innerHTML = `
                <div style="background: rgba(102, 126, 234, 0.1); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(102, 126, 234, 0.2);">
                    <p style="font-size: 0.875rem; color: #667eea; font-weight: 600; margin-bottom: 0.5rem;">Секретный вопрос:</p>
                    <p style="color: #1f2937; font-weight: 500;">${data.question}</p>
                </div>
            `;
        } else {
            showToast('Секретный вопрос не найден', 'error');
        }
    } catch (error) {
        showToast('Ошибка загрузки вопроса', 'error');
    }
}

// Вход
async function login(event) {
    event.preventDefault();
    
    const discord = document.getElementById('discord').value.trim();
    const method = document.getElementById('loginMethod').value;
    
    if (!discord) {
        showToast('Введите Discord ник!', 'error');
        return;
    }
    
    let credentials = { discord, method };
    
    if (method === 'password') {
        const password = document.getElementById('password').value;
        if (!password) {
            showToast('Введите пароль!', 'error');
            return;
        }
        credentials.password = password;
    } else {
        const answer = document.getElementById('securityAnswer').value.trim();
        if (!answer) {
            showToast('Введите ответ на вопрос!', 'error');
            return;
        }
        credentials.securityAnswer = answer;
    }
    
    try {
        const response = await fetch(window.location.origin + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Сохраняем данные пользователя
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Вход выполнен!');
            
            // Перенаправляем на главную
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(data.error, 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения к серверу', 'error');
        console.error(error);
    }
}
