/**
 * Sistema de gestión automatizada del Video Destacado
 * Permite actualizar automáticamente el contenido del video más popular
 */

class FeaturedVideoManager {
    constructor() {
        this.apiConfig = {
            // Configuración para YouTube Data API v3
            apiKey: 'YOUR_YOUTUBE_API_KEY', // Reemplazar con tu API key
            channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA',
            maxResults: 50
        };
        
        this.featuredVideoData = {
            videoId: 'Xzkp9Ei0nHc',
            title: 'Enseñanza Bíblica: Creciendo en la Fe',
            description: 'Una profunda reflexión sobre el crecimiento espiritual y la importancia de la perseverancia en la vida cristiana. En esta enseñanza exploramos los fundamentos bíblicos para fortalecer nuestra fe diaria y vivir conforme a los propósitos de Dios.',
            publishDate: '2025-07-15',
            duration: '28:45',
            viewCount: 1247,
            topics: [
                'Fundamentos de la fe cristiana',
                'Crecimiento espiritual y perseverancia',
                'Aplicación práctica de principios bíblicos',
                'Vivir conforme a la voluntad de Dios'
            ]
        };
        
        this.lastUpdateDate = null;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 horas en millisegundos
    }
    
    /**
     * Obtiene estadísticas del canal desde YouTube API
     * Nota: Requiere configurar una API key de YouTube Data API v3
     */
    async fetchChannelStats() {
        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${this.apiConfig.apiKey}&channelId=${this.apiConfig.channelId}&part=snippet,id&order=viewCount&maxResults=${this.apiConfig.maxResults}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener datos de YouTube');
            }
            
