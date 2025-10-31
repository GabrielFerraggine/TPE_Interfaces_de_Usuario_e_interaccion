class Ficha {
    constructor(ctx, x, y, radio, tablero, fila, columna, rutaImagen) {
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

        this.imagenFicha = new Image();
        this.imagenFicha.src = rutaImagen;
        
        // Agregar manejo de errores para la imagen
        this.imagenFicha.onerror = () => {
            console.error("Error al cargar la imagen:", rutaImagen);
        };
    }

    dibujar() {
        // Método base que será sobrescrito
    }

    dibujarTemporal(ctx) {
        // Método base que será sobrescrito
    }

    contienePunto(x, y) {
        // Método base que será sobrescrito
        return false;
    }

    dibujarImagen(x, y, radio) {
        const ctx = this.ctx;
        const imagenFicha = this.imagenFicha;
        
        if (imagenFicha && imagenFicha.complete) {
            ctx.save();
            ctx.beginPath();
            this.crearForma(x, y, radio - 3);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(
                imagenFicha,
                x - radio + 3,
                y - radio + 3,
                (radio - 3) * 2,
                (radio - 3) * 2
            );
            ctx.restore();
        }
    }

    crearForma(x, y, radio) {
        // Método base que será sobrescrito
    }

    dibujarBorde(x, y, radio) {
        const ctx = this.ctx;
        
        if (this.seleccionada) {
            ctx.strokeStyle = "#FF6B35";
            ctx.lineWidth = 2.3;
        } else {
            ctx.strokeStyle = "#b18119cf"; 
            ctx.lineWidth = 1.9;
        }
        
        ctx.beginPath();
        this.crearForma(x, y, radio - 1);
        ctx.stroke();
    }

    crearGradiente(x, y, radio) {
        const ctx = this.ctx;
        const gradiente = ctx.createRadialGradient(
            x - radio * 0.3,
            y - radio * 0.3,
            radio * 0.2,
            x,
            y,
            radio
        );
        gradiente.addColorStop(0, "#1C1C1C");
        gradiente.addColorStop(1, "#1C1C1C");
        return gradiente;
    }
}