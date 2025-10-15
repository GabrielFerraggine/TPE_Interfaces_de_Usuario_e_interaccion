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
const totalPieces = 4;
let pieceRotations = [0, 0, 0, 0];
let correctRotations = [0, 0, 0, 0];
let usedHelp = false;
let currentImage = null;
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

//Filtros
const levelConfig = [
    { name: 'Escala de grises', filter: 'grayscale', colors: ['#FF6B35', '#FF8C5A'] },
    { name: 'Brillo (30%)', filter: 'brightness', colors: ['#3366CC', '#5599FF'] },
    { name: 'Negativo', filter: 'invert', colors: ['#33CC66', '#66FF99'] }
];

// ==================== FILTROS CON IMAGEDATA ====================

// Función para aplicar filtros usando ImageData
function applyImageFilter(imageData, filterType) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        switch(filterType) {
            case 'grayscale':
                // Escala de grises
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = gray;     // R
                data[i + 1] = gray; // G
                data[i + 2] = gray; // B
                break;
                
            case 'brightness':
                // Brillo +30%
                data[i] = Math.min(r * 1.9, 255);     // R
                data[i + 1] = Math.min(g * 1.9, 255); // G
                data[i + 2] = Math.min(b * 1.9, 255); // B
                break;
                
            case 'invert':
                // Negativo
                data[i] = 255 - r;     // R
                data[i + 1] = 255 - g; // G
                data[i + 2] = 255 - b; // B
                break;
        }
    }
    return imageData;
}

// Función para obtener una pieza de la imagen con filtro aplicado
function getFilteredImagePiece(image, pieceIndex, filterType) {
    const pieceCols = 2;
    const pieceRows = 2;
    const imgPieceWidth = image.width / pieceCols;
    const imgPieceHeight = image.height / pieceRows;
    
    const row = Math.floor(pieceIndex / 2);
    const col = pieceIndex % 2;
    
    // Crear canvas temporal para la pieza
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imgPieceWidth;
    tempCanvas.height = imgPieceHeight;
    
    // Dibujar la pieza en el canvas temporal
    tempCtx.drawImage(
        image,
        col * imgPieceWidth, row * imgPieceHeight,
        imgPieceWidth, imgPieceHeight,
        0, 0,
        imgPieceWidth, imgPieceHeight
    );
    
    // Obtener ImageData y aplicar filtro
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const filteredData = applyImageFilter(imageData, filterType);
    
    // Devolver el canvas con el filtro aplicado
    tempCtx.putImageData(filteredData, 0, 0);
    return tempCanvas;
}

// Modificar la función drawPreview para mostrar la imagen completa con filtro
function drawImagePreview(canvas, ctx, level) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = levelConfig[level - 1];
    
    if (currentImage && currentImage.complete) {
        // Crear canvas temporal para aplicar filtro a toda la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;
        
        // Dibujar imagen original
        tempCtx.drawImage(currentImage, 0, 0);
        
        // Aplicar filtro
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const filteredData = applyImageFilter(imageData, config.filter);
        tempCtx.putImageData(filteredData, 0, 0);
        
        // Dibujar en el canvas de preview
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback si no hay imagen
        drawPieceBackground(ctx, 0, 0, canvas.width, canvas.height, config.colors);
    }
    
    // Dibujar cuadrícula de referencia
    ctx.filter = 'none';
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Texto del nivel
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nivel ' + level, canvas.width / 2, canvas.height / 2);
}

//Manejo de pantallas
function showScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

//dibuja el fondo de cada pieza aplicando degrade
function drawPieceBackground(ctx, x, y, width, height, colors) {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
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

//Dibuja las piezas
function drawGameBoard() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);//limpia el tablero al rotar una pieza

    const config = levelConfig[currentLevel - 1];//aplica filtro segun nivel (tomando el array de filtros como referencia)
    const pieceSize = 280;
    const gap = 20;
    const startX = 10;
    const startY = 10;

    //recorre las 4 piezas del puzzle
    for (let i = 0; i < 4; i++) {
        //Define la posicion de cada pieza
        const row = Math.floor(i / 2);
        const col = i % 2;
        //define coordenadas de dibujo
        const x = startX + col * (pieceSize + gap);
        const y = startY + row * (pieceSize + gap);
        const isCorrect = pieceRotations[i] === correctRotations[i];

        //Redibuja la pieza que fue rotada 
        drawPiece(gameCtx, i, pieceRotations[i], x, y, pieceSize, config, isCorrect);
    }
}

//Dibuja la imagen previa (función original como fallback)
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

    //dibuja la linea que divide en 4
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

//Obtiene los calculos para saber que pieza fue clickeada
function getPieceAtPosition(x, y) {
    const pieceSize = 280;
    const gap = 20;
    const startX = 10;
    const startY = 10;

    for (let i = 0; i < 4; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const px = startX + col * (pieceSize + gap);
        const py = startY + row * (pieceSize + gap);

        if (x >= px && x <= px + pieceSize && y >= py && y <= py + pieceSize) {
            return i;
        }
    }
    return -1;//Caso el click esta fuera del canvas 
}

