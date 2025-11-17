// ========== CONFIGURACIÓN DEL JUEGO ==========
const GAME_CONFIG = {
    GRAVITY: 0.8,
    JUMP_STRENGTH: -12,
    VIKING_X: 80,
    SCROLL_SPEED: 5,
    OBSTACLE_SPAWN_RATE: 120,
    BONUS_SPAWN_RATE: 300,
    INITIAL_LIVES: 3,
    get WORLD_WIDTH() { 
        const container = document.getElementById('flappyGameContainer');
        return container ? container.offsetWidth : 800; 
    },
    get WORLD_HEIGHT() { 
        const container = document.getElementById('flappyGameContainer');
        return container ? container.offsetHeight : 600; 
    },
    OBSTACLE_GAP: 200,
    OBSTACLE_WIDTH: 60,
    MIN_GAP_Y: 150,
    MAX_GAP_Y: 400
};

// ========== ESTADO DEL JUEGO ==========
const gameState = {
    isRunning: false,
    scrollOffset: 0,
    score: 0,
    distance: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    gameStarted: false
};

// ========== CLASE VIKING SIMPLIFICADA ==========
class Viking {
    constructor() {
        this.element = document.getElementById('viking');
        this.x = GAME_CONFIG.VIKING_X;
        this.y = GAME_CONFIG.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        this.isDead = false;
        this.width = 40;
        this.height = 50;
        
        console.log("🦅 Vikingo creado en posición:", this.x, this.y);
    }

    jump() {
        console.log("🔄 Intento de salto - gameStarted:", gameState.gameStarted, "isDead:", this.isDead);
        
        if (!gameState.gameStarted) {
            this.startGame();
            return;
        }
        
        if (!this.isDead && gameState.gameStarted) {
            this.velocityY = GAME_CONFIG.JUMP_STRENGTH;
            console.log("🚀 Saltando! Velocidad Y:", this.velocityY);
        }
    }

    startGame() {
        console.log("🎮 INICIANDO JUEGO!");
        gameState.gameStarted = true;
        gameState.isRunning = true;
        this.velocityY = GAME_CONFIG.JUMP_STRENGTH;
        
        // Ocultar instrucciones
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }
        
        console.log("✅ Juego iniciado correctamente");
    }

    update() {
        if (!this.isDead && gameState.gameStarted) {
            // Aplicar gravedad
            this.velocityY += GAME_CONFIG.GRAVITY;
            this.y += this.velocityY;

            // Limites de pantalla
            const minY = 50;
            const maxY = GAME_CONFIG.WORLD_HEIGHT - this.height - 20;
            
            if (this.y < minY) {
                this.y = minY;
                this.velocityY = 0;
            }
            
            if (this.y > maxY) {
                this.y = maxY;
                this.velocityY = 0;
                if (!this.isDead) {
                    this.takeDamage();
                }
            }

            this.render();
        }
    }

    render() {
        this.element.style.top = `${this.y}px`;
        this.element.style.left = `${this.x}px`;
    }

    takeDamage() {
        if (this.isDead) return;

        gameState.lives--;
        document.getElementById('lives').textContent = gameState.lives;
        
        console.log(`💥 Daño recibido! Vidas: ${gameState.lives}`);
        
        // Efecto visual
        this.element.style.animation = 'vikingDamage 0.5s';
        setTimeout(() => {
            if (!this.isDead) {
                this.element.style.animation = '';
            }
        }, 500);
        
        if (gameState.lives <= 0) {
            this.die();
        } else {
            // Pequeño rebote
            this.velocityY = GAME_CONFIG.JUMP_STRENGTH * 0.5;
        }
    }

    die() {
        console.log("💀 Vikingo murió");
        this.isDead = true;
        this.element.style.animation = 'vikingDeath 1s forwards';
        
        setTimeout(() => {
            endGame();
        }, 1000);
    }

    getCollisionRect() {
        return {
            left: this.x + 5,
            right: this.x + this.width - 5,
            top: this.y + 5,
            bottom: this.y + this.height - 5
        };
    }
}

// ========== CLASE OBSTÁCULO SIMPLIFICADA ==========
class Obstacle {
    constructor(x) {
        this.x = x;
        this.width = GAME_CONFIG.OBSTACLE_WIDTH;
        this.passed = false;
        
        // Calcular altura del gap
        const gapY = Math.random() * (GAME_CONFIG.MAX_GAP_Y - GAME_CONFIG.MIN_GAP_Y) + GAME_CONFIG.MIN_GAP_Y;
        const gapHeight = GAME_CONFIG.OBSTACLE_GAP;
        
        this.topHeight = gapY - gapHeight / 2;
        this.bottomHeight = GAME_CONFIG.WORLD_HEIGHT - (gapY + gapHeight / 2);
        this.bottomY = gapY + gapHeight / 2;

        // Crear elementos
        this.topElement = this.createObstacleElement('obstacle-top', this.topHeight);
        this.bottomElement = this.createObstacleElement('obstacle-bottom', this.bottomHeight);
        
        console.log("🏔️ Obstáculo creado en x:", x);
    }

