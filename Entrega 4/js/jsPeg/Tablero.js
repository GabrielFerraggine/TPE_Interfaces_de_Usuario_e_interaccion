class Tablero {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.imagenesFichas = [
            "../img/imgPeg/barco.png",
            "../img/imgPeg/Casco-hacha.png",
            "../img/imgPeg/Ficha-runicaa.png"
        ];

        // Objeto para mapear nombres de formas a sus clases
        this.formasFichas = {};
        this.inicializarFormasFichas();
        this.formaSeleccionada = 'aleatoria';
        this.imagenSeleccionada = 'aleatoria';

        //Inicializacion de propiedades
        this.imagenFichaActual = this.obtenerImagenAleatoria();
        this.fichas = [];
        this.casillas = [];
        this.movimientosValidos = [];
        this.fichaSeleccionada = null;
        this.juegoActivo = false;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.ayudaActiva = false;
        this.movimientoAyuda = null;
        this.timerInterval = null;

        //Sistema de tiempo limite
        this.sistemaTiempoLimite = new SistemaTiempoLimite(this);

        //Precargar la imagen
        this.inicializarFormasFichas();
        this.precargarImagenes(() => {
            this.inicializarFichas();
            this.configurarEventos();
            this.dibujar();
            this.configurarModalEventListeners();
        });

        this.juegoActivo = false;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.ayudaActiva = false;
    }

    //crear fichas basado en la selección
    crearFicha(ctx, x, y, radio, tablero, fila, columna) {
        // Verificar que formasFichas tenga contenido
        if (Object.keys(this.formasFichas).length === 0) {
            console.error('No hay formas de fichas disponibles');
            return null;
        }

        let ClaseFicha;
        if (this.formaSeleccionada === 'aleatoria') {
            const tipos = Object.values(this.formasFichas).filter(cls => typeof cls === 'function');
            if (tipos.length === 0) {
                console.error('No hay constructores válidos en formasFichas');
                return null;
            }
            ClaseFicha = tipos[Math.floor(Math.random() * tipos.length)];
        } else {
            ClaseFicha = this.formasFichas[this.formaSeleccionada];
        }

        // Verificar que tenemos un constructor válido
        if (typeof ClaseFicha !== 'function') {
            console.error('ClaseFicha no es función:', ClaseFicha, 'para forma:', this.formaSeleccionada);
            console.error('Formas disponibles:', this.formasFichas);
            return null;
        }

        let rutaImagen;
        if (this.imagenSeleccionada === 'aleatoria') {
            rutaImagen = this.obtenerImagenAleatoria();
        } else {
            rutaImagen = this.imagenSeleccionada;
        }

        try {
            return new ClaseFicha(ctx, x, y, radio, tablero, fila, columna, rutaImagen);
        } catch (error) {
            console.error('Error al crear ficha:', error);
            return null;
        }
    }

    //devuelve la ruta de una de las imágenes aleatoriamente
    obtenerImagenAleatoria() {
        const indiceAleatorio = Math.floor(Math.random() * this.imagenesFichas.length);
        return this.imagenesFichas[indiceAleatorio];
    }

    //inicializar las formas de las fichas
    inicializarFormasFichas() {
        // Verifica que las clases existan en el ámbito global
        if (typeof FichaCircular === 'function') {
            this.formasFichas['circular'] = FichaCircular;
        } else {
            console.error('FichaCircular no está definida');
        }

        if (typeof FichaCuadrada === 'function') {
            this.formasFichas['cuadrada'] = FichaCuadrada;
        } else {
            console.error('FichaCuadrada no está definida');
        }

        if (typeof FichaPentagonal === 'function') {
            this.formasFichas['pentagonal'] = FichaPentagonal;
        } else {
            console.error('FichaPentagonal no está definida');
        }
    }

    //Carga la imagen actual de la ficha en un objeto Image
    cargarImagenFicha() {
        this.imagenFicha = new Image();
        this.imagenFicha.src = this.imagenFichaActual;
        this.imagenFicha.onload = () => {
            if (this.fichas && this.fichas.length > 0) {
                this.dibujar();
            }
        };
        this.imagenFicha.onerror = () => {
            console.error("Error al cargar la imagen:", this.imagenFichaActual);
        };
    }

    //Cambia la imagen actual de la ficha por una nueva
    cambiarImagenFicha(nuevaImagen) {
        this.imagenFichaActual = nuevaImagen;
        this.cargarImagenFicha();
    }

    //Devuelve el objeto Image de la ficha actualmente cargada
    getImagenFicha() {
        return this.imagenFicha;
    }

    //Configura el tablero inicial
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

    //inicializa las fichas
    inicializarFichas() {
        this.fichas = [];
        this.casillas.forEach(casilla => {
            if (casilla.ocupada) {
                // Se llama a crearFicha
                const ficha = this.crearFicha(
                    this.ctx,
                    casilla.x + casilla.tamano / 2,
                    casilla.y + casilla.tamano / 2,
                    casilla.tamano / 2 - 4,
                    this,
                    casilla.fila,
                    casilla.columna
                );
                this.fichas.push(ficha);
            }
        });
    }

    //añade los listeners para los eventos del mouse
    configurarEventos() {
        this.canvas.addEventListener('mousedown', this.manejarMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.manejarMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.manejarMouseUp.bind(this));
    }

    // Maneja el evento mouse down
    manejarMouseDown(event) {
        if (!this.juegoActivo) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.fichaSeleccionada = null;
        for (let ficha of this.fichas.slice().reverse()) {
            if (ficha.contienePunto(x, y)) {
                this.fichaSeleccionada = ficha;
                this.fichas.forEach(f => f.seleccionada = false);
                ficha.seleccionada = true;
                break;
            }
        }

        if (this.fichaSeleccionada) {
            this.mostrarMovimientosValidos(this.fichaSeleccionada);
            this.dibujar();
        }
    }

    // Maneja el evento mouse move
    manejarMouseMove(event) {
        if (!this.juegoActivo || !this.fichaSeleccionada) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.fichaSeleccionada.xTemp = x;
        this.fichaSeleccionada.yTemp = y;
        this.dibujar();
    }

    // Maneja el evento mouse up
    manejarMouseUp(event) {
        if (!this.juegoActivo || !this.fichaSeleccionada) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.intentarMoverFicha(this.fichaSeleccionada, x, y);

        if (this.fichaSeleccionada) {
            this.fichaSeleccionada.seleccionada = false;
        }

        this.fichaSeleccionada.xTemp = null;
        this.fichaSeleccionada.yTemp = null;
        this.fichaSeleccionada = null;
        this.movimientosValidos = [];
        this.dibujar();
    }

    // Muestra los movimientos validos
    mostrarMovimientosValidos(ficha) {
        this.movimientosValidos = this.obtenerMovimientosValidos(ficha);
    }

    //Determina todos los movimientos posibles para una ficha
    obtenerMovimientosValidos(ficha) {
        const movimientos = [];
        const direcciones = [
            //fila destino/columna destino/fila salto/ columna salto
            { df: -2, dc: 0, sf: -1, sc: 0 },//Arriba
            { df: 2, dc: 0, sf: 1, sc: 0 },//Abajo
            { df: 0, dc: -2, sf: 0, sc: -1 },//Izquierda
            { df: 0, dc: 2, sf: 0, sc: 1 },//Derecha
            { df: -3, dc: 0, sf: -2, sc: 0 },//Arriba
            { df: 3, dc: 0, sf: 2, sc: 0 },//Abajo
            { df: 0, dc: -3, sf: 0, sc: -2 },//Izquierda
            { df: 0, dc: 3, sf: 0, sc: 2 }//Derecha
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

    //Verifica si un movimiento es valido
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

    // Obtiene la casilla en una posición específica
    obtenerCasilla(fila, columna) {
        return this.casillas.find(c => c.fila === fila && c.columna === columna);
    }

    // Obtiene la ficha en una posición específica
    obtenerFichaEnCasilla(fila, columna) {
        return this.fichas.find(f => f.fila === fila && f.columna === columna);
    }

    //Comprueba si las coordenadas x, y están cerca de un punto de movimiento válido
    intentarMoverFicha(ficha, x, y) {
        for (let movimiento of this.movimientosValidos) {
            const distancia = Math.sqrt(Math.pow(x - movimiento.x, 2) + Math.pow(y - movimiento.y, 2));
            if (distancia <= ficha.radio * 1.5) {
                this.realizarMovimiento(ficha, movimiento);
                return;
            }
        }
    }

    // Realiza el movimiento de una ficha
    realizarMovimiento(ficha, movimiento) {
        const filaOriginal = ficha.fila;
        const columnaOriginal = ficha.columna;

        ficha.x = movimiento.x;
        ficha.y = movimiento.y;
        ficha.fila = movimiento.fila;
        ficha.columna = movimiento.columna;

        const indexFichaSaltada = this.fichas.indexOf(movimiento.fichaSaltada);
        if (indexFichaSaltada > -1) {//cantidad borrada;

            if(filaOriginal < movimiento.fila) {//Hacia abajo
                this.fichas.splice(indexFichaSaltada, 1);
                this.fichas.splice(columnaOriginal+1, 1);
            } else if(filaOriginal > movimiento.fila) {//Hacia arriba
                this.fichas.splice(indexFichaSaltada, 1);
                this.fichas.splice(indexFichaSaltada+4, 1);
            } else if(columnaOriginal < movimiento.columna) {//hacia derecha
                this.fichas.splice(indexFichaSaltada, 1);
                this.fichas.splice(indexFichaSaltada-1, 1);
            } else {//hacia la izquierda
                this.fichas.splice(indexFichaSaltada, 2);
            }
        }

        // const indexFichaSaltada2 = this.fichas.indexOf(movimiento.fichaSaltada);
        // if (indexFichaSaltada2 > -1) {
        //     this.fichas.splice(indexFichaSaltada2, 8);//cantidad borrada;
        // }

        //Logica ocupada
        const casillaOrigen = this.obtenerCasilla(filaOriginal, columnaOriginal);
        const casillaDestino = this.obtenerCasilla(movimiento.fila, movimiento.columna);
        const casillaSalto = this.obtenerCasilla(movimiento.fichaSaltada.fila, movimiento.fichaSaltada.columna);
//        const casillaSalto2 = this.obtenerCasilla(movimiento.fichaSaltada.fila, movimiento.fichaSaltada.columna);
        console.log(casillaSalto);
        // console.log(casillaSalto2);

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
        // if (casillaSalto2) {
        //      casillaSalto2.ocupada = false;
        //      casillaSalto2.vacia = true;
        // }

        this.ultimoMovimiento = this.timer;
        this.detenerAyuda();

        setTimeout(() => this.verificarFinJuego(), 100);
    }

    // Comprueba si el juego ha terminado (no quedan movimientos posibles)
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
                    callback: () => {
                        this.reiniciarJuego(); // Esto mostrará el modal de configuración
                    }
                },
                {
                    text: 'Menú Principal',
                    type: 'cancel',
                    callback: () => {
                        this.reinicioRapido(); // Esto reinicia rápidamente sin modal
                    }
                }
            ];
            showNotification(titulo, mensaje, botones);
        }
    }

    //muestra el modal visual
    iniciarJuego() {
        if (this.juegoActivo) return;

        //forzar selección reiniciando las variables a null
        this.formaSeleccionada = null;
        this.imagenSeleccionada = null;

        //Limpiar la selección visual
        const configModal = document.getElementById('configModal');
        const options = configModal.querySelectorAll('.config-option');
        options.forEach(opt => opt.classList.remove('selected'));

        //Ocultar el mensaje de error
        const errorMsg = document.getElementById('configErrorMessage');
        if (errorMsg) {
            errorMsg.style.display = 'none';
            errorMsg.textContent = '';
        }

        // Mostrar el modal de configuración
        configModal.classList.add('active');
    }

    // configura los event listeners para el modal de configuración
    configurarModalEventListeners() {
        const configModal = document.getElementById('configModal');
        const confirmBtn = document.getElementById('confirmConfigBtn');
        const imageOptions = document.querySelectorAll('.config-option[data-group="imagen"]');
        const shapeOptions = document.querySelectorAll('.config-option[data-group="forma"]');
        const errorMsg = document.getElementById('configErrorMessage');

        // Configurar selección de opciones
        this.addClickHandler(imageOptions, 'imagenSeleccionada');
        this.addClickHandler(shapeOptions, 'formaSeleccionada');

        confirmBtn.addEventListener('click', () => {

            // Validar la selección
            if (this.imagenSeleccionada && this.formaSeleccionada) {
                if (errorMsg) errorMsg.style.display = 'none'; // Ocultar error
                configModal.classList.remove('active');
                this._comenzarPartida();

            } else {
                if (errorMsg) {
                    if (!this.imagenSeleccionada && !this.formaSeleccionada) {
                        errorMsg.textContent = 'Debes elegir una imagen y una forma.';
                    } else if (!this.imagenSeleccionada) {
                        errorMsg.textContent = 'Debes elegir una imagen para tus Vikingos.';
                    } else {
                        errorMsg.textContent = 'Debes elegir una forma para las fichas.';
                    }
                    errorMsg.style.display = 'block'; // Mostrar error
                }
            }
        });

        const resetToRandom = () => {
            configModal.classList.remove('active');
            this.formaSeleccionada = 'aleatoria';
            this.imagenSeleccionada = 'aleatoria';
            if (errorMsg) errorMsg.style.display = 'none'; // Ocultar error
            this._comenzarPartida();

        };

        // Cerrar modal al hacer clic fuera
        configModal.addEventListener('click', (e) => {
            if (e.target === configModal) {
                resetToRandom();
            }
        });
    }

    // Se llama después de mostrar el modal para hacer cliqueables las opciones.
    setupModalEventListeners() {
        const imageOptions = document.querySelectorAll('.config-option[data-group="imagen"]');
        const shapeOptions = document.querySelectorAll('.config-option[data-group="forma"]');

        this.addClickHandler(imageOptions, 'imagenSeleccionada');
        this.addClickHandler(shapeOptions, 'formaSeleccionada');
    }

    // Helper para la lógica de selección visual.
    addClickHandler(options, propertyToSet) {
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(opt => opt.classList.remove('selected'));

                option.classList.add('selected');

                this[propertyToSet] = option.dataset.value;
            });
        });
    }

    //Inicia una nueva partida con la configuración seleccionada
    _comenzarPartida() {
        this.reinicioRapido();

        // Configurar el estado del juego
        this.juegoActivo = true;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.actualizarTimerDisplay();
        this.detenerAyuda();

        // Iniciar sistemas
        this.sistemaTiempoLimite.iniciarTiempoLimite();
        this.iniciarTimer();

        // Iniciar animación del juego
        const animar = () => {
            if (this.juegoActivo) {
                this.dibujar();
                requestAnimationFrame(animar);
            }
        };
        animar();
    }

    //se inicia el timer
    iniciarTimer() {
        this.detenerTimer(); // Asegurarse de que no hay timers duplicados

        this.timerInterval = setInterval(() => {
            this.timer++;
            this.actualizarTimerDisplay();
            this.sistemaTiempoLimite.actualizarTiempoLimite();

            if (this.timer - this.ultimoMovimiento >= 30 && !this.ayudaActiva) {
                this.mostrarAyuda();
            }
        }, 1000);
    }

    //desactiva el sistema de ayuda
    detenerAyuda() {
        this.ayudaActiva = false;
        this.movimientoAyuda = null;
    }

    //Busca un movimiento válido al azar
    mostrarAyuda() {
        const movimientosPosibles = [];
        for (let ficha of this.fichas) {
            const movimientos = this.obtenerMovimientosValidos(ficha);
            if (movimientos.length > 0) {
                movimientosPosibles.push({
                    ficha: ficha,
                    movimiento: movimientos[0]
                });
            }
        }
        if (movimientosPosibles.length > 0) {
            const ayuda = movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
            this.ayudaActiva = true;
            this.movimientoAyuda = ayuda;
            this.dibujar();
        }
    }

    //detiene el timer
    detenerTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    //reinicia el juego
    reiniciarJuego() {
        //Primero detener todo
        this.detenerTimer();
        this.detenerAyuda();
        this.juegoActivo = false;

        //Mostrar el modal de configuración para nueva partida
        this.iniciarJuego();
    }

    //reinicia el juego sin mostrar el modal
    reinicioRapido() {
        this.detenerAyuda();
        this.juegoActivo = false;
        this.timer = 0;
        this.ultimoMovimiento = 0;
        this.fichaSeleccionada = null;
        this.movimientosValidos = [];

        // Mantener las configuraciones actuales
        // Reiniciar completamente el tablero y fichas
        this.configurarTablero();
        this.inicializarFichas();

        this.sistemaTiempoLimite.detenerTiempoLimite();
        this.sistemaTiempoLimite.iniciarTiempoLimite();

        this.dibujar();
        this.juegoActivo = true;
    }

    //Actualiza el elemento HTML del timer para mostrar el tiempo de juego
    actualizarTimerDisplay() {
        const minutos = Math.floor(this.timer / 60);
        const segundos = this.timer % 60;
        const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = tiempoFormateado;
    }

    //Limpia el canvas y llama a los métodos específicos para dibujar el tablero
    dibujar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dibujarTablero();
        this.dibujarMovimientosValidos();
        this.dibujarFichas();
    }

    //Dibuja las casillas del tablero en el canvas
    dibujarTablero() {
        this.ctx.fillStyle = '#3B2F2F'; //fondo tablero
        this.ctx.strokeStyle = '#1C1C1C'; //borde tablero
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
                this.ctx.fillStyle = '#3B2F2F'; //fondo tablero
            }
        });
    }

    // Dibuja los movimientos validos dependiendo la forma de la ficha seleccionada
    dibujarMovimientosValidos() {
        const pulso = 0.3 + (Math.sin(Date.now() / 300) * 0.25 + 0.25);

        this.movimientosValidos.forEach(mov => {
            this.ctx.fillStyle = `rgba(255, 107, 53, ${pulso})`;
            this.ctx.strokeStyle = '#FF6B35';
            this.ctx.lineWidth = 3;

            //Si hay una ficha seleccionada, usar su forma
            if (this.fichaSeleccionada && typeof this.fichaSeleccionada.crearForma === 'function') {
                this.ctx.beginPath();
                this.fichaSeleccionada.crearForma(mov.x, mov.y, 25); // Usar radio de 25 para los indicadores
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                //Fallback a círculo si no hay ficha seleccionada o no tiene el método
                this.ctx.beginPath();
                this.ctx.arc(mov.x, mov.y, 25, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }

            //Efecto de pulso exterior
            const tamanoPulso = 25 + Math.sin(Date.now() / 400) * 9;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${pulso * 0.7})`;
            this.ctx.lineWidth = 2;

            if (this.fichaSeleccionada && typeof this.fichaSeleccionada.crearForma === 'function') {
                this.ctx.beginPath();
                this.fichaSeleccionada.crearForma(mov.x, mov.y, tamanoPulso);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(mov.x, mov.y, tamanoPulso, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });

        if (this.ayudaActiva && this.movimientoAyuda) {
            const ayuda = this.movimientoAyuda;
            const pulsoAyuda = 0.4 + (Math.sin(Date.now() / 250) * 0.3 + 0.3);

            //Resaltar la ficha para la ayuda
            this.ctx.fillStyle = `rgba(0, 150, 255, ${pulsoAyuda * 0.3})`;
            this.ctx.strokeStyle = '#0096FF';
            this.ctx.lineWidth = 4;

            this.ctx.beginPath();
            ayuda.ficha.crearForma(ayuda.ficha.x, ayuda.ficha.y, ayuda.ficha.radio + 8);
            this.ctx.fill();
            this.ctx.stroke();

            //Resaltar el destino de movimiento para la ayuda
            this.ctx.fillStyle = `rgba(0, 150, 255, ${pulsoAyuda * 0.5})`;
            this.ctx.strokeStyle = '#0096FF';
            this.ctx.lineWidth = 4;

            //Usar la forma de la ficha para el destino de ayuda también
            if (ayuda.ficha && typeof ayuda.ficha.crearForma === 'function') {
                this.ctx.beginPath();
                ayuda.ficha.crearForma(ayuda.movimiento.x, ayuda.movimiento.y, 30);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(ayuda.movimiento.x, ayuda.movimiento.y, 30, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }

    // Dibuja todas las fichas
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


    //metodo para precargar las imagenes y evitar retrasos en el juego
    precargarImagenes(callback) {
        const rutas = this.imagenesFichas;
        let cargadas = 0;
        rutas.forEach(ruta => {
            const img = new Image();
            img.src = ruta;
            img.onload = () => {
                cargadas++;
                if (cargadas === rutas.length) {
                    callback();
                }
            };
            img.onerror = () => {
                console.warn("Error al cargar imagen:", ruta);
                cargadas++;
                if (cargadas === rutas.length) {
                    callback();
                }
            };
        });
    }
}


// ==================== INICIALIZACIÓN ====================
let juegoPegSolitaire = null;

document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('pegSolitaireCanvas');
    if (canvas) {
        juegoPegSolitaire = new Tablero(canvas);

        juegoPegSolitaire.iniciarJuego();

        // Botón de reinicio rápido (mantiene configuraciones)
        document.getElementById('btnNewGame').addEventListener('click', function () {
            juegoPegSolitaire.reinicioRapido();
        });

        // Botón de reinicio completo (muestra modal)
        document.getElementById('resetGameBtn').addEventListener('click', function () {
            juegoPegSolitaire.reiniciarJuego();
        });
    }
});