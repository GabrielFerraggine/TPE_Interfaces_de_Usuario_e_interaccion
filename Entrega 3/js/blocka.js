//boton user
const userAvatar = document.getElementById("userAvatar");
const dropdownMenu = document.getElementById("dropdownMenu");
const closeBtn = document.querySelector(".close-btn");

//Mostrar/ocultar menú al clickear el avatar
userAvatar.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
});

//Boton "Volver" cierra el menu
closeBtn.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
});

//Cierra si se hace clic afuera
document.addEventListener("click", (event) => {
    if (!dropdownMenu.contains(event.target) && !userAvatar.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
    }
});

//Boton menu hamburguesa
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuHamburguesaBtn");
const menuIcon = document.getElementById("menuIcon");

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");

    if (sidebar.classList.contains("expanded")) {
        menuIcon.src = "../img/close.png";
    } else {
        menuIcon.src = "../img/Menu Hamburguesa.png";
    }
});

//Lleva al registro al cerrar sesion
document.querySelectorAll("#logoutBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        window.location.href = "../html/registro.html";
    });
});

//Boton compartir
document.addEventListener('DOMContentLoaded', (event) => {
    const toggleButton = document.getElementById('toggleShare');
    const socialIcons = document.getElementById('socialIcons');

    toggleButton.addEventListener('click', () => {
        socialIcons.classList.toggle('visible');
    });
});

// ==================== JUEGO BLOCKA ====================
//Variables del juego
let currentLevel = 1;
let timerInterval;
let seconds = 0;
let isGameActive = false;
let correctPieces = 0;
let pieceRotations = [0, 0, 0, 0];
let correctRotations = [0, 0, 0, 0];
let usedHelp = false;
let currentImage = null;
let maxTimePerLevel = [0, 25, 15];//Tiempos máximos por nivel
let timeLimitReached = false;
let cantPieces = 4;
let gridConfig = { cols: 2, rows: 2 };

const gridConfigs = {
    4: { cols: 2, rows: 2, pieceSize: 200 },
    6: { cols: 3, rows: 2, pieceSize: 200 },
    8: { cols: 4, rows: 2, pieceSize: 200 }
};

const images = [
    "../img/imgBlocka/bestia.jpg",
    "../img/imgBlocka/cuatrobrazos.webp",
    "../img/imgBlocka/diamante.jpg",
    "../img/imgBlocka/fantasmatico.webp",
    "../img/imgBlocka/fuego.jpg",
    "../img/imgBlocka/insectoide.jpg",
    "../img/imgBlocka/mandibula.jpg",
    "../img/imgBlocka/materiagris.jpg",
    "../img/imgBlocka/upgrade.jpg",
    "../img/imgBlocka/XLR8.jpg"
];

//Elementos del 2D del canvas (par elemento y contexto)
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const completeCanvas = document.getElementById('completeCanvas');
const completeCtx = completeCanvas.getContext('2d');
const canvas = document.getElementById("thumbCanvas");
const ctx = canvas.getContext("2d");

//Filtros
const levelConfig = [
    { name: 'Escala de grises', filter: 'grayscale', colors: [] },
    { name: 'Brillo (30%)', filter: 'brightness', colors: [] },
    { name: 'Negativo', filter: 'invert', colors: [] }
];

// ==================== THUMBNAILS CANVAS ====================
const imagesThunb = [
    "../img/imgBlocka/bestia.jpg",
    "../img/imgBlocka/cuatrobrazos.webp",
    "../img/imgBlocka/diamante.jpg",
    "../img/imgBlocka/fantasmatico.webp",
    "../img/imgBlocka/fuego.jpg",
    "../img/imgBlocka/insectoide.jpg",
    "../img/imgBlocka/mandibula.jpg",
    "../img/imgBlocka/materiagris.jpg",
    "../img/imgBlocka/upgrade.jpg",
    "../img/imgBlocka/XLR8.jpg"
];

const loadedImages = imagesThunb.map(url => {
    const img = new Image();
    img.src = url;
    return img;
});

const spacing = 20;
const startX = 400;
let y = 50;
let selectedIndex = -1;

