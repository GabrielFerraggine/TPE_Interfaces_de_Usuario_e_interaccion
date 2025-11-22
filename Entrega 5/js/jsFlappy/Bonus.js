class Bonus {
    constructor(x, y, juego) {
        this.x = x;
        this.y = y;
        this.width = 42;
        this.height = 38;
        this.collected = false;
        this.juego = juego;

        this.element = document.createElement('div');
        this.element.className = 'bonus';
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        document.getElementById('bonusesContainer').appendChild(this.element);

        console.log("Bonus creado en:", x, y);
    }

    update(gameStarted) {
        if (gameStarted) {
            this.x -= Juego.SCROLL_SPEED;
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
            
            this.juego.score += 50;
            document.getElementById('score').textContent = this.juego.score;
            
            this.juego.coinsForLife++; //Sumamos 1 al contador interno
            
            if (this.juego.coinsForLife >= 3 && this.juego.lives < Juego.INITIAL_LIVES) { //suma una vida al recolectar 5 monedas, solo si tiene menos de las iniciales
                this.juego.lives++;
                this.juego.coinsForLife = 0;
                
                // Actualizamos el HUD de vidas
                const livesElement = document.getElementById('lives');
                livesElement.textContent = this.juego.lives;

                this.juego.coinsForLife = 0;
                
                livesElement.classList.remove('life-gained');
                void livesElement.offsetWidth; 
                livesElement.classList.add('life-gained');

                this.spawnFloatingText("+1 VIDA", "#32CD32");
                console.log("¡Vida extra ganada!");
            } else {
                this.spawnFloatingText("+50", "#ffd700");
            }

            // Animación de la moneda desapareciendo
            this.element.classList.add('collected');

            setTimeout(() => {
                this.remove();
            }, 400);

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

    //texto al recolectar bonus
    spawnFloatingText(message = '+50', color = '#ffd700') {
        const text = document.createElement('div');
        text.className = 'floating-score';
        text.textContent = message;
        
        text.style.color = color;
        text.style.textShadow = color === '#32CD32' 
            ? '2px 2px 0px #006400, -1px -1px 0 #000' 
            : '2px 2px 0px #c41e3a, -1px -1px 0 #000';
        
        text.style.left = `${this.x}px`;
        text.style.top = `${this.y}px`;
        
        if (message.length > 3) {
             text.style.fontSize = "20px";
             text.style.width = "100px";
             text.style.textAlign = "center";
        }

        document.getElementById('flappyGameContainer').appendChild(text);
        
        setTimeout(() => {
            text.remove();
        }, 800);
    }
}