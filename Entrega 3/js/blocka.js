// Banco de imágenes
const imageBank = [
  "../img/imgBlocka/mountain-landscape.png",
  "../img/imgBlocka/colorful-abstract-art-pattern.jpg",
  "../img/imgBlocka/cute-animal-portrait.jpg",
  "../img/imgBlocka/sunset-cityscape.png",
  "../img/imgBlocka/tropical-beach-paradise.png",
  "../img/imgBlocka/space-galaxy-stars-nebula.jpg",
]

// Configuración de filtros por nivel
const levelFilters = [
  { name: "Escala de Grises", filter: "grayscale" },
  { name: "Brillo (30%)", filter: "brightness" },
  { name: "Negativo", filter: "invert" },
]

// Estado del juego
let currentLevel = 0
let currentImage = null
let pieces = []
let timerInterval = null
let startTime = 0
let elapsedTime = 0

// Navegación entre pantallas
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active")
  })
  document.getElementById(screenId).classList.add("active")
}

function showHome() {
  showScreen("home-screen")
  stopTimer()
}

function showInstructions() {
  showScreen("instructions-screen")
}

function startGame() {
  currentLevel = 0
  loadLevel()
}

function nextLevel() {
  currentLevel++
  if (currentLevel < levelFilters.length) {
    loadLevel()
  } else {
    alert("¡Felicitaciones! Has completado todos los niveles.")
    showHome()
  }
}

// Cargar nivel
function loadLevel() {
  console.log("[v0] Loading level:", currentLevel + 1)

  // Seleccionar imagen aleatoria
  const randomIndex = Math.floor(Math.random() * imageBank.length)
  currentImage = imageBank[randomIndex]

  console.log("[v0] Selected image:", currentImage)

  // Actualizar UI
  document.getElementById("level-display").textContent = `Nivel ${currentLevel + 1}`
  document.getElementById("filter-display").textContent = `Filtro: ${levelFilters[currentLevel].name}`

  // Cargar imagen y crear piezas
  const img = new Image()
  img.onload = () => {
    console.log("[v0] Image loaded successfully")
    createPuzzlePieces(img)
    showScreen("game-screen")
    startTimer()
  }
  img.onerror = () => {
    console.error("[v0] Error loading image:", currentImage)
    alert("Error al cargar la imagen. Por favor, intenta de nuevo.")
    showHome()
  }
  img.src = currentImage
}

// Crear piezas del puzzle
function createPuzzlePieces(img) {
  console.log("[v0] Creating puzzle pieces")

  const grid = document.getElementById("blocka-grid")
  grid.innerHTML = ""
  pieces = []

  const pieceWidth = img.width / 2
  const pieceHeight = img.height / 2

  console.log("[v0] Piece dimensions:", pieceWidth, "x", pieceHeight)

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const pieceDiv = document.createElement("div")
      pieceDiv.className = "blocka-piece"

      const canvas = document.createElement("canvas")
      canvas.width = pieceWidth
      canvas.height = pieceHeight
      const ctx = canvas.getContext("2d")

      // Dibujar la porción de la imagen
      ctx.drawImage(img, col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight)

      // Aplicar filtro
      applyFilter(ctx, canvas, levelFilters[currentLevel].filter)

      // Rotación aleatoria inicial (0, 90, 180, 270)
      const randomRotation = Math.floor(Math.random() * 4) * 90

      const piece = {
        element: pieceDiv,
        canvas: canvas,
        ctx: ctx,
        rotation: randomRotation,
        correctRotation: 0,
        row: row,
        col: col,
        originalImageData: ctx.getImageData(0, 0, pieceWidth, pieceHeight),
      }

      canvas.style.transform = `rotate(${randomRotation}deg)`

      // Event listeners
      pieceDiv.addEventListener("click", (e) => rotatePiece(piece, -90))
      pieceDiv.addEventListener("contextmenu", (e) => {
        e.preventDefault()
        rotatePiece(piece, 90)
      })

      pieceDiv.appendChild(canvas)
      grid.appendChild(pieceDiv)
      pieces.push(piece)
    }
  }

  console.log("[v0] Created", pieces.length, "pieces")
}

// Aplicar filtros
function applyFilter(ctx, canvas, filterType) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  switch (filterType) {
    case "grayscale":
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg
        data[i + 1] = avg
        data[i + 2] = avg
      }
      break

    case "brightness":
      const brightnessFactor = 0.3
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= brightnessFactor
        data[i + 1] *= brightnessFactor
        data[i + 2] *= brightnessFactor
      }
      break

    case "invert":
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
      break
  }

  ctx.putImageData(imageData, 0, 0)
}

// Rotar pieza
function rotatePiece(piece, degrees) {
  console.log("[v0] Rotating piece by", degrees, "degrees")

  piece.element.classList.add("rotating")

  piece.rotation = (piece.rotation + degrees) % 360
  if (piece.rotation < 0) piece.rotation += 360

  piece.canvas.style.transform = `rotate(${piece.rotation}deg)`

  setTimeout(() => {
    piece.element.classList.remove("rotating")
    checkWin()
  }, 500)
}

// Verificar victoria
function checkWin() {
  const allCorrect = pieces.every((piece) => piece.rotation === piece.correctRotation)

  console.log("[v0] Checking win condition:", allCorrect)

  if (allCorrect) {
    console.log("[v0] Level completed!")
    stopTimer()
    showVictoryScreen()
  }
}

// Mostrar pantalla de victoria
function showVictoryScreen() {
  document.getElementById("final-time").textContent = formatTime(elapsedTime)
  document.getElementById("completed-level").textContent = currentLevel + 1

  // Mostrar imagen completa sin filtros
  const img = new Image()
  img.onload = () => {
    const canvas = document.getElementById("completed-canvas")
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)
  }
  img.src = currentImage

  // Mostrar/ocultar botón de siguiente nivel
  const nextBtn = document.getElementById("next-level-btn")
  if (currentLevel < levelFilters.length - 1) {
    nextBtn.style.display = "inline-block"
  } else {
    nextBtn.style.display = "none"
  }

  showScreen("victory-screen")
}

// Temporizador
function startTimer() {
  startTime = Date.now()
  elapsedTime = 0

  timerInterval = setInterval(() => {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000)
    document.getElementById("timer").textContent = formatTime(elapsedTime)
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Game initialized")
  showHome()
})