            const data = await response.json();
            return this.processVideoData(data.items);
        } catch (error) {
            console.warn('No se pudo conectar con YouTube API, usando datos locales:', error);
            return this.getFallbackData();
        }
    }
    
    /**
     * Procesa los datos obtenidos de YouTube API
     */
    processVideoData(videos) {
        // Filtrar solo videos (no shorts ni livestreams)
        const regularVideos = videos.filter(video => 
            video.id.kind === 'youtube#video' && 
            video.snippet.title.length > 20 // Filtro básico para excluir shorts
        );
        
        if (regularVideos.length > 0) {
            const mostViewed = regularVideos[0];
            return {
                videoId: mostViewed.id.videoId,
                title: mostViewed.snippet.title,
                description: mostViewed.snippet.description.substring(0, 300) + '...',
                publishDate: new Date(mostViewed.snippet.publishedAt).toISOString().split('T')[0],
                thumbnail: mostViewed.snippet.thumbnails.high.url
            };
        }
        
        return this.getFallbackData();
    }
    
    /**
     * Datos de respaldo cuando no se puede acceder a la API
     */
    getFallbackData() {
        return this.featuredVideoData;
    }
    
    /**
     * Obtiene el video más visto del mes anterior
     */
    async getMostViewedVideoOfLastMonth() {
        try {
            // Calcular fechas del mes anterior
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            
            const publishedAfter = lastMonth.toISOString();
            const publishedBefore = endOfLastMonth.toISOString();
            
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?key=${this.apiConfig.apiKey}&channelId=${this.apiConfig.channelId}&part=snippet,id&order=viewCount&maxResults=1&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}`
            );
            
            if (!response.ok) {
                throw new Error('Error al obtener video del mes anterior');
            }
            
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                return await this.getVideoDetails(data.items[0].id.videoId);
            }
            
            return this.getFallbackData();
        } catch (error) {
            console.warn('Error obteniendo video del mes anterior:', error);
            return this.getFallbackData();
        }
    }
    
    /**
     * Obtiene detalles completos de un video específico
     */
    async getVideoDetails(videoId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?key=${this.apiConfig.apiKey}&id=${videoId}&part=snippet,statistics,contentDetails`
            );
            
            if (!response.ok) {
                throw new Error('Error al obtener detalles del video');
            }
            
            const data = await response.json();
            const video = data.items[0];
            
            return {
                videoId: videoId,
                title: video.snippet.title,
                description: video.snippet.description.substring(0, 300) + '...',
                publishDate: new Date(video.snippet.publishedAt).toLocaleDateString('es-ES'),
                duration: this.formatDuration(video.contentDetails.duration),
                viewCount: parseInt(video.statistics.viewCount).toLocaleString('es-ES'),
                thumbnail: video.snippet.thumbnails.high.url,
                topics: this.extractTopics(video.snippet.description)
            };
        } catch (error) {
            console.error('Error obteniendo detalles del video:', error);
            return this.getFallbackData();
        }
    }
    
    /**
     * Convierte duración de formato ISO 8601 a formato legible
     */
    formatDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        return `${hours ? hours + ':' : ''}${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    
    /**
     * Extrae temas principales de la descripción del video
     */
    extractTopics(description) {
        // Implementación básica - se puede mejorar con procesamiento de lenguaje natural
        const defaultTopics = [
            'Enseñanza bíblica',
            'Crecimiento espiritual',
            'Vida cristiana',
            'Sabiduría divina'
        ];
        
        const keywords = [
            'fe', 'esperanza', 'amor', 'gracia', 'salvación', 'oración',
            'biblia', 'jesús', 'dios', 'espíritu', 'santo', 'iglesia'
        ];
        
        const foundTopics = [];
        const lowerDesc = description.toLowerCase();
        
        keywords.forEach(keyword => {
            if (lowerDesc.includes(keyword)) {
                foundTopics.push(`Enseñanza sobre ${keyword}`);
            }
        });
        
        return foundTopics.length > 0 ? foundTopics.slice(0, 4) : defaultTopics;
    }
    
    /**
     * Actualiza el contenido HTML del video destacado
     */
    updateFeaturedVideoHTML(videoData) {
        const elements = {
            badge: document.querySelector('.badge-text'),
            title: document.querySelector('.featured-title'),
            publishDate: document.querySelector('.meta-item:nth-child(1) .meta-text'),
            viewCount: document.querySelector('.meta-item:nth-child(2) .meta-text'),
            duration: document.querySelector('.meta-item:nth-child(3) .meta-text'),
            description: document.querySelector('.featured-description'),
            topicsList: document.querySelector('.featured-topics ul'),
            videoLink: document.querySelector('.hero-actions .btn-primary'),
            videoIframe: document.querySelector('.hero-right iframe')
        };
        
        // Obtener nombre del mes anterior
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        // Actualizar elementos HTML
        if (elements.badge) {
            elements.badge.textContent = `Más Visto de ${monthNames[lastMonth.getMonth()]} ${lastMonth.getFullYear()}`;
        }
        
        if (elements.title) {
            elements.title.textContent = videoData.title;
        }
        
        if (elements.publishDate) {
            elements.publishDate.textContent = `Publicado: ${videoData.publishDate}`;
        }
        
        if (elements.viewCount) {
            elements.viewCount.textContent = `${videoData.viewCount} visualizaciones`;
        }
        
        if (elements.duration) {
            elements.duration.textContent = `Duración: ${videoData.duration}`;
        }
        
        if (elements.description) {
            elements.description.textContent = videoData.description;
        }
        
        if (elements.topicsList && videoData.topics) {
            elements.topicsList.innerHTML = videoData.topics
                .map(topic => `<li>${topic}</li>`)
                .join('');
        }
        
        if (elements.videoLink) {
            elements.videoLink.href = `https://www.youtube.com/watch?v=${videoData.videoId}`;
        }
        
        if (elements.videoIframe) {
            elements.videoIframe.src = `https://www.youtube.com/embed/${videoData.videoId}`;
        }
        
        // Marcar como actualizado
        this.lastUpdateDate = new Date();
        localStorage.setItem('featuredVideoLastUpdate', this.lastUpdateDate.toISOString());
    }
    
    /**
     * Verifica si es necesario actualizar el contenido
     */
    needsUpdate() {
        const lastUpdate = localStorage.getItem('featuredVideoLastUpdate');
        if (!lastUpdate) return true;
        
        const timeDiff = Date.now() - new Date(lastUpdate).getTime();
        return timeDiff > this.updateInterval;
    }
    
    /**
     * Inicializa la gestión automática del video destacado
     */
    async initialize() {
        try {
            // Verificar si necesita actualización
            if (this.needsUpdate()) {
                console.log('Actualizando video destacado...');
                const videoData = await this.getMostViewedVideoOfLastMonth();
                this.updateFeaturedVideoHTML(videoData);
                console.log('Video destacado actualizado:', videoData.title);
            } else {
                console.log('Video destacado actualizado recientemente');
            }
            
            // Configurar actualizaciones automáticas (opcional)
            this.scheduleNextUpdate();
            
        } catch (error) {
            console.error('Error inicializando video destacado:', error);
            // Usar datos de respaldo
            this.updateFeaturedVideoHTML(this.getFallbackData());
        }
    }
    
    /**
     * Programa la próxima actualización automática
     */
    scheduleNextUpdate() {
        setTimeout(() => {
            this.initialize();
        }, this.updateInterval);
    }
    
    /**
     * Actualización manual (para uso administrativo)
     */
    async forceUpdate() {
        console.log('Forzando actualización del video destacado...');
        const videoData = await this.getMostViewedVideoOfLastMonth();
        this.updateFeaturedVideoHTML(videoData);
        return videoData;
    }
}

// Configuración global
window.FeaturedVideoManager = FeaturedVideoManager;

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página de videos de YouTube
    if (window.location.pathname.includes('videos-youtube')) {
        const manager = new FeaturedVideoManager();
        manager.initialize();
        
        // Hacer disponible globalmente para uso manual
        window.featuredVideoManager = manager;
        
        // Agregar botón de actualización manual (opcional - solo para administradores)
        if (window.location.search.includes('admin=true')) {
            const updateButton = document.createElement('button');
            updateButton.textContent = '🔄 Actualizar Video Destacado';
            updateButton.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            `;
            
            updateButton.addEventListener('click', async () => {
                updateButton.disabled = true;
                updateButton.textContent = '⏳ Actualizando...';
                
                try {
                    await manager.forceUpdate();
                    updateButton.textContent = '✅ Actualizado';
                    setTimeout(() => {
                        updateButton.textContent = '🔄 Actualizar Video Destacado';
                        updateButton.disabled = false;
                    }, 2000);
                } catch (error) {
                    updateButton.textContent = '❌ Error';
                    console.error('Error en actualización manual:', error);
                    setTimeout(() => {
                        updateButton.textContent = '🔄 Actualizar Video Destacado';
                        updateButton.disabled = false;
                    }, 2000);
                }
            });
            
            document.body.appendChild(updateButton);
        }
    }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeaturedVideoManager;
}
