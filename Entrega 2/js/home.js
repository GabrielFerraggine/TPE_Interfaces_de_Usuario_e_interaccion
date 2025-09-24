let games;
let juegosTendencia;
let juegosRecomendados;//agregar el peg solitare
let juegosAventura;
let juegosPuzzle;


async function obtenerJuegos() {
    try {
        const response = await fetch('https://vj.interfaces.jima.com.ar/api');
        const games = await response.json();

        // Filtrar juegos con rating mayor a 4.0 si tienen rating
        const juegosDestacados = Array.isArray(games)
            ? games.filter(game => game.rating && game.rating > 4.0)
            : [];
        return juegosDestacados;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

//tiene por objetivo mostrar los array que recibe 
function formatearValor(valor) {
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

async function mostrarJuegos() {
    const gameList = document.getElementById('gameList');
    const juegos = await obtenerJuegos();

    //todo una funcion anonima
    juegos.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        let content = '';

        for (const key in game) {
            if (key.toLowerCase().includes('image') && game[key]) {
                content += `<img src="${game[key]}" alt="${game.name || 'Juego'}">`;
            } else {
                content += `<p><strong>${key}:</strong> ${formatearValor(game[key])}</p>`;
            }
        }

        card.innerHTML = content;
        gameList.appendChild(card);
    });
}

mostrarJuegos();

/*
function filtrarJuegos(filtroCategoria) {
    const resultado = games.filter(game => game.genres = filtroCategoria);
    return resultado;
}*/