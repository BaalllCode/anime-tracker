document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchBtn.addEventListener('click', performSearch);

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Searching database...</p>';

        try {
            // 1. Pesquisa base na TVMaze
            const searchResponse = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
            if (!searchResponse.ok) throw new Error('Failed to fetch data');
            
            const searchData = await searchResponse.json();

            if (searchData.length === 0) {
                resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No anime found.</p>';
                return;
            }

            // Ficar apenas com os 6 melhores resultados para preencher a grelha de forma equilibrada
            const topResults = searchData.slice(0, 6);

            // 2. Fetch paralelo (Promise.all) para ir buscar os episódios de cada série simultaneamente
            const marathonList = await Promise.all(topResults.map(async (item) => {
                const show = item.show;
                let episodesCount = 0;
                
                try {
                    const epsResponse = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
                    if (epsResponse.ok) {
                        const epsData = await epsResponse.json();
                        episodesCount = epsData.length;
                    }
                } catch (e) {
                    console.error("Error fetching episodes", e);
                }

                const runtime = show.averageRuntime || 24; 
                const totalHours = ((episodesCount * runtime) / 60).toFixed(1);

                return {
                    title: show.name,
                    image: show.image ? show.image.original : 'https://via.placeholder.com/250x350?text=No+Image',
                    episodes: episodesCount,
                    totalHours: totalHours,
                    status: show.status
                };
            }));

            resultsContainer.innerHTML = ''; 

            // 3. Renderizar os cartões com os dados finais
            marathonList.forEach((anime, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.animationDelay = `${index * 0.1}s`;

                card.innerHTML = `
                    <img src="${anime.image}" alt="${anime.title}">
                    <h2>${anime.title}</h2>
                    <p>Episodes: <span class="highlight">${anime.episodes > 0 ? anime.episodes : 'N/A'}</span></p>
                    <p>Total Time: <span class="highlight">${anime.episodes > 0 ? anime.totalHours + 'h' : '?'}</span></p>
                    <p>Status: <span>${anime.status}</span></p>
                `;

                resultsContainer.appendChild(card);
            });

        } catch (error) {
            resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error connecting to the database.</p>`;
            console.error(error);
        }
    }
});