/*================== INICIALIZACION Y CONFIGURACION ================================ */
//Función para obtener una pieza de la imagen con filtro aplicado
function getFilteredImagePiece(image, pieceIndex, filterType) {
    const pieceCols = gridConfig.cols;
    const pieceRows = gridConfig.rows;
    const imgPieceWidth = image.width / pieceCols;
    const imgPieceHeight = image.height / pieceRows;

    const row = Math.floor(pieceIndex / pieceCols);
    const col = pieceIndex % pieceCols;

    //Crear canvas temporal para la pieza
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imgPieceWidth;
    tempCanvas.height = imgPieceHeight;

    //Dibujar la pieza en el canvas temporal
    tempCtx.drawImage(
        image,
        col * imgPieceWidth, row * imgPieceHeight,
        imgPieceWidth, imgPieceHeight,
        0, 0,
        imgPieceWidth, imgPieceHeight
    );

    //Obtener ImageData y aplicar filtro
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const filteredData = applyImageFilter(imageData, filterType);

    //Devolver el canvas con el filtro aplicado
    tempCtx.putImageData(filteredData, 0, 0);
    return tempCanvas;
}

//Carga el nivel configurando valores iniciales
function loadLevel(level) {
    currentLevel = level;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('completedLevel').textContent = level;

    const config = levelConfig[level - 1];
    document.getElementById('currentFilter').textContent = config.name;

    //Reiniciar valores del juego
    correctPieces = 0;
    pieceRotations = Array(cantPieces).fill(0).map(() => Math.floor(Math.random() * 4));
    correctRotations = Array(cantPieces).fill(0);
    usedHelp = false;
    seconds = 0;
    timeLimitReached = false;

    clearInterval(timerInterval);
    isGameActive = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('helpBtn').disabled = true;
    updateTimerDisplay();
    updateDisplay();
    updateTimerLimitDisplay();
}

//Actualiza el display del grid en base a la cantidad de piezas
function updateGridConfig(piecesCount) {
    cantPieces = piecesCount;
    gridConfig = gridConfigs[piecesCount];
    
    //Reinicializar arrays de rotaciones
    pieceRotations = Array(piecesCount).fill(0).map(() => Math.floor(Math.random() * 4));
    correctRotations = Array(piecesCount).fill(0);
    
    //Ajustar tamaño del canvas si es necesario
    adjustCanvasSize();
}

//Función para ajustar el tamaño del canvas según la configuración
function adjustCanvasSize() {
    const gap = 20;
    const startX = 10;
    const startY = 10;
    
    const width = startX * 2 + gridConfig.cols * gridConfig.pieceSize + (gridConfig.cols - 1) * gap;
    const height = startY * 2 + gridConfig.rows * gridConfig.pieceSize + (gridConfig.rows - 1) * gap;
    
    gameCanvas.width = width;
    gameCanvas.height = height;
}

function resetGame() {
    isGameActive = false;
    clearInterval(timerInterval);
    correctPieces = 0;
    pieceRotations = Array(cantPieces).fill(0).map(() => Math.floor(Math.random() * 4));
    correctRotations = Array(cantPieces).fill(0);
    seconds = 0;
    timeLimitReached = false;
    usedHelp = false;
    currentLevel = 1;

    document.getElementById('startBtn').disabled = false;
    document.getElementById('helpBtn').disabled = true;

    updateTimerDisplay();
    updateDisplay();
    updateTimerLimitDisplay();

    // Resetear clases del timer
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.classList.remove('warning', 'danger');
}

//mostrar el tiempo límite en la UI
function updateTimerLimitDisplay() {
    const timerLimitElement = document.getElementById('timerLimit');
    if (!timerLimitElement) return;

    const maxTime = maxTimePerLevel[currentLevel - 1];

    if (maxTime > 0) {
        const minutes = Math.floor(maxTime / 60);
        const seconds = maxTime % 60;
        const timeStr = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        timerLimitElement.textContent = `Límite: ${timeStr}`;
        timerLimitElement.style.display = 'block';
    } else {
        timerLimitElement.textContent = 'Sin límite';
        timerLimitElement.style.display = 'block';
    }
}

/*================================== INTERACCIÓN DEL JUGADOR ===============================*/
//Obtiene los calculos para saber que pieza fue clickeada
function getPieceAtPosition(x, y) {
    const pieceSize = gridConfig.pieceSize;
    const gap = 20;
    const startX = 10;
    const startY = 10;

    for (let i = 0; i < cantPieces; i++) {
        const row = Math.floor(i / gridConfig.cols);
        const col = i % gridConfig.cols;
        const px = startX + col * (pieceSize + gap);
        const py = startY + row * (pieceSize + gap);

        if (x >= px && x <= px + pieceSize && y >= py && y <= py + pieceSize) {
            return i;
        }
    }
    return -1;//Caso el click esta fuera del canvas 
}

