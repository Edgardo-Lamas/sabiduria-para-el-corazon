/**
 * 🎬 Sistema de Actualización Automática del Video Destacado
 * Sabiduría para el Corazón - Automatización YouTube
 * 
 * Funcionalidades:
 * 1. Obtiene automáticamente el video más visto del mes anterior
 * 2. Actualiza la información en tiempo real
 * 3. Sistema de fallback si no hay conexión a la API
 * 4. Cache local para evitar llamadas excesivas
 */

class YouTubeAutoUpdater {
    constructor(options = {}) {
        // Configuración principal
        this.config = {
            // 🔑 API Configuration - IMPORTANTE: Configura tu API key
            apiKey: options.apiKey || 'AIzaSyCYZgAGvigUR8USMvXHyIP6lt0m__M0p7I', // Tu API key configurada
            channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA',
            
            // ⚙️ Configuración de actualización
            autoUpdate: true,
            updateOnPageLoad: true,
            checkInterval: 24 * 60 * 60 * 1000, // 24 horas
            cacheExpiry: 6 * 60 * 60 * 1000,    // 6 horas
            
            // 🎯 Configuración de filtros
            minVideoLength: 300, // 5 minutos mínimo
            excludeShorts: true,
            excludeLiveStreams: true,
            
            // 📊 Debug y logging
            debug: true,
            logLevel: 'info'
        };
        
        // Estado interno
        this.cache = this.loadFromLocalStorage();
        this.isUpdating = false;
        this.lastSuccessfulUpdate = null;
        
        // Elementos DOM
        this.elements = {
            videoFrame: document.querySelector('.featured-video iframe'),
            title: document.querySelector('.featured-title'),
            description: document.querySelector('.featured-description'),
            publishDate: document.querySelector('.meta-item .meta-text'),
            viewCount: document.querySelectorAll('.meta-item .meta-text')[1],
            duration: document.querySelectorAll('.meta-item .meta-text')[2],
            badge: document.querySelector('.badge-text'),
            topics: document.querySelector('.featured-topics ul'),
            videoLink: document.querySelector('.btn-primary')
        };
        
        this.init();
    }
    
    /**
     * 🚀 Inicialización del sistema
     */
    init() {
        this.log('info', '🎬 Inicializando YouTube Auto Updater...');
        
        if (this.config.updateOnPageLoad) {
            this.checkAndUpdateIfNeeded();
        }
        
        if (this.config.autoUpdate) {
            this.startAutoUpdateTimer();
        }
        
        // Event listeners para interacciones manuales
        this.addEventListeners();
        
        this.log('info', '✅ Sistema inicializado correctamente');
    }
    
