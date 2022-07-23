const movies = document.querySelector('.movies');
const form = document.querySelector('.form');
const body = document.querySelector('body');
const input = document.querySelector('.input');
const popupResult = document.querySelector('.popup__result');
const closeButton = document.querySelector('.close__button');

const date = new Date();
const year = date.getFullYear();
const month = date.toLocaleString("en-US", {month: 'long'});


async function getMovies() {
    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/premieres?year=${year}&month=${month}`, {
        method: 'GET',
        headers: {
            'X-API-KEY': '6dacdf07-fb99-450d-bd78-0f2cb956e550',
            'Content-Type': 'application/json',
        },
    });
    const responseData = await response.json();


    responseData.items.forEach((el) => {
        showMovies(el);
    })


    document.querySelectorAll('.movie').forEach((el) => {
        el.addEventListener('click', async function (event) {
            await getOneMoviesWithVideo(this.id);
        })
    });

    return responseData.results;
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const inputValue = input.value;

    if (inputValue) {
        movies.innerHTML = '';
        const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${inputValue}&page=1`, {
            method: 'GET',
            headers: {
                'X-API-KEY': '6dacdf07-fb99-450d-bd78-0f2cb956e550',
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        responseData.films.forEach((el) => {
            showMovies(el);
        });

        document.querySelectorAll('.movie').forEach((el) => {
            el.addEventListener('click', async function (event) {
                await getOneMoviesWithVideo(this.id);
            })
        });
    }
})


function showMovies(movie) {
    const {nameRu, premiereRu, posterUrl, kinopoiskId, filmId, year} = movie;
    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.setAttribute('id', `${kinopoiskId ? kinopoiskId : filmId}`);
    movieEl.innerHTML =
        `
             <img src="${posterUrl}" alt="">
            <div class="movie__info">
                <h3 class="movie__title">${nameRu}<br> ${premiereRu ? changeDate(premiereRu) : year}</h3>
            </div>
            `;
    movies.appendChild(movieEl);
}

function showOneMovie(movie, url) {
    const {posterUrl, nameRu, nameOriginal, ratingImdb, ratingKinopoisk, kinopoiskId, year, description, countries} = movie;

    let div = document.createElement('div');
    div.classList.add('popup__info');
    div.innerHTML = `
            <div class="popup__left">
                    <img src="${posterUrl}" alt="">
                </div>
                <div class="popup__right">
                    <h2 class="popup__title">${nameRu}(${year})</h2>
                    ${nameOriginal ? `<p class="popup__title-eng">${nameOriginal}</p>` : ""}

                    <p>${description}</p>
                    <div class="popup__rating">
                        ${ratingKinopoisk ? `<p>КП: ${ratingKinopoisk}</p>` : ''}
                        ${ratingImdb ? `<p>IMDb: ${ratingImdb}</p>` : ''}
                        ${countries ? `<p>Страна: ${countries[0].country}</p>` : ''}
                      
                    </div>
                    ${url ? `<iframe width="350" height="200" src="${url}"
                                title="YouTube video player" frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>` : ''}

                    <a href="https:/kinopoiskk.ru/film/${kinopoiskId ? kinopoiskId : filmId}/" target="_blank"
                       class="link">смотреть</a>
                </div>
            `
    popupResult.appendChild(div);
    const popupWrapper = document.querySelector('.popup__wrapper');
    const overlay = document.querySelector('.overlay');

    popupWrapper.classList.add('popup__wrapper--visible');
    overlay.classList.add('overlay--visible');
    body.classList.add('stopScroll');


    closeButton.addEventListener('click', function () {
        popupWrapper.classList.remove('popup__wrapper--visible');
        overlay.classList.remove('overlay--visible');
        body.classList.remove('stopScroll');
        div.remove();
    })
}

async function getOneMovie(id) {
    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}`, {
        method: 'GET',
        headers: {
            'X-API-KEY': '6dacdf07-fb99-450d-bd78-0f2cb956e550',
            'Content-Type': 'application/json',
        },
    });
    const responseData = await response.json();


    return responseData;
}

async function getVideo(id) {
    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.2/films/${id}/videos`, {
        method: 'GET',
        headers: {
            'X-API-KEY': '6dacdf07-fb99-450d-bd78-0f2cb956e550',
            'Content-Type': 'application/json',
        },
    });
    const responseData = await response.json();
    return responseData;
}

getMovies();


async function getOneMoviesWithVideo(id) {
    let movie = await getOneMovie(id);

    let videos = await getVideo(id);
    let videoTrailers = prepareVideos(videos.items);
    let videoFilters = videoTrailers.filter((el) => {
        return (el.url.indexOf('youtube') !== -1);
    })
    let one = videoFilters[0]?.embedUrl;
    if (one) {
        if (one.indexOf('undefined') !== -1) {
            one = videoFilters[1]?.embedUrl;
        }
    }

    showOneMovie(movie, one);
}

const prepareVideos = (videos) => {
    const regex =
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/;

    return videos?.map((video) => {
        return {
            ...video,
            embedUrl: `https://www.youtube.com/embed/${regex.exec(video.url)?.[1]}`,
        };
    });
};

// <a href="https:/kinopoiskk.ru/film/${kinopoiskId ? kinopoiskId : filmId}/" target="_blank" class="link">смотреть фильм</a>

// src="https://www.youtube.com/embed/DcG5EWAIxk8"


function changeDate(date) {
    let dateNew = new Date(date);
    return dateNew.toLocaleString("ru", {month: 'long', day: 'numeric'});
}