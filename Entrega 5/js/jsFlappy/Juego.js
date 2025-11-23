class Juego {
    // Configuración del juego
    static GRAVITY = 0.8;
    static JUMP_STRENGTH = -12;
    static DRAGON_X = 80;
    static SCROLL_SPEED = 5;

    // DIFICULTAD DINÁMICA
    static INITIAL_SPAWN_RATE = 120;
    static MIN_SPAWN_RATE = 50;
    static DIFFICULTY_FACTOR = 0.1;

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

    //Ratio de aparicion de las aguilas
    static DECORATION_SPAWN_RATE = 200;

    constructor() {
        this.isRunning = false;
        this.scrollOffset = 0;
        this.score = 0;
        this.distance = 0;
        this.lives = Juego.INITIAL_LIVES;
        this.gameStarted = false;

        // Variable para controlar la dificultad actual
        this.currentSpawnRate = Juego.INITIAL_SPAWN_RATE;

        this.dragon = null;
        this.obstaculos = [];
        this.bonuses = [];

        this.coinsForLife = 0;

        this.obstacleSpawnCounter = Juego.INITIAL_SPAWN_RATE - 20;
        this.bonusSpawnCounter = 0;

        this.parallaxLayers = document.querySelectorAll('.parallax-layer');

        this.decorations = [];
        this.decorationSpawnCounter = 0;
    }

    init() {

        const gameContainer = document.getElementById('flappyGameContainer');
        const dragonElement = document.getElementById('dragon');

        if (!gameContainer) {
            return;
        }

        if (!dragonElement) {
            return;
        }

        this.dragon = new Dragon(this);
        this.isRunning = true;
        this.startGameLoop();
        this.setupEventListeners();
    }

    startGameLoop() {
        this.update();
    }

    update() {
        if (!this.isRunning) {
            requestAnimationFrame(() => this.update());
            return;
        }

        if (this.dragon) {
            this.dragon.update();
        }

        if (this.gameStarted) {
            this.scrollOffset += Juego.SCROLL_SPEED;
            this.distance = Math.floor(this.scrollOffset / 10);
            document.getElementById('distance').textContent = this.distance;

            // Dificultad progresiva
            const reduction = this.distance * Juego.DIFFICULTY_FACTOR;
            this.currentSpawnRate = Math.max(
                Juego.MIN_SPAWN_RATE,
                Juego.INITIAL_SPAWN_RATE - reduction
            );

            // Generación de Obstáculos
            this.obstacleSpawnCounter++;
            if (this.obstacleSpawnCounter >= this.currentSpawnRate) {
                this.spawnObstacle();
                this.obstacleSpawnCounter = 0;
            }

            // Generación de Bonus
            this.bonusSpawnCounter++;
            if (this.bonusSpawnCounter >= Juego.BONUS_SPAWN_RATE) {
                this.spawnBonus();
                this.bonusSpawnCounter = 0;
            }

            //Generacion de decoraciones
            this.decorationSpawnCounter++;
            if (this.decorationSpawnCounter >= Juego.DECORATION_SPAWN_RATE) {
                this.spawnDecoration();
                this.decorationSpawnCounter = 0;
            }
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

        //Actualizar decoraciones
        for (let i = this.decorations.length - 1; i >= 0; i--) {
            if (this.decorations[i].update(this.gameStarted)) {
                this.decorations.splice(i, 1);
            }
        }

        this.checkCollisions();

        requestAnimationFrame(() => this.update());
    }

    spawnDecoration() {
        if (!this.gameStarted) return;

        const decoration = new Decoracion(Juego.WORLD_WIDTH, this);
        this.decorations.push(decoration);
    }

    spawnObstacle() {
        if (!this.gameStarted) return;

        const obstaculo = new Obstaculo(Juego.WORLD_WIDTH);
        this.obstaculos.push(obstaculo);
    }

    spawnBonus() {
        if (!this.gameStarted) return;

        const x = Juego.WORLD_WIDTH;
        const maxIntentos = 20;

        for (let intentos = 0; intentos < maxIntentos; intentos++) {
            const y = Math.random() * (Juego.WORLD_HEIGHT - 200) + 100;

            if (!this.bonusColisionaConObstaculo(x, y)) {
                const bonus = new Bonus(x, y, this);
                this.bonuses.push(bonus);
                return;
            }
        }
    }

    bonusColisionaConObstaculo(bonusX, bonusY) {
        const bonusWidth = 25;
        const bonusHeight = 25;

        for (let i = 0; i < this.obstaculos.length; i++) {
            const obstaculo = this.obstaculos[i];

            if (Math.abs(obstaculo.x - bonusX) < 200) {
                const bonusRect = {
                    left: bonusX,
                    right: bonusX + bonusWidth,
                    top: bonusY,
                    bottom: bonusY + bonusHeight
                };

                const topCollision = this.rectsOverlap(bonusRect, obstaculo.getTopCollisionRect());
                const bottomCollision = this.rectsOverlap(bonusRect, obstaculo.getBottomCollisionRect());

                if (topCollision || bottomCollision) {
                    return true;
                }
            }
        }

        return false;
    }

    checkCollisions() {
        if (!this.gameStarted || this.dragon.isDead) return;

        const dragonRect = this.dragon.getCollisionRect();

        for (let i = 0; i < this.obstaculos.length; i++) {
            const ob = this.obstaculos[i];

            const topCollision = this.rectsOverlap(dragonRect, ob.getTopCollisionRect());
            const bottomCollision = this.rectsOverlap(dragonRect, ob.getBottomCollisionRect());

            if (topCollision || bottomCollision) {
                this.dragon.takeDamage();
                break;
            }
        }

        for (let i = 0; i < this.bonuses.length; i++) {
            const bonus = this.bonuses[i];
            if (!bonus.collected && this.rectsOverlap(dragonRect, bonus.getCollisionRect())) {
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
        this.isRunning = false;

        this.parallaxLayers.forEach(layer => layer.classList.remove('scrolling'));

        const gameOverScreen = document.getElementById('gameOverScreen');
        document.getElementById('finalScore').textContent = `Puntaje Final: ${this.score}`;
        document.getElementById('finalDistance').textContent = `Distancia: ${this.distance}`;

        setTimeout(() => {
            gameOverScreen.classList.add('active');
        }, 1200);
    }

    restart() {

        document.getElementById('obstaclesContainer').innerHTML = '';
        document.getElementById('bonusesContainer').innerHTML = '';
        
        //Limpiar decoraciones
        this.decorations.forEach(decoration => decoration.remove());
        this.decorations = [];

        this.parallaxLayers.forEach(layer => layer.classList.remove('scrolling'));

        this.isRunning = true;
        this.score = 0;
        this.distance = 0;
        this.lives = Juego.INITIAL_LIVES;
        this.gameStarted = false;
        this.scrollOffset = 0;

        this.coinsForLife = 0;

        //Reinicio de dificultad
        this.currentSpawnRate = Juego.INITIAL_SPAWN_RATE;

        document.getElementById('score').textContent = '0';
        document.getElementById('distance').textContent = '0';
        document.getElementById('lives').textContent = Juego.INITIAL_LIVES;

        this.obstaculos = [];
        this.bonuses = [];

        document.getElementById('gameOverScreen').classList.remove('active');

        if (this.dragon) {
            this.dragon.reset();
        }

        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.style.display = 'block';
        }

        this.obstacleSpawnCounter = Juego.INITIAL_SPAWN_RATE - 20;
        this.bonusSpawnCounter = 0;
        this.decorationSpawnCounter = 0;
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            //Verificar que sea click izquierdo
            if (event.button !== 0) return;
            
            //Verificar que el click sea dentro del contenedor del juego
            const gameContainer = document.getElementById('flappyGameContainer');
            if (!gameContainer.contains(event.target)) return;
            
            if (!event.target.closest('.btn-restart') && !event.target.closest('#toggleShare')) {
                if (this.dragon) {
                    this.dragon.jump();
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (this.dragon) {
                    this.dragon.jump();
                }
            }
        });
    }
}

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

document.addEventListener('DOMContentLoaded', function () {
    initGame();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initGame, 100);
}

window.restartGame = restartGame;