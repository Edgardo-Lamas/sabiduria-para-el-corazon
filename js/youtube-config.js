/**
 * 🔧 Configuración del Sistema de Automatización YouTube
 * Archivo de configuración para facilitar el setup
 */

// 🔑 CONFIGURACIÓN PRINCIPAL - EDITA ESTOS VALORES
const YOUTUBE_CONFIG = {
    // ⚠️ IMPORTANTE: Reemplaza con tu YouTube Data API Key
    // Obtén una en: https://console.cloud.google.com/
    API_KEY: 'AIzaSyCYZgAGvigUR8USMvXHyIP6lt0m__M0p7I',
    
    // ✅ Tu Channel ID (ya configurado correctamente)
    CHANNEL_ID: 'UCQ4LzY6UyppxVddHx5f-ZnA',
    
    // ⚙️ Configuración de comportamiento
    AUTO_UPDATE: true,              // ¿Actualizar automáticamente?
    UPDATE_ON_PAGE_LOAD: true,      // ¿Actualizar al cargar la página?
    UPDATE_INTERVAL_HOURS: 24,      // Cada cuántas horas actualizar
    CACHE_DURATION_HOURS: 6,        // Duración del cache local
    
    // 🎯 Filtros de contenido
    MIN_VIDEO_LENGTH_MINUTES: 5,    // Videos de mínimo 5 minutos
    EXCLUDE_SHORTS: true,           // Excluir YouTube Shorts
    EXCLUDE_LIVE_STREAMS: true,     // Excluir transmisiones en vivo
    
    // 🛠️ Configuración de desarrollo
    DEBUG_MODE: true,               // Mostrar logs en consola
    LOG_LEVEL: 'info'               // Nivel de logs: 'error', 'warning', 'info', 'success'
};

// 🎨 CONFIGURACIÓN DE UI (Opcional)
const UI_CONFIG = {
    SHOW_UPDATE_BUTTON: true,       // Mostrar botón de actualización manual
    SHOW_LOADING_INDICATOR: true,   // Mostrar indicador de carga
    SHOW_LAST_UPDATE_TIME: true,    // Mostrar hora de última actualización
    ANIMATE_UPDATES: true           // Animaciones en las actualizaciones
};

// 📋 TEXTOS PERSONALIZABLES
const TEXTS = {
    LOADING: '🔄 Actualizando video destacado...',
    SUCCESS: '✅ Video actualizado exitosamente',
    ERROR: '❌ Error al actualizar, usando datos predeterminados',
    NO_API_KEY: '⚠️ API Key no configurada, usando modo de demostración',
    MANUAL_UPDATE_BTN: '🔄 Actualizar',
    LAST_UPDATE_PREFIX: '📅 Última actualización:'
};

