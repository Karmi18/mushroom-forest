// ============================================
// ГРИБНОЙ ЛЕС 
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🍄 Грибной Лес - Идеальная версия');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const hpIcons = document.getElementById('hpIcons');
    const dayDisplay = document.getElementById('dayDisplay');
    const restartBtn = document.getElementById('restartBtn');
    
    // РАЗМЕРЫ
    canvas.width = 800;
    canvas.height = 400;
    
    // ФИЗИКА
    const GRAVITY = 0.5;
    const JUMP_FORCE = -10;
    const MOVE_SPEED = 5;
    
    // ========================================
    // ИГРОК
    // ========================================
    
    let player = {
        x: 100,
        y: 300,
        width: 26,
        height: 36,
        velY: 0,
        grounded: false
    };
    
    // Камера
    let cameraOffset = 0;
    
    // ========================================
    // ГРИБЫ
    // ========================================
    
    let mushrooms = [];
    let poisonTrails = [];
    let explosions = [];
    
    // Типы грибов
    const mushroomTypes = [
        { // КРАСНЫЙ - движется
            color: '#ff4d6d', glowColor: '#ff6b8b',
            moving: true, speed: 1.2
        },
        { // ФИОЛЕТОВЫЙ - ядовитый
            color: '#bf7fff', glowColor: '#d49cff',
            moving: false, poisonous: true
        },
        { // РОЗОВЫЙ - взрывной
            color: '#f2b5c4', glowColor: '#ffc0cb',
            moving: true, speed: 0.8, explosive: true
        },
        { // БОРОВИК - обычный
            color: '#f2b5c4', glowColor: '#ffc0cb',
            moving: false, harmless: true
        }
    ];
    
    function createMushroom(x, y, typeIndex) {
        const type = mushroomTypes[typeIndex];
        let mushroom = {
            x: x,
            y: y,
            width: 34,
            height: 34,
            color: type.color,
            glowColor: type.glowColor,
            alive: true,
            respawnTimer: 0,
            poisonous: type.poisonous || false,
            explosive: type.explosive || false,
            harmless: type.harmless || false,
            typeIndex: typeIndex
        };
        
        if (type.moving) {
            mushroom.moving = true;
            mushroom.speed = type.speed || 1;
            mushroom.direction = 1;
            mushroom.minX = x - 100;
            mushroom.maxX = x + 100;
        }
        
        return mushroom;
    }
    
    // ========================================
    // ПЛАТФОРМЫ
    // ========================================
    
    let platforms = [
        // ОСНОВНАЯ ЗЕМЛЯ - 1 МИЛЛИОН ПИКСЕЛЕЙ
        { x: 0, y: 350, width: 1000000, height: 30, type: 'ground' },
        
        // МАЛЕНЬКИЕ ПЛАТФОРМЫ
        { x: 400, y: 280, width: 100, height: 15 },
        { x: 600, y: 230, width: 100, height: 15 },
        { x: 800, y: 180, width: 100, height: 15 },
        { x: 1000, y: 250, width: 100, height: 15 },
        { x: 1200, y: 200, width: 100, height: 15 },
        { x: 1400, y: 280, width: 100, height: 15 },
        { x: 1600, y: 230, width: 100, height: 15 },
        { x: 1800, y: 180, width: 100, height: 15 },
        { x: 2000, y: 250, width: 100, height: 15 },
        { x: 2200, y: 280, width: 100, height: 15 },
        { x: 2400, y: 200, width: 100, height: 15 },
        { x: 2600, y: 230, width: 100, height: 15 },
        { x: 2800, y: 180, width: 100, height: 15 },
        { x: 3000, y: 250, width: 100, height: 15 }
    ];
    
    // Домик
    let house = {
        x: 50,
        y: 310,
        width: 50,
        height: 40
    };
    
    // ДЕРЕВЬЯ
    let trees = [];
    for (let i = 0; i < 500; i++) {
        trees.push({
            x: i * 100 + Math.random() * 100,
            y: 200 + Math.random() * 80,
            height: 100 + Math.random() * 70,
            width: 8 + Math.random() * 8,
            color: `rgba(74, 44, 95, ${0.15 + Math.random() * 0.2})`
        });
    }
    
    // ========================================
    // НАЧАЛЬНЫЕ ГРИБЫ
    // ========================================
    
    function initMushrooms() {
        mushrooms = [
            // Грибы на земле
            createMushroom(300, 320, 0), // Красный
            createMushroom(500, 320, 1), // Фиолетовый (на земле)
            createMushroom(200, 320, 3), // Боровик
            createMushroom(400, 320, 3), // Боровик
            
            // Грибы на платформах (фиолетовые ТОЛЬКО на НЕКОТОРЫХ!)
            createMushroom(430, 260, 2), // Розовый на платформе 400
            createMushroom(630, 210, 3), // Боровик на платформе 600
            createMushroom(830, 160, 1), // Фиолетовый на платформе 800 (ОДИН!)
            createMushroom(1030, 230, 3), // Боровик на платформе 1000
            createMushroom(1230, 180, 2), // Розовый на платформе 1200
            createMushroom(1430, 260, 3), // Боровик на платформе 1400
            createMushroom(1630, 210, 1), // Фиолетовый на платформе 1600 (ЕЩЕ ОДИН!)
            createMushroom(1830, 160, 3), // Боровик на платформе 1800
            createMushroom(2030, 230, 2), // Розовый на платформе 2000
            createMushroom(2230, 260, 3), // Боровик на платформе 2200
            createMushroom(2430, 180, 1), // Фиолетовый на платформе 2400 (И ЕЩЕ ОДИН!)
            createMushroom(2630, 210, 3), // Боровик на платформе 2600
            createMushroom(2830, 160, 3), // Боровик на платформе 2800
            createMushroom(3030, 230, 2)  // Розовый на платформе 3000
        ];
    }
    initMushrooms();
    
    // ИГРОВЫЕ ПЕРЕМЕННЫЕ
    let hp = 5;
    let maxHp = 5;
    let day = 1;
    let gameRunning = true;
    let keys = {};
    let frameCount = 0;
    let dayTimer = 0;
    const DAY_LENGTH = 7200; // 2 минуты
    
    // ========================================
    // УПРАВЛЕНИЕ
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        keys[e.code] = true;
        
        if (e.code === 'Space' && player.grounded) {
            player.velY = JUMP_FORCE;
            player.grounded = false;
        }
        
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', function(e) {
        keys[e.code] = false;
    });
    
    // ========================================
    // ДВИЖЕНИЕ 
    // ========================================
    
    function movePlayer() {
        if (!gameRunning) return;
        
        if (keys['ArrowRight'] || keys['KeyD']) {
            player.x += MOVE_SPEED;
        }
        
        if (keys['ArrowLeft'] || keys['KeyA']) {
            if (player.x > 20) {
                player.x -= MOVE_SPEED;
            }
        }
        
        // Камера ТОЧНО следует за игроком 
        cameraOffset = player.x - 300;
        if (cameraOffset < 0) cameraOffset = 0;
    }
    
    // ФИЗИКА
    function applyGravity() {
        player.velY += GRAVITY;
        player.y += player.velY;
    }
    
    function handleCollisions() {
        player.grounded = false;
        
        platforms.forEach(platform => {
            let platformScreenX = platform.x - cameraOffset;
            
            if (player.x < platformScreenX + platform.width &&
                player.x + player.width > platformScreenX &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height) {
                
                if (player.velY >= 0 && player.y + player.height - player.velY <= platform.y + 5) {
                    player.y = platform.y - player.height;
                    player.velY = 0;
                    player.grounded = true;
                }
            }
        });
        
        if (player.y > canvas.height) {
            player.x = 100;
            player.y = 300;
            hp--;
            updateHpDisplay();
            if (hp <= 0) gameOver();
        }
    }
    
    // ОБНОВЛЕНИЕ HP
    function updateHpDisplay() {
        if (!hpIcons) return;
        hpIcons.innerHTML = '';
        for (let i = 0; i < maxHp; i++) {
            const heart = document.createElement('div');
            heart.className = 'hp-icon' + (i < hp ? '' : ' empty');
            hpIcons.appendChild(heart);
        }
    }
    
    // ОБНОВЛЕНИЕ ДНЕЙ
    function updateDayCounter() {
        dayTimer++;
        if (dayTimer >= DAY_LENGTH) {
            dayTimer = 0;
            day++;
            if (dayDisplay) dayDisplay.textContent = `ДЕНЬ ${day}`;
        }
    }
    
    // ОБНОВЛЕНИЕ ГРИБОВ
    function updateMushrooms() {
        // Ядовитые следы
        poisonTrails = poisonTrails.filter(trail => {
            trail.life--;
            return trail.life > 0;
        });
        
        // Взрывы
        explosions = explosions.filter(exp => {
            exp.life--;
            return exp.life > 0;
        });
        
        mushrooms.forEach(m => {
            if (!m.alive) {
                m.respawnTimer--;
                if (m.respawnTimer <= 0) {
                    m.alive = true;
                    m.x = player.x + Math.random() * 500 + 200;
                }
                return;
            }
            
            // Движение гриба
            if (m.moving) {
                m.x += m.speed * m.direction;
                if (m.x < m.minX) m.direction = 1;
                if (m.x > m.maxX) m.direction = -1;
            }
            
            // Проверка на взрыв (розовый гриб)
            if (m.explosive && m.alive) {
                let mushroomScreenX = m.x - cameraOffset;
                let dx = Math.abs(mushroomScreenX - player.x);
                let dy = Math.abs(m.y - player.y);
                
                // Если игрок близко - ВЗРЫВ!
                if (dx < 70 && dy < 70) {
                    // Взрывная волна
                    explosions.push({
                        x: mushroomScreenX,
                        y: m.y - 10,
                        life: 20
                    });
                    
                    // Урон игроку, если совсем близко
                    if (dx < 40 && dy < 40) {
                        hp -= 2;
                        updateHpDisplay();
                        player.velY = JUMP_FORCE / 2;
                        
                        // Отбрасывание
                        if (player.x < mushroomScreenX) {
                            player.x -= 30;
                        } else {
                            player.x += 30;
                        }
                    }
                    
                    m.alive = false;
                    m.respawnTimer = 300; // 5 секунд
                }
            }
            
            // Столкновение с игроком
            let mushroomScreenX = m.x - cameraOffset;
            
            if (player.x < mushroomScreenX + m.width &&
                player.x + player.width > mushroomScreenX &&
                player.y < m.y + m.height &&
                player.y + player.height > m.y) {
                
                // Прыжок на гриб
                if (player.velY > 0 && player.y + player.height - player.velY <= m.y + 5) {
                    if (m.poisonous) {
                        // Фиолетовый оставляет ядовитый след
                        poisonTrails.push({
                            x: mushroomScreenX,
                            y: m.y,
                            life: 60
                        });
                    }
                    
                    m.alive = false;
                    m.respawnTimer = 300;
                    player.velY = JUMP_FORCE / 1.5;
                } 
                // Касание сбоку
                else if (!m.harmless) {
                    hp--;
                    updateHpDisplay();
                    
                    if (player.x < mushroomScreenX) {
                        player.x = mushroomScreenX - player.width - 10;
                    } else {
                        player.x = mushroomScreenX + m.width + 10;
                    }
                    
                    if (hp <= 0) gameOver();
                }
            }
        });
    }
    
    // ГЕНЕРАЦИЯ НОВЫХ ПЛАТФОРМ И ГРИБОВ
    function generateNewContent() {
        let lastPlatformX = Math.max(...platforms.map(p => p.x));
        
        if (player.x + 1000 > lastPlatformX - 500) {
            let newX = lastPlatformX + 400 + Math.random() * 200;
            
            // Новая платформа
            platforms.push({
                x: newX,
                y: 200 + Math.random() * 150,
                width: 100,
                height: 15
            });
            
            // Добавляем грибы на новую платформу
            let mushroomY = platforms[platforms.length-1].y - 40;
            
            // ТОЛЬКО ИНОГДА ФИОЛЕТОВЫЙ!
            let random = Math.random();
            if (random < 0.2) {
                // 20% - фиолетовый (редкий)
                mushrooms.push(createMushroom(newX + 30, mushroomY, 1));
            } else if (random < 0.5) {
                // 30% - розовый
                mushrooms.push(createMushroom(newX + 30, mushroomY, 2));
            } else {
                // 50% - боровик (обычный)
                mushrooms.push(createMushroom(newX + 30, mushroomY, 3));
            }
            
            // Иногда добавляем красный на землю
            if (Math.random() > 0.7) {
                mushrooms.push(createMushroom(newX + 150, 320, 0));
            }
        }
    }
    
    function gameOver() {
        gameRunning = false;
        setTimeout(() => {
            hp = maxHp;
            player.x = 100;
            player.y = 300;
            cameraOffset = 0;
            gameRunning = true;
            updateHpDisplay();
            initMushrooms();
        }, 1000);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            hp = maxHp;
            player.x = 100;
            player.y = 300;
            cameraOffset = 0;
            day = 1;
            dayTimer = 0;
            if (dayDisplay) dayDisplay.textContent = 'ДЕНЬ 1';
            updateHpDisplay();
            initMushrooms();
        });
    }
    
    // ========================================
    // ОТРИСОВКА
    // ========================================
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // ФОН
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a0b2e');
        gradient.addColorStop(1, '#2a1b3d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // ДЕРЕВЬЯ
        trees.forEach(tree => {
            let treeX = tree.x - cameraOffset * 0.3;
            if (treeX < -200) treeX += 20000;
            if (treeX > canvas.width + 200) treeX -= 20000;
            
            if (treeX > -100 && treeX < canvas.width + 100) {
                ctx.fillStyle = tree.color;
                ctx.fillRect(treeX, tree.y - tree.height, tree.width, tree.height);
                ctx.beginPath();
                ctx.arc(treeX + tree.width/2, tree.y - tree.height - 5, tree.width, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // ПЛАТФОРМЫ
        platforms.forEach(p => {
            let platformX = p.x - cameraOffset;
            if (platformX > -200 && platformX < canvas.width + 200) {
                ctx.fillStyle = '#4a2c5f';
                ctx.fillRect(platformX, p.y, p.width, p.height);
                ctx.strokeStyle = '#9d4edd';
                ctx.strokeRect(platformX, p.y, p.width, p.height);
            }
        });
        
        // ЯДОВИТЫЕ СЛЕДЫ
        poisonTrails.forEach(trail => {
            let alpha = trail.life / 60;
            ctx.fillStyle = `rgba(157, 78, 221, ${alpha * 0.5})`;
            ctx.shadowColor = '#bf7fff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(trail.x + 17, trail.y - 10, 25, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // ВЗРЫВЫ
        explosions.forEach(exp => {
            let size = 30 + (20 - exp.life) * 3;
            let alpha = exp.life / 20;
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(exp.x + 17, exp.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // ДОМИК
        let houseX = house.x - cameraOffset;
        if (houseX > -100 && houseX < canvas.width + 100) {
            ctx.fillStyle = '#4a2c5f';
            ctx.fillRect(houseX, house.y, house.width, house.height);
            
            ctx.fillStyle = '#9d4edd';
            ctx.beginPath();
            ctx.moveTo(houseX - 5, house.y);
            ctx.lineTo(houseX + house.width/2, house.y - 15);
            ctx.lineTo(houseX + house.width + 5, house.y);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#d88c9a';
            ctx.fillRect(houseX + 15, house.y + 15, 20, 25);
            
            ctx.shadowColor = '#9d4edd';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // ГРИБЫ
        mushrooms.forEach(m => {
            if (!m.alive) return;
            
            let mushroomX = m.x - cameraOffset;
            if (mushroomX > -100 && mushroomX < canvas.width + 100) {
                ctx.shadowColor = m.glowColor;
                ctx.shadowBlur = 20;
                
                ctx.fillStyle = '#4a2c5f';
                ctx.fillRect(mushroomX + 9, m.y, 16, m.height - 6);
                
                ctx.fillStyle = m.color;
                ctx.beginPath();
                ctx.ellipse(mushroomX + m.width/2, m.y - 6, m.width/2, 8, 0, 0, Math.PI*2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
            }
        });
        
        // ИГРОК
        let headY = player.y - 6 + Math.sin(frameCount * 0.1) * 1;
        
        // Шляпа
        ctx.fillStyle = '#9d4edd';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, headY - 8, 12, 4, 0, 0, Math.PI*2);
        ctx.fill();
        
        // Голова
        ctx.fillStyle = '#f2b5c4';
        ctx.shadowColor = '#d88c9a';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, headY, 10, 0, Math.PI*2);
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = '#1a0b2e';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(player.x + 7, headY - 3, 2, 0, Math.PI*2);
        ctx.arc(player.x + player.width - 7, headY - 3, 2, 0, Math.PI*2);
        ctx.fill();
        
        // Блик
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(player.x + 6, headY - 4, 0.8, 0, Math.PI*2);
        ctx.arc(player.x + player.width - 8, headY - 4, 0.8, 0, Math.PI*2);
        ctx.fill();
        
        // Тело
        ctx.fillStyle = '#4a2c5f';
        ctx.shadowBlur = 8;
        ctx.fillRect(player.x + 4, player.y, 18, player.height);
        
        ctx.shadowBlur = 0;
        
        frameCount++;
        
        // ГЕНЕРАЦИЯ НОВЫХ ПЛАТФОРМ
        generateNewContent();
    }
    
    // ========================================
    // ИГРОВОЙ ЦИКЛ
    // ========================================
    
    function gameLoop() {
        if (gameRunning) {
            movePlayer();
            applyGravity();
            handleCollisions();
            updateMushrooms();
            updateDayCounter();
        }
        
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // ЗАПУСК
    updateHpDisplay();
    gameLoop();
    console.log('✅ Идеальная версия запущена!');
    
});

// ========================================
// ФОРМА ОТЗЫВА 
// ========================================

const reviewForm = document.getElementById('reviewForm');
const reviewsContainer = document.getElementById('reviewsContainer');

function createReviewElement(name, email, text) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <strong>${escapeHtml(name)}</strong>
        <p style="color: var(--soft-pink); font-size: 0.85em; margin: 5px 0;">✉️ ${escapeHtml(email)}</p>
        <p style="margin: 10px 0;">${escapeHtml(text)}</p>
        <div class="review-date" style="color: var(--soft-pink); font-size: 0.75em;">📅 ${dateStr} в ${timeStr}</div>
    `;
    
    return div;
}

// Функция для защиты от XSS-атак 
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Загружаем сохраненные отзывы при запуске
if (reviewsContainer) {
    try {
        const savedReviews = localStorage.getItem('mushroomForestReviews');
        if (savedReviews) {
            const reviews = JSON.parse(savedReviews);
            reviewsContainer.innerHTML = '';
            
            reviews.forEach(review => {
                const reviewEl = createReviewElement(review.name, review.email, review.text);
                if (review.date) {
                    const dateEl = reviewEl.querySelector('.review-date');
                    const date = new Date(review.date);
                    dateEl.textContent = `📅 ${date.toLocaleDateString('ru-RU')} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
                }
                reviewsContainer.appendChild(reviewEl);
            });
        }
    } catch (e) {
        console.log('Ошибка загрузки отзывов:', e);
    }
}

// ОСНОВНОЙ ОБРАБОТЧИК С JS-ВАЛИДАЦИЕЙ 
if (reviewForm && reviewsContainer) {
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const reviewInput = document.getElementById('review');
        
        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const text = reviewInput?.value.trim();
        
        // JS-ВАЛИДАЦИЯ  
        let errors = [];
        
        // 1. Валидация имени
        if (!name) {
            errors.push('Введите имя');
        } else if (name.length < 2) {
            errors.push('Имя должно содержать минимум 2 символа');
        } else if (name.length > 50) {
            errors.push('Имя не должно превышать 50 символов');
        } else if (!/^[а-яА-Яa-zA-ZёЁ\s-]+$/.test(name)) {
            errors.push('Имя может содержать только буквы, пробелы и дефисы');
        }
        
        // 2. Валидация email
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!email) {
            errors.push('Введите email');
        } else if (!emailRegex.test(email)) {
            errors.push('Введите корректный email (например: name@domain.com)');
        }
        
        // 3. Валидация текста отзыва
        if (!text) {
            errors.push('Напишите текст отзыва');
        } else if (text.length < 10) {
            errors.push('Текст отзыва должен содержать минимум 10 символов');
        } else if (text.length > 500) {
            errors.push('Текст отзыва не должен превышать 500 символов');
        } else if (text.trim().length === 0) {
            errors.push('Текст отзыва не может состоять только из пробелов');
        }
        
        // Если есть ошибки - показываем и ПРЕРЫВАЕМ отправку
        if (errors.length > 0) {
            alert('❌ Ошибки:\n\n• ' + errors.join('\n• '));
            return; // ← форма НЕ отправляется!
        }
        
        // Сохраняем отзыв 
        alert(`✨ Спасибо, ${name}! Твой отзыв сохранен.`);
        
        // Удаляем заглушку "Пока нет отзывов"
        if (reviewsContainer.children.length === 1 && 
            reviewsContainer.children[0].classList?.contains('no-reviews')) {
            reviewsContainer.innerHTML = '';
        }
        
        // Создаем элемент отзыва
        const reviewEl = createReviewElement(name, email, text);
        reviewsContainer.prepend(reviewEl);
        
        // Сохраняем в localStorage
        let reviews = [];
        const saved = localStorage.getItem('mushroomForestReviews');
        if (saved) {
            reviews = JSON.parse(saved);
        }
        
        // Добавляем новый отзыв в начало
        reviews.unshift({
            name: name,
            email: email,
            text: text,
            date: new Date().toISOString()
        });
        
        // Ограничиваем количество сохраняемых отзывов (последние 20)
        if (reviews.length > 20) {
            reviews = reviews.slice(0, 20);
        }
        
        // Сохраняем обратно
        localStorage.setItem('mushroomForestReviews', JSON.stringify(reviews));
        
        // Очищаем форму
        nameInput.value = '';
        emailInput.value = '';
        reviewInput.value = '';
    });
}
