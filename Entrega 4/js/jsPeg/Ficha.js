class Ficha {
    constructor(ctx, x, y, radio, tablero, fila, columna) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.tablero = tablero;
        this.fila = fila;
        this.columna = columna;
        this.ocupada = true;
        this.seleccionada = false;
        this.xTemp = null;
        this.yTemp = null;  
    }
    
    dibujar() {
        if (this.ocupada) {
            const imagenFicha = this.tablero.getImagenFicha();
            
            if (imagenFicha && imagenFicha.complete) {
                // Dibujar imagen de la ficha
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
                this.ctx.closePath();
                this.ctx.clip();
                
                this.ctx.drawImage(
                    imagenFicha,
                    this.x - this.radio,
                    this.y - this.radio,
                    this.radio * 2,
                    this.radio * 2
                );
                
                this.ctx.restore();
            } else {
                // Fallback: dibujar círculo si la imagen no está cargada
                this.ctx.fillStyle = this.seleccionada ? '#FFD700' : '#8B4513';
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }

            // Resaltar si está seleccionada
            if (this.seleccionada) {
                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }
    
    dibujarTemporal(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.xTemp, this.yTemp, this.radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.xTemp, this.yTemp, this.radio * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.xTemp + 2, this.yTemp + 2, this.radio, 0, Math.PI * 2);
        ctx.fill();
    }
}