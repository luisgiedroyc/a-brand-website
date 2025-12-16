// Глобальные переменные
let currentScreen = 1;
let noiseItems = [];
let mouseX = 0;
let mouseY = 0;
let scene, camera, renderer, productModel;
let isMobile = window.innerWidth <= 768;
let touchStartX = 0;
let touchEndX = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let targetRotationY = 0;
let targetRotationX = 0;

// Буквы для шума (кириллица)
const letters = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const triggerWords = {
    'concept': 'КОНЦЕПЦИЯ',
    'products': 'ПРОДУКТЫ'
};

// Позиции для слов-триггеров (будут вычисляться динамически)
let triggerPositions = {};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем начальное состояние экранов
    const screen1 = document.getElementById('screen-1');
    const screen2 = document.getElementById('screen-2');
    const screen3 = document.getElementById('screen-3');
    
    if (screen1) {
        screen1.style.transform = 'translateX(0)';
        screen1.classList.add('active');
    }
    if (screen2) {
        screen2.style.transform = 'translateX(100vw)';
        screen2.style.display = 'flex';
    }
    if (screen3) {
        screen3.style.transform = 'translateX(200vw)';
        screen3.style.display = 'flex';
    }
    
    // Проверяем, что Three.js загружен
    if (typeof THREE === 'undefined') {
        console.error('Three.js не загружен!');
        return;
    }
    
    initNoise();
    initNavigation();
    initProductView(); // Инициализируем Three.js сцену, но модель создадим позже
    initMobileSupport();
    
    console.log('Сайт инициализирован');
});

// ========== ШУМ ==========
function initNoise() {
    const container = document.getElementById('noiseContainer');
    if (!container) {
        console.error('Контейнер шума не найден!');
        return;
    }

    // Очищаем контейнер перед созданием новых элементов
    container.innerHTML = '';
    noiseItems = [];
    triggerPositions = {};

    // Вычисляем количество ячеек для сетки
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const cellSize = 30; // размер ячейки для буквы
    const padding = 40;
    const cols = Math.max(1, Math.floor((containerWidth - padding) / cellSize));
    const rows = Math.max(1, Math.floor((containerHeight - padding) / cellSize));

    console.log(`Создаем сетку букв: ${cols} колонок x ${rows} строк`);

    // Создаем сетку букв
    const grid = [];
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            const item = document.createElement('div');
            item.className = 'noise-item';
            item.dataset.row = row;
            item.dataset.col = col;
            
            // Случайная буква
            item.textContent = letters[Math.floor(Math.random() * letters.length)];
            
            container.appendChild(item);
            grid[row][col] = item;
            noiseItems.push(item);
        }
    }

    // Размещаем слова-триггеры в сетке
    placeTriggerWords(grid, cols, rows);

    console.log(`Создано ${noiseItems.length} букв в сетке`);
    
    // Анимация изменения букв
    setInterval(() => {
        noiseItems.forEach(item => {
            if (!item.classList.contains('frozen') && !item.classList.contains('trigger-letter')) {
                // Меняем букву рандомно (80% вероятность)
                if (Math.random() > 0.2) {
                    item.textContent = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        });
    }, 1000); // Меняем каждую секунду

    // Реакция на курсор
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleNoiseClick);
}

function placeTriggerWords(grid, cols, rows) {
    // Размещаем "КОНЦЕПЦИЯ" (10 букв)
    const conceptWord = triggerWords.concept;
    const conceptStartCol = Math.floor(cols * 0.2);
    const conceptStartRow = Math.floor(rows * 0.3);
    
    for (let i = 0; i < conceptWord.length; i++) {
        if (conceptStartCol + i < cols && conceptStartRow < rows) {
            const item = grid[conceptStartRow][conceptStartCol + i];
            item.textContent = conceptWord[i];
            item.classList.add('trigger-letter', 'trigger-concept');
            item.dataset.target = 'concept';
            item.dataset.letterIndex = i;
        }
    }
    triggerPositions.concept = {
        row: conceptStartRow,
        col: conceptStartCol,
        length: conceptWord.length
    };

    // Размещаем "ПРОДУКТЫ" (8 букв)
    const productsWord = triggerWords.products;
    const productsStartCol = Math.floor(cols * 0.2);
    const productsStartRow = Math.floor(rows * 0.6);
    
    for (let i = 0; i < productsWord.length; i++) {
        if (productsStartCol + i < cols && productsStartRow < rows) {
            const item = grid[productsStartRow][productsStartCol + i];
            item.textContent = productsWord[i];
            item.classList.add('trigger-letter', 'trigger-products');
            item.dataset.target = 'products';
            item.dataset.letterIndex = i;
        }
    }
    triggerPositions.products = {
        row: productsStartRow,
        col: productsStartCol,
        length: productsWord.length
    };
}