// Rotate piece
function rotatePiece(index, direction) {
    if (!isGameActive) return;

    //guarda si una pieza esta bien rotada o no
    const wasCorrect = pieceRotations[index] === correctRotations[index];
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

//Indicador visual de la cantidad de piezas acertadas
function updateDisplay() {
    document.getElementById('correctPieces').textContent = correctPieces + '/' + totalPieces;
    const progress = Math.round((correctPieces / totalPieces) * 100);
    document.getElementById('progress').textContent = progress + '%';
}

//Timer del nivel
function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeStr = minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
    document.getElementById('timerDisplay').textContent = timeStr;
    document.getElementById('finalTime').textContent = timeStr;
}

// Check level complete
function checkLevelComplete() {
    if (correctPieces === totalPieces) {
        levelComplete();
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

//Carga el nivel configurando valores iniciales (rotacion de piezas)
function loadLevel(level) {
    currentLevel = level;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('completedLevel').textContent = level;

    const config = levelConfig[level - 1];
    document.getElementById('currentFilter').textContent = config.name;

    // Reinicia valores del juego (sin cargar imagen)
    correctPieces = 0;
    pieceRotations = [0, 0, 0, 0];
    correctRotations = [0, 0, 0, 0];
    usedHelp = false;
    seconds = 0;

    resetGame();
}

//Resea valores al inicio de cada nivel
function resetGame() {
    clearInterval(timerInterval);
    seconds = 0;
    isGameActive = false;
    correctPieces = 0;
    usedHelp = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('helpBtn').disabled = true;
    updateTimerDisplay();
    updateDisplay();
}

//Muestra la vista previa del nivel
function showImagePreview() {
    loadLevel(currentLevel);
    document.getElementById('previewLevel').textContent = currentLevel;

    // Selecciona una imagen aleatoria
    const randomIndex = Math.floor(Math.random() * images.length);
    currentImage = new Image();
    currentImage.src = images[randomIndex];

    currentImage.onload = function () {
        // Configura rotaciones correctas (todas en 0)
        correctRotations = [0, 0, 0, 0];

        // Genera rotaciones iniciales distintas de 0 sin usar do...while
        pieceRotations = [];
        for (let i = 0; i < correctRotations.length; i++) {
            let randomRotation = Math.floor(Math.random() * 4);
            if (randomRotation === correctRotations[i]) {
                // Si salió igual a la correcta, sumar 1 (y ajustar si llega a 4)
                randomRotation++;
                if (randomRotation === 4) randomRotation = 0;
            }
            pieceRotations.push(randomRotation);
        }

        // Dibuja la imagen previa CON FILTRO aplicado
        drawImagePreview(previewCanvas, previewCtx, currentLevel);

        showScreen('previewScreen');

        setTimeout(() => {
            showScreen('gameScreen');
            drawGameBoard();
        }, 3000);
    };

    currentImage.onerror = function () {
        // Fallback si la imagen no carga
        drawPreview(previewCanvas, previewCtx, currentLevel);
        showScreen('previewScreen');
        setTimeout(() => {
            showScreen('gameScreen');
            drawGameBoard();
        }, 3000);
    };
}

// Use help
function useHelp() {
    if (!isGameActive || usedHelp) return;

    ///busca una pieza en posicion incorrecta
    let incorrectIndex = -1;
    for (let i = 0; i < totalPieces; i++) {
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

//Abre el primer nivel con el boton de comenzar juego
document.getElementById('startGameBtn').addEventListener('click', function () {
    currentLevel = 1;
    showImagePreview();
});

//Inicia el nivel actual del boton comenzar nivel
document.getElementById('startBtn').addEventListener('click', function () {
    if (!isGameActive) {
        isGameActive = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('helpBtn').disabled = false;

        seconds = 0;
        updateTimerDisplay();
        timerInterval = setInterval(function () {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }
});

//Boton de ayuda
document.getElementById('helpBtn').addEventListener('click', useHelp);

//Confirma si desea volver al menu principal
document.getElementById('menuBtn').addEventListener('click', function () {
    if (confirm('¿Volver al menú principal? Se perderá el progreso actual.')) {
        showScreen('welcomeScreen');
        resetGame();
    }
});

//Te lleva al menu sin confirmacion 
document.getElementById('menuBtn2').addEventListener('click', function () {
    showScreen('welcomeScreen');
    resetGame();
});

//Te lleva al siguiente nivel si existe o muestra la pantalla de felicitaciones
document.getElementById('nextLevelBtn').addEventListener('click', function () {
    if (currentLevel < 3) {
        currentLevel++;
        showImagePreview();
    } else {
        alert('¡Felicidades! Completaste todos los niveles del juego BLOCKA.');
        showScreen('welcomeScreen');
        resetGame();
    }
});

//Inicializacion
showScreen('welcomeScreen');