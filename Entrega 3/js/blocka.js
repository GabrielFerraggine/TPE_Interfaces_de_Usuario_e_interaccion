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

    /*============test================== */
/*  document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const images = [
    "../img/imgBlocka/abstract.jpg",
    "../img/imgBlocka/galaxia.jpg",
    "../img/imgBlocka/montania.png",
    "../img/imgBlocka/perrito.jpg",
    "../img/imgBlocka/playa.png",
  ];

  // Selecciona una imagen aleatoria
  const randomIndex = Math.floor(Math.random() * images.length);
  const randomSrc = images[randomIndex];

  const img = new Image();
  img.src = randomSrc;

  img.onload = function () {
    // Calcula tamaño para centrarla
    const thumbWidth = 280;
    const thumbHeight = 180;

    const x = (canvas.width - thumbWidth) / 2;
    const y = (canvas.height - thumbHeight) / 2;

    ctx.drawImage(img, x, y, thumbWidth, thumbHeight);
  };
});
*/


// ==================== JUEGO BLOCKA ====================0
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
            "../img/imgBlocka/abstract.jpg",
            "../img/imgBlocka/galaxia.jpg",
            "../img/imgBlocka/montania.png",
            "../img/imgBlocka/perrito.jpg",
            "../img/imgBlocka/playa.png",
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

        //Aplica el filtro elegido
        /*function applyFilter(ctx, filter) {
            if (filter === 'grayscale') {
                ctx.filter = 'grayscale(100%)';
            } else if (filter === 'brightness') {
                ctx.filter = 'brightness(130%)';
            } else if (filter === 'invert') {
                ctx.filter = 'invert(100%)';
            } else {
                ctx.filter = 'none';
            }
        }*/

        //Dibuja una pieza
        function drawPiece(ctx, index, rotation, x, y, size, config, isCorrect) {
            ctx.save();//guarda la configuracion actual(colores,transformaciones, filtros)
    

            ctx.translate(x + size / 2, y + size / 2);//Situa el origen de la pieza al centro
            ctx.rotate((rotation * 90) * Math.PI / 180);//Rota la pieza 90°
            ctx.translate(-(x + size / 2), -(y + size / 2));

            //Aplica un degrade previamente definido
            if (currentImage) {
                //Determina qué parte de la imagen usar para cada pieza
                const pieceCols = 2;
                const pieceRows = 2;
                const imgPieceWidth = currentImage.width / pieceCols;
                const imgPieceHeight = currentImage.height / pieceRows;

                const row = Math.floor(index / 2);
                const col = index % 2;

                ctx.drawImage(
                    currentImage,
                    col * imgPieceWidth, row * imgPieceHeight,   //coordenadas dentro de la imagen
                    imgPieceWidth, imgPieceHeight,               //tamaño de la parte de la imagen
                    x, y, size, size                             //destino en el canvas
                );
            } else {
                drawPieceBackground(ctx, x, y, size, size, config.colors);
            }

            //Aplica un filtro
            //applyFilter(ctx, config.filter);

            //Hace mas grueso el borde si la pieza esta en la posicion que debe (podria no usarse o implementar un modo facil)
            /*ctx.strokeStyle = isCorrect ? '#4CAF50' : '#FF6B35';
            ctx.lineWidth = isCorrect ? 4 : 2;
            ctx.strokeRect(x, y, size, size);*/

            // Reset filter for text
            ctx.filter = 'none';

            //Dibuja el numero de la pieza
            /*ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, x + size / 2, y + size / 2);*/

            //Dibuja un indicador de la rotacion actual (tambien podria usarse en un modo facil o debug)
            /*ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x + size - 60, y + 10, 50, 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(rotation * 90 + '°', x + size - 35, y + 25);*/

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

            //recorre las 4 piezas del puzzle (seguramente debamos tocar aca para el opcional)
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

        //Dibuja la imagen previa
        function drawPreview(canvas, ctx, level) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const config = levelConfig[level - 1];
            
            //Aplica filtro o degrade
            drawPieceBackground(ctx, 0, 0, canvas.width, canvas.height, config.colors);
            //applyFilter(ctx, config.filter);
            
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
            drawPreview(completeCanvas, completeCtx, currentLevel);
            
            showScreen('completeScreen');
        }

        //Carga el nivel configurando valores iniciales (rotacion de piezas)
        function loadLevel(level) {
            currentLevel = level;
            document.getElementById('currentLevel').textContent = level;
            document.getElementById('completedLevel').textContent = level;

            const config = levelConfig[level - 1];
            document.getElementById('currentFilter').textContent = config.name;

            // Selecciona una imagen aleatoria
            const randomIndex = Math.floor(Math.random() * images.length);
            currentImage = new Image();
            currentImage.src = images[randomIndex];

            // Restablece variables del juego
            correctPieces = 0;
            pieceRotations = [0, 0, 0, 0];
            correctRotations = [0, 0, 0, 0];
            usedHelp = false;
            seconds = 0;

            currentImage.onload = function () {
                console.log("Imagen cargada:", currentImage.src);

                //Guardar las rotaciones correctas base
                //En este caso, todas las piezas "correctas" están a 0° (orientación original)
                correctRotations = [0, 0, 0, 0];

                // Genera rotaciones incorrectas iniciales (distintas de las correctas)
                pieceRotations = correctRotations.map(correct => {
                    let incorrect;
                    do {
                        incorrect = Math.floor(Math.random() * 4);
                    } while (incorrect === correct);
                    return incorrect;
                });

                drawGameBoard(); // Dibuja con las nuevas rotaciones
            };

            currentImage.onerror = function () {
                console.error("No se pudo cargar la imagen:", currentImage.src);
            };

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

            if (currentImage && currentImage.complete) {
                previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                previewCtx.drawImage(currentImage, 0, 0, previewCanvas.width, previewCanvas.height);
            } else {
                drawPreview(previewCanvas, previewCtx, currentLevel);
            }
            showScreen('previewScreen');
            
            setTimeout(() => {
                showScreen('gameScreen');
                drawGameBoard();
            }, 3000);
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
        gameCanvas.addEventListener('click', function(e) {
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
        gameCanvas.addEventListener('contextmenu', function(e) {
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
        document.getElementById('startGameBtn').addEventListener('click', function() {
            currentLevel = 1;
            showImagePreview();
        });

        //Inicia el nivel actual del boton comenzar nivel
        document.getElementById('startBtn').addEventListener('click', function() {
            if (!isGameActive) {
                isGameActive = true;
                document.getElementById('startBtn').disabled = true;
                document.getElementById('helpBtn').disabled = false;
                
                seconds = 0;
                updateTimerDisplay();
                timerInterval = setInterval(function() {
                    seconds++;
                    updateTimerDisplay();
                }, 1000);
            }
        });

        //Boton de ayuda
        document.getElementById('helpBtn').addEventListener('click', useHelp);

        //Confirma si desea volver al menu principal
        document.getElementById('menuBtn').addEventListener('click', function() {
            if (confirm('¿Volver al menú principal? Se perderá el progreso actual.')) {
                showScreen('welcomeScreen');
                resetGame();
            }
        });

        //Te lleva al menu sin confirmacion 
        document.getElementById('menuBtn2').addEventListener('click', function() {
            showScreen('welcomeScreen');
            resetGame();
        });

        //Te lleva al siguiente nivel si existe o muestra la pantalla de felicitaciones
        document.getElementById('nextLevelBtn').addEventListener('click', function() {
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
