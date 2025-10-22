// Loader при загрузке страницы (2 секунды)
(function() {
    // Функция скрытия loader
    function hideLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    // Скрываем loader через 2 секунды
    setTimeout(hideLoader, 2000);
})();