//Rota una pieza a una posicion diferente a la correcta
function rotatePiece(index, direction) {
    if (!isGameActive) return;

    //guarda si una pieza esta bien rotada o no
    const wasCorrect = pieceRotations[index] === correctRotations[index];
    //Calcular nueva rotación (asegurando que esté entre 0-3, se iba de rango antes)
    pieceRotations[index] = (pieceRotations[index] + direction + 4) % 4;

    const isCorrect = pieceRotations[index] === correctRotations[index];

    //Suma o resta al contador de piezas que esta bien rotadas
    if (!wasCorrect && isCorrect) {
        correctPieces++;
    } else if (wasCorrect && !isCorrect) {
        correctPieces--;
    }

    drawGameBoard();
    updateDisplay();
    checkLevelComplete();
}

//Usar ayuda
function useHelp() {
    if (!isGameActive || usedHelp) return;

    ///busca una pieza en posicion incorrecta
    let incorrectIndex = -1;
    for (let i = 0; i < cantPieces; i++) {
        if (pieceRotations[i] !== correctRotations[i]) {
            incorrectIndex = i;
            break;
        }
    }

    //Si existe alguna pieza en posicion incorrecta la rota, actualiza y comprueba si se completo el nivel
    if (incorrectIndex !== -1) {
        const wasCorrect = pieceRotations[incorrectIndex] === correctRotations[incorrectIndex];
        pieceRotations[incorrectIndex] = correctRotations[incorrectIndex];

        if (!wasCorrect) {
            correctPieces++;
        }

        //extra suma 5s al timer
        seconds += 5;
        updateTimerDisplay();
        usedHelp = true;
        document.getElementById('helpBtn').disabled = true;

        drawGameBoard();
        updateDisplay();
        checkLevelComplete();
    }
}

/*======================================== ACTUALIZACION DE ESTADOS ================================*/
//Indicador visual de la cantidad de piezas acertadas
function updateDisplay() {
    document.getElementById('correctPieces').textContent = correctPieces + '/' + cantPieces;
    const progress = Math.round((correctPieces / cantPieces) * 100);
    document.getElementById('progress').textContent = progress + '%';
}

//Timer del nivel
function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeStr = minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');

    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = timeStr;
    document.getElementById('finalTime').textContent = timeStr;

    const maxTime = maxTimePerLevel[currentLevel - 1]; //Ajustar índice porque currentLevel empieza en 1
    if (maxTime > 0) {
        if (seconds >= maxTime - 10 && seconds < maxTime) {
            timerDisplay.classList.add('warning');
            timerDisplay.classList.remove('danger');
        } else if (seconds >= maxTime) {
            timerDisplay.classList.add('danger');
            timerDisplay.classList.remove('warning');
        } else {
            timerDisplay.classList.remove('warning', 'danger');
        }
    } else {
        timerDisplay.classList.remove('warning', 'danger');
    }
}

//Chequea que todas las piezas esten en su lugar y que no se haya excedido el tiempo limite
function checkLevelComplete() {
    if (correctPieces === cantPieces) {
        levelComplete();
    }

    // Verificar si se excedió el tiempo límite
    const maxTime = maxTimePerLevel[currentLevel - 1]; // Ajustar índice
    if (maxTime > 0 && seconds >= maxTime && !timeLimitReached) {
        timeLimitReached = true;
        timeLimitExceeded();
    }
}

//funcion para manejar cuando se excede el tiempo
function timeLimitExceeded() {
    isGameActive = false;
    clearInterval(timerInterval);

    //Mostrar notificación de tiempo agotado
    setTimeout(() => {
        showNotification(
            '¡Tiempo Agotado!', 
            `No completaste el nivel ${currentLevel} en el tiempo límite. El nivel se reiniciará.`,
            [
                {
                    text: 'Reiniciar Nivel',
                    type: 'confirm',
                    callback: resetCurrentLevel
                }
            ]
        );
    }, 100);
}

