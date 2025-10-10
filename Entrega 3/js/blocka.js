// boton user
const userAvatar = document.getElementById("userAvatar");
const dropdownMenu = document.getElementById("dropdownMenu");
const closeBtn = document.querySelector(".close-btn");

// Mostrar / ocultar menú al clickear el avatar
userAvatar.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// Botón "Volver" cierra el menú
closeBtn.addEventListener("click", () => {
  dropdownMenu.classList.add("hidden");
});

// Cierra si se hace clic afuera
document.addEventListener("click", (event) => {
  if (!dropdownMenu.contains(event.target) && !userAvatar.contains(event.target)) {
    dropdownMenu.classList.add("hidden");
  }
});

//boton menu hamburguesa
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuHamburguesaBtn");
const menuIcon = document.getElementById("menuIcon");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("expanded");

  if (sidebar.classList.contains("expanded")) {
    menuIcon.src = "../img/close.png"; // icono de cerrar
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

// Botón compartir
document.addEventListener('DOMContentLoaded', (event) => {
    const toggleButton = document.getElementById('toggleShare');
    const socialIcons = document.getElementById('socialIcons');

    toggleButton.addEventListener('click', () => {
        // Toggles the 'visible' class on the social-icons container
        socialIcons.classList.toggle('visible');
    });
});

// ==================== JUEGO BLOCKA ====================

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const welcomeScreen = document.getElementById('welcome-screen');
    const gameScreen = document.getElementById('game-screen');
    const imagePreview = document.getElementById('image-preview');
    const levelCompleteScreen = document.getElementById('level-complete');
    const blockaContainer = document.getElementById('blocka-container');
    
    const startGameBtn = document.getElementById('start-game-btn');
    const startBtn = document.getElementById('start-btn');
    const helpBtn = document.getElementById('help-btn');
    const menuBtn = document.getElementById('menu-btn');
    const menuBtn2 = document.getElementById('menu-btn-2');
    const nextLevelBtn = document.getElementById('next-level-btn');
    
    const timerDisplay = document.getElementById('timer-display');
    const currentLevelDisplay = document.getElementById('current-level');
    const currentFilterDisplay = document.getElementById('current-filter');
    const correctPiecesDisplay = document.getElementById('correct-pieces');
    const progressDisplay = document.getElementById('progress');
    const finalTimeDisplay = document.getElementById('final-time');
    const completedLevelDisplay = document.getElementById('completed-level');
    const previewLevel = document.getElementById('preview-level');
    const previewLevelNum = document.getElementById('preview-level-num');
    const previewImage = document.getElementById('preview-image');
    const completedImageDiv = document.getElementById('completed-image');
    
    // Variables del juego
    let currentLevel = 1;
    let timerInterval;
    let seconds = 0;
    let isGameActive = false;
    let correctPieces = 0;
    const totalPieces = 4;
    let pieceRotations = [0, 0, 0, 0];
    let correctRotations = [0, 0, 0, 0];
    let usedHelp = false;
    
    // Configuración de niveles
    const levelConfig = [
        { 
            name: 'Escala de grises', 
            filter: 'grayscale',
            color: 'level-1'
        },
        { 
            name: 'Brillo (30%)', 
            filter: 'brightness',
            color: 'level-2'
        },
        { 
            name: 'Negativo', 
            filter: 'invert',
            color: 'level-3'
        }
    ];
    
    // Inicializar el juego
    function initGame() {
        showScreen(welcomeScreen);
        resetGame();
    }
    
    // Mostrar pantalla específica
    function showScreen(screen) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.blocka-screen').forEach(s => {
            s.classList.remove('active');
        });
        // Mostrar la pantalla solicitada
        screen.classList.add('active');
    }
    
    // Iniciar juego desde pantalla de bienvenida
    startGameBtn.addEventListener('click', function() {
        currentLevel = 1;
        showImagePreview();
    });
    
    // Mostrar preview de imagen
    function showImagePreview() {
        loadLevel(currentLevel);
        
        // Configurar preview
        previewLevel.textContent = currentLevel;
        previewLevelNum.textContent = currentLevel;
        previewImage.className = 'blocka-preview-image ' + levelConfig[currentLevel - 1].color;
        
        showScreen(imagePreview);
        
        // Mostrar preview por 3 segundos
        setTimeout(() => {
            showGameScreen();
        }, 3000);
    }
    
    // Mostrar pantalla de juego
    function showGameScreen() {
        showScreen(gameScreen);
        createPieces();
    }
    
    // Cargar nivel
    function loadLevel(level) {
        currentLevel = level;
        currentLevelDisplay.textContent = level;
        completedLevelDisplay.textContent = level;
        
        // Configurar nivel actual
        const config = levelConfig[level - 1] || levelConfig[0];
        currentFilterDisplay.textContent = config.name;
        
        // Determinar rotaciones correctas aleatorias
        correctRotations = [
            Math.floor(Math.random() * 4),
            Math.floor(Math.random() * 4),
            Math.floor(Math.random() * 4),
            Math.floor(Math.random() * 4)
        ];
        
        // Inicializar rotaciones incorrectas
        pieceRotations = correctRotations.map(correct => {
            let incorrect;
            do {
                incorrect = (correct + 1 + Math.floor(Math.random() * 3)) % 4;
            } while (incorrect === correct);
            return incorrect;
        });
        
        resetGame();
    }
    
    // Crear piezas del rompecabezas
    function createPieces() {
        blockaContainer.innerHTML = '';
        
        const config = levelConfig[currentLevel - 1] || levelConfig[0];
        
        for (let i = 0; i < totalPieces; i++) {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = `blocka-piece ${config.color}`;
            if (config.filter) {
                pieceDiv.classList.add(`piece-${config.filter}`);
            }
            pieceDiv.dataset.index = i;
            pieceDiv.dataset.rotation = pieceRotations[i];
            
            // Contenido visual de la pieza
            const pieceContent = document.createElement('div');
            pieceContent.className = 'piece-content';
            pieceContent.textContent = i + 1;
            pieceDiv.appendChild(pieceContent);
            
            // Aplicar rotación inicial
            applyRotation(pieceDiv, pieceRotations[i]);
            
            // Añadir indicador de rotación
            const indicator = document.createElement('div');
            indicator.className = 'rotation-indicator';
            indicator.textContent = `${pieceRotations[i] * 90}°`;
            pieceDiv.appendChild(indicator);
            
            // Event listeners
            pieceDiv.addEventListener('click', function(e) {
                if (!isGameActive) return;
                e.preventDefault();
                rotatePiece(i, -1);
            });
            
            pieceDiv.addEventListener('contextmenu', function(e) {
                if (!isGameActive) return;
                e.preventDefault();
                rotatePiece(i, 1);
                return false;
            });
            
            blockaContainer.appendChild(pieceDiv);
        }
        
        updateDisplay();
    }
    
    // Aplicar rotación visual
    function applyRotation(element, rotation) {
        const angle = rotation * 90;
        element.style.transform = `rotate(${angle}deg)`;
        element.dataset.rotation = rotation;
    }
    
    // Rotar pieza
    function rotatePiece(index, direction) {
        if (!isGameActive) return;
        
        const pieceDiv = blockaContainer.children[index];
        const wasCorrect = pieceRotations[index] === correctRotations[index];
        
        // Actualizar rotación
        pieceRotations[index] = (pieceRotations[index] + direction + 4) % 4;
        
        // Aplicar rotación visual
        applyRotation(pieceDiv, pieceRotations[index]);
        
        // Actualizar indicador
        pieceDiv.querySelector('.rotation-indicator').textContent = `${pieceRotations[index] * 90}°`;
        
        // Efecto visual
        pieceDiv.classList.add('pulse');
        setTimeout(() => {
            pieceDiv.classList.remove('pulse');
        }, 500);
        
        // Verificar corrección
        const isCorrect = pieceRotations[index] === correctRotations[index];
        
        if (!wasCorrect && isCorrect) {
            correctPieces++;
            pieceDiv.classList.add('piece-correct');
        } else if (wasCorrect && !isCorrect) {
            correctPieces--;
            pieceDiv.classList.remove('piece-correct');
        }
        
        updateDisplay();
        checkLevelComplete();
    }
    
    // Verificar nivel completado
    function checkLevelComplete() {
        if (correctPieces === totalPieces) {
            levelComplete();
        }
    }
    
    // Nivel completado
    function levelComplete() {
        isGameActive = false;
        clearInterval(timerInterval);
        
        // Configurar pantalla de completado
        const config = levelConfig[currentLevel - 1] || levelConfig[0];
        completedImageDiv.className = 'blocka-completed-image ' + config.color;
        completedImageDiv.innerHTML = '<div class="completed-placeholder">¡Nivel ' + currentLevel + ' Completado!</div>';
        
        finalTimeDisplay.textContent = timerDisplay.textContent;
        showScreen(levelCompleteScreen);
    }
    
    // Reiniciar juego
    function resetGame() {
        clearInterval(timerInterval);
        seconds = 0;
        isGameActive = false;
        correctPieces = 0;
        usedHelp = false;
        startBtn.disabled = false;
        helpBtn.disabled = true;
        updateTimerDisplay();
        updateDisplay();
    }
    
    // Actualizar display
    function updateDisplay() {
        correctPiecesDisplay.textContent = `${correctPieces}/${totalPieces}`;
        const progress = Math.round((correctPieces / totalPieces) * 100);
        progressDisplay.textContent = `${progress}%`;
    }
    
    // Actualizar temporizador
    function updateTimerDisplay() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Usar ayuda
    function useHelp() {
        if (!isGameActive || usedHelp) return;
        
        // Encontrar pieza incorrecta
        let incorrectIndex = -1;
        for (let i = 0; i < totalPieces; i++) {
            if (pieceRotations[i] !== correctRotations[i]) {
                incorrectIndex = i;
                break;
            }
        }
        
        if (incorrectIndex !== -1) {
            // Corregir pieza
            const wasCorrect = pieceRotations[incorrectIndex] === correctRotations[incorrectIndex];
            pieceRotations[incorrectIndex] = correctRotations[incorrectIndex];
            
            const pieceDiv = blockaContainer.children[incorrectIndex];
            applyRotation(pieceDiv, pieceRotations[incorrectIndex]);
            
            // Actualizar indicador
            pieceDiv.querySelector('.rotation-indicator').textContent = `${pieceRotations[incorrectIndex] * 90}°`;
            
            if (!wasCorrect) {
                correctPieces++;
                pieceDiv.classList.add('piece-correct');
            }
            
            // Añadir penalización
            seconds += 5;
            updateTimerDisplay();
            
            usedHelp = true;
            helpBtn.disabled = true;
            
            updateDisplay();
            checkLevelComplete();
        }
    }
    
    // Event Listeners del juego
    startBtn.addEventListener('click', function() {
        if (!isGameActive) {
            isGameActive = true;
            startBtn.disabled = true;
            helpBtn.disabled = false;
            
            seconds = 0;
            updateTimerDisplay();
            timerInterval = setInterval(function() {
                seconds++;
                updateTimerDisplay();
            }, 1000);
        }
    });
    
    helpBtn.addEventListener('click', useHelp);
    
    nextLevelBtn.addEventListener('click', function() {
        if (currentLevel < 3) {
            currentLevel++;
            showImagePreview();
        } else {
            // Volver al inicio si completó todos los niveles
            alert('¡Felicidades! Completaste todos los niveles del juego BLOCKA.');
            initGame();
        }
    });
    
    menuBtn.addEventListener('click', function() {
        if (confirm('¿Volver al menú principal? Se perderá el progreso actual.')) {
            initGame();
        }
    });
    
    menuBtn2.addEventListener('click', function() {
        initGame();
    });
    
    // Inicializar el juego cuando se carga la página
    initGame();
});