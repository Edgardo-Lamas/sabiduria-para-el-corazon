// INTEGRACIÓN CON YOUTUBE API
// Objetivo: Mostrar automáticamente los últimos videos del canal

class YouTubeIntegration {
    constructor() {
        this.apiKey = 'TU_YOUTUBE_API_KEY';
        this.channelId = 'UCQ4LzY6UyppxVddHx5f-ZnA';
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    // EJEMPLO 1: Cargar últimos videos del canal
    async loadLatestVideos(maxResults = 6) {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?part=snippet&channelId=${this.channelId}&maxResults=${maxResults}&order=date&type=video&key=${this.apiKey}`
            );
            const data = await response.json();
            
            if (data.items) {
                this.createVideoGallery(data.items);
            }
        } catch (error) {
            console.error('Error cargando videos de YouTube:', error);
        }
    }

    createVideoGallery(videos) {
        // Crear nueva sección de videos en la página
        const videoSection = document.createElement('section');
        videoSection.className = 'youtube-videos';
        videoSection.innerHTML = `
            <div class="container">
                <h2>📺 Últimos Videos</h2>
                <p>Contenido reciente de nuestro canal de YouTube</p>
                <div class="video-grid">
                    ${videos.map(video => this.createVideoCard(video)).join('')}
                </div>
                <div class="see-more">
                    <a href="https://www.youtube.com/channel/${this.channelId}" target="_blank" rel="noopener">
                        Ver más videos en YouTube →
                    </a>
                </div>
            </div>
        `;
        
        // Insertar después de la sección principal
        const mainSection = document.querySelector('main .central');
        mainSection.insertAdjacentElement('afterend', videoSection);
    }

    createVideoCard(video) {
        const videoId = video.id.videoId;
        const snippet = video.snippet;
        
        return `
            <div class="video-card" data-video-id="${videoId}">
                <div class="video-thumbnail">
                    <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" loading="lazy">
                    <div class="play-overlay" onclick="playVideo('${videoId}')">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="video-info">
                    <h3>${snippet.title}</h3>
                    <p class="video-date">${this.formatDate(snippet.publishedAt)}</p>
                    <p class="video-description">${this.truncateText(snippet.description, 100)}</p>
                    <div class="video-actions">
                        <button onclick="watchOnYouTube('${videoId}')" class="btn-youtube">
                            Ver en YouTube
                        </button>
                        <button onclick="shareVideo('${videoId}', '${snippet.title}')" class="btn-share">
                            📤 Compartir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // EJEMPLO 2: Reproductor embebido dinámico
    async loadFeaturedVideo() {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?part=snippet&channelId=${this.channelId}&maxResults=1&order=date&type=video&key=${this.apiKey}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                this.updateFeaturedVideo(data.items[0]);
            }
        } catch (error) {
            console.error('Error cargando video destacado:', error);
        }
    }

    updateFeaturedVideo(video) {
        const videoId = video.id.videoId;
        const snippet = video.snippet;
        
        // Actualizar sección de videos (crear si no existe)
        let videoSection = document.querySelector('.featured-video');
        if (!videoSection) {
            videoSection = document.createElement('div');
            videoSection.className = 'featured-video';
            document.querySelector('.tercero').innerHTML = `
                <h2>🎥 VIDEO DESTACADO</h2>
                <div class="featured-video">
                    <div class="video-player">
                        <iframe width="560" height="315" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                title="${snippet.title}"
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-details">
                        <h3>${snippet.title}</h3>
                        <p class="video-date">Publicado: ${this.formatDate(snippet.publishedAt)}</p>
                        <p>${snippet.description}</p>
                    </div>
                </div>
            `;
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // EJEMPLO 3: Estadísticas del canal
    async loadChannelStats() {
        try {
            const response = await fetch(
                `${this.baseUrl}/channels?part=statistics,snippet&id=${this.channelId}&key=${this.apiKey}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                this.displayChannelStats(data.items[0]);
            }
        } catch (error) {
            console.error('Error cargando estadísticas del canal:', error);
        }
    }

    displayChannelStats(channel) {
        const stats = channel.statistics;
        const snippet = channel.snippet;
        
        // Crear widget de estadísticas
        const statsWidget = document.createElement('div');
        statsWidget.className = 'channel-stats';
        statsWidget.innerHTML = `
            <div class="stats-container">
                <h3>📊 Nuestro Canal</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${this.formatNumber(stats.subscriberCount)}</span>
                        <span class="stat-label">Suscriptores</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.formatNumber(stats.videoCount)}</span>
                        <span class="stat-label">Videos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.formatNumber(stats.viewCount)}</span>
                        <span class="stat-label">Visualizaciones</span>
                    </div>
                </div>
                <a href="https://www.youtube.com/channel/${this.channelId}?sub_confirmation=1" 
                   target="_blank" 
                   class="subscribe-btn">
                    🔔 Suscribirse al canal
                </a>
            </div>
        `;
        
        // Insertar en el footer
        const footer = document.querySelector('footer');
        footer.insertBefore(statsWidget, footer.firstChild);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// FUNCIONES GLOBALES
function playVideo(videoId) {
    // Crear modal para reproducir video
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeVideoModal()">&times;</span>
            <iframe width="800" height="450" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeVideoModal() {
    const modal = document.querySelector('.video-modal');
    if (modal) {
        modal.remove();
    }
}

function watchOnYouTube(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function shareVideo(videoId, title) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const youtube = new YouTubeIntegration();
    
    // Cargar contenido de YouTube
    youtube.loadLatestVideos(6);
    youtube.loadFeaturedVideo();
    youtube.loadChannelStats();
});

export { YouTubeIntegration };
