// Animación de éxito para el botón de jugar los carruseles (debe ser refinada)
function addPlayButtonAnimation() {
    document.querySelectorAll('.play-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            btn.classList.add('loading');
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.textContent = '';
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.textContent = 'Jugar';
                }, 500);
            }, 1200);
        });
    });
}
// Muestra los juegos recibidos en un array en el HTML
function showGames(juegosArray) {
    const gameList = document.getElementById('gameList');
    gameList.innerHTML = '';
    if (!juegosArray || juegosArray.length === 0) {
        gameList.innerHTML = '<p>No se encontraron juegos.</p>';
        return;
    }
    juegosArray.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        let content = '';
        for (const key in game) {
            if (key.toLowerCase().includes('image') && game[key]) {
                content += `<img src="${game[key]}" alt="${game.name || 'Juego'}">`;
            } else {
                content += `<p><strong>${key}:</strong> ${formatValue(game[key])}</p>`;
            }
        }
        card.innerHTML = content;
        gameList.appendChild(card);
    });
}
let juegos;

//obtiene todos los juegos
async function getGames() {
    try {
        const response = await fetch('https://vj.interfaces.jima.com.ar/api');
        juegos = await response.json();

        // Mostrar los géneros de los juegos para depuración
        console.log('Genres de los juegos:', juegos.map(g => g.genres));
        // si querés devolver todos
        return juegos;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

//tiene por objetivo mostrar los array que recibe 
function formatValue(valor) {
    if (Array.isArray(valor)) {
        // Convertir array a lista separada por comas
        return valor.map(v => (typeof v === 'object' ? JSON.stringify(v) : v)).join(', ');
    } else if (typeof valor === 'object' && valor !== null) {
        // Convertir objeto a JSON string
        return JSON.stringify(valor);
    } else {
        return valor;
    }
}

// Muestra los juegos en el HTML, recibe un array de juegos como parámetro, la categoria donde se va a mostrar y un límite opcional
function showGames(juegosArray, seccionMostrar, limite) {
    const gameList = document.getElementById(seccionMostrar);
    gameList.innerHTML = '';
    if (!juegosArray || juegosArray.length === 0) {
        gameList.innerHTML = '<p>No se encontraron juegos.</p>';
        return;
    }
    const juegosMostrar = (typeof limite === 'number' && limite > 0) ? juegosArray.slice(0, limite) : juegosArray;
    juegosMostrar.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        let content = '';
        // Mostrar solo imagen y nombre
        // Buscar la propiedad de imagen (puede variar el nombre)
        let imageUrl = '';
        for (const key in game) {
            if (key.toLowerCase().includes('image') && game[key]) {
                imageUrl = game[key];
                break;
            }
        }
        if (imageUrl) {
            content += `<img src="${imageUrl}" alt="${game.name || 'Juego'}">`;
        }
        content += `<p class="game-title">${game.name || 'Sin nombre'}</p>`;
        content += `<button class="play-button" class="play-btn">Jugar</button>`;
        card.innerHTML = content;
        gameList.appendChild(card);
    });
    addPlayButtonAnimation();
}

//filtra los juegos, es tan largo ya que toma el juego escrito en minuscula o mayuscula y si el genero es un array o un objeto
function filterGames(juegosArray, filtroCategoria) {
    if (!juegosArray) return [];
    const filtro = (typeof filtroCategoria === 'string' ? filtroCategoria.trim().toLowerCase() : '');
    return juegosArray.filter(game => {
        if (!game.genres) return false;
        if (Array.isArray(game.genres)) {
            return game.genres.some(g => {
                if (typeof g === 'object' && g !== null && g.name) {
                    return g.name.trim().toLowerCase().includes(filtro);
                } else if (typeof g === 'string') {
                    return g.trim().toLowerCase().includes(filtro);
                }
                return false;
            });
        } else if (typeof game.genres === 'object' && game.genres !== null && game.genres.name) {
            return game.genres.name.trim().toLowerCase().includes(filtro);
        } else if (typeof game.genres === 'string') {
            return game.genres.trim().toLowerCase().includes(filtro);
        }
        return false;
    });
}

