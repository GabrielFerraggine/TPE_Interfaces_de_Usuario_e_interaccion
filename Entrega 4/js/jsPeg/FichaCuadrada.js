class FichaCuadrada extends Ficha {
    crearForma(x, y, radio) {
        const lado = radio * 2;
        this.ctx.rect(x - radio, y - radio, lado, lado);
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
        return xPunto >= this.x - this.radio && 
               xPunto <= this.x + this.radio && 
               yPunto >= this.y - this.radio && 
               yPunto <= this.y + this.radio;
    }
}