    createObstacleElement(className, height) {
        const element = document.createElement('div');
        element.className = `obstacle ${className}`;
        element.style.left = `${this.x}px`;
        element.style.width = `${this.width}px`;
        element.style.height = `${height}px`;
        
        if (className === 'obstacle-bottom') {
            element.style.bottom = '0px';
        }
        
        document.getElementById('obstaclesContainer').appendChild(element);
        return element;
    }

    update() {
        if (gameState.gameStarted) {
            this.x -= GAME_CONFIG.SCROLL_SPEED;
        }
        
        this.topElement.style.left = `${this.x}px`;
        this.bottomElement.style.left = `${this.x}px`;

        // Verificar si salió de pantalla
        if (this.x < -this.width) {
            this.remove();
            return true;
        }
        
        return false;
    }

    remove() {
        if (this.topElement.parentNode) {
            this.topElement.remove();
        }
        if (this.bottomElement.parentNode) {
            this.bottomElement.remove();
        }
    }

    getTopCollisionRect() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: 0,
            bottom: this.topHeight
        };
    }

    getBottomCollisionRect() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: GAME_CONFIG.WORLD_HEIGHT - this.bottomHeight,
            bottom: GAME_CONFIG.WORLD_HEIGHT
        };
    }
}

// ========== CLASE BONUS SIMPLIFICADA ==========
class Bonus {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.collected = false;
        
        this.element = document.createElement('div');
        this.element.className = 'bonus';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        
        document.getElementById('bonusesContainer').appendChild(this.element);
        
        console.log("💰 Bonus creado en:", x, y);
    }

    update() {
        if (gameState.gameStarted) {
            this.x -= GAME_CONFIG.SCROLL_SPEED;
        }
        
        this.element.style.left = `${this.x}px`;

        if (this.x < -50) {
            this.remove();
            return true;
        }
        return false;
    }

    collect() {
        if (!this.collected) {
            this.collected = true;
            gameState.score += 50;
            document.getElementById('score').textContent = gameState.score;
            
            this.element.style.animation = 'bonusCollect 0.5s forwards';
            setTimeout(() => this.remove(), 500);
            
            console.log("⭐ Bonus recolectado! Puntaje:", gameState.score);
            return true;
        }
        return false;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.remove();
        }
    }

    getCollisionRect() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}

// ========== FUNCIONES DEL JUEGO ==========
function updateParallax() {
    if (!gameState.gameStarted) return;
    
    const offset = gameState.scrollOffset;

    document.getElementById('cloudsLayer').style.backgroundPosition = `${-offset * 0.2}px 0`;
    document.getElementById('mountainsFarLayer').style.backgroundPosition = `${-offset * 0.4}px 0`;
    document.getElementById('mountainsNearLayer').style.backgroundPosition = `${-offset * 0.6}px 0`;
    document.getElementById('groundLayer').style.backgroundPosition = `${-offset}px 0`;
}

function spawnObstacle() {
    if (!gameState.gameStarted) return;
    
    const obstacle = new Obstacle(GAME_CONFIG.WORLD_WIDTH);
    obstacles.push(obstacle);
    console.log("🆕 Obstáculo generado. Total:", obstacles.length);
}

function spawnBonus() {
    if (!gameState.gameStarted) return;
    
    const x = GAME_CONFIG.WORLD_WIDTH;
    const y = Math.random() * (GAME_CONFIG.WORLD_HEIGHT - 200) + 100;
    const bonus = new Bonus(x, y);
    bonuses.push(bonus);
}

function checkCollisions() {
    if (!gameState.gameStarted || viking.isDead) return;

    const vikingRect = viking.getCollisionRect();

    // Colisiones con obstáculos
    for (let i = 0; i < obstacles.length; i++) {
        const ob = obstacles[i];
        
        const topCollision = rectsOverlap(vikingRect, ob.getTopCollisionRect());
        const bottomCollision = rectsOverlap(vikingRect, ob.getBottomCollisionRect());
        
        if (topCollision || bottomCollision) {
            console.log("💥 Colisión con obstáculo!");
            viking.takeDamage();
            break;
        }
    }

    // Colisiones con bonus
    for (let i = 0; i < bonuses.length; i++) {
        const bonus = bonuses[i];
        if (!bonus.collected && rectsOverlap(vikingRect, bonus.getCollisionRect())) {
            bonus.collect();
        }
    }
}

function rectsOverlap(a, b) {
    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}

// ========== VARIABLES GLOBALES ==========
let viking = null;
let obstacles = [];
let bonuses = [];

let obstacleSpawnCounter = 0;
let bonusSpawnCounter = 0;

