class FichaCircular extends Ficha {
    crearForma(x, y, radio) {
        this.ctx.arc(x, y, radio, 0, Math.PI * 2);
    }

    dibujar() {
        if (!this.ocupada) return;

        const ctx = this.ctx;
        const x = this.x;
        const y = this.y;
        const radio = this.radio;

        ctx.fillStyle = this.crearGradiente(x, y, radio);
        ctx.beginPath();
        this.crearForma(x, y, radio);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        this.dibujarImagen(x, y, radio);
        ctx.restore();
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

    contienePunto(xPunto, yPunto) {
        const distancia = Math.sqrt((xPunto - this.x) ** 2 + (yPunto - this.y) ** 2);
        return distancia <= this.radio;
    }
}