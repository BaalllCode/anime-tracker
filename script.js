document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    // Permitir pesquisa ao carregar no "Enter" além do clique no botão
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchBtn.addEventListener('click', performSearch);

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        // Limpar resultados anteriores e mostrar estado de carregamento
        resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Searching database...</p>';

        try {
            // Fetch à API Jikan (MyAnimeList)
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6`);
            
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const result = await response.json();
            const animes = result.data;

            resultsContainer.innerHTML = ''; // Limpar o texto de loading

            if (animes.length === 0) {
                resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No anime found.</p>';
                return;
            }

            // Gerar os cartões para os resultados encontrados
            animes.forEach((anime, index) => {
                const episodes = anime.episodes || 0;
                // Assumir 24 minutos por episódio se a duração for desconhecida
                const durationMinutes = anime.duration && anime.duration.includes('min') 
                    ? parseInt(anime.duration) 
                    : 24; 
                
                const totalHours = ((episodes * durationMinutes) / 60).toFixed(1);

                const card = document.createElement('div');
                card.className = 'card';
                // Adicionar um pequeno atraso (delay) na animação CSS para cada cartão aparecer em sequência
                card.style.animationDelay = `${index * 0.1}s`;

                card.innerHTML = `
                    <img src="${anime.images.webp.large_image_url}" alt="${anime.title}">
                    <h2>${anime.title_english || anime.title}</h2>
                    <p>Episodes: <span class="highlight">${episodes > 0 ? episodes : 'Ongoing'}</span></p>
                    <p>Total Time: <span class="highlight">${episodes > 0 ? totalHours + 'h' : '?'}</span></p>
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