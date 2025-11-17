class Vikingo {
    constructor(juego) {
        this.juego = juego;
        this.element = document.getElementById('viking');
        this.x = Juego.VIKING_X;
        this.y = Juego.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        this.isDead = false;
        this.isInvincible = false;
        this.width = 40;
        this.height = 50;

        console.log("🦅 Vikingo creado en posición:", this.x, this.y);
    }

    jump() {
        console.log("Intento de salto - gameStarted:", this.juego.gameStarted, "isDead:", this.isDead);

        if (!this.juego.gameStarted) {
            this.startGame();
            return;
        }

        if (!this.isDead && this.juego.gameStarted) {
            this.velocityY = Juego.JUMP_STRENGTH;
            console.log("Saltando! Velocidad Y:", this.velocityY);
        }
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

        console.log("Juego iniciado correctamente");
    }

    update() {
        if (!this.juego.gameStarted) return;
        if (this.isDead) return;

        this.velocityY += Juego.GRAVITY;
        this.y += this.velocityY;

        const minY = 50;
        const maxY = Juego.WORLD_HEIGHT - this.height - 20;

        if (this.y < minY) {
            this.y = minY;
            this.velocityY = 0;
        }

        if (this.y > maxY) {
            this.y = maxY;
            this.velocityY = 0;
            //si car al suelo, muere instantaneamente
            if (!this.isDead) {
                this.die();
            }
        }

        this.render();
    }

    render() {
        this.element.style.top = `${this.y}px`;
        this.element.style.left = `${this.x}px`;
    }

    takeDamage() {
        if (this.isDead || this.isInvincible) return;

        //Activar invencibilidad
        this.isInvincible = true;

        this.juego.lives--;
        document.getElementById('lives').textContent = this.juego.lives;
        
        console.log(`Daño recibido! Vidas: ${this.juego.lives}. Invencible por 2s.`);
        
        //Añadir clase CSS para parpadear
        this.element.classList.add('invincible');
        
        //timer para sacar la invencibilidad
        setTimeout(() => {
            this.endInvincibility();
        }, 1500); // 1seg y medio
        
        if (this.juego.lives <= 0) {
            this.die();
        } else {
            //salto para indicar el golpe
            this.velocityY = Juego.JUMP_STRENGTH * 0.5;
        }
    }

    endInvincibility() {
        this.isInvincible = false;
        this.element.classList.remove('invincible');
        console.log("Invencibilidad terminada.");
    }

    die() {
        if (this.isDead) return;

        console.log("Vikingo murió");
        this.isDead = true;
        this.element.classList.remove('invincible');
        this.element.style.animation = 'vikingDeath 1s forwards';

        setTimeout(() => {
            this.juego.endGame();
        }, 1000);
    }

    reset() {
        this.isDead = false;
        this.isInvincible = false;
        this.y = Juego.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        this.element.classList.remove('invincible');
        this.element.style.animation = '';
        this.render();
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