class Decoracion {
    constructor(x) {
        this.x = x;
        this.width = 500;
        this.height = 320;
        this.frameWidth = 125;
        this.currentFrame = 0;
        this.totalFrames = 4;
        this.animationSpeed = 8;
        this.animationCounter = 0;
        
        this.y = Math.random() * (Juego.WORLD_HEIGHT - 200) + 100;
        
        this.element = this.createDecorationElement();
        console.log("Decoración creada en x:", x, "y:", this.y);
    }

    createDecorationElement() {
        const element = document.createElement('div');
        element.className = 'decoration';
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;
        
        document.getElementById('flappyGameContainer').appendChild(element);
        return element;
    }

    update(gameStarted) {
        if (gameStarted) {
            this.x -= Juego.SCROLL_SPEED;
        }
        
        this.element.style.left = `${this.x}px`;
        
        //Animación del sprite
        this.animationCounter++;
        if (this.animationCounter >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            const backgroundPositionX = - (this.currentFrame * this.frameWidth);
            this.element.style.backgroundPosition = `${backgroundPositionX}px 0px`;
            this.animationCounter = 0;
        }

        if (this.x < -this.frameWidth) {
            this.remove();
            return true;
        }
        
        return false;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.remove();
        }
    }
}