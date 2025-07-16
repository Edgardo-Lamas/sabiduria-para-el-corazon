// SISTEMA DE BÚSQUEDA INTELIGENTE
// Objetivo: Búsqueda unificada en Airtable, Notion, YouTube y contenido local

class SmartSearch {
    constructor() {
        this.searchIndex = new Map();
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.popularSearches = JSON.parse(localStorage.getItem('popularSearches') || '{}');
        this.initializeSearch();
    }

    // EJEMPLO 1: Barra de búsqueda inteligente
    initializeSearch() {
        this.createSearchInterface();
        this.buildSearchIndex();
        this.setupSearchListeners();
    }

    createSearchInterface() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'smart-search-container';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <div class="search-input-container">
                    <input type="text" 
                           id="smart-search" 
                           placeholder="Buscar audios, artículos, videos..." 
                           autocomplete="off">
                    <button class="search-btn" onclick="smartSearch.performSearch()">
                        🔍
                    </button>
                    <button class="search-filter-btn" onclick="smartSearch.toggleFilters()">
                        ⚙️
                    </button>
                </div>
                
                <div class="search-suggestions" id="search-suggestions" style="display: none;">
                    <!-- Sugerencias dinámicas -->
                </div>
                
                <div class="search-filters" id="search-filters" style="display: none;">
                    <div class="filter-group">
                        <label>Tipo de contenido:</label>
                        <label><input type="checkbox" value="audios" checked> Audios</label>
                        <label><input type="checkbox" value="articulos" checked> Artículos</label>
                        <label><input type="checkbox" value="videos" checked> Videos</label>
                        <label><input type="checkbox" value="libros" checked> Libros</label>
                    </div>
                    <div class="filter-group">
                        <label>Fecha:</label>
                        <select id="date-filter">
                            <option value="">Cualquier fecha</option>
                            <option value="week">Última semana</option>
                            <option value="month">Último mes</option>
                            <option value="year">Último año</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Predicador/Autor:</label>
                        <select id="author-filter">
                            <option value="">Todos</option>
                            <!-- Se llena dinámicamente -->
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="search-results" id="search-results" style="display: none;">
                <!-- Resultados de búsqueda -->
            </div>
        `;
        
        // Insertar después del nav
        const nav = document.querySelector('nav');
        nav.insertAdjacentElement('afterend', searchContainer);
    }

    setupSearchListeners() {
        const searchInput = document.getElementById('smart-search');
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        // Búsqueda en tiempo real con debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.showSuggestions(query);
                }, 300);
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Ocultar sugerencias al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.smart-search-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    // EJEMPLO 2: Búsqueda unificada en múltiples fuentes
    async performSearch(query = null) {
        const searchInput = document.getElementById('smart-search');
        const searchQuery = query || searchInput.value.trim();
        
        if (!searchQuery) return;
        
        // Guardar en historial
        this.addToSearchHistory(searchQuery);
        
        // Mostrar loader
        this.showSearchLoader();
        
        try {
            // Buscar en paralelo en todas las fuentes
            const searchPromises = [
                this.searchInAirtable(searchQuery),
                this.searchInNotion(searchQuery),
                this.searchInYouTube(searchQuery),
                this.searchInLocalContent(searchQuery)
            ];
            
            const results = await Promise.all(searchPromises);
            const unifiedResults = this.unifySearchResults(results, searchQuery);
            
            this.displaySearchResults(unifiedResults, searchQuery);
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showSearchError();
        } finally {
            this.hideSearchLoader();
        }
    }

    async searchInAirtable(query) {
        const tables = ['Audios', 'Articulos', 'Libros'];
        const results = [];
        
        for (const table of tables) {
            try {
                const formula = `OR(
                    SEARCH(LOWER('${query}'), LOWER({Titulo})),
                    SEARCH(LOWER('${query}'), LOWER({Descripcion})),
                    SEARCH(LOWER('${query}'), LOWER({Predicador})),
                    SEARCH(LOWER('${query}'), LOWER({Autor}))
                )`;
                
                const response = await fetch(`${AIRTABLE_CONFIG.baseUrl}/${table}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=10`, {
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                results.push(...data.records.map(record => ({
                    source: 'airtable',
                    type: table.toLowerCase(),
                    id: record.id,
                    title: record.fields.Titulo || record.fields.Nombre,
                    description: record.fields.Descripcion || '',
                    author: record.fields.Predicador || record.fields.Autor || '',
                    date: record.fields.Fecha_Publicacion || record.fields.Fecha_Grabacion || '',
                    url: record.fields.Archivo_Audio?.[0]?.url || record.fields.Archivo_PDF?.[0]?.url || '',
                    thumbnail: record.fields.Miniatura?.[0]?.url || record.fields.Portada?.[0]?.url || '',
                    relevance: this.calculateRelevance(query, record.fields)
                })));
                
            } catch (error) {
                console.error(`Error buscando en ${table}:`, error);
            }
        }
        
        return results;
    }

    async searchInNotion(query) {
        try {
            const response = await fetch(`${NOTION_CONFIG.baseUrl}/databases/${NOTION_CONFIG.databases.articulos}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${NOTION_CONFIG.token}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify({
                    filter: {
                        or: [
                            {
                                property: 'Titulo',
                                title: {
                                    contains: query
                                }
                            },
                            {
                                property: 'Contenido',
                                rich_text: {
                                    contains: query
                                }
                            }
                        ]
                    }
                })
            });
            
            const data = await response.json();
            
            return data.results.map(page => ({
                source: 'notion',
                type: 'articulo',
                id: page.id,
                title: page.properties.Titulo?.title[0]?.plain_text || '',
                description: page.properties.Resumen?.rich_text[0]?.plain_text || '',
                author: page.properties.Autor?.rich_text[0]?.plain_text || '',
                date: page.properties.Fecha_Publicacion?.date?.start || '',
                url: `#notion-${page.id}`,
                thumbnail: page.properties.Portada?.files[0]?.file?.url || '',
                relevance: this.calculateRelevance(query, page.properties)
            }));
            
        } catch (error) {
            console.error('Error buscando en Notion:', error);
            return [];
        }
    }

    async searchInYouTube(query) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CONFIG.channelId}&q=${encodeURIComponent(query)}&maxResults=5&type=video&key=${YOUTUBE_CONFIG.apiKey}`
            );
            
            const data = await response.json();
            
            return data.items?.map(video => ({
                source: 'youtube',
                type: 'video',
                id: video.id.videoId,
                title: video.snippet.title,
                description: video.snippet.description,
                author: video.snippet.channelTitle,
                date: video.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                thumbnail: video.snippet.thumbnails.medium.url,
                relevance: this.calculateRelevance(query, video.snippet)
            })) || [];
            
        } catch (error) {
            console.error('Error buscando en YouTube:', error);
            return [];
        }
    }

    searchInLocalContent(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(' ');
        
        // Buscar en títulos y contenido de la página actual
        const searchableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a');
        
        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            const relevance = searchTerms.reduce((score, term) => {
                return score + (text.includes(term) ? 1 : 0);
            }, 0);
            
            if (relevance > 0) {
                results.push({
                    source: 'local',
                    type: 'pagina',
                    id: Math.random().toString(36).substr(2, 9),
                    title: element.textContent.trim(),
                    description: element.closest('section')?.querySelector('p')?.textContent || '',
                    author: 'Sabiduría para el Corazón',
                    date: new Date().toISOString(),
                    url: `#${element.id || ''}`,
                    thumbnail: '',
                    relevance: relevance
                });
            }
        });
        
        return results;
    }

    // EJEMPLO 3: Sugerencias inteligentes
    async showSuggestions(query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        // Obtener sugerencias del historial
        const historySuggestions = this.searchHistory
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3);
        
        // Obtener búsquedas populares relacionadas
        const popularSuggestions = Object.keys(this.popularSearches)
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => this.popularSearches[b] - this.popularSearches[a])
            .slice(0, 3);
        
        // Sugerencias automáticas basadas en contenido
        const contentSuggestions = await this.getContentSuggestions(query);
        
        const allSuggestions = [
            ...historySuggestions.map(s => ({ text: s, type: 'history' })),
            ...popularSuggestions.map(s => ({ text: s, type: 'popular' })),
            ...contentSuggestions.map(s => ({ text: s, type: 'content' }))
        ];
        
        // Eliminar duplicados
        const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
            index === self.findIndex(s => s.text === suggestion.text)
        ).slice(0, 8);
        
        if (uniqueSuggestions.length > 0) {
            suggestionsContainer.innerHTML = `
                <div class="suggestions-list">
                    ${uniqueSuggestions.map(suggestion => `
                        <div class="suggestion-item" onclick="smartSearch.selectSuggestion('${suggestion.text}')">
                            <span class="suggestion-icon">${this.getSuggestionIcon(suggestion.type)}</span>
                            <span class="suggestion-text">${suggestion.text}</span>
                            <span class="suggestion-type">${this.getSuggestionTypeText(suggestion.type)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            suggestionsContainer.style.display = 'block';
        }
    }

    async getContentSuggestions(query) {
        // Implementar lógica para obtener sugerencias basadas en el contenido
        const suggestions = [];
        
        // Buscar términos relacionados en el índice
        for (const [term, data] of this.searchIndex) {
            if (term.includes(query.toLowerCase()) && term !== query.toLowerCase()) {
                suggestions.push(term);
            }
        }
        
        return suggestions.slice(0, 3);
    }

    // UTILIDADES
    unifySearchResults(results, query) {
        const allResults = results.flat();
        
        // Ordenar por relevancia
        allResults.sort((a, b) => b.relevance - a.relevance);
        
        // Agrupar por tipo
        const groupedResults = allResults.reduce((groups, result) => {
            if (!groups[result.type]) {
                groups[result.type] = [];
            }
            groups[result.type].push(result);
            return groups;
        }, {});
        
        return {
            query: query,
            total: allResults.length,
            groups: groupedResults,
            all: allResults.slice(0, 20) // Limitar a 20 resultados
        };
    }

    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.total === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No se encontraron resultados para "${query}"</h3>
                    <p>Intenta con otros términos de búsqueda o revisa la ortografía.</p>
                    <div class="search-suggestions-empty">
                        <h4>Búsquedas populares:</h4>
                        ${Object.keys(this.popularSearches).slice(0, 5).map(term => 
                            `<button onclick="smartSearch.performSearch('${term}')" class="suggestion-tag">${term}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="search-results-header">
                    <h3>Resultados para "${query}" (${results.total})</h3>
                    <button onclick="smartSearch.clearResults()" class="close-results">✕</button>
                </div>
                <div class="results-content">
                    ${Object.entries(results.groups).map(([type, items]) => `
                        <div class="result-group">
                            <h4>${this.getTypeTitle(type)} (${items.length})</h4>
                            <div class="result-items">
                                ${items.slice(0, 5).map(item => this.createResultItem(item)).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        resultsContainer.style.display = 'block';
    }

    createResultItem(item) {
        return `
            <div class="result-item" onclick="smartSearch.openResult('${item.source}', '${item.type}', '${item.id}', '${item.url}')">
                ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" class="result-thumbnail">` : ''}
                <div class="result-content">
                    <h5>${item.title}</h5>
                    <p class="result-description">${item.description}</p>
                    <div class="result-meta">
                        <span class="result-author">${item.author}</span>
                        <span class="result-date">${this.formatDate(item.date)}</span>
                        <span class="result-source">${this.getSourceIcon(item.source)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    calculateRelevance(query, fields) {
        let relevance = 0;
        const queryTerms = query.toLowerCase().split(' ');
        
        // Verificar cada campo
        Object.values(fields).forEach(field => {
            if (typeof field === 'string') {
                const fieldText = field.toLowerCase();
                queryTerms.forEach(term => {
                    if (fieldText.includes(term)) {
                        relevance += fieldText === term ? 10 : 1; // Coincidencia exacta vale más
                    }
                });
            }
        });
        
        return relevance;
    }

    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Mantener solo 10
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }
        
        // Actualizar búsquedas populares
        this.popularSearches[query] = (this.popularSearches[query] || 0) + 1;
        localStorage.setItem('popularSearches', JSON.stringify(this.popularSearches));
    }

    // Métodos auxiliares para UI
    getSuggestionIcon(type) {
        const icons = {
            history: '🕒',
            popular: '🔥',
            content: '💡'
        };
        return icons[type] || '🔍';
    }

    getSuggestionTypeText(type) {
        const types = {
            history: 'Reciente',
            popular: 'Popular',
            content: 'Sugerencia'
        };
        return types[type] || '';
    }

    getTypeTitle(type) {
        const titles = {
            audios: '🎵 Audios',
            articulos: '📖 Artículos',
            videos: '🎥 Videos',
            libros: '📚 Libros',
            pagina: '📄 Contenido de la página'
        };
        return titles[type] || type;
    }

    getSourceIcon(source) {
        const icons = {
            airtable: '📊',
            notion: '📝',
            youtube: '📺',
            local: '🏠'
        };
        return icons[source] || '📄';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Métodos públicos para interacción
    selectSuggestion(suggestion) {
        document.getElementById('smart-search').value = suggestion;
        this.performSearch(suggestion);
    }

    toggleFilters() {
        const filters = document.getElementById('search-filters');
        filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    }

    clearResults() {
        document.getElementById('search-results').style.display = 'none';
        document.getElementById('smart-search').value = '';
    }

    openResult(source, type, id, url) {
        if (source === 'youtube' || url.startsWith('http')) {
            window.open(url, '_blank');
        } else if (source === 'notion') {
            notionCMS.readArticle(id);
        } else if (url.startsWith('#')) {
            window.location.hash = url.substring(1);
        } else {
            window.location.href = url;
        }
    }

    showSearchLoader() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '<div class="search-loader">🔍 Buscando...</div>';
        resultsContainer.style.display = 'block';
    }

    hideSearchLoader() {
        // El loader se reemplaza con los resultados
    }

    showSearchError() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '<div class="search-error">❌ Error en la búsqueda. Intenta nuevamente.</div>';
    }

    buildSearchIndex() {
        // Construir índice de búsqueda para contenido local
        // Este método se ejecuta en background
        setTimeout(() => {
            const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a');
            textElements.forEach(element => {
                const words = element.textContent.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 2) {
                        if (!this.searchIndex.has(word)) {
                            this.searchIndex.set(word, []);
                        }
                        this.searchIndex.get(word).push({
                            element: element,
                            text: element.textContent
                        });
                    }
                });
            });
        }, 1000);
    }
}

// INICIALIZACIÓN
const smartSearch = new SmartSearch();

// CONFIGURACIONES PARA LAS APIS (deben estar definidas en config.js)
const AIRTABLE_CONFIG = {
    baseUrl: 'https://api.airtable.com/v0/tu_base_id',
    apiKey: 'tu_api_key'
};

const NOTION_CONFIG = {
    baseUrl: 'https://api.notion.com/v1',
    token: 'tu_notion_token',
    databases: {
        articulos: 'tu_database_id'
    }
};

const YOUTUBE_CONFIG = {
    channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA',
    apiKey: 'tu_youtube_api_key'
};

export { SmartSearch };
