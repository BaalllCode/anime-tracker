// Wait for HTML to load
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Store HTML elements in simple variables
    let searchBtn = document.getElementById('searchBtn');
    let searchInput = document.getElementById('searchInput');
    let resultsContainer = document.getElementById('resultsContainer');
    let sectionTitle = document.getElementById('sectionTitle');

    let recommendedIds = [82, 169, 2993, 526, 431, 15299, 269, 430, 335, 527, 179, 66];

    // 2. Load recommendations when page opens
    loadRecommendations();

    // 3. Search button click event
    searchBtn.addEventListener('click', function() {
        searchShow();
    });

    // 4. Enter key event on the input box
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchShow();
        }
    });

    // --- FUNCTION A: LOAD INITIAL RECOMMENDATIONS ---------------------------------
    async function loadRecommendations() {
        sectionTitle.textContent = "Recommended for you";
        resultsContainer.innerHTML = "<p>Loading 12 recommendations...</p>";

        // Create an array of fetch requests
        let requestList = [];
        for (let i = 0; i < recommendedIds.length; i++) {
            let id = recommendedIds[i];
            let request = fetch('https://api.tvmaze.com/shows/' + id + '?embed=episodes');
            requestList.push(request);
        }

        // Wait for all requests to finish at the same time
        let responses = await Promise.all(requestList);
        
        resultsContainer.innerHTML = ""; // Clear loading message

        // Read data and create cards using a simple FOR loop
        for (let i = 0; i < responses.length; i++) {
            let response = responses[i];

            if (response.ok === true) {
                let data = await response.json();

                let episodeCount = 0;
                if (data._embedded && data._embedded.episodes) {
                    episodeCount = data._embedded.episodes.length;
                }

                let duration = data.averageRuntime;
                if (duration === null) {
                    duration = 45; 
                }

                let totalMinutes = episodeCount * duration;
                let totalHours = (totalMinutes / 60).toFixed(1);

                let imageUrl = "https://via.placeholder.com/250x350?text=No+Image";
                if (data.image && data.image.original) {
                    imageUrl = data.image.original;
                }

                // CORREÇÃO: Usar data.id em vez de item.id
                let card = document.createElement('a');
                card.href = 'details.html?id=' + data.id; 
                card.className = 'card';
                card.style.animationDelay = (i * 0.05) + "s"; 

                card.innerHTML = `
                    <img src="${imageUrl}" alt="Poster">
                    <h2>${data.name}</h2>
                    <p>Episodes: <span class="highlight">${episodeCount}</span></p>
                    <p>Time: <span class="highlight">${totalHours}h</span></p>
                    <p>Status: <span>${data.status}</span></p>
                `;

                resultsContainer.appendChild(card);
            }
        }
    }


    // --- FUNCTION B: SEARCH FOR A SPECIFIC TV SHOW --------------------------------------
    async function searchShow() {
        let searchTerm = searchInput.value;

        if (searchTerm === "") {
            return;
        }

        sectionTitle.textContent = 'Results for "' + searchTerm + '"';
        resultsContainer.innerHTML = "<p>Searching database...</p>";

        let searchResponse = await fetch('https://api.tvmaze.com/search/shows?q=' + searchTerm);
        let searchData = await searchResponse.json();

        if (searchData.length === 0) {
            resultsContainer.innerHTML = "<p>No TV show found.</p>";
            return;
        }

        resultsContainer.innerHTML = "";

        let limit = 12;
        if (searchData.length < 12) {
            limit = searchData.length;
        }

        for (let i = 0; i < limit; i++) {
            let item = searchData[i].show;

            let episodeCount = 0;
            let episodeResponse = await fetch('https://api.tvmaze.com/shows/' + item.id + '/episodes');
            
            if (episodeResponse.ok === true) {
                let episodes = await episodeResponse.json();
                episodeCount = episodes.length;
            }

            let duration = item.averageRuntime;
            if (duration === null) {
                duration = 45;
            }

            let totalMinutes = episodeCount * duration;
            let totalHours = (totalMinutes / 60).toFixed(1);

            let imageUrl = "https://via.placeholder.com/250x350?text=No+Image";
            if (item.image && item.image.original) {
                imageUrl = item.image.original;
            }

            // AQUI MANTÉM-SE O item.id porque a variável chama-se item nesta função
            let card = document.createElement('a');
            card.href = 'details.html?id=' + item.id;
            card.className = 'card';
            card.style.animationDelay = (i * 0.05) + "s";

            card.innerHTML = `
                <img src="${imageUrl}" alt="Poster">
                <h2>${item.name}</h2>
                <p>Episodes: <span class="highlight">${episodeCount}</span></p>
                <p>Time: <span class="highlight">${totalHours}h</span></p>
                <p>Status: <span>${item.status}</span></p>
            `;

            resultsContainer.appendChild(card);
        }
    }
});