class SistemaTiempoLimite {
    constructor(tablero) {
        this.tablero = tablero;
        this.tiempoLimite = 300; //5 minutos en segundos
        this.tiempoRestante = this.tiempoLimite;
        this.alertaMostrada = false;
    }

    // Inicia el temporizador del tiempo límite
    iniciarTiempoLimite() {
        this.tiempoRestante = this.tiempoLimite;
        this.alertaMostrada = false;
        this.actualizarDisplayTiempoLimite();
    }

    // Actualiza el temporizador del tiempo límite
    actualizarTiempoLimite() {
        if (!this.tablero.juegoActivo) return;

        this.tiempoRestante--;
        this.actualizarDisplayTiempoLimite();

        // Verificar alertas
        if (this.tiempoRestante === 60 && !this.alertaMostrada) {
            this.mostrarAlertaTiempo("¡Último minuto!", "Te queda 1 minuto para completar el juego.");
            this.alertaMostrada = true;
        }

        // Verificar fin del tiempo
        if (this.tiempoRestante <= 0) {
            this.tiempoAgotado();
        }
    }

    // Actualiza el display del tiempo límite
    actualizarDisplayTiempoLimite() {
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        const tiempoLimiteElement = document.getElementById('tiempoLimiteDisplay');
        if (tiempoLimiteElement) {
            tiempoLimiteElement.textContent = tiempoFormateado;
            
            //Cambiar color cuando quede poco tiempo
            if (this.tiempoRestante <= 15) {
                tiempoLimiteElement.style.color = '#FF4444';
                tiempoLimiteElement.style.fontWeight = 'bold';
            } else {
                tiempoLimiteElement.style.color = '#FF6B35';
            }
        }
    }

    // Muestra una alerta cuando queda poco tiempo
    mostrarAlertaTiempo(titulo, mensaje) {
        showNotification(titulo, mensaje, [
            {
                text: 'Entendido',
                type: 'confirm',
                callback: () => console.log('Alerta de tiempo confirmada')
            }
        ]);
    }

    // muestra notificación cuando se agota el tiempo
    tiempoAgotado() {
        this.tablero.juegoActivo = false;
        this.tablero.detenerTimer();
        this.tablero.detenerAyuda();

        const fichasRestantes = this.tablero.fichas.length;
        
        showNotification(
            '¡Tiempo Agotado!', 
            `Se te ha acabado el tiempo. Quedaron ${fichasRestantes} vikingos en pie.`,
            [
                {
                    text: 'Reintentar',
                    type: 'confirm',
                    callback: () => {
                        this.tablero.reiniciarJuego();
                        this.iniciarTiempoLimite();
                    }
                },
                {
                    text: 'Menú Principal',
                    type: 'cancel',
                    callback: () => {
                        this.tablero.reiniciarJuego();
                    }
                }
            ]
        );
    }

    // Detiene y resetea el temporizador del tiempo límite
    detenerTiempoLimite() {
        this.tiempoRestante = this.tiempoLimite;
        this.alertaMostrada = false;
        this.actualizarDisplayTiempoLimite();
    }
}