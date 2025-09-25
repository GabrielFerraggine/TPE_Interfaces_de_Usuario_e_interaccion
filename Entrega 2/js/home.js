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
        content += `<button class="play-button">Jugar</button>`;
        card.innerHTML = content;
        gameList.appendChild(card);
    });
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




/*Ejecucion cada vez que abro el home/index*/
async function init() {
    await getGames(); // primero cargo todos los juegos

    //para que recomendados tenga juego se puede usar un random (proximamente)
    showGames(filterGames(juegos, 'RPG'), 'gameListRecommended', 6);
    showGames(filterGames(juegos, 'Adventure'), 'gameListAdventure', 6);
    showGames(filterGames(juegos, 'Puzzle'), 'gameListPuzzle', 6);

}

init();

