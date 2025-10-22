// Красивый снегопад для всех страниц
class Snowflake {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * -100;
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.6 + 0.4;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Если снежинка вышла за экран, создаем новую сверху
        if (this.y > window.innerHeight) {
            this.y = -10;
            this.x = Math.random() * window.innerWidth;
        }

        // Если снежинка ушла за край по X
        if (this.x > window.innerWidth) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = window.innerWidth;
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SnowEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.snowflakes = [];
        this.isActive = true;
        this.animationId = null;

        // Стили canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';

        document.body.appendChild(this.canvas);

        this.resize();
        this.createSnowflakes();
        this.animate();

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createSnowflakes() {
        const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 100);
        for (let i = 0; i < count; i++) {
            this.snowflakes.push(new Snowflake());
        }
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.snowflakes.length; i++) {
            this.snowflakes[i].update();
            this.snowflakes[i].draw(this.ctx);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Автоматически запускаем снегопад при загрузке страницы
let snowEffect = null;

function initSnow() {
    try {
        // Проверяем настройку снегопада
        const snowEnabled = localStorage.getItem('snowEnabled');
        
        if (snowEnabled === null || snowEnabled === 'true') {
            if (!snowEffect) {
                snowEffect = new SnowEffect();
                console.log('❄️ Снегопад активирован');
            }
        }
    } catch (error) {
        console.error('Ошибка инициализации снега:', error);
    }
}

// Запускаем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnow);
} else {
    // DOM уже загружен
    initSnow();
}

// Функция для включения/выключения снегопада
function toggleSnow() {
    const snowEnabled = localStorage.getItem('snowEnabled');
    
    if (snowEnabled === 'false') {
        localStorage.setItem('snowEnabled', 'true');
        if (!snowEffect) {
            snowEffect = new SnowEffect();
        }
    } else {
        localStorage.setItem('snowEnabled', 'false');
        if (snowEffect) {
            snowEffect.stop();
            snowEffect = null;
        }
    }
}
