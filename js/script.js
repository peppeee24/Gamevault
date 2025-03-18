// Controlla se siamo nella pagina del gioco tramite la classe `game-detail`
if (document.body.classList.contains('game-detail')) {
    document.addEventListener("DOMContentLoaded", function () {
        const gameId = getURLParameter('game');
        const game = window.games[gameId];

        if (game) {
            // Assegna i valori solo se gli elementi esistono
            setTextContent('game-title', game.title);
            setTextContent('game-date', game.date);
            setTextContent('game-description', game.description);
            setTextContent('game-genre', game.genre);
            setTextContent('game-platform', game.platform);
            setTextContent('game-developer', game.developer);
            setTextContent('game-genre-det', game.genre);
            setTextContent('game-platform-det', game.platform);
            setTextContent('game-developer-det', game.developer);
            setTextContent('game-date-det', game.date);
            setTextContent('breadcrumb-game-name', game.title);
            setTextContent('game-history', game.history);

            // Imposta immagini e video solo se gli elementi esistono
            setImageSource('game-image', game.image);
            setVideoSource(gameId, game.video);

            // Caricamento immagini slider
            const sliderImagesContainer = document.querySelector('.slider-images');
            if (sliderImagesContainer) {
                sliderImagesContainer.innerHTML = ''; // Svuota il contenitore prima di caricare nuove immagini
                if (game.images && game.images.length > 0) {
                    game.images.forEach((imgSrc, index) => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = `${game.title} - Immagine ${index + 1}`;
                        if (index === 0) img.classList.add('active'); // Imposta la prima immagine come attiva
                        sliderImagesContainer.appendChild(img);
                    });

                    initializeSlider(); // Avvia lo slider solo se ci sono immagini
                } else {
                    sliderImagesContainer.innerHTML = "<p>Nessuna immagine disponibile</p>";
                }
            }

            loadComments(gameId); // Carica i commenti
            document.getElementById('add-comment-btn').addEventListener('click', function () {
                addComment(gameId);
            });

            addDublinCoreMetadataBody(game);

        } else {

            const container = document.querySelector('.game-detail-section .container');
            if (container) {
                container.innerHTML = "<h2>Gioco non trovato.</h2><p>Il gioco selezionato non esiste o è stato rimosso.</p>";
            }
        }

        
    });

    function addDublinCoreMetadataBody(game) {
        const metadataContainer = document.createElement("div");
        metadataContainer.classList.add("metadata-section");

        metadataContainer.innerHTML = `
        <h2>📄 Metadata</h2>
        <ul class="metadata-list">
            <li><span class="metadata-key" property="DC.Title">🕹️ Titolo:</span> <span class="metadata-value">${game.title}</span></li>
            <li><span class="metadata-key" property="DC.Creator">🖥️ Sviluppatore:</span> <span class="metadata-value">${game.developer || "N/D"}</span></li>
            <li><span class="metadata-key" property="DC.Date">📅 Data di rilascio:</span> <span class="metadata-value">${game.date || "N/D"}</span></li>
            <li><span class="metadata-key" property="DC.Type">📚 Genere:</span> <span class="metadata-value">${game.genre || "N/D"}</span></li>
            <li><span class="metadata-key" property="DC.Description">📖 Descrizione:</span> <span class="metadata-value">${game.description || "Nessuna descrizione disponibile."}</span></li>
        </ul>
        `;

        document.querySelector(".game-details").appendChild(metadataContainer);
    }
    

    // Funzione per caricare i commenti da `games.js` e `localStorage`
    function loadComments(gameId) {
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';

        let comments = JSON.parse(localStorage.getItem(`comments_${gameId}`)) || window.games[gameId].comments || [];

        comments.forEach((comment, index) => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            commentElement.innerHTML = `
            <p><strong>${comment.author}</strong>: ${comment.text}</p>
            <div class="comment-actions">
                <span class="like-count">${comment.likes} 👍</span>
                <button class="like-btn" onclick="likeComment('${gameId}', ${index})">Like</button>
            </div>
        `;

            commentsContainer.appendChild(commentElement);
        });

        localStorage.setItem(`comments_${gameId}`, JSON.stringify(comments));
    }

    // Funzione per aggiungere un nuovo commento
    function addComment(gameId) {
        const commentInput = document.getElementById('comment-input');
        const commentText = commentInput.value.trim();
        if (commentText === '') return;

        let comments = JSON.parse(localStorage.getItem(`comments_${gameId}`)) || window.games[gameId].comments || [];

        const newComment = {
            author: "Anonimo",
            text: commentText,
            likes: 0
        };

        comments.push(newComment);
        localStorage.setItem(`comments_${gameId}`, JSON.stringify(comments));

        commentInput.value = '';
        loadComments(gameId);
    }

    // Funzione per mettere "Mi Piace" a un commento
    function likeComment(gameId, index) {
        let comments = JSON.parse(localStorage.getItem(`comments_${gameId}`)) || window.games[gameId].comments || [];

        if (comments[index]) {
            comments[index].likes += 1;
            localStorage.setItem(`comments_${gameId}`, JSON.stringify(comments));
            loadComments(gameId);
        }
    }


    // Funzione per impostare il testo in un elemento (evita errori se l'elemento non esiste)
    function setTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text || "Informazione non disponibile";
        }
    }

    // Funzione per impostare l'immagine in un elemento <img>
    function setImageSource(elementId, src) {
        const element = document.getElementById(elementId);
        if (element && src) {
            element.src = src;
        }
    }

    // Funzione per impostare il video o incorporare un iframe di YouTube
