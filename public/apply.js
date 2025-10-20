const API_URL = 'http://localhost:4000/api';

let selectedPosition = '';

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
}

// Отправка заявки
async function submitApplication(event) {
    event.preventDefault();
    
    if (!selectedPosition) {
        alert('Выбери должность!');
        return;
    }
    
    const formData = {
        userId: Date.now().toString(), // Временный ID
        discord: document.getElementById('discord').value.trim(),
        minecraft: document.getElementById('minecraft').value.trim(),
        age: document.getElementById('age').value,
        experience: document.getElementById('experience').value.trim(),
        why: document.getElementById('why').value.trim(),
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
            alert('❌ Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('❌ Ошибка подключения к серверу');
        console.error(error);
    }
}
