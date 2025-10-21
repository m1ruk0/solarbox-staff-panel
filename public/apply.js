// Определяем URL API автоматически
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api' 
    : '/api';

let selectedPosition = '';

// Toast уведомления
function showToast(title, message, type = 'error') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        error: 'fa-exclamation-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Вопросы для разных должностей
const questions = {
    helper: [
        {
            id: 'about',
            label: 'Расскажите о себе',
            placeholder: 'Расскажите немного о себе, своих интересах и увлечениях...',
            rows: 3,
            icon: 'fa-user'
        },
        {
            id: 'why',
            label: 'Почему именно вы?',
            placeholder: 'Почему мы должны выбрать именно вас на должность хелпера?',
            rows: 3,
            icon: 'fa-star'
        },
        {
            id: 'experience',
            label: 'Есть ли у вас опыт работы хелпером? Где?',
            placeholder: 'Опишите свой опыт работы хелпером на других серверах (если есть)...',
            rows: 3,
            icon: 'fa-briefcase'
        },
        {
            id: 'programs',
            label: 'Какие программы для проверок знаете?',
            placeholder: 'Перечислите программы и инструменты для проверки игроков (CoreProtect, LogBlock и т.д.)...',
            rows: 2,
            icon: 'fa-tools'
        }
    ],
    media: [
        {
            id: 'why',
            label: 'Почему именно вы?',
            placeholder: 'Почему мы должны выбрать именно вас на должность медии?',
            rows: 3,
            icon: 'fa-star'
        },
        {
            id: 'experience',
            label: 'Имеете ли вы опыт в медиа пространстве?',
            placeholder: 'Расскажите о вашем опыте создания контента, работы с соцсетями...',
            rows: 3,
            icon: 'fa-video'
        },
        {
            id: 'tiktok',
            label: 'Ссылка на ваш TikTok',
            placeholder: 'https://www.tiktok.com/@ваш_ник',
            rows: 1,
            icon: 'fa-link',
            type: 'url'
        }
    ]
};

// Выбор должности
function selectPosition(position) {
    selectedPosition = position;
    document.getElementById('position').value = position;
    
    // Убираем выделение со всех карточек
    document.querySelectorAll('.position-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    event.currentTarget.classList.add('selected');
    
    // Обновляем подсказку возраста
    const ageInput = document.getElementById('age');
    const ageHint = document.getElementById('ageHint');
    if (position === 'helper') {
        ageInput.placeholder = '14';
        ageInput.min = '14';
        ageHint.textContent = 'Минимальный возраст для хелпера: 14 лет';
    } else if (position === 'media') {
        ageInput.placeholder = '13';
        ageInput.min = '13';
        ageHint.textContent = 'Минимальный возраст для медии: 13 лет';
    }
    
    // Показываем секцию с вопросами
    document.getElementById('questionsSection').style.display = 'block';
    
    // Генерируем вопросы
    generateQuestions(position);
    
    // Показываем требования для медии
    if (position === 'media') {
        document.getElementById('mediaRequirements').style.display = 'block';
    } else {
        document.getElementById('mediaRequirements').style.display = 'none';
    }
    
    // Прокручиваем к вопросам
    setTimeout(() => {
        document.getElementById('questionsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Генерация вопросов
function generateQuestions(position) {
    const container = document.getElementById('dynamicQuestions');
    container.innerHTML = '';
    
    const positionQuestions = questions[position] || [];
    
    positionQuestions.forEach(q => {
        const div = document.createElement('div');
        
        const inputType = q.type === 'url' ? 'input' : 'textarea';
        const inputHTML = inputType === 'input' 
            ? `<input type="url" id="${q.id}" name="${q.id}" placeholder="${q.placeholder}" class="input-field" required>`
            : `<textarea id="${q.id}" name="${q.id}" rows="${q.rows}" placeholder="${q.placeholder}" class="input-field" required></textarea>`;
        
        div.innerHTML = `
            <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas ${q.icon} text-indigo-600 mr-2"></i>
                ${q.label}
            </label>
            ${inputHTML}
        `;
        
        container.appendChild(div);
    });
}

// Отправка заявки
async function submitApplication(event) {
    event.preventDefault();
    
    if (!selectedPosition) {
        showToast('Выбери должность!', 'Пожалуйста, выбери должность перед отправкой заявки', 'warning');
        return;
    }
    
    // Собираем ответы на динамические вопросы
    const positionQuestions = questions[selectedPosition] || [];
    const answers = {};
    
    positionQuestions.forEach(q => {
        const element = document.getElementById(q.id);
        if (element) {
            answers[q.id] = element.value.trim();
        }
    });
    
    // Формируем текст для поля experience (объединяем все ответы)
    let experienceText = '';
    if (selectedPosition === 'helper') {
        experienceText = `О себе: ${answers.about || ''}\n\nПочему именно я: ${answers.why || ''}\n\nОпыт работы: ${answers.experience || ''}\n\nПрограммы для проверок: ${answers.programs || ''}`;
    } else if (selectedPosition === 'media') {
        experienceText = `Почему именно я: ${answers.why || ''}\n\nОпыт в медиа: ${answers.experience || ''}\n\nTikTok: ${answers.tiktok || ''}`;
    }
    
    const formData = {
        discord: document.getElementById('discord').value.trim(),
        minecraft: document.getElementById('minecraft').value.trim(),
        age: document.getElementById('age').value,
        experience: experienceText,
        why: answers.why || '',
        position: selectedPosition
    };
    
    try {
        const response = await fetch(`${API_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Показываем сообщение об успехе
            document.getElementById('applicationForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Прокручиваем наверх
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showToast('Ошибка отправки', data.error || 'Не удалось отправить заявку', 'error');
        }
    } catch (error) {
        showToast('Ошибка подключения', 'Не удалось подключиться к серверу. Проверьте интернет-соединение.', 'error');
        console.error(error);
    }
}
