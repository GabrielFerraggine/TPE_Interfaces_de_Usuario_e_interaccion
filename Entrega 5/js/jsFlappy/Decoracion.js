class Decoracion {
    constructor(x, juego) {
        this.x = x;
        this.juego = juego; //Referencia al juego para verificar colisiones
        this.width = 500;
        this.height = 320;
        this.frameWidth = 125;
        this.currentFrame = 0;
        this.totalFrames = 4;
        this.animationSpeed = 8;
        this.animationCounter = 0;
        
        //Buscar una posicion Y que no colisione con obstáculos
        this.y = this.findSafeYPosition();
        
        this.element = this.createDecorationElement();
    }

    findSafeYPosition() {
        const maxIntentos = 20; //Intentos maximos para encontrar posicion segura

        const minHeight = 30;
        const maxHeight = Juego.WORLD_HEIGHT / 2;
        
        for (let intento = 0; intento < maxIntentos; intento++) {
            const y = Math.random() * (maxHeight - minHeight) + minHeight; //aparecen de la mitad de la pantalla para arriba
            
            if (!this.colisionaConObstaculo(this.x, y)) {
                return y; // Posición segura encontrada
            }
        }
        
        //Si no encuentra posición segura despues de varios intentos,
        //devuelve una posición por defecto
        return Math.random() * (maxHeight - minHeight) + minHeight;
    }

    colisionaConObstaculo(decorationX, decorationY) {
        const decorationRect = {
            left: decorationX,
            right: decorationX + this.frameWidth,
            top: decorationY,
            bottom: decorationY + this.height
        };

        //Verificar colision con todos los obstáculos
        for (let i = 0; i < this.juego.obstaculos.length; i++) {
            const obstaculo = this.juego.obstaculos[i];
            
            //Solo verificar obstaculos cercanos
            if (Math.abs(obstaculo.x - decorationX) < 300) {
                const topCollision = this.juego.rectsOverlap(decorationRect, obstaculo.getTopCollisionRect());
                const bottomCollision = this.juego.rectsOverlap(decorationRect, obstaculo.getBottomCollisionRect());
                
                if (topCollision || bottomCollision) {
                    return true;
                }
            }
        }
        
        return false;
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
        
        //Animacion del sprite
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