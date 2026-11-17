// Wait for HTML to load
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Apanhar o ID no link
    let urlParams = new URLSearchParams(window.location.search);
    let showId = urlParams.get('id');

    let detailsContainer = document.getElementById('showDetails');
    let recommendedContainer = document.getElementById('recommendedContainer');

    // Voltar para casa se não houver ID
    if (showId === null) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Iniciar as funções de carregamento
    loadShowDetails(showId);
    loadSimilarShows();

    // --- FUNÇÃO 1: CARREGAR A PÁGINA PRINCIPAL DA SÉRIE ---
    async function loadShowDetails(id) {
        let response = await fetch('https://api.tvmaze.com/shows/' + id);
        
        if (response.ok === false) {
            detailsContainer.innerHTML = "<p>Error loading show details.</p>";
            return;
        }

        let data = await response.json();

        // Imagem
        let imageUrl = "https://via.placeholder.com/320x470?text=No+Image";
        if (data.image && data.image.original) {
            imageUrl = data.image.original;
        }

        // Resumo
        let summaryText = data.summary;
        if (summaryText === null) {
            summaryText = "<p>No description available.</p>";
        }

        // Gerar as "tags" (pílulas) para os géneros (Drama, Sci-Fi, etc) usando um FOR simples
        let genresHtml = '';
        for (let i = 0; i < data.genres.length; i++) {
            genresHtml += '<span class="genre-tag">' + data.genres[i] + '</span>';
        }

        // Nota (ex: 8.7/10)
        let rating = 'N/A';
        if (data.rating && data.rating.average) {
            rating = data.rating.average + '<span style="font-size:16px; color:#666;"> / 10</span>';
        }

        // Botão para o site oficial (apenas se existir)
        let siteButtonHtml = '';
        if (data.officialSite) {
            siteButtonHtml = '<a href="' + data.officialSite + '" target="_blank" class="action-btn">Visit Official Site</a>';
        }

        // Desenhar a interface cinemática
        detailsContainer.innerHTML = `
            <img src="${imageUrl}" alt="Poster" class="details-image">
            
            <div class="details-info">
                <div class="genre-tags">${genresHtml}</div>
                <h2 class="details-title">${data.name}</h2>
                <div class="rating-box">⭐ ${rating}</div>
                
                <div class="summary-text">${summaryText}</div>
                
                <div style="margin-bottom: 20px;">
                    <p><strong>Premiered:</strong> ${data.premiered || 'Unknown'}</p>
                    <p><strong>Status:</strong> ${data.status}</p>
                    <p><strong>Language:</strong> ${data.language}</p>
                </div>

                ${siteButtonHtml}
            </div>
        `;
    }

    // --- FUNÇÃO 2: CARREGAR AS SÉRIES RECOMENDADAS NO FUNDO ---
    async function loadSimilarShows() {
        // Escolhemos 4 séries aleatórias/populares para sugerir
        let similarIds = [73, 169, 431, 82]; // Ex: The Walking Dead, Breaking Bad, Gotham, Game of Thrones
        
        let requestList = [];
        for (let i = 0; i < similarIds.length; i++) {
            let request = fetch('https://api.tvmaze.com/shows/' + similarIds[i] + '?embed=episodes');
            requestList.push(request);
        }

        let responses = await Promise.all(requestList);
        
        for (let i = 0; i < responses.length; i++) {
            let response = responses[i];

            if (response.ok === true) {
                let data = await response.json();

                let episodeCount = 0;
                if (data._embedded && data._embedded.episodes) {
                    episodeCount = data._embedded.episodes.length;
                }

                let duration = data.averageRuntime;
                if (duration === null) duration = 45; 

                let totalHours = ((episodeCount * duration) / 60).toFixed(1);

                let imageUrl = "https://via.placeholder.com/250x350?text=No+Image";
                if (data.image && data.image.original) {
                    imageUrl = data.image.original;
                }

                // Desenhar os cartões normais da página inicial
                let card = document.createElement('a');
                card.href = 'details.html?id=' + data.id; // Quando clicamos num recomendado, recarrega a página de detalhes!
                card.className = 'card';
                card.style.animationDelay = (i * 0.05) + "s"; 

                card.innerHTML = `
                    <img src="${imageUrl}" alt="Poster">
                    <h2>${data.name}</h2>
                    <p>Episodes: <span class="highlight">${episodeCount}</span></p>
                    <p>Time: <span class="highlight">${totalHours}h</span></p>
                    <p>Status: <span>${data.status}</span></p>
                `;

                recommendedContainer.appendChild(card);
            }
        }
    }

});