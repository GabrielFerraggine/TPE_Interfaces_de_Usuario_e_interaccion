class Ficha {
    constructor(x, y, radio, fila, columna) {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.fila = fila;
        this.columna = columna;
        this.xTemp = null;
        this.yTemp = null;
        
        const tipos = [
            { color: '#C41E3A', borde: '#8B0000' },
            { color: '#1E3A8A', borde: '#000080' },
            { color: '#15803D', borde: '#006400' },
            { color: '#7C2D12', borde: '#8B4513' },
            { color: '#6D28D9', borde: '#4C1D95' }
        ];
        this.tipo = tipos[Math.floor(Math.random() * tipos.length)];
    }
    
    dibujar(ctx) {
        ctx.fillStyle = this.tipo.color;
        ctx.strokeStyle = this.tipo.borde;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    dibujarTemporal(ctx) {
        ctx.fillStyle = this.tipo.color;
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