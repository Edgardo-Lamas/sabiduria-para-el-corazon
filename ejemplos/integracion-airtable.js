// EJEMPLO PRÁCTICO: INTEGRACIÓN CON AIRTABLE
// Objetivo: Hacer que el contenido del sitio sea 100% dinámico

// 1. CONFIGURACIÓN INICIAL
const AIRTABLE_CONFIG = {
    baseId: 'appXXXXXXXXXXXXXX', // Tu Base ID
    apiKey: 'keyXXXXXXXXXXXXXX', // Tu API Key
    tables: {
        articulos: 'tblArticulos',
        audios: 'tblAudios', 
        videos: 'tblVideos',
        eventos: 'tblEventos',
        versiculos: 'tblVersiculos'
    }
};

// 2. FUNCIÓN PARA CARGAR CONTENIDO DINÁMICO
class AirtableContent {
    constructor() {
        this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}`;
        this.headers = {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    // EJEMPLO 1: Mensaje destacado dinámico
    async loadFeaturedMessage() {
        try {
            const response = await fetch(`${this.baseUrl}/Audios?filterByFormula=({Destacado}=TRUE())&maxRecords=1`, {
                headers: this.headers
            });
            const data = await response.json();
            
            if (data.records.length > 0) {
                const mensaje = data.records[0].fields;
                this.updateFeaturedSection({
                    titulo: mensaje.Titulo,
                    predicador: mensaje.Predicador,
                    audioUrl: mensaje.Archivo_Audio[0].url,
                    imagen: mensaje.Miniatura[0].url,
                    descripcion: mensaje.Descripcion
                });
            }
        } catch (error) {
            console.error('Error cargando mensaje destacado:', error);
        }
    }

    updateFeaturedSection(mensaje) {
        const section = document.querySelector('.segundo');
        section.innerHTML = `
            <img src="${mensaje.imagen}" alt="${mensaje.titulo}">
            <h2>MENSAJE DESTACADO</h2>
            <h3>${mensaje.titulo}</h3>
            <p>Por: ${mensaje.predicador}</p>
            <p>${mensaje.descripcion}</p>
            <audio src="${mensaje.audioUrl}" controls preload="metadata">
                Tu navegador no soporta audio HTML5.
            </audio>
            <div class="audio-controls">
                <button onclick="downloadAudio('${mensaje.audioUrl}')">📥 Descargar</button>
                <button onclick="shareAudio('${mensaje.titulo}')">📤 Compartir</button>
            </div>
        `;
    }

    // EJEMPLO 2: Versículo del día automático
    async loadDailyVerse() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        try {
            const response = await fetch(`${this.baseUrl}/Versiculos?filterByFormula=({DiaDelAno}=${dayOfYear})`, {
                headers: this.headers
            });
            const data = await response.json();
            
            if (data.records.length > 0) {
                const versiculo = data.records[0].fields;
                this.updateDailyVerse(versiculo);
            }
        } catch (error) {
            console.error('Error cargando versículo:', error);
        }
    }

    updateDailyVerse(versiculo) {
        const section = document.querySelector('.cuarta');
        section.innerHTML = `
            <h2>Versículo del día</h2>
            <blockquote>
                <p>"${versiculo.Texto}"</p>
                <cite>${versiculo.Referencia}</cite>
            </blockquote>
            <div class="verse-actions">
                <button onclick="shareVerse('${versiculo.Texto}', '${versiculo.Referencia}')">
                    📤 Compartir versículo
                </button>
            </div>
        `;
    }

    // EJEMPLO 3: Eventos próximos dinámicos
    async loadUpcomingEvents() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch(`${this.baseUrl}/Eventos?filterByFormula=IS_AFTER({Fecha}, '${today}')&sort[0][field]=Fecha&sort[0][direction]=asc&maxRecords=3`, {
                headers: this.headers
            });
            const data = await response.json();
            
            this.updateScheduleSection(data.records);
        } catch (error) {
            console.error('Error cargando eventos:', error);
        }
    }

    updateScheduleSection(eventos) {
        const section = document.querySelector('.quinta ul');
        section.innerHTML = eventos.map(evento => {
            const fields = evento.fields;
            return `
                <li class="${fields.Tipo.toLowerCase()}">
                    <h3>${fields.Titulo}</h3>
                    <div class="event-details">
                        <h4>${fields.Descripcion}<br>${fields.Horario}</h4>
                        <p>${fields.Ubicacion}</p>
                        <div class="event-actions">
                            <button onclick="addToCalendar('${fields.Titulo}', '${fields.Fecha}', '${fields.Horario}')">
                                📅 Añadir al calendario
                            </button>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    }
}

// FUNCIONES DE UTILIDAD
function downloadAudio(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
}

function shareAudio(titulo) {
    if (navigator.share) {
        navigator.share({
            title: titulo,
            text: `Escucha este mensaje: ${titulo}`,
            url: window.location.href
        });
    }
}

function shareVerse(texto, referencia) {
    const message = `"${texto}" - ${referencia}`;
    if (navigator.share) {
        navigator.share({
            title: 'Versículo del día',
            text: message
        });
    } else {
        navigator.clipboard.writeText(message);
        alert('Versículo copiado al portapapeles');
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const airtableContent = new AirtableContent();
    
    // Cargar contenido dinámico
    airtableContent.loadFeaturedMessage();
    airtableContent.loadDailyVerse();
    airtableContent.loadUpcomingEvents();
    
    // Actualizar cada 30 minutos
    setInterval(() => {
        airtableContent.loadFeaturedMessage();
        airtableContent.loadUpcomingEvents();
    }, 30 * 60 * 1000);
});

export { AirtableContent };