//reiniciar el nivel actual
function resetCurrentLevel() {
    isGameActive = false;
    clearInterval(timerInterval);
    timeLimitReached = false;

    //Mantener la misma imagen pero reiniciar rotaciones y timer
    correctPieces = 0;
    pieceRotations = Array(cantPieces).fill(0).map(() => Math.floor(Math.random() * 4));
    correctRotations = Array(cantPieces).fill(0);
    usedHelp = false;
    seconds = 0;

    //Calcular correctPieces inicial
    for (let i = 0; i < cantPieces; i++) {
        if (pieceRotations[i] === correctRotations[i]) {
            correctPieces++;
        }
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('helpBtn').disabled = true;

    updateTimerDisplay();
    updateDisplay();
    drawGameBoard();

    //Mostrar mensaje en la pantalla de juego
    showScreen('gameScreen');
}

/*========================================= DIBUJO Y RENDERIZADO =============================== */
/*Muestra la pantalla del preview, si no hay imagen retorna */
function showImagePreview() {
    loadLevel(currentLevel);
    document.getElementById('previewLevel').textContent = currentLevel;

    const startPreview = () => {
        correctRotations = Array(cantPieces).fill(0);
        pieceRotations = [];

        //Restringir piezas correctas iniciales
        for (let i = 0; i < cantPieces; i++) {
            let randomRotation = Math.floor(Math.random() * 4);
            pieceRotations.push(randomRotation);
        }

        correctPieces = 0;
        for (let i = 0; i < cantPieces; i++) {
            if (pieceRotations[i] === correctRotations[i]) {
                correctPieces++;
            }
        }

        drawImagePreview(previewCanvas, previewCtx, currentLevel);
        showScreen('previewScreen');

        setTimeout(() => {
            showScreen('gameScreen');
            drawGameBoard();
            updateDisplay();
        }, 3000);
    };

    if (!currentImage) return;

    if (currentImage.complete) {
        startPreview();
    } else {
        currentImage.onload = startPreview;
        currentImage.onerror = () => {
            drawPreview(previewCanvas, previewCtx, currentLevel);
            showScreen('previewScreen');
            setTimeout(() => {
                showScreen('gameScreen');
                drawGameBoard();
                updateDisplay();
            }, 3000);
        };
    }
}

/*Dibuja la preview de la imagen aplicando filtros*/
function drawImagePreview(canvas, ctx, level) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = levelConfig[level - 1];

    if (currentImage && currentImage.complete) {
        //Crear canvas temporal para aplicar filtro a toda la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;

        //Dibujar imagen original
        tempCtx.drawImage(currentImage, 0, 0);

        //Aplicar filtro
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const filteredData = applyImageFilter(imageData, config.filter);
        tempCtx.putImageData(filteredData, 0, 0);

        //Dibujar en el canvas de preview
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    } else {
        //Fallback si no hay imagen
        drawPieceBackground(ctx, 0, 0, canvas.width, canvas.height, config.colors);
    }

    //Dibujar cuadrícula de referencia
    ctx.filter = 'none';
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);


    //Lineas verticales
    for (let col = 1; col < gridConfig.cols; col++) {
        const x = (canvas.width / gridConfig.cols) * col;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    //Lineas horizontales
    for (let row = 1; row < gridConfig.rows; row++) {
        const y = (canvas.height / gridConfig.rows) * row;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Texto del nivel
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nivel ' + level, canvas.width / 2, canvas.height / 2);
}

//Dibuja la imagen previa
function drawPreview(canvas, ctx, level) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = levelConfig[level - 1];

    //Aplica filtro o degrade
    drawPieceBackground(ctx, 0, 0, canvas.width, canvas.height, config.colors);

    //Dibuja la cuadricula de referencia
    ctx.filter = 'none';
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    //Dibuja la linea que divide la imagen
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    //Texto del centro del preview
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nivel ' + level, canvas.width / 2, canvas.height / 2);
}

//Dibuja el fondo de cada pieza aplicando degrade
function drawPieceBackground(ctx, x, y, width, height, colors) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
}

/*Dibuja el thumnails*/
function drawThumbnails(highlightIndex = -1) {//el -1 es para evitar que se vaya de rango
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imagesPerRow = Math.ceil(imagesThunb.length / 2);//Mitad de imagenes por fila
    let currentX = startX;
    let currentY = y;

    loadedImages.forEach((img, i) => {
        // Cambiar a nueva fila cuando llegamos al límite
        if (i > 0 && i % imagesPerRow === 0) {
            currentX = startX;
            currentY += 150 + spacing;//Altura de imagen + espaciado
        }

        ctx.drawImage(img, currentX, currentY, 150, 150);

        if (i === highlightIndex) {
            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 4;
            ctx.strokeRect(currentX - 3, currentY - 3, 156, 152);
        }

        //Mover a la siguiente posición en X
        currentX += 150 + spacing;
    });
}
//Carga de las imagenes
Promise.all(loadedImages.map(img => new Promise(res => img.onload = res))).then(() => drawThumbnails());

