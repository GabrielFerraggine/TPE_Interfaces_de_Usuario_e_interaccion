class Juego {
    // Configuración del juego como propiedades estáticas
    static GRAVITY = 0.8;
    static JUMP_STRENGTH = -12;
    static VIKING_X = 80;
    static SCROLL_SPEED = 5;
    static OBSTACLE_SPAWN_RATE = 120;
    static BONUS_SPAWN_RATE = 300;
    static INITIAL_LIVES = 3;
    static OBSTACLE_GAP = 200;
    static OBSTACLE_WIDTH = 60;
    static MIN_GAP_Y = 150;
    static MAX_GAP_Y = 400;
    
    static get WORLD_WIDTH() { 
        const container = document.getElementById('flappyGameContainer');
        return container ? container.offsetWidth : 800; 
    }
    
    static get WORLD_HEIGHT() { 
        const container = document.getElementById('flappyGameContainer');
        return container ? container.offsetHeight : 600; 
    }

    constructor() {
        this.isRunning = false;
        this.scrollOffset = 0;
        this.score = 0;
        this.distance = 0;
        this.lives = Juego.INITIAL_LIVES;
        this.gameStarted = false;
        
        this.vikingo = null;
        this.obstaculos = [];
        this.bonuses = [];
        
        this.obstacleSpawnCounter = 0;
        this.bonusSpawnCounter = 0;

        this.parallaxLayers = document.querySelectorAll('.parallax-layer');
    }

    init() {
        console.log("🎮 Iniciando Valhalla Flight...");
        
        const gameContainer = document.getElementById('flappyGameContainer');
        const vikingElement = document.getElementById('viking');
        
        if (!gameContainer) {
            console.error("No se encontró flappyGameContainer");
            return;
        }
        
        if (!vikingElement) {
            console.error("No se encontró el vikingo");
            return;
        }
        
        console.log("Elementos del DOM encontrados");
        
        this.vikingo = new Vikingo(this);
        this.isRunning = true;
        this.startGameLoop();
        this.setupEventListeners();
        
        console.log("Juego inicializado correctamente");
    }

    startGameLoop() {
        this.update();
    }

    update() {
        if (!this.isRunning) {
            requestAnimationFrame(() => this.update());
            return;
        }

        // Actualizar vikingo
        if (this.vikingo) {
            this.vikingo.update();
        }
        
        // Actualizar juego
        if (this.gameStarted) {
            this.scrollOffset += Juego.SCROLL_SPEED;
            this.distance = Math.floor(this.scrollOffset / 10);
            document.getElementById('distance').textContent = this.distance;
        }
                
        // Generar obstáculos
        this.obstacleSpawnCounter++;
        if (this.obstacleSpawnCounter >= Juego.OBSTACLE_SPAWN_RATE) {
            this.spawnObstacle();
            this.obstacleSpawnCounter = 0;
        }
        
        // Generar bonuses
        this.bonusSpawnCounter++;
        if (this.bonusSpawnCounter >= Juego.BONUS_SPAWN_RATE) {
            this.spawnBonus();
            this.bonusSpawnCounter = 0;
        }
        
        // Actualizar obstáculos
        for (let i = this.obstaculos.length - 1; i >= 0; i--) {
            if (this.obstaculos[i].update(this.gameStarted)) {
                this.obstaculos.splice(i, 1);
            }
        }
        
        // Actualizar bonuses
        for (let i = this.bonuses.length - 1; i >= 0; i--) {
            if (this.bonuses[i].update(this.gameStarted)) {
                this.bonuses.splice(i, 1);
            }
        }
        
        this.checkCollisions();
        
        requestAnimationFrame(() => this.update());
    }

    spawnObstacle() {
        if (!this.gameStarted) return;
        
        const obstaculo = new Obstaculo(Juego.WORLD_WIDTH);
        this.obstaculos.push(obstaculo);
        console.log("Obstáculo generado. Total:", this.obstaculos.length);
    }

    spawnBonus() {
        if (!this.gameStarted) return;
        
        const x = Juego.WORLD_WIDTH;
        const maxIntentos = 20;
        
        // Intentar encontrar una posición válida que no colisione con obstáculos
        for (let intentos = 0; intentos < maxIntentos; intentos++) {
            const y = Math.random() * (Juego.WORLD_HEIGHT - 200) + 100;
            
            if (!this.bonusColisionaConObstaculo(x, y)) {
                // Posición válida encontrada, crear el bonus
                const bonus = new Bonus(x, y, this);
                this.bonuses.push(bonus);
                return;
            }
        }
        
        console.log("No se pudo encontrar posición válida para el bonus");
    }

    bonusColisionaConObstaculo(bonusX, bonusY) {
        const bonusWidth = 25;
        const bonusHeight = 25;
        
        // Verificar colisión con todos los obstáculos cercanos
        for (let i = 0; i < this.obstaculos.length; i++) {
            const obstaculo = this.obstaculos[i];
            
            // Solo verificar obstáculos que estén cerca en el eje X
            if (Math.abs(obstaculo.x - bonusX) < 200) {
                // Crear rectángulo del bonus
                const bonusRect = {
                    left: bonusX,
                    right: bonusX + bonusWidth,
                    top: bonusY,
                    bottom: bonusY + bonusHeight
                };
                
                // Verificar colisión con el obstáculo superior
                const topCollision = this.rectsOverlap(bonusRect, obstaculo.getTopCollisionRect());
                
                // Verificar colisión con el obstáculo inferior
                const bottomCollision = this.rectsOverlap(bonusRect, obstaculo.getBottomCollisionRect());
                
                if (topCollision || bottomCollision) {
                    return true; // Hay colisión
                }
            }
        }
        
        return false; // No hay colisión
    }

    checkCollisions() {
        if (!this.gameStarted || this.vikingo.isDead) return;

        const vikingRect = this.vikingo.getCollisionRect();

        // Colisiones con obstáculos
        for (let i = 0; i < this.obstaculos.length; i++) {
            const ob = this.obstaculos[i];
            
            const topCollision = this.rectsOverlap(vikingRect, ob.getTopCollisionRect());
            const bottomCollision = this.rectsOverlap(vikingRect, ob.getBottomCollisionRect());
            
            if (topCollision || bottomCollision) {
                console.log("Colisión con obstáculo!");
                this.vikingo.takeDamage();
                break;
            }
        }

        // Colisiones con bonus
        for (let i = 0; i < this.bonuses.length; i++) {
            const bonus = this.bonuses[i];
            if (!bonus.collected && this.rectsOverlap(vikingRect, bonus.getCollisionRect())) {
                bonus.collect();
            }
        }
    }

    rectsOverlap(a, b) {
        return !(
            a.right < b.left ||
            a.left > b.right ||
            a.bottom < b.top ||
            a.top > b.bottom
        );
    }

    endGame() {
        console.log(" Fin del juego");
        this.isRunning = false;

        // Detener parallax
        this.parallaxLayers.forEach(layer => layer.classList.remove('scrolling'));
        
        const gameOverScreen = document.getElementById('gameOverScreen');
        document.getElementById('finalScore').textContent = `Puntaje Final: ${this.score}`;
        document.getElementById('finalDistance').textContent = `Distancia: ${this.distance}`;
        
        setTimeout(() => {
            gameOverScreen.classList.add('active');
        }, 1000);
    }

    restart() {
        console.log("🔄 Reiniciando juego...");
        
        // Limpiar contenedores
        document.getElementById('obstaclesContainer').innerHTML = '';
        document.getElementById('bonusesContainer').innerHTML = '';
        
        // Pausa las animaciones CSS del parallax
        this.parallaxLayers.forEach(layer => layer.classList.remove('scrolling'));

        // Resetear estado del juego
        this.isRunning = true;
        this.score = 0;
        this.distance = 0;
        this.lives = Juego.INITIAL_LIVES;
        this.gameStarted = false;
        this.scrollOffset = 0;
        
        // Actualizar UI
        document.getElementById('score').textContent = '0';
        document.getElementById('distance').textContent = '0';
        document.getElementById('lives').textContent = Juego.INITIAL_LIVES;
        
        // Limpiar arrays
        this.obstaculos = [];
        this.bonuses = [];
        
        // Ocultar pantalla de game over
        document.getElementById('gameOverScreen').classList.remove('active');
        
        // Reiniciar vikingo
        if (this.vikingo) {
            this.vikingo.reset();
        }
        
        // Mostrar instrucciones
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.style.display = 'block';
        }
        
        // Resetear contadores
        this.obstacleSpawnCounter = 0;
        this.bonusSpawnCounter = 0;
        
        console.log("Juego reiniciado");
    }

    setupEventListeners() {
        // Click para saltar
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.btn-restart') && !event.target.closest('#toggleShare')) {
                if (this.vikingo) {
                    this.vikingo.jump();
                }
            }
        });
        
        // Espacio para saltar
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (this.vikingo) {
                    this.vikingo.jump();
                }
            }
        });
        
        console.log("Event listeners configurados");
    }
}

// ========== INICIALIZACIÓN ==========
let juegoInstance = null;

function initGame() {
    juegoInstance = new Juego();
    juegoInstance.init();
}

function restartGame() {
    if (juegoInstance) {
        juegoInstance.restart();
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, inicializando juego...");
    initGame();
});

// También inicializar si la página ya está cargada
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initGame, 100);
}

// Hacer restartGame global para que el HTML pueda llamarlo
window.restartGame = restartGame;