// ========== BUCLE PRINCIPAL ==========
function updateGame() {
    if (!gameState.isRunning) {
        requestAnimationFrame(updateGame);
        return;
    }

    // Actualizar vikingo
    if (viking) {
        viking.update();
    }
    
    // Actualizar juego
    if (gameState.gameStarted) {
        gameState.scrollOffset += GAME_CONFIG.SCROLL_SPEED;
        gameState.distance = Math.floor(gameState.scrollOffset / 10);
        document.getElementById('distance').textContent = gameState.distance;
    }
    
    updateParallax();
    
    // Generar obstáculos
    obstacleSpawnCounter++;
    if (obstacleSpawnCounter >= GAME_CONFIG.OBSTACLE_SPAWN_RATE) {
        spawnObstacle();
        obstacleSpawnCounter = 0;
    }
    
    // Generar bonuses
    bonusSpawnCounter++;
    if (bonusSpawnCounter >= GAME_CONFIG.BONUS_SPAWN_RATE) {
        spawnBonus();
        bonusSpawnCounter = 0;
    }
    
    // Actualizar obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].update()) {
            obstacles.splice(i, 1);
        }
    }
    
    // Actualizar bonuses
    for (let i = bonuses.length - 1; i >= 0; i--) {
        if (bonuses[i].update()) {
            bonuses.splice(i, 1);
        }
    }
    
    checkCollisions();
    
    requestAnimationFrame(updateGame);
}

function endGame() {
    console.log("🎯 Fin del juego");
    gameState.isRunning = false;
    
    const gameOverScreen = document.getElementById('gameOverScreen');
    document.getElementById('finalScore').textContent = `Puntaje Final: ${gameState.score}`;
    document.getElementById('finalDistance').textContent = `Distancia: ${gameState.distance}`;
    
    setTimeout(() => {
        gameOverScreen.classList.add('active');
    }, 1000);
}

function restartGame() {
    console.log("🔄 Reiniciando juego...");
    
    // Limpiar contenedores
    document.getElementById('obstaclesContainer').innerHTML = '';
    document.getElementById('bonusesContainer').innerHTML = '';
    
    // Resetear estado del juego
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.distance = 0;
    gameState.lives = GAME_CONFIG.INITIAL_LIVES;
    gameState.gameStarted = false;
    gameState.scrollOffset = 0;
    
    // Actualizar UI
    document.getElementById('score').textContent = '0';
    document.getElementById('distance').textContent = '0';
    document.getElementById('lives').textContent = GAME_CONFIG.INITIAL_LIVES;
    
    // Limpiar arrays
    obstacles = [];
    bonuses = [];
    
    // Ocultar pantalla de game over
    document.getElementById('gameOverScreen').classList.remove('active');
    
    // Reiniciar vikingo
    if (viking) {
        viking.isDead = false;
        viking.y = GAME_CONFIG.WORLD_HEIGHT / 2;
        viking.velocityY = 0;
        viking.element.style.animation = '';
        viking.render();
    }
    
    // Mostrar instrucciones
    const instructions = document.querySelector('.instructions');
    if (instructions) {
        instructions.style.display = 'block';
    }
    
    // Resetear contadores
    obstacleSpawnCounter = 0;
    bonusSpawnCounter = 0;
    
    console.log("✅ Juego reiniciado");
}

// ========== INICIALIZACIÓN ==========
function initGame() {
    console.log("🎮 Iniciando Valhalla Flight...");
    
    // Verificar elementos del DOM
    const gameContainer = document.getElementById('flappyGameContainer');
    const vikingElement = document.getElementById('viking');
    
    if (!gameContainer) {
        console.error("❌ No se encontró flappyGameContainer");
        return;
    }
    
    if (!vikingElement) {
        console.error("❌ No se encontró el vikingo");
        return;
    }
    
    console.log("✅ Elementos del DOM encontrados");
    
    // Crear instancia del vikingo
    viking = new Viking();
    
    // Iniciar bucle del juego
    gameState.isRunning = true;
    updateGame();
    
    console.log("🚀 Juego inicializado correctamente");
}

// ========== EVENT LISTENERS MEJORADOS ==========
function setupEventListeners() {
    // Click para saltar
    document.addEventListener('click', function(event) {
        // Evitar que el click en otros elementos active el salto
        if (!event.target.closest('.btn-restart') && !event.target.closest('#toggleShare')) {
            if (viking) {
                viking.jump();
            }
        }
    });
    
    // Espacio para saltar
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            if (viking) {
                viking.jump();
            }
        }
    });
    
    console.log("🎯 Event listeners configurados");
}

// ========== INICIALIZACIÓN AL CARGAR LA PÁGINA ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM cargado, inicializando juego...");
    initGame();
    setupEventListeners();
});

// También inicializar si la página ya está cargada
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initGame, 100);
}

// Hacer restartGame global para que el HTML pueda llamarlo
window.restartGame = restartGame;