function handleMouseMove(e) {
    if (currentScreen !== 1) return; // Только на первом экране
    
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Проверяем, наведен ли курсор на слово-триггер
    let hoveredTrigger = null;
    let closestTriggerLetter = null;
    let minDistance = Infinity;

    noiseItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - itemX, 2) + Math.pow(mouseY - itemY, 2)
        );

        if (item.classList.contains('trigger-letter')) {
            // Для букв-триггеров находим ближайшую
            if (distance < minDistance) {
                minDistance = distance;
                closestTriggerLetter = item;
            }
        } else {
            // Обычные буквы
            if (distance < 50) {
                item.classList.add('frozen');
                const intensity = 1 - (distance / 50);
                item.style.opacity = Math.min(0.5 + intensity * 0.3, 0.8);
            } else {
                item.classList.remove('frozen');
                item.style.opacity = 0.5;
            }
        }
    });

    // Если курсор близко к букве-триггеру, подсвечиваем все слово
    if (closestTriggerLetter && minDistance < 60) {
        const target = closestTriggerLetter.dataset.target;
        const allLetters = document.querySelectorAll(`.trigger-${target}`);
        
        allLetters.forEach(letter => {
            letter.classList.add('trigger-hover');
            letter.style.opacity = 1;
            letter.style.color = target === 'concept' ? 'var(--neon-pink)' : 'var(--neon-cyan)';
            letter.style.textShadow = `0 0 10px ${target === 'concept' ? 'var(--neon-pink)' : 'var(--neon-cyan)'}, 0 0 20px ${target === 'concept' ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`;
        });
        hoveredTrigger = target;
    } else {
        // Сбрасываем подсветку всех триггеров
        document.querySelectorAll('.trigger-letter').forEach(letter => {
            letter.classList.remove('trigger-hover');
            letter.style.opacity = 0.5;
            letter.style.color = 'var(--noise-gray)';
            letter.style.textShadow = 'none';
        });
    }
}

function handleNoiseClick(e) {
    if (currentScreen !== 1) return;
    
    const target = e.target.dataset.target;
    if (target && (target === 'concept' || target === 'products')) {
        console.log('Клик по триггеру:', target);
        navigateToScreen(2, target);
    }
}

// ========== НАВИГАЦИЯ ==========
function initNavigation() {
    // Продукты на втором экране
    document.querySelectorAll('.product-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const product = e.currentTarget.getAttribute('data-product');
            console.log('Клик по продукту:', product);
            navigateToScreen(3, product);
        });
    });

    // Хлебные крошки
    document.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const screen = parseInt(e.target.getAttribute('data-screen'));
            if (screen) {
                console.log('Навигация на экран:', screen);
                navigateToScreen(screen);
            }
        });
    });
}