function setVideoSource(gameId, videoUrl) {
    const videoContainer = document.getElementById("game-video-container");

    if (!videoContainer) return;

    // Controlla se è un link di YouTube
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        // Estrai l'ID del video YouTube e crea l'embed URL
        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) return;

        videoContainer.innerHTML = `
            <iframe width="100%" height="400px" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allowfullscreen>
            </iframe>
        `;
    } else {
        // Se è un file MP4, usa il tag <video>
        videoContainer.innerHTML = `
            <video id="game-video" controls>
                <source src="${videoUrl}" type="video/mp4">
                Il tuo browser non supporta il video.
            </video>
        `;
    }
}

// Funzione per estrarre l'ID di un video di YouTube da un link
function getYouTubeVideoId(url) {
    const regExp = /(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}


    // Funzione per ottenere i parametri URL
    function getURLParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // Funzione per gestire lo slider delle immagini
    function initializeSlider() {
        const sliderImages = document.querySelectorAll('.slider-images img');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let currentIndex = 0;

        function showImage(index) {
            sliderImages.forEach((img, i) => {
                img.classList.toggle('active', i === index);
            });
        }

        showImage(currentIndex);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === 0) ? sliderImages.length - 1 : currentIndex - 1;
                showImage(currentIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === sliderImages.length - 1) ? 0 : currentIndex + 1;
                showImage(currentIndex);
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.body.classList.contains('collection-page')) {
        loadCollection();
    }
});

// Funzione per caricare i giochi nella pagina collezione
function loadCollection() {
    const collectionContainer = document.getElementById('collection-container');
    if (!collectionContainer) return;

    collectionContainer.innerHTML = '';

    for (let gameId in window.games) {
        const game = window.games[gameId];

        const gameBox = document.createElement('div');
        gameBox.classList.add('game-box');
        gameBox.onclick = function () {
            openGamePage(gameId);
        };

        gameBox.innerHTML = `
            <img src="${game.image}" alt="${game.title}">
            <div class="game-info">
                <h3>${game.title}</h3>
                <p>${game.genre} | ${game.platform}</p>
            </div>
        `;

        collectionContainer.appendChild(gameBox);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    if (document.body.classList.contains('contact-page')) {
        setupContactForm();
    }
});

// Funzione per gestire il form dei contatti
function setupContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Impedisce il refresh della pagina

        // Ottiene i dati inseriti
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Controlla che tutti i campi siano compilati
        if (name === "" || email === "" || message === "") {
            alert("Per favore, compila tutti i campi.");
            return;
        }

        // Simula l'invio del messaggio
        alert(`Grazie ${name}! Il tuo messaggio è stato inviato con successo.`);
        
        // Resetta il form dopo l'invio
        contactForm.reset();
    });
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.body.classList.contains('about-page')) {
        setupProjectPlanButton();
    }
});

// Funzione per aprire il "Web Project Plan"
function setupProjectPlanButton() {
    const button = document.getElementById("open-project-plan");
    if (!button) return;

    button.addEventListener("click", function () {
        window.open("webproject.html", "_blank");
    });
}

// Searchbox
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-box");
    const searchButton = document.getElementById("search-button");

    if (searchButton) {
        searchButton.addEventListener("click", handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                handleSearch();
            }
        });
    }

    // PER SEARCHBOX collezione
    const searchCollectionInput = document.getElementById("search-collection-box");
    const searchCollectionButton = document.getElementById("search-collection-button");

    if (searchCollectionButton) {
        searchCollectionButton.addEventListener("click", handleCollectionSearch);
    }

    if (searchCollectionInput) {
        searchCollectionInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                handleCollectionSearch();
            }
        });
    }
});

// Funzione per la ricerca nella home
function handleSearch() {
    searchGame("search-box");
}

// Funzione per la ricerca nella collezione
function handleCollectionSearch() {
    searchGame("search-collection-box");
}

// Funzione generale di ricerca
function searchGame(inputId) {
    const searchInput = document.getElementById(inputId);
    const searchQuery = searchInput.value.trim().toLowerCase();

    if (!searchQuery) return;

    if (typeof window.games === "undefined" || Object.keys(window.games).length === 0) {
        console.error("Errore: window.games non è stato caricato correttamente.");
        alert("Errore: Il database dei giochi non è disponibile.");
        return;
    }

    let found = false;

    for (let gameId in window.games) {
        if (window.games.hasOwnProperty(gameId)) {
            let gameTitle = window.games[gameId].title.trim().toLowerCase();
            let gameIdentifier = gameId.toLowerCase(); 

            console.log(`Comparando: ${searchQuery} con ${gameTitle} e ${gameIdentifier}`); 

            if (gameTitle.includes(searchQuery) || gameIdentifier.includes(searchQuery)) {
                console.log(`Gioco trovato: ${gameIdentifier}, aprendo pagina ${gameId}`);
                openGamePage(gameId);
                found = true;
                break;
            }
        }
    }

    if (!found) {
        alert("Gioco non trovato! Assicurati di scrivere il nome esatto.");
    }
}



// Funzione per aprire la pagina del gioco con il parametro in URL
function openGamePage(gameId) {
    window.location.href = `game.html?game=${gameId}`;
}
