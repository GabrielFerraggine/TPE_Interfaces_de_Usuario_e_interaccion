class Dragon {
    constructor(juego) {
        this.juego = juego;
        this.element = document.getElementById('dragon');
        this.x = Juego.DRAGON_X;
        this.y = Juego.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        this.isDead = false;
        this.isInvincible = false;
        
        // Dimensiones referenciales (el hitbox real lo define getCollisionRect abajo)
        this.width = 137;
        this.height = 120;

        //descomentar para ver hitboxes (1/3)
        // this.debugBox = document.createElement('div');
        // this.debugBox.style.position = 'absolute';
        // this.debugBox.style.border = '2px solid red';
        // this.debugBox.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        // this.debugBox.style.zIndex = '999';
        // this.debugBox.style.pointerEvents = 'none';
        // document.getElementById('flappyGameContainer').appendChild(this.debugBox);

        console.log("Dragón listo con efectos activados");
    }

    jump() {
        // Si está muerto, no puede saltar
        if (this.isDead) return;

        if (!this.juego.gameStarted) {
            this.startGame();
            return;
        }

        this.velocityY = Juego.JUMP_STRENGTH;
    }

    startGame() {
        console.log("🎮 INICIANDO JUEGO!");
        this.juego.gameStarted = true;
        this.juego.isRunning = true;
        this.velocityY = Juego.JUMP_STRENGTH;

        const instructions = document.querySelector('.instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }

        this.juego.parallaxLayers.forEach(layer => layer.classList.add('scrolling'));
    }

    update() {
        if (!this.juego.gameStarted) return;
        
        // Aplicar gravedad siempre
        this.velocityY += Juego.GRAVITY;
        this.y += this.velocityY;

        const minY = -50; // puede subir un poco más allá del techo
        const maxY = Juego.WORLD_HEIGHT + 50; // suelo visual

        // Techo
        if (this.y < minY) {
            this.y = minY;
            this.velocityY = 0;
        }

        // Suelo / Muerte por caída
        if (this.y > Juego.WORLD_HEIGHT - this.height + 20) {
            if (!this.isDead) {
                this.die(); // Si toca el suelo vivo, muere
            }
        }

        this.render();
        //descomentar para ver hitboxes (2/3)
        // this.drawDebugHitbox();
    }

    render() {
        this.element.style.top = `${this.y}px`;
        this.element.style.left = `${this.x}px`;
    }

    //descomentar para ver hitboxes (3/3)
    // drawDebugHitbox() {
    //     const rect = this.getCollisionRect();
    //     this.debugBox.style.left = `${rect.left}px`;
    //     this.debugBox.style.top = `${rect.top}px`;
    //     this.debugBox.style.width = `${rect.right - rect.left}px`;
    //     this.debugBox.style.height = `${rect.bottom - rect.top}px`;
    // }

    takeDamage() {
        // Si ya está muerto o es invencible, no hacer nada
        if (this.isDead || this.isInvincible) return;

        this.isInvincible = true;
        this.juego.lives--;
        document.getElementById('lives').textContent = this.juego.lives;
        
        console.log(`¡Golpe recibido! Vidas restantes: ${this.juego.lives}`);

        //Agregar clase de daño/invencibilidad
        this.element.classList.add('invincible');
        
        //rebote al ser golpeado
        this.velocityY = Juego.JUMP_STRENGTH * 0.5;

        // timer para quitar invencibilidad (1.5 segundos)
        setTimeout(() => {
            this.endInvincibility();
        }, 1500); 
        
        if (this.juego.lives <= 0) {
            this.die();
        }
    }

    endInvincibility() {
        // Solo sacar si no ha muerto entre medio
        if (!this.isDead) {
            this.isInvincible = false;
            this.element.classList.remove('invincible');
        }
    }

    die() {
        if (this.isDead) return;

        console.log("💀 El dragón ha caído.");
        this.isDead = true;
        
        this.element.classList.remove('invincible'); // sacar parpadeo si lo tenía
        this.element.classList.add('dead'); // Activar animacion de muerte

        // Notificar al juego que termine
        setTimeout(() => {
            this.juego.endGame();
        }, 1000);
    }

    reset() {
        this.isDead = false;
        this.isInvincible = false;
        this.y = Juego.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        
        // Limpiar clases de efectos
        this.element.classList.remove('invincible');
        this.element.classList.remove('dead');
        
        // Asegurar que la rotación vuelva a 0 (manejado por CSS al quitar .dead, 
        // pero forzamos render por si acaso)
        this.render();
    }

    getCollisionRect() {
        const offsetX = 54;
        const offsetY = 70;
        const boxWidth = 100;
        const boxHeight = 60;

        return {
            left: this.x + offsetX,
            right: this.x + offsetX + boxWidth,
            top: this.y + offsetY,
            bottom: this.y + offsetY + boxHeight
        };
    }
}