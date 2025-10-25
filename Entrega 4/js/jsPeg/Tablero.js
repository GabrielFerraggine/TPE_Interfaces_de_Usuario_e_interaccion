// ==================== CLASES DEL JUEGO PEG SOLITAIRE ====================

class Tablero {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fichas = [];
        this.fichaSeleccionada = null;
        this.casillas = [];
        this.movimientosValidos = [];
        this.timer = 0;
        this.timerInterval = null;
        this.juegoActivo = false;
        
        this.configurarTablero();
        this.inicializarFichas();
        this.configurarEventos();
        this.dibujar();
    }
    
    configurarTablero() {
        this.posicionesValidas = [
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0]
        ];
        
        this.casillas = [];
        const tamanoCasilla = 80;
        const offsetX = (this.canvas.width - (7 * tamanoCasilla)) / 2;
        const offsetY = (this.canvas.height - (7 * tamanoCasilla)) / 2;
        
        for (let fila = 0; fila < 7; fila++) {
            for (let columna = 0; columna < 7; columna++) {
                if (this.posicionesValidas[fila][columna] === 1) {
                    const vacia = (fila === 3 && columna === 3);
                    this.casillas.push({
                        fila: fila,
                        columna: columna,
                        x: offsetX + columna * tamanoCasilla,
                        y: offsetY + fila * tamanoCasilla,
                        tamano: tamanoCasilla,
                        ocupada: !vacia,
                        vacia: vacia
                    });
                }
            }
        }
    }
    
    inicializarFichas() {
        this.fichas = [];
        this.casillas.forEach(casilla => {
            if (casilla.ocupada) {
                this.fichas.push(new Ficha(
                    casilla.x + casilla.tamano / 2,
                    casilla.y + casilla.tamano / 2,
                    casilla.tamano / 2 - 8,
                    casilla.fila,
                    casilla.columna
                ));
            }
        });
    }
    
    configurarEventos() {
        this.canvas.addEventListener('mousedown', this.manejarMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.manejarMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.manejarMouseUp.bind(this));
    }
    
    manejarMouseDown(event) {
        if (!this.juegoActivo) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.fichaSeleccionada = this.obtenerFichaEnPosicion(x, y);
        
        if (this.fichaSeleccionada) {
            this.mostrarMovimientosValidos(this.fichaSeleccionada);
            this.dibujar();
        }
    }
    
    manejarMouseMove(event) {
        if (!this.juegoActivo || !this.fichaSeleccionada) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.fichaSeleccionada.xTemp = x;
        this.fichaSeleccionada.yTemp = y;
        this.dibujar();
    }
    
    manejarMouseUp(event) {
        if (!this.juegoActivo || !this.fichaSeleccionada) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.intentarMoverFicha(this.fichaSeleccionada, x, y);
        
        this.fichaSeleccionada.xTemp = null;
        this.fichaSeleccionada.yTemp = null;
        this.fichaSeleccionada = null;
        this.movimientosValidos = [];
        this.dibujar();
    }
    
    obtenerFichaEnPosicion(x, y) {
        for (let ficha of this.fichas) {
            const distancia = Math.sqrt(Math.pow(x - ficha.x, 2) + Math.pow(y - ficha.y, 2));
            if (distancia <= ficha.radio) {
                return ficha;
            }
        }
        return null;
    }
    
    mostrarMovimientosValidos(ficha) {
        this.movimientosValidos = this.obtenerMovimientosValidos(ficha);
    }
    
    obtenerMovimientosValidos(ficha) {
        const movimientos = [];
        const direcciones = [
            { df: -2, dc: 0, sf: -1, sc: 0 },
            { df: 2, dc: 0, sf: 1, sc: 0 },
            { df: 0, dc: -2, sf: 0, sc: -1 },
            { df: 0, dc: 2, sf: 0, sc: 1 }
        ];
        
        for (let dir of direcciones) {
            const filaDestino = ficha.fila + dir.df;
            const columnaDestino = ficha.columna + dir.dc;
            const filaSalto = ficha.fila + dir.sf;
            const columnaSalto = ficha.columna + dir.sc;
            
            if (this.esMovimientoValido(ficha, filaDestino, columnaDestino, filaSalto, columnaSalto)) {
                const casillaDestino = this.obtenerCasilla(filaDestino, columnaDestino);
                const fichaSaltada = this.obtenerFichaEnCasilla(filaSalto, columnaSalto);
                
                movimientos.push({
                    x: casillaDestino.x + casillaDestino.tamano / 2,
                    y: casillaDestino.y + casillaDestino.tamano / 2,
                    fila: filaDestino,
                    columna: columnaDestino,
                    fichaSaltada: fichaSaltada,
                    direccion: dir
                });
            }
        }
        return movimientos;
    }
    
    esMovimientoValido(ficha, filaDestino, columnaDestino, filaSalto, columnaSalto) {
        if (filaDestino < 0 || filaDestino >= 7 || columnaDestino < 0 || columnaDestino >= 7) return false;
        if (this.posicionesValidas[filaDestino][columnaDestino] !== 1) return false;
        if (filaSalto < 0 || filaSalto >= 7 || columnaSalto < 0 || columnaSalto >= 7) return false;
        if (this.posicionesValidas[filaSalto][columnaSalto] !== 1) return false;
        
        const casillaDestino = this.obtenerCasilla(filaDestino, columnaDestino);
        const casillaSalto = this.obtenerCasilla(filaSalto, columnaSalto);
        if (!casillaDestino || !casillaSalto) return false;
        if (!casillaDestino.vacia) return false;
        
        const fichaSaltada = this.obtenerFichaEnCasilla(filaSalto, columnaSalto);
        if (!fichaSaltada) return false;
        
        return true;
    }
    
    obtenerCasilla(fila, columna) {
        return this.casillas.find(c => c.fila === fila && c.columna === columna);
    }
    
    obtenerFichaEnCasilla(fila, columna) {
        return this.fichas.find(f => f.fila === fila && f.columna === columna);
    }
    
    intentarMoverFicha(ficha, x, y) {
        for (let movimiento of this.movimientosValidos) {
            const distancia = Math.sqrt(Math.pow(x - movimiento.x, 2) + Math.pow(y - movimiento.y, 2));
            if (distancia <= ficha.radio * 1.5) {
                this.realizarMovimiento(ficha, movimiento);
                return;
            }
        }
    }
    
    realizarMovimiento(ficha, movimiento) {
        const filaOriginal = ficha.fila;
        const columnaOriginal = ficha.columna;
        
        ficha.x = movimiento.x;
        ficha.y = movimiento.y;
        ficha.fila = movimiento.fila;
        ficha.columna = movimiento.columna;
        
        const indexFichaSaltada = this.fichas.indexOf(movimiento.fichaSaltada);
        if (indexFichaSaltada > -1) {
            this.fichas.splice(indexFichaSaltada, 1);
        }
        
        const casillaOrigen = this.obtenerCasilla(filaOriginal, columnaOriginal);
        const casillaDestino = this.obtenerCasilla(movimiento.fila, movimiento.columna);
        const casillaSalto = this.obtenerCasilla(movimiento.fichaSaltada.fila, movimiento.fichaSaltada.columna);
        
        if (casillaOrigen) {
            casillaOrigen.ocupada = false;
            casillaOrigen.vacia = true;
        }
        if (casillaDestino) {
            casillaDestino.ocupada = true;
            casillaDestino.vacia = false;
        }
        if (casillaSalto) {
            casillaSalto.ocupada = false;
            casillaSalto.vacia = true;
        }
        
        // Resetear timer de ayuda
        this.ultimoMovimiento = this.timer;
        this.detenerAyuda();
        
        setTimeout(() => this.verificarFinJuego(), 100);
    }
    
    verificarFinJuego() {
        let hayMovimientos = false;
        for (let ficha of this.fichas) {
            if (this.obtenerMovimientosValidos(ficha).length > 0) {
                hayMovimientos = true;
                break;
            }
        }
        
        if (!hayMovimientos) {
            this.juegoActivo = false;
            this.detenerTimer();
            this.detenerAyuda();
            
            const fichasRestantes = this.fichas.length;
            let titulo = '';
            let mensaje = '';
            
            if (fichasRestantes === 1) {
                const fichaFinal = this.fichas[0];
                const esCentro = fichaFinal.fila === 3 && fichaFinal.columna === 3;
                
                if (esCentro) {
                    titulo = '¡Victoria Épica!';
                    mensaje = 'El último vikingo ocupa el trono central.';
                } else {
                    titulo = 'Juego Terminado';
                    mensaje = 'Bien hecho, pero el último vikingo no está en el trono central.';
                }
            } else {
                titulo = 'Juego Terminado';
                mensaje = `Quedaron ${fichasRestantes} vikingos en pie.`;
            }
            
            const botones = [
                {
                    text: 'Jugar de Nuevo',
                    type: 'confirm',
                    callback: () => this.reiniciarJuego()
                },
                {
                    text: 'Menú Principal', 
                    type: 'cancel',
                    callback: () => {
                        this.reiniciarJuego();
                    }
                }
            ];
            
            showNotification(titulo, mensaje, botones);
        }
    }
    
    iniciarJuego() {
        if (this.juegoActivo) return;
        this.juegoActivo = true;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.ayudaActiva = false;
        this.movimientoAyuda = null;
        this.actualizarTimerDisplay();
        this.detenerTimer();
        this.detenerAyuda();
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.actualizarTimerDisplay();
            
            // Verificar si necesita ayuda (5 segundos sin movimiento)
            if (this.timer - this.ultimoMovimiento >= 5 && !this.ayudaActiva) {
                this.mostrarAyuda();
            }
        }, 1000);
        
        document.getElementById('startGameBtn').disabled = true;
        this.dibujar();
    }
    
    detenerAyuda() {
        this.ayudaActiva = false;
        this.movimientoAyuda = null;
    }
    
    mostrarAyuda() {
        // Buscar un movimiento posible
        const movimientosPosibles = [];
        
        for (let ficha of this.fichas) {
            const movimientos = this.obtenerMovimientosValidos(ficha);
            if (movimientos.length > 0) {
                movimientosPosibles.push({
                    ficha: ficha,
                    movimiento: movimientos[0] // Tomar el primer movimiento posible
                });
            }
        }
        
        if (movimientosPosibles.length > 0) {
            // Elegir un movimiento aleatorio para sugerir
            const ayuda = movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
            this.ayudaActiva = true;
            this.movimientoAyuda = ayuda;            
            
            this.dibujar();
        }
    }
    
    detenerTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    reiniciarJuego() {
        this.detenerTimer();
        this.detenerAyuda();
        this.juegoActivo = false;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.actualizarTimerDisplay();
        this.fichaSeleccionada = null;
        this.movimientosValidos = [];
        this.configurarTablero();
        this.inicializarFichas();
        document.getElementById('startGameBtn').disabled = false;
        this.dibujar();
    }
    
    actualizarTimerDisplay() {
        const minutos = Math.floor(this.timer / 60);
        const segundos = this.timer % 60;
        const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = tiempoFormateado;
    }
    
    dibujar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dibujarTablero();
        this.dibujarMovimientosValidos();
        this.dibujarFichas();
    }
    
    dibujarTablero() {
        this.ctx.fillStyle = '#5D4037';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.strokeStyle = '#5D4037';
        this.ctx.lineWidth = 2;
        
        this.casillas.forEach(casilla => {
            this.ctx.beginPath();
            this.ctx.roundRect(casilla.x, casilla.y, casilla.tamano, casilla.tamano, 8);
            this.ctx.fill();
            this.ctx.stroke();
            
            if (casilla.fila === 3 && casilla.columna === 3) {
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                this.ctx.beginPath();
                this.ctx.roundRect(casilla.x + 2, casilla.y + 2, casilla.tamano - 4, casilla.tamano - 4, 6);
                this.ctx.fill();
                this.ctx.fillStyle = '#8B4513';
            }
        });
    }
    
    dibujarMovimientosValidos() {
    this.movimientosValidos.forEach(mov => {
        this.ctx.fillStyle = 'rgba(255, 107, 53, 0.5)';
        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(mov.x, mov.y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    });
    
    // Dibujar ayuda si está activa
    if (this.ayudaActiva && this.movimientoAyuda) {
        const ayuda = this.movimientoAyuda;
        
        // Destacar la ficha sugerida con un círculo azul
        this.ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
        this.ctx.strokeStyle = '#0096FF';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(ayuda.ficha.x, ayuda.ficha.y, ayuda.ficha.radio + 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Destacar el destino sugerido con un círculo azul
        this.ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        this.ctx.strokeStyle = '#0096FF';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(ayuda.movimiento.x, ayuda.movimiento.y, 30, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
    }
}
    
    dibujarFichas() {
        this.fichas.forEach(ficha => {
            if (ficha !== this.fichaSeleccionada) ficha.dibujar(this.ctx);
        });
        if (this.fichaSeleccionada && this.fichaSeleccionada.xTemp && this.fichaSeleccionada.yTemp) {
            this.fichaSeleccionada.dibujarTemporal(this.ctx);
        } else if (this.fichaSeleccionada) {
            this.fichaSeleccionada.dibujar(this.ctx);
        }
    }
}


// ==================== INICIALIZACIÓN ====================

let juegoPegSolitaire = null;

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('pegSolitaireCanvas');
    if (canvas) {
        juegoPegSolitaire = new Tablero(canvas);
        document.getElementById('startGameBtn').addEventListener('click', function() {
            juegoPegSolitaire.iniciarJuego();
        });
        document.getElementById('resetGameBtn').addEventListener('click', function() {
            juegoPegSolitaire.reiniciarJuego();
        });
    }
});