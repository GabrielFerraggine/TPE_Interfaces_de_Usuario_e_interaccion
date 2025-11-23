class Obstaculo {
    constructor(x) {
        this.x = x;
        this.width = Juego.OBSTACLE_WIDTH;
        this.passed = false;
        
        const gapY = Math.random() * (Juego.MAX_GAP_Y - Juego.MIN_GAP_Y) + Juego.MIN_GAP_Y;
        const gapHeight = Juego.OBSTACLE_GAP;
        
        this.topHeight = gapY - gapHeight / 2;
        this.bottomHeight = Juego.WORLD_HEIGHT - (gapY + gapHeight / 2);
        this.bottomY = gapY + gapHeight / 2;

        this.topElement = this.createObstacleElement('obstacle-top', this.topHeight);
        this.bottomElement = this.createObstacleElement('obstacle-bottom', this.bottomHeight);
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

    update(gameStarted) {
        if (gameStarted) {
            this.x -= Juego.SCROLL_SPEED;
        }
        
        this.topElement.style.left = `${this.x}px`;
        this.bottomElement.style.left = `${this.x}px`;

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
            top: Juego.WORLD_HEIGHT - this.bottomHeight,
            bottom: Juego.WORLD_HEIGHT
        };
    }

    
}