// 📊 DATOS DE FALLBACK (Si no funciona la API)
const FALLBACK_DATA = {
    videoId: 'Xzkp9Ei0nHc',
    title: 'Enseñanza Bíblica: Creciendo en la Fe',
    description: 'Una profunda reflexión sobre el crecimiento espiritual y la importancia de la perseverancia en la vida cristiana. En esta enseñanza exploramos los fundamentos bíblicos para fortalecer nuestra fe diaria.',
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

// 🚀 FUNCIÓN DE INICIALIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que estamos en la página correcta
    if (document.querySelector('.videos-hero')) {
        
        // Verificar configuración de API Key
        if (YOUTUBE_CONFIG.API_KEY === 'AIzaSyBdGK_TU_API_KEY_AQUI_REEMPLAZAR') {
            console.warn('⚠️ YouTube API Key no configurada. Usando modo de demostración.');
            console.info('📖 Consulta docs/youtube-automation-setup.md para instrucciones de configuración');
        }
        
        // Inicializar el sistema con la configuración
        try {
            window.youtubeUpdater = new YouTubeAutoUpdater({
                apiKey: YOUTUBE_CONFIG.API_KEY,
                channelId: YOUTUBE_CONFIG.CHANNEL_ID,
                autoUpdate: YOUTUBE_CONFIG.AUTO_UPDATE,
                updateOnPageLoad: YOUTUBE_CONFIG.UPDATE_ON_PAGE_LOAD,
                checkInterval: YOUTUBE_CONFIG.UPDATE_INTERVAL_HOURS * 60 * 60 * 1000,
                cacheExpiry: YOUTUBE_CONFIG.CACHE_DURATION_HOURS * 60 * 60 * 1000,
                minVideoLength: YOUTUBE_CONFIG.MIN_VIDEO_LENGTH_MINUTES * 60,
                excludeShorts: YOUTUBE_CONFIG.EXCLUDE_SHORTS,
                excludeLiveStreams: YOUTUBE_CONFIG.EXCLUDE_LIVE_STREAMS,
                debug: YOUTUBE_CONFIG.DEBUG_MODE,
                logLevel: YOUTUBE_CONFIG.LOG_LEVEL
            });
            
            console.log('🎬✅ Sistema de actualización automática de YouTube inicializado correctamente');
            
            // Configurar UI si está habilitada
            if (UI_CONFIG.SHOW_UPDATE_BUTTON) {
                setupManualUpdateButton();
            }
            
        } catch (error) {
            console.error('❌ Error inicializando sistema YouTube:', error);
        }
    }
});

// 🔧 FUNCIONES AUXILIARES
function setupManualUpdateButton() {
    const updateBtn = document.querySelector('.refresh-featured-video');
    if (updateBtn) {
        updateBtn.textContent = TEXTS.MANUAL_UPDATE_BTN;
        updateBtn.title = 'Actualizar video destacado manualmente';
    }
}

// 📝 FUNCIÓN DE VALIDACIÓN DE CONFIGURACIÓN
function validateConfig() {
    const issues = [];
    
    if (!YOUTUBE_CONFIG.API_KEY || YOUTUBE_CONFIG.API_KEY.includes('TU_API_KEY_AQUI')) {
        issues.push('❌ API Key no configurada correctamente');
    }
    
    if (!YOUTUBE_CONFIG.CHANNEL_ID) {
        issues.push('❌ Channel ID faltante');
    }
    
    if (YOUTUBE_CONFIG.UPDATE_INTERVAL_HOURS < 1) {
        issues.push('⚠️ Intervalo de actualización muy frecuente (mínimo 1 hora recomendado)');
    }
    
    if (issues.length > 0) {
        console.group('🔧 Problemas de Configuración Detectados:');
        issues.forEach(issue => console.warn(issue));
        console.info('📖 Consulta docs/youtube-automation-setup.md para ayuda');
        console.groupEnd();
    } else {
        console.log('✅ Configuración validada correctamente');
    }
    
    return issues.length === 0;
}

// 🧪 FUNCIONES DE TESTING/DEBUG
window.testYouTubeIntegration = function() {
    console.group('🧪 Test de Integración YouTube');
    
    console.log('📋 Configuración actual:', YOUTUBE_CONFIG);
    
    if (window.youtubeUpdater) {
        console.log('✅ Sistema inicializado');
        console.log('📊 Cache actual:', window.youtubeUpdater.cache);
        console.log('🔄 Ejecutando actualización de prueba...');
        
        window.youtubeUpdater.updateFeaturedVideo().then(() => {
            console.log('✅ Test completado');
        }).catch(error => {
            console.error('❌ Error en test:', error);
        });
    } else {
        console.error('❌ Sistema no inicializado');
    }
    
    console.groupEnd();
};

// Validar configuración al cargar
setTimeout(() => validateConfig(), 1000);

// Exportar configuración para uso global
window.YOUTUBE_CONFIG = YOUTUBE_CONFIG;
window.UI_CONFIG = UI_CONFIG;

console.log('⚙️ Configuración YouTube cargada. Ejecuta testYouTubeIntegration() para probar.');
