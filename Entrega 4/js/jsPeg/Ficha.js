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

        const rutaAleatoria = this.tablero.obtenerImagenAleatoria();
        this.imagenFicha = new Image();
        this.imagenFicha.src = rutaAleatoria;
    }


    dibujar() {
        if (!this.ocupada) return;

        const imagenFicha = this.imagenFicha;
        const ctx = this.ctx;

        //Fondo circular
        const gradiente = ctx.createRadialGradient(
            this.x - this.radio * 0.3,
            this.y - this.radio * 0.3,
            this.radio * 0.2,
            this.x,
            this.y,
            this.radio
        );
        gradiente.addColorStop(0, "#1C1C1C"); //color fondo ficha
        gradiente.addColorStop(1, "#1C1C1C"); //sombra
        ctx.fillStyle = gradiente;


        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fill();

        //Sombra de la ficha
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        //Imagen de la ficha
        if (imagenFicha && imagenFicha.complete) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radio - 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(
                imagenFicha,
                this.x - this.radio + 3,
                this.y - this.radio + 3,
                (this.radio - 3) * 2,
                (this.radio - 3) * 2
            );
        }

        ctx.restore();

        //Borde si está seleccionada
        if (this.seleccionada) {
            ctx.strokeStyle = "#FF6B35";
            ctx.lineWidth = 2.3;
        } else {// Borde normal
            ctx.strokeStyle = "#b18119cf"; 
            ctx.lineWidth = 1.9;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio - 1, 0, Math.PI * 2);
        ctx.stroke();
    }


    dibujarTemporal(ctx) {
        const imagenFicha = this.imagenFicha;

        const gradiente = ctx.createRadialGradient(
            this.xTemp - this.radio * 0.3,
            this.yTemp - this.radio * 0.3,
            this.radio * 0.2,
            this.xTemp,
            this.yTemp,
            this.radio
        );
        gradiente.addColorStop(0, "#1C1C1C");
        gradiente.addColorStop(1, "#1C1C1C");
        ctx.fillStyle = gradiente;
        ctx.beginPath();
        ctx.arc(this.xTemp, this.yTemp, this.radio, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;

        //Imagen de la ficha
        if (imagenFicha && imagenFicha.complete) {
            ctx.beginPath();
            ctx.arc(this.xTemp, this.yTemp, this.radio - 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(
                imagenFicha,
                this.xTemp - this.radio + 4,
                this.yTemp - this.radio + 4,
                (this.radio - 4) * 2,
                (this.radio - 4) * 2
            );
        }

        ctx.restore();

        // Borde
        ctx.strokeStyle = "#FF6B35";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.xTemp, this.yTemp, this.radio - 1, 0, Math.PI * 2);
        ctx.stroke();
    }

}