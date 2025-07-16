// Configuración para integraciones con servicios externos
const CONFIG = {
    // URLs de APIs y servicios
    apis: {
        airtable: {
            baseUrl: 'https://api.airtable.com/v0/',
            baseId: '', // Agregar tu Base ID de Airtable
            apiKey: '', // Agregar tu API Key de Airtable (usar variables de entorno en producción)
            tables: {
                articulos: 'Articulos',
                audios: 'Audios',
                videos: 'Videos',
                libros: 'Libros'
            }
        },
        notion: {
            baseUrl: 'https://api.notion.com/v1/',
            token: '', // Token de integración de Notion
            databaseIds: {
                articulos: '',
                eventos: '',
                sermones: ''
            }
        },
        youtube: {
            apiKey: '', // YouTube Data API v3 key
            channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA',
            baseUrl: 'https://www.googleapis.com/youtube/v3/'
        }
    },
    
    // Configuración de la aplicación
    app: {
        itemsPerPage: 9,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedFileTypes: ['pdf', 'mp3', 'mp4', 'doc', 'docx'],
        cacheExpiration: 30 * 60 * 1000 // 30 minutos
    },
    
    // URLs del sitio
    site: {
        baseUrl: 'https://sabiduriaparaelcorazon.github.io',
        githubRepo: 'https://github.com/tuusuario/sabiduria-para-el-corazon',
        contactEmail: 'contacto@sabiduriaparaelcorazon.org'
    }
};

// Funciones de utilidad para las APIs
const API_UTILS = {
    // Función para hacer requests a Airtable
    async fetchFromAirtable(table, params = {}) {
        const url = new URL(`${CONFIG.apis.airtable.baseUrl}${CONFIG.apis.airtable.baseId}/${table}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.apis.airtable.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching from Airtable:', error);
            return null;
        }
    },
    
    // Función para obtener videos de YouTube
    async fetchYouTubeVideos(maxResults = 10) {
        const url = `${CONFIG.apis.youtube.baseUrl}search?part=snippet&channelId=${CONFIG.apis.youtube.channelId}&maxResults=${maxResults}&order=date&type=video&key=${CONFIG.apis.youtube.apiKey}`;
        
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            return null;
        }
    },
    
    // Función para cachear datos en localStorage
    cacheData(key, data) {
        const cacheObject = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheObject));
    },
    
    // Función para obtener datos del cache
    getCachedData(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CONFIG.app.cacheExpiration) {
            localStorage.removeItem(key);
            return null;
        }
        
        return data;
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, API_UTILS };
}