//funcion para obtener juegos aleatorios
function getRandomGames(juegosArray, limite) {
    if (!juegosArray || juegosArray.length === 0) return [];
    
    const shuffled = [...juegosArray]; 
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Intercambio
    }
    
    // Devolver el número de juegos aleatorios solicitado
    return shuffled.slice(0, limite);
}

// function showCarouselGames(juegosArray, seccionMostrar, limite) {
//     const container = document.getElementById(seccionMostrar);
//     container.innerHTML = '';

//     if (!juegosArray || juegosArray.length === 0) {
//         container.innerHTML = '<p>No se encontraron juegos.</p>';
//         return;
//     }

//     const juegosMostrar = (typeof limite === 'number' && limite > 0) ? juegosArray.slice(0, limite) : juegosArray;

//     juegosMostrar.forEach(game => {
//         const slide = document.createElement('div');
//         slide.className = 'slide';

//         let imageUrl = '';
//         for (const key in game) {
//             if (key.toLowerCase().includes('image') && game[key]) {
//                 imageUrl = game[key];
//                 break;
//             }
//         }

//         let content = '';
//         if (imageUrl) {
//             content += `<img src="${imageUrl}" alt="${game.name || 'Juego'}">`;
//         }
//         content += `<h3>${game.name || 'Sin nombre'}</h3>`;
//         content += `<a href="html/juego.html" class="play-btn">Jugar</a>`;

//         slide.innerHTML = content;
//         container.appendChild(slide);
//     });
// }

//Carrusel principal encapsulado en una función
function initCarousel() {
    const slider = document.querySelector('.game-slider');
    if (!slider) return;
    const slides = slider.querySelectorAll('.slide');
    const btnLeft = slider.querySelector('.carousel-arrow.left');
    const btnRight = slider.querySelector('.carousel-arrow.right');

    let currentIndex = 0;

    function updateCarousel() {
        slides.forEach((slide, index) => {
            let offset = index - currentIndex;

            // Para que sea circular (siempre toma el vecino más cercano)
            if (offset < -Math.floor(slides.length / 2)) {
                offset += slides.length;
            } else if (offset > Math.floor(slides.length / 2)) {
                offset -= slides.length;
            }

            slide.classList.remove("active-slide");

            let transform = '';
            let opacity = '0';
            let zIndex = '0';

            const baseTransform = 'translateX(-50%)';

            if (offset === 0) {
                // Slide central
                transform = `${baseTransform} scale(1)`;
                opacity = '1';
                zIndex = '3';
                slide.classList.add("active-slide");
            } else if (offset === 1) {
                // Vecino derecho
                transform = `translateX(calc(-50% + 550px)) scale(0.8)`;
                opacity = '1';
                zIndex = '2';
            } else if (offset === -1) {
                // Vecino izquierdo
                transform = `translateX(calc(-50% - 550px)) scale(0.8)`;
                opacity = '1';
                zIndex = '2';
            } else {
                // Los demás (no se ven, pero siguen existiendo para rotar)
                transform = `${baseTransform} scale(0.6)`;
                opacity = '0';
                zIndex = '0';
            }

            slide.style.transform = transform;
            slide.style.opacity = opacity;
            slide.style.zIndex = zIndex;
        });
    }

    if (btnRight) {
        btnRight.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        });
    }

    if (btnLeft) {
        btnLeft.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        });
    }

    updateCarousel();
}


//Ejecucion cada vez que abro el home
async function init() {
    await getGames(); //se cargan todos los juegos

    //recomendados usa la funcion de aleatorios
    const randomGames = getRandomGames(juegos, 6);
    showGames(randomGames, 'gameListRecommended', 6);
    showGames(filterGames(juegos, 'Adventure'), 'gameListAdventure', 6);
    showGames(filterGames(juegos, 'Shooter'), 'gameListPuzzle', 6);

}

// Inicializa el carrusel una vez que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    addPlayButtonAnimation();
});

//Inicio de la aplicación
init();


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
    menuIcon.src = "img/close.png"; // icono de cerrar
  } else {
    menuIcon.src = "img/Menu Hamburguesa.png"; // icono hamburguesa
  }
});

//Lleva al registro al cerrar sesion
document.querySelectorAll("#logoutBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    window.location.href = "html/registro.html";
  });
});