/*Elige una imagen random y anima la seleccion*/
function selectRandom() {
    showScreen('thumbScreen');
    selectedIndex = Math.floor(Math.random() * images.length);
    let vueltas = 0;
    let velocidad = 100;
    let current = 0;

    const totalVueltas = loadedImages.length * 3;
    const totalSteps = totalVueltas + selectedIndex + 2;

    const animate = () => {
        vueltas++;

        if (vueltas < totalSteps) {
            drawThumbnails(current);
            if (vueltas > totalSteps * 0.7) velocidad += 30;
            current = (current + 1) % loadedImages.length;
            setTimeout(animate, velocidad);
        } else {
            drawThumbnails(selectedIndex);
            currentImage = new Image();
            currentImage.src = images[selectedIndex];

            currentImage.onload = () => {
                showImagePreview();
            };
        }
    };

    animate();
}

//Función para aplicar filtros usando ImageData
function applyImageFilter(imageData, filterType) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    //Doble for tradicional para recorrer filas y columnas
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calcular índice en el array de datos
            const index = (y * width + x) * 4;
            
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            switch(filterType) {
                case 'grayscale':
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    data[index] = gray;         // R
                    data[index + 1] = gray;     // G
                    data[index + 2] = gray;     // B
                    break;
                    
                case 'brightness':
                    data[index] = Math.min(r * 1.9, 255);     // R
                    data[index + 1] = Math.min(g * 1.9, 255); // G
                    data[index + 2] = Math.min(b * 1.9, 255); // B
                    break;
                    
                case 'invert':
                    data[index] = 255 - r;     // R
                    data[index + 1] = 255 - g; // G
                    data[index + 2] = 255 - b; // B
                    break;
            }
        }
    }
    return imageData;
}

//Dibuja una pieza
function drawPiece(ctx, index, rotation, x, y, size, config, isCorrect) {
    ctx.save();//guarda la configuracion actual(colores,transformaciones, filtros)

    ctx.translate(x + size / 2, y + size / 2);//Situa el origen de la pieza al centro
    ctx.rotate((rotation * 90) * Math.PI / 180);//Rota la pieza 90°
    ctx.translate(-(x + size / 2), -(y + size / 2));

    if (currentImage) {
        // Obtener la pieza con filtro aplicado
        const filteredPiece = getFilteredImagePiece(currentImage, index, config.filter);

        // Dibujar la pieza filtrada
        ctx.drawImage(filteredPiece, x, y, size, size);
    } else {
        drawPieceBackground(ctx, x, y, size, size, config.colors);
    }

    //restaura para no afectar a la siguiente pieza
    ctx.restore();
}

//Dibuja las piezas en el grid
function drawGameBoard() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);//limpia el tablero al rotar una pieza

    const config = levelConfig[currentLevel - 1];//aplica filtro segun nivel (tomando el array de filtros como referencia)
    const pieceSize = gridConfig.pieceSize;
    const gap = 20;
    const startX = 10;
    const startY = 10;

    //recorre las 4 piezas del puzzle
    for (let i = 0; i < cantPieces; i++) {
        //Define la posicion de cada pieza
        const row = Math.floor(i / gridConfig.cols);
        const col = i % gridConfig.cols;
        //define coordenadas de dibujo
        const x = startX + col * (pieceSize + gap);
        const y = startY + row * (pieceSize + gap);
        const isCorrect = pieceRotations[i] === correctRotations[i];

        //Redibuja la pieza que fue rotada 
        drawPiece(gameCtx, i, pieceRotations[i], x, y, pieceSize, config, isCorrect);
    }
}

//Muestra el canvas que indica que se completo el nivel
function levelComplete() {
    isGameActive = false;
    clearInterval(timerInterval);

    document.getElementById('completedLevel').textContent = currentLevel;

    // Mostrar la imagen COMPLETA SIN FILTROS
    if (currentImage && currentImage.complete) {
        completeCtx.clearRect(0, 0, completeCanvas.width, completeCanvas.height);
        completeCtx.drawImage(currentImage, 0, 0, completeCanvas.width, completeCanvas.height);
    } else {
        // Fallback si no hay imagen
        const config = levelConfig[currentLevel - 1];
        drawPieceBackground(completeCtx, 0, 0, completeCanvas.width, completeCanvas.height, config.colors);
    }

    showScreen('completeScreen');
}


/*============================================ MANEJO DE PANTALLAS ============================*/
function showScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