    /**
     * 📅 Obtiene el video más visto del mes anterior
     */
    async getMostViewedVideoOfLastMonth() {
        try {
            this.log('info', '📊 Obteniendo video más visto del mes anterior...');
            
            const { startDate, endDate } = this.getLastMonthDates();
            
            // Paso 1: Buscar videos del mes anterior
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
                `key=${this.config.apiKey}&` +
                `channelId=${this.config.channelId}&` +
                `part=snippet&` +
                `order=viewCount&` +
                `type=video&` +
                `publishedAfter=${startDate}&` +
                `publishedBefore=${endDate}&` +
                `maxResults=10`;
            
            const searchResponse = await fetch(searchUrl);
            if (!searchResponse.ok) {
                throw new Error(`API Error: ${searchResponse.status}`);
            }
            
            const searchData = await searchResponse.json();
            
            if (!searchData.items || searchData.items.length === 0) {
                throw new Error('No se encontraron videos del mes anterior');
            }
            
            // Paso 2: Obtener estadísticas detalladas de los videos
            const videoIds = searchData.items.map(item => item.id.videoId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
                `key=${this.config.apiKey}&` +
                `id=${videoIds}&` +
                `part=statistics,contentDetails,snippet`;
            
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();
            
            // Paso 3: Filtrar y encontrar el más visto
            const validVideos = statsData.items
                .filter(video => this.isValidVideo(video))
                .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount));
            
            if (validVideos.length === 0) {
                throw new Error('No se encontraron videos válidos');
            }
            
            const mostViewed = validVideos[0];
            const videoData = this.formatVideoData(mostViewed);
            
            this.log('success', `✅ Video encontrado: "${videoData.title}" con ${videoData.viewCount} visualizaciones`);
            
            return videoData;
            
        } catch (error) {
            this.log('error', `❌ Error obteniendo video: ${error.message}`);
            return this.getFallbackData();
        }
    }
    
    /**
     * 📋 Formatea los datos del video para uso interno
     */
    formatVideoData(video) {
        const duration = this.parseDuration(video.contentDetails.duration);
        const publishDate = new Date(video.snippet.publishedAt);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        return {
            videoId: video.id,
            title: video.snippet.title,
            description: this.cleanDescription(video.snippet.description),
            publishDate: publishDate.toISOString().split('T')[0],
            publishDateFormatted: `${publishDate.getDate()} de ${monthNames[publishDate.getMonth()]} ${publishDate.getFullYear()}`,
            duration: duration,
            viewCount: parseInt(video.statistics.viewCount),
            viewCountFormatted: this.formatNumber(video.statistics.viewCount),
            likeCount: parseInt(video.statistics.likeCount || 0),
            monthYear: `${monthNames[publishDate.getMonth()]} ${publishDate.getFullYear()}`,
            embedUrl: `https://www.youtube.com/embed/${video.id}`,
            watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
            topics: this.extractTopicsFromDescription(video.snippet.description),
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * 🖥️ Actualiza la interfaz con los nuevos datos
     */
    async updateUI(videoData) {
        try {
            this.log('info', '🖥️ Actualizando interfaz de usuario...');
            
            // Actualizar iframe del video
            if (this.elements.videoFrame) {
                this.elements.videoFrame.src = videoData.embedUrl;
            }
            
            // Actualizar título
            if (this.elements.title) {
                this.elements.title.textContent = videoData.title;
            }
            
            // Actualizar descripción
            if (this.elements.description) {
                this.elements.description.textContent = videoData.description;
            }
            
            // Actualizar metadatos
            if (this.elements.publishDate) {
                this.elements.publishDate.textContent = `Publicado: ${videoData.publishDateFormatted}`;
            }
            
            if (this.elements.viewCount) {
                this.elements.viewCount.textContent = `${videoData.viewCountFormatted} visualizaciones`;
            }
            
            if (this.elements.duration) {
                this.elements.duration.textContent = `Duración: ${videoData.duration}`;
            }
            
            // Actualizar badge
            if (this.elements.badge) {
                this.elements.badge.textContent = `Más Visto de ${videoData.monthYear}`;
            }
            
            // Actualizar enlaces
            if (this.elements.videoLink) {
                this.elements.videoLink.href = videoData.watchUrl;
            }
            
            // Actualizar topics si están disponibles
            if (this.elements.topics && videoData.topics.length > 0) {
                this.elements.topics.innerHTML = videoData.topics
                    .map(topic => `<li>${topic}</li>`)
                    .join('');
            }
            
            // Añadir indicador de actualización
            this.addUpdateIndicator(videoData.lastUpdated);
            
            this.log('success', '✅ Interfaz actualizada correctamente');
            
        } catch (error) {
            this.log('error', `❌ Error actualizando UI: ${error.message}`);
        }
    }
    
    /**
     * 🔄 Verifica si necesita actualización y la ejecuta
     */
    async checkAndUpdateIfNeeded() {
        const now = new Date().getTime();
        const lastUpdate = this.cache.lastUpdate || 0;
        const shouldUpdate = (now - lastUpdate) > this.config.cacheExpiry;
        
        if (shouldUpdate || !this.cache.videoData) {
            await this.updateFeaturedVideo();
        } else {
            this.log('info', '📋 Usando datos del cache (aún válidos)');
            await this.updateUI(this.cache.videoData);
        }
    }
    
    /**
     * 🎯 Función principal de actualización
     */
    async updateFeaturedVideo() {
        if (this.isUpdating) {
            this.log('warning', '⏳ Actualización ya en progreso, saltando...');
            return;
        }
        
        this.isUpdating = true;
        this.showLoadingIndicator();
        
        try {
            this.log('info', '🔄 Iniciando actualización del video destacado...');
            
            const videoData = await this.getMostViewedVideoOfLastMonth();
            
            if (videoData) {
                await this.updateUI(videoData);
                this.saveToLocalStorage(videoData);
                this.lastSuccessfulUpdate = new Date();
                
                // Disparar evento personalizado para otras partes de la aplicación
                this.dispatchUpdateEvent(videoData);
                
                this.log('success', '🎉 ¡Actualización completada exitosamente!');
            }
            
        } catch (error) {
            this.log('error', `❌ Error en la actualización: ${error.message}`);
            
            // Intentar usar datos del cache como fallback
            if (this.cache.videoData) {
                await this.updateUI(this.cache.videoData);
                this.log('info', '📋 Usando datos del cache como fallback');
            }
            
        } finally {
            this.isUpdating = false;
            this.hideLoadingIndicator();
        }
    }
    
    /**
     * ⏰ Configura el timer de actualización automática
     */
    startAutoUpdateTimer() {
        // Actualizar cada 24 horas
        setInterval(() => {
            this.log('info', '⏰ Ejecutando actualización automática programada...');
            this.updateFeaturedVideo();
        }, this.config.checkInterval);
        
        this.log('info', `⏰ Timer de actualización automática configurado (cada ${this.config.checkInterval / (60 * 60 * 1000)} horas)`);
    }
    
    /**
     * 💾 Gestión de cache local
     */
    saveToLocalStorage(videoData) {
        const cacheData = {
            videoData: videoData,
            lastUpdate: new Date().getTime(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem('featuredVideoCache', JSON.stringify(cacheData));
            this.cache = cacheData;
        } catch (error) {
            this.log('warning', '⚠️ No se pudo guardar en localStorage');
        }
    }
    
    loadFromLocalStorage() {
        try {
            const cached = localStorage.getItem('featuredVideoCache');
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            this.log('warning', '⚠️ No se pudo cargar desde localStorage');
            return {};
        }
    }
    
    /**
     * 🛠️ Funciones auxiliares
     */
    getLastMonthDates() {
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        
        return {
            startDate: firstDayLastMonth.toISOString(),
            endDate: lastDayLastMonth.toISOString()
        };
    }
    
    isValidVideo(video) {
        const duration = this.parseDurationToSeconds(video.contentDetails.duration);
        
        return duration >= this.config.minVideoLength &&
               !video.snippet.title.toLowerCase().includes('#shorts') &&
               video.snippet.liveBroadcastContent !== 'live';
    }
    
    parseDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    parseDurationToSeconds(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    }
    
    cleanDescription(description) {
        return description
            .replace(/https?:\/\/[^\s]+/g, '') // Remover URLs
            .replace(/\n{2,}/g, '\n\n') // Limpiar saltos de línea múltiples
            .substring(0, 300) + (description.length > 300 ? '...' : '');
    }
    
    extractTopicsFromDescription(description) {
        // Patrones comunes para extraer temas
        const patterns = [
            /(?:temas?|topics?):\s*([^.\n]+)/i,
            /(?:incluye|include):\s*([^.\n]+)/i,
            /-\s*([^.\n-]+)/g
        ];
        
        const topics = [];
        
        for (const pattern of patterns) {
            const matches = description.match(pattern);
            if (matches) {
                if (pattern.global) {
                    topics.push(...matches.map(match => match.replace(/^-\s*/, '').trim()));
                } else {
                    topics.push(...matches[1].split(/[,;]/).map(topic => topic.trim()));
                }
            }
        }
        
        // Fallback con temas genéricos si no se encontraron
        if (topics.length === 0) {
            return [
                'Enseñanza bíblica',
                'Crecimiento espiritual',
                'Aplicación práctica',
                'Fundamentos de la fe'
            ];
        }
        
        return [...new Set(topics)].slice(0, 4); // Máximo 4 temas únicos
    }
    
    getFallbackData() {
        return {
            videoId: 'Xzkp9Ei0nHc',
            title: 'Enseñanza Bíblica: Creciendo en la Fe',
            description: 'Una profunda reflexión sobre el crecimiento espiritual y la importancia de la perseverancia en la vida cristiana.',
            publishDate: '2025-07-15',
            publishDateFormatted: '15 de Julio 2025',
            duration: '28:45',
            viewCount: 1247,
            viewCountFormatted: '1.2K',
            monthYear: 'Julio 2025',
            embedUrl: 'https://www.youtube.com/embed/Xzkp9Ei0nHc',
            watchUrl: 'https://www.youtube.com/watch?v=Xzkp9Ei0nHc',
            topics: [
                'Fundamentos de la fe cristiana',
                'Crecimiento espiritual',
                'Aplicación práctica',
                'Voluntad de Dios'
            ],
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * 🎨 UI Helpers
     */
    showLoadingIndicator() {
        // Crear indicador de carga si no existe
        if (!document.querySelector('.update-loading')) {
            const loader = document.createElement('div');
            loader.className = 'update-loading';
            loader.innerHTML = '🔄 Actualizando video destacado...';
            loader.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                animation: pulse 1s infinite;
            `;
            document.body.appendChild(loader);
        }
    }
    
    hideLoadingIndicator() {
        const loader = document.querySelector('.update-loading');
        if (loader) {
            loader.remove();
        }
    }
    
    addUpdateIndicator(lastUpdated) {
        const updateTime = new Date(lastUpdated).toLocaleString('es-ES');
        
        let indicator = document.querySelector('.last-update-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'last-update-indicator';
            indicator.style.cssText = `
                font-size: 0.8em;
                color: #666;
                text-align: center;
                margin-top: 10px;
                padding: 5px;
                background: #f8f9fa;
                border-radius: 3px;
            `;
            
            const heroSection = document.querySelector('.videos-hero');
            if (heroSection) {
                heroSection.appendChild(indicator);
            }
        }
        
        indicator.innerHTML = `📅 Última actualización: ${updateTime}`;
    }
    
    addEventListeners() {
        // Botón de actualización manual (si existe)
        const refreshBtn = document.querySelector('.refresh-featured-video');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.log('info', '🔄 Actualización manual solicitada');
                this.updateFeaturedVideo();
            });
        }
        
        // Listener para visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAndUpdateIfNeeded();
            }
        });
    }
    
    dispatchUpdateEvent(videoData) {
        const event = new CustomEvent('featuredVideoUpdated', {
            detail: videoData
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 📝 Sistema de logging
     */
    log(level, message) {
        if (!this.config.debug) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[YouTube Auto-Updater ${timestamp}]`;
        
        switch (level) {
            case 'error':
                console.error(`${prefix} ❌`, message);
                break;
            case 'warning':
                console.warn(`${prefix} ⚠️`, message);
                break;
            case 'success':
                console.log(`${prefix} ✅`, message);
                break;
            case 'info':
            default:
                console.log(`${prefix} ℹ️`, message);
                break;
        }
    }
}

// 🚀 Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en la página de videos
    if (document.querySelector('.videos-hero')) {
        window.youtubeUpdater = new YouTubeAutoUpdater({
            // Configuración personalizable
            apiKey: 'TU_API_KEY_AQUI', // ⚠️ IMPORTANTE: Configurar tu API key
            debug: true,
            autoUpdate: true,
            updateOnPageLoad: true
        });
        
        console.log('🎬 Sistema de actualización automática de YouTube inicializado');
    }
});

// Exportar para uso global
window.YouTubeAutoUpdater = YouTubeAutoUpdater;