function navigateToScreen(screen, data = null) {
    const screen1 = document.getElementById('screen-1');
    const screen2 = document.getElementById('screen-2');
    const screen3 = document.getElementById('screen-3');
    
    console.log('navigateToScreen вызвана:', screen, data);
    console.log('Экраны найдены:', { screen1: !!screen1, screen2: !!screen2, screen3: !!screen3 });
    
    // Убираем все классы active
    [screen1, screen2, screen3].forEach(s => {
        if (s) {
            s.classList.remove('active');
        }
    });

    // Применяем сдвиги через style.transform
    if (screen === 1) {
        // Возврат на главный экран
        if (screen1) {
            screen1.style.transform = 'translateX(0)';
            screen1.classList.add('active');
        }
        if (screen2) screen2.style.transform = 'translateX(100vw)';
        if (screen3) screen3.style.transform = 'translateX(200vw)';
        disposeModel();
    } else if (screen === 2) {
        // Переход на экран 2
        if (screen1) {
            screen1.style.transform = 'translateX(-100vw)';
            screen1.classList.remove('active');
        }
        if (screen2) {
            screen2.style.transform = 'translateX(0)';
            screen2.classList.add('active');
            screen2.style.display = 'flex';
            screen2.style.visibility = 'visible';
            screen2.style.opacity = '1';
        }
        if (screen3) screen3.style.transform = 'translateX(200vw)';
        
        // Показываем нужную панель
        if (data === 'concept') {
            const conceptPanel = document.getElementById('concept-panel');
            const productsPanel = document.getElementById('products-panel');
            if (conceptPanel) conceptPanel.style.display = 'flex';
            if (productsPanel) productsPanel.style.display = 'none';
            const currentSection = document.getElementById('currentSection');
            if (currentSection) currentSection.textContent = 'КОНЦЕПЦИЯ';
        } else if (data === 'products' || !data) {
            const conceptPanel = document.getElementById('concept-panel');
            const productsPanel = document.getElementById('products-panel');
            if (conceptPanel) conceptPanel.style.display = 'none';
            if (productsPanel) productsPanel.style.display = 'flex';
            const currentSection = document.getElementById('currentSection');
            if (currentSection) currentSection.textContent = 'ПРОДУКТЫ';
        }
    } else if (screen === 3) {
        // Переход на экран 3
        if (screen1) {
            screen1.style.transform = 'translateX(-200vw)';
            screen1.classList.remove('active');
        }
        if (screen2) screen2.style.transform = 'translateX(-100vw)';
        if (screen3) {
            screen3.style.transform = 'translateX(0)';
            screen3.classList.add('active');
            screen3.style.display = 'flex';
            screen3.style.visibility = 'visible';
            screen3.style.opacity = '1';
        }
        
        // Устанавливаем информацию о продукте и загружаем модель
        if (data === 'orb') {
            const title = document.getElementById('product-title');
            const desc = document.getElementById('product-description');
            const current = document.getElementById('currentProduct');
            if (title) title.textContent = 'A! ORB';
            if (desc) desc.textContent = 'Сферический светильник с мягким рассеянным светом. Идеален для создания атмосферы в любом пространстве.';
            if (current) current.textContent = 'A! ORB';
            setTimeout(() => loadProductModel('orb'), 100);
        } else if (data === 'pleat') {
            const title = document.getElementById('product-title');
            const desc = document.getElementById('product-description');
            const current = document.getElementById('currentProduct');
            if (title) title.textContent = 'A! PLEAT';
            if (desc) desc.textContent = 'Светильник со складчатой структурой. Создает уникальные световые паттерны и тени.';
            if (current) current.textContent = 'A! PLEAT';
            setTimeout(() => loadProductModel('pleat'), 100);
        }
    }

    currentScreen = screen;
    console.log(`Переход на экран ${screen} завершен`, {
        screen1Transform: screen1?.style.transform,
        screen2Transform: screen2?.style.transform,
        screen3Transform: screen3?.style.transform
    });
}

// ========== 3D МОДЕЛИ ==========
function initProductView() {
    const canvas = document.getElementById('product-canvas');
    if (!canvas) {
        console.warn('Canvas для 3D не найден, но это нормально для первого экрана');
        return;
    }

    try {
        // Сцена
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        // Камера
        const aspect = canvas.clientWidth > 0 ? canvas.clientWidth / canvas.clientHeight : 1;
        camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.set(0, 0, 5);

        // Рендерер
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Модель будет создана при переходе на экран продукта

        // Интерактивность курсора
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('touchmove', handleCanvasTouchMove);

        // Анимация
        animate();
        
        console.log('Three.js сцена инициализирована');
    } catch (error) {
        console.error('Ошибка инициализации Three.js:', error);
    }
}

function disposeModel() {
    if (!productModel) return;
    
    scene.remove(productModel);
    
    // Очистка ресурсов
    if (productModel instanceof THREE.Group) {
        productModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    } else if (productModel instanceof THREE.Mesh) {
        if (productModel.geometry) productModel.geometry.dispose();
        if (productModel.material) {
            if (Array.isArray(productModel.material)) {
                productModel.material.forEach(mat => mat.dispose());
            } else {
                productModel.material.dispose();
            }
        }
    }
    
    productModel = null;
}

