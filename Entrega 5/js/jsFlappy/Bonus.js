class Bonus {
    constructor(x, y, juego) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
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

            // Ocultar el bonus
            this.element.style.display = 'none';

            console.log("Bonus recolectado! Puntaje:", this.juego.score);
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