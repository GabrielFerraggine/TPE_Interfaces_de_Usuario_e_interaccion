// FichaPentagonal.js
class FichaPentagonal extends Ficha {
    constructor(ctx, x, y, radio, tablero, fila, columna, imagenSrc) {
        super(ctx, x, y, radio, tablero, fila, columna, imagenSrc);
        
        // Usar la misma imagen que la clase base
        this.imagen = this.imagenFicha;
    }

    crearForma(x, y, radio) {
        // Crear un pentágono
        const lados = 5;
        const anguloInicial = -Math.PI / 2;
        
        this.ctx.beginPath();
        
        for (let i = 0; i <= lados; i++) {
            const angulo = anguloInicial + (i * 2 * Math.PI / lados);
            const puntoX = x + radio * Math.cos(angulo);
            const puntoY = y + radio * Math.sin(angulo);
            
            if (i === 0) {
                this.ctx.moveTo(puntoX, puntoY);
            } else {
                this.ctx.lineTo(puntoX, puntoY);
            }
        }
        
        this.ctx.closePath();
    }

    contienePunto(x, y) {
        this.crearForma(this.x, this.y, this.radio);
        return this.ctx.isPointInPath(x, y);
    }

    dibujar() {
        if (!this.ocupada) return;

        const ctx = this.ctx;
        const x = this.x;
        const y = this.y;
        const radio = this.radio;

        // Usar el mismo gradiente que las otras fichas
        ctx.fillStyle = this.crearGradiente(x, y, radio);
        ctx.beginPath();
        this.crearForma(x, y, radio);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Usar el método dibujarImagen de la clase base
        this.dibujarImagen(x, y, radio);
        ctx.restore();
        
        // Usar el método dibujarBorde de la clase base (con colores amarillos)
        this.dibujarBorde(x, y, radio);
    }

    dibujarTemporal(ctx) {
        const x = this.xTemp;
        const y = this.yTemp;
        const radio = this.radio;

        ctx.fillStyle = this.crearGradiente(x, y, radio);
        ctx.beginPath();
        this.crearForma(x, y, radio);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        this.dibujarImagen(x, y, radio);
        ctx.restore();

        ctx.strokeStyle = "#FF6B35";
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.crearForma(x, y, radio - 1);
        ctx.stroke();
    }
}