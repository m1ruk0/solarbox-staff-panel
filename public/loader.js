// Красивый loader при загрузке страницы

// Создаем loader HTML
const loaderHTML = `
    <div class="page-loader" id="pageLoader">
        <div class="loader-content">
            <div class="loader-spinner"></div>
            <div class="loader-text">Загрузка...</div>
            <div class="loader-subtext">Подготовка панели управления</div>
        </div>
    </div>
`;

// Вставляем loader в начало body
document.addEventListener('DOMContentLoaded', () => {
    // Если loader уже есть, не добавляем
    if (document.getElementById('pageLoader')) return;
    
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    
    // Скрываем loader после полной загрузки
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('pageLoader');
            if (loader) {
                loader.classList.add('hidden');
                // Удаляем из DOM через 0.5 секунды (после анимации)
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }
        }, 300); // Минимальное время показа loader
    });
});

// Показываем loader сразу (до DOMContentLoaded)
if (document.readyState === 'loading') {
    document.write(loaderHTML);
}