function loadProductModel(productType) {
    // Удаляем старую модель
    disposeModel();

    // Пытаемся загрузить модель из папки models
    if (typeof THREE !== 'undefined') {
        // Проверяем наличие GLTFLoader
        let LoaderClass = null;
        // Проверяем различные варианты загрузки GLTFLoader
        if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
            LoaderClass = THREE.GLTFLoader;
        } else if (typeof GLTFLoader !== 'undefined') {
            LoaderClass = GLTFLoader;
        } else if (window.GLTFLoader) {
            LoaderClass = window.GLTFLoader;
        }
        
        if (LoaderClass) {
            const loader = new LoaderClass();
        const modelPath = `models/${productType}.glb`;
        
        console.log(`Попытка загрузить модель: ${modelPath}`);
        
        loader.load(
            modelPath,
            (gltf) => {
                console.log('Модель успешно загружена:', productType);
                disposeModel(); // Очищаем заглушку если она была создана
                productModel = gltf.scene;
                
                // Масштабируем модель если нужно
                const box = new THREE.Box3().setFromObject(productModel);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = 3 / maxDim;
                    productModel.scale.set(scale, scale, scale);
                }
                
                scene.add(productModel);
            },
            (progress) => {
                // Прогресс загрузки
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`Загрузка модели: ${percentComplete.toFixed(2)}%`);
                }
            },
            (error) => {
                console.warn('Ошибка загрузки модели из файла, используем заглушку:', error);
                // Если не удалось загрузить, создаем заглушку
                createPlaceholderModel(productType);
            }
            );
        } else {
            console.warn('GLTFLoader не доступен, используем заглушку');
            createPlaceholderModel(productType);
        }
    } else {
        console.warn('Three.js не загружен, используем заглушку');
        createPlaceholderModel(productType);
    }
}

function createPlaceholderModel(productType) {
    // Создаем заглушку модели
    if (productType === 'orb') {
        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.3,
            roughness: 0.7
        });
        productModel = new THREE.Mesh(geometry, material);
        scene.add(productModel);
    } else if (productType === 'pleat') {
        // Для PLEAT создаем складчатую форму
        const pleatGroup = new THREE.Group();
        
        for (let i = 0; i < 8; i++) {
            const pleat = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.3, 0.2),
                new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    metalness: 0.3,
                    roughness: 0.7
                })
            );
            pleat.position.z = -0.8 + (i * 0.2);
            pleat.rotation.y = Math.sin(i) * 0.2;
            pleatGroup.add(pleat);
        }
        
        productModel = pleatGroup;
        scene.add(productModel);
    }
}

function handleCanvasMouseMove(e) {
    if (!productModel || currentScreen !== 3) return;

    lastMouseX = Date.now();
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Устанавливаем целевое вращение
    targetRotationY = productModel.rotation.y + x * 0.3;
    targetRotationX = y * 0.3;
}

function handleCanvasTouchMove(e) {
    if (!productModel || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    productModel.rotation.y = x * 0.3;
    productModel.rotation.x = y * 0.3;
}

function animate() {
    requestAnimationFrame(animate);

    if (productModel && currentScreen === 3) {
        // Медленное вращение (только если нет активного взаимодействия с мышью)
        const timeSinceLastMove = Date.now() - (lastMouseX || 0);
        if (timeSinceLastMove > 100) {
            productModel.rotation.y += 0.005;
        } else {
            // Плавная интерполяция к целевому вращению
            productModel.rotation.y += (targetRotationY - productModel.rotation.y) * 0.1;
            productModel.rotation.x += (targetRotationX - productModel.rotation.x) * 0.1;
        }
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    if (renderer && camera) {
        const canvas = document.getElementById('product-canvas');
        if (canvas) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    }
    
    isMobile = window.innerWidth <= 768;
});

// ========== МОБИЛЬНАЯ ПОДДЕРЖКА ==========
function initMobileSupport() {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - переход вперед
                if (currentScreen === 1) {
                    navigateToScreen(2, 'products');
                } else if (currentScreen === 2) {
                    const activePanel = document.querySelector('.content-panel[style*="flex"], .content-panel:not([style*="none"])');
                    if (activePanel && activePanel.id === 'products-panel') {
                        navigateToScreen(3, 'orb');
                    }
                }
            } else {
                // Свайп вправо - переход назад
                if (currentScreen === 3) {
                    navigateToScreen(2, 'products');
                } else if (currentScreen === 2) {
                    navigateToScreen(1);
                }
            }
        }
    }
}

// Кнопка покупки
document.querySelector('.buy-button')?.addEventListener('click', () => {
    alert('Функция покупки будет реализована позже');
});

