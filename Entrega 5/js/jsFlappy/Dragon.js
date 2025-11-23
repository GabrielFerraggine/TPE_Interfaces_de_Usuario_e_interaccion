class Dragon {
    constructor(juego) {
        this.juego = juego;
        this.element = document.getElementById('dragon');
        this.x = Juego.DRAGON_X;
        this.y = Juego.WORLD_HEIGHT / 2;
        this.velocityY = 0;
        this.isDead = false;
        this.isInvincible = false;

        //Dimensiones referenciales (el hitbox real lo define getCollisionRect abajo)
        this.width = 137;
        this.height = 120;

    }

    jump() {
        //Si está muerto, no puede saltar
        if (this.isDead) return;

        if (!this.juego.gameStarted) {
            this.startGame();
            return;
        }

        this.velocityY = Juego.JUMP_STRENGTH;
    }

    startGame() {
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
        //Permitimos actualizar si el juego corre O si el dragon murio
        if (!this.juego.gameStarted && !this.isDead) return;
        
        // Gravedad (usando la lógica de caída lenta que hicimos antes)
        if (this.isDead) {
            this.velocityY += Juego.GRAVITY; 
            if (this.velocityY > 7) this.velocityY = 7;
        } else {
            this.velocityY += Juego.GRAVITY;
        }
        
        this.y += this.velocityY;

        const minY = -50; 
        
        // Techo
        if (this.y < minY) {
            this.y = minY;
            this.velocityY = 0;
        }

        if (this.y > Juego.WORLD_HEIGHT - this.height + 20) {
            if (!this.isDead) {
                // Si toca el suelo vivo, muere instantáneamente y termina
                this.die(); 
                this.juego.endGame();
            } else {
                this.y = Juego.WORLD_HEIGHT - this.height + 20;
                this.juego.endGame();
            }
        }
        // this.drawDebugHitbox(); //descomentar para ver hitboxes (2/3)
        this.render();
    }

    render() {
        this.element.style.top = `${this.y}px`;
        this.element.style.left = `${this.x}px`;
    }

    //descomentar para ver hitboxes (3/3)
    //  drawDebugHitbox() {
    //      const rect = this.getCollisionRect();
    //      this.debugBox.style.left = `${rect.left}px`;
    //      this.debugBox.style.top = `${rect.top}px`;
    //      this.debugBox.style.width = `${rect.right - rect.left}px`;
    //      this.debugBox.style.height = `${rect.bottom - rect.top}px`;
    //  }

    takeDamage() {
         //Si ya está muerto o es invencible, no hacer nada
        if (this.isDead || this.isInvincible) return;

        this.isInvincible = true;
        this.juego.lives--;
        document.getElementById('lives').textContent = this.juego.lives;

        //Agregar clase de daño/invencibilidad
        this.element.classList.add('invincible');

        //rebote al ser golpeado
        if (this.juego.lives > 0) {
            // Si sigue vivo, rebote para arriba
            this.velocityY = Juego.JUMP_STRENGTH * 0.5;
        } else {
            this.velocityY = 0; 
        }

        // timer para sacar invencibilidad
        setTimeout(() => {
            this.endInvincibility();
        }, 1500);//1.5seg

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

        this.isDead = true;
        
        this.element.classList.remove('invincible'); 
        this.element.classList.add('dead'); 

        this.juego.gameStarted = false; 
        //frena el fondo
        this.juego.parallaxLayers.forEach(layer => layer.classList.remove('scrolling'));

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
        const boxHeight = 40;

        return {
            left: this.x + offsetX,
            right: this.x + offsetX + boxWidth,
            top: this.y + offsetY,
            bottom: this.y + offsetY + boxHeight
        };
    }
}