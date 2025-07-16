// Funcionalidad principal para la plataforma de contenido bíblico
document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar componentes
    initializeSearchFunctionality();
    initializeDynamicContent();
    initializeAudioPlayer();
    
    // Solo abrir en nueva pestaña los enlaces externos
    document.querySelectorAll('a[href^="http"], a[href^="https://web.facebook.com"], a[href^="https://www.youtube.com"]').forEach(function(link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});

// Funcionalidad de búsqueda para contenido
function initializeSearchFunctionality() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

async function handleSearch(event) {
    event.preventDefault();
    const query = event.target.querySelector('input[name="search"]').value;
    
    if (!query.trim()) return;
    
    // Mostrar loader
    showLoader();
    
    try {
        // Buscar en diferentes fuentes
        const results = await Promise.all([
            searchInContent('articulos', query),
            searchInContent('audios', query),
            searchInContent('videos', query)
        ]);
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showErrorMessage('Error al realizar la búsqueda');
    } finally {
        hideLoader();
    }
}

// Función para buscar en contenido específico
async function searchInContent(contentType, query) {
    // Implementar búsqueda en Airtable o Notion
    // Por ahora, búsqueda básica en el DOM
    const elements = document.querySelectorAll(`[data-content-type="${contentType}"]`);
    return Array.from(elements).filter(el => 
        el.textContent.toLowerCase().includes(query.toLowerCase())
    );
}

// Inicializar contenido dinámico
function initializeDynamicContent() {
    loadFeaturedContent();
    loadRecentAudios();
    loadDailyVerse();
}

// Cargar contenido destacado
async function loadFeaturedContent() {
    try {
        // En el futuro, esto vendrá de Airtable/Notion
        const featuredContent = await getFeaturedContent();
        if (featuredContent) {
            updateFeaturedSection(featuredContent);
        }
    } catch (error) {
        console.error('Error cargando contenido destacado:', error);
    }
}

// Obtener contenido destacado (placeholder para futura integración)
async function getFeaturedContent() {
    // TODO: Integrar con Airtable/Notion
    return {
        title: "Mensaje Destacado de la Semana",
        description: "Te invitamos a escuchar el mensaje destacado",
        audioUrl: "./audios/destacado.mp3",
        imageUrl: "./img/foto audio 4.jpg"
    };
}

// Actualizar sección destacada
function updateFeaturedSection(content) {
    const section = document.querySelector('.segundo');
    if (section && content) {
        const audioElement = section.querySelector('audio');
        if (audioElement && content.audioUrl) {
            audioElement.src = content.audioUrl;
        }
    }
}

// Cargar audios recientes
async function loadRecentAudios() {
    try {
        const cachedAudios = API_UTILS.getCachedData('recent-audios');
        if (cachedAudios) {
            displayRecentAudios(cachedAudios);
            return;
        }
        
        // Cargar desde API
        const audios = await getRecentAudios();
        if (audios) {
            API_UTILS.cacheData('recent-audios', audios);
            displayRecentAudios(audios);
        }
    } catch (error) {
        console.error('Error cargando audios recientes:', error);
    }
}

// Obtener audios recientes (placeholder)
async function getRecentAudios() {
    // TODO: Integrar con Airtable/Notion
    return [
        {
            title: "Estudiando la Biblia",
            speaker: "Marcelo De La Llave",
            url: "./audios/2012-03-11 - Estudiando la Biblia - Marcelo de la Llave.mp3",
            duration: "45:30"
        },
        {
            title: "La Creación",
            speaker: "John MacArthur",
            url: "./audios/1.El como , porque y cuando de la creacion John MacArthur.mp3",
            duration: "52:15"
        }
    ];
}

// Mostrar audios recientes
function displayRecentAudios(audios) {
    // Implementar visualización de audios recientes
    console.log('Audios recientes:', audios);
}

// Cargar versículo del día
async function loadDailyVerse() {
    try {
        const today = new Date().toDateString();
        const cachedVerse = API_UTILS.getCachedData(`daily-verse-${today}`);
        
        if (cachedVerse) {
            updateDailyVerse(cachedVerse);
            return;
        }
        
        // En el futuro, obtener de una API de versículos bíblicos
        const verse = await getDailyVerse();
        if (verse) {
            API_UTILS.cacheData(`daily-verse-${today}`, verse);
            updateDailyVerse(verse);
        }
    } catch (error) {
        console.error('Error cargando versículo del día:', error);
    }
}

// Obtener versículo del día (placeholder)
async function getDailyVerse() {
    // TODO: Integrar con API de versículos bíblicos
    const verses = [
        {
            text: "Pero Dios, habiendo pasado por alto los tiempos de esta ignorancia, ahora manda a todos los hombres en todo lugar que se arrepientan...",
            reference: "Hechos 17:30"
        },
        {
            text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            reference: "Juan 3:16"
        },
        {
            text: "El Señor no retarda su promesa, según algunos la tienen por tardanza, sino que es paciente para con nosotros, no queriendo que ninguno perezca, sino que todos procedan al arrepentimiento.",
            reference: "2 Pedro 3:9"
        }
    ];
    
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
}

// Actualizar versículo del día
function updateDailyVerse(verse) {
    const verseSection = document.querySelector('.cuarta');
    if (verseSection && verse) {
        const textElement = verseSection.querySelector('p');
        const referenceElement = verseSection.querySelector('h3');
        
        if (textElement) textElement.textContent = `"${verse.text}"`;
        if (referenceElement) referenceElement.textContent = verse.reference;
    }
}

// Inicializar reproductor de audio mejorado
function initializeAudioPlayer() {
    const audioElements = document.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
        audio.addEventListener('loadstart', () => showAudioLoader(audio));
        audio.addEventListener('canplay', () => hideAudioLoader(audio));
        audio.addEventListener('error', () => showAudioError(audio));
    });
}

// Funciones de utilidad para UI
function showLoader() {
    const loader = document.getElementById('loader') || createLoader();
    loader.style.display = 'block';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = '<div class="spinner">Cargando...</div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    document.body.appendChild(loader);
    return loader;
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showAudioLoader(audio) {
    const container = audio.parentElement;
    if (container && !container.querySelector('.audio-loader')) {
        const loader = document.createElement('div');
        loader.className = 'audio-loader';
        loader.textContent = 'Cargando audio...';
        container.appendChild(loader);
    }
}

function hideAudioLoader(audio) {
    const container = audio.parentElement;
    const loader = container?.querySelector('.audio-loader');
    if (loader) loader.remove();
}

function showAudioError(audio) {
    const container = audio.parentElement;
    hideAudioLoader(audio);
    
    if (container && !container.querySelector('.audio-error')) {
        const error = document.createElement('div');
        error.className = 'audio-error';
        error.textContent = 'Error al cargar el audio';
        error.style.color = 'red';
        container.appendChild(error);
    }
}

// Función para mostrar resultados de búsqueda
function displaySearchResults(results) {
    // TODO: Implementar visualización de resultados
    console.log('Resultados de búsqueda:', results);
}

// Exportar funciones para uso global
window.SabiduriaApp = {
    loadFeaturedContent,
    loadRecentAudios,
    loadDailyVerse,
    handleSearch
};