/*========================================== SISTEMA DE NOTIFICACIONES =======================================*/
function showNotification(title, message, buttons = []) {
    const overlay = document.getElementById('notificationOverlay');
    const notification = document.getElementById('gameNotification');
    const titleElement = document.getElementById('notificationTitle');
    const messageElement = document.getElementById('notificationMessage');
    const buttonsContainer = document.getElementById('notificationButtons');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Limpiar botones anteriores
    buttonsContainer.innerHTML = '';
    
    // Crear botones dinámicamente
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.className = `notification-btn ${button.type || 'confirm'}`;
        btn.onclick = () => {
            hideNotification();
            if (button.callback) button.callback();
        };
        buttonsContainer.appendChild(btn);
    });
    
    // Si no hay botones, agregar uno por defecto
    if (buttons.length === 0) {
        const defaultBtn = document.createElement('button');
        defaultBtn.textContent = 'Aceptar';
        defaultBtn.className = 'notification-btn confirm';
        defaultBtn.onclick = hideNotification;
        buttonsContainer.appendChild(defaultBtn);
    }
    
    overlay.classList.add('active');
    notification.classList.add('active');
}

function hideNotification() {
    const overlay = document.getElementById('notificationOverlay');
    const notification = document.getElementById('gameNotification');
    
    overlay.classList.remove('active');
    notification.classList.remove('active');
}

// Función para mostrar confirmación
function showConfirmation(message, onConfirm, onCancel = null) {
    showNotification('Confirmar', message, [
        {
            text: 'Cancelar',
            type: 'cancel',
            callback: onCancel
        },
        {
            text: 'Aceptar',
            type: 'confirm',
            callback: onConfirm
        }
    ]);
}

/*================================EventListerner ===========================*/

//Responde a los clicks izquierdos
gameCanvas.addEventListener('click', function (e) {
    if (!isGameActive) return;
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pieceIndex = getPieceAtPosition(x, y);
    if (pieceIndex !== -1) {
        rotatePiece(pieceIndex, -1);
    }
});

//Responde a los clicks derechos
gameCanvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (!isGameActive) return;
    const rect = gameCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pieceIndex = getPieceAtPosition(x, y);
    if (pieceIndex !== -1) {
        rotatePiece(pieceIndex, 1);
    }
    return false;
});

//Inicia el nivel actual del boton comenzar nivel
document.getElementById('startBtn').addEventListener('click', function () {
    if (!isGameActive) {
        isGameActive = true;
        timeLimitReached = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('helpBtn').disabled = false;

        seconds = 0;
        updateTimerDisplay();
        timerInterval = setInterval(function () {
            if (isGameActive) {
                seconds++;
                updateTimerDisplay();
                checkLevelComplete(); // Verificar tiempo en cada actualización
            }
        }, 1000);
    }
});

//Selectores de cantidad de piezas
document.getElementById('btn4').addEventListener('click', function() {
    updateGridConfig(4);
    resetGame();
    selectRandom();
});

document.getElementById('btn6').addEventListener('click', function() {
    updateGridConfig(6);
    resetGame();
    selectRandom();
});

document.getElementById('btn8').addEventListener('click', function() {
    updateGridConfig(8);
    resetGame();
    selectRandom();
});

//Inicia de una imagen aleatoria
document.getElementById('startGameBtn').addEventListener('click', function() {
    showScreen('complexityLevel');
});

//Boton de ayuda
document.getElementById('helpBtn').addEventListener('click', useHelp);

//Confirma si desea volver al menu principal
document.getElementById('menuBtn').addEventListener('click', function () {
    showConfirmation(
        '¿Volver al menú principal? Se perderá el progreso actual.',
        function() {
            showScreen('welcomeScreen');
            resetGame();
        }
    );
});

//Te lleva al menu sin confirmacion 
document.getElementById('menuBtn2').addEventListener('click', function () {
    showScreen('welcomeScreen');
    resetGame();
});

document.getElementById('nextLevelBtn').addEventListener('click', function () {
    if (currentLevel < 3) {
        currentLevel++;
        selectRandom();
    } else {
        showNotification(
            '¡Felicidades!', 
            'Completaste todos los niveles del juego BLOCKA.',
            [
                {
                    text: 'Volver al Menú',
                    type: 'confirm',
                    callback: function() {
                        showScreen('welcomeScreen');
                        currentLevel = 1;
                        resetGame();
                    }
                }
            ]
        );
    }
});

/*========================================== INICIALIZACION POR DEFECTO =============================*/

updateGridConfig(4);
showScreen('welcomeScreen');