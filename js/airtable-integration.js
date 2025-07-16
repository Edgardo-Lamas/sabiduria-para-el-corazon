// IMPLEMENTACIÓN ESPECÍFICA PARA SABIDURÍA PARA EL CORAZÓN
// Este archivo contiene la lógica exacta para conectar tu sitio con Airtable

class AirtableContent {
    constructor() {
        this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}`;
        this.headers = {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    // 1. CARGAR MENSAJE DESTACADO (reemplaza tu audio estático actual)
    async loadFeaturedMessage() {
        try {
            console.log('🔄 Cargando mensaje destacado desde Airtable...');
            
            const response = await fetch(`${this.baseUrl}/AUDIOS_SERMONES?filterByFormula=({Destacado}=TRUE())&maxRecords=1`, {
                headers: this.headers
            });
            
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
                const mensaje = data.records[0].fields;
                this.updateFeaturedSection(mensaje);
                console.log('✅ Mensaje destacado cargado:', mensaje.Titulo);
            } else {
                console.log('⚠️ No hay mensaje destacado configurado en Airtable');
            }
        } catch (error) {
            console.error('❌ Error cargando mensaje destacado:', error);
            this.hideLoader('mensaje-loading');
        }
    }

    updateFeaturedSection(mensaje) {
        const section = document.getElementById('mensaje-destacado');
        if (!section) return;

        // Ocultar loader
        this.hideLoader('mensaje-loading');

        // Actualizar contenido
        section.innerHTML = `
            <img src="${mensaje.Imagen_Miniatura?.[0]?.url || './img/foto audio 4.jpg'}" 
                 alt="${mensaje.Titulo}">
            <h2>MENSAJE DESTACADO</h2>
            <h3>${mensaje.Titulo}</h3>
            <p class="predicador">Por: ${mensaje.Predicador}</p>
            <p class="descripcion">${mensaje.Descripcion || 'Te invitamos a escuchar este mensaje'}</p>
            
            <div class="audio-container">
                <audio src="${mensaje.Archivo_Audio[0].url}" 
                       controls 
                       preload="metadata"
                       onplay="trackAudioPlay('${mensaje.Titulo}')">
                    Tu navegador no soporta audio HTML5.
                </audio>
            </div>
            
            <div class="mensaje-stats">
                <span class="stats-downloads">📊 ${mensaje.Descargas || 0} descargas</span>
                <span class="stats-duration">⏱️ ${mensaje.Duracion || 'N/A'}</span>
                <span class="stats-series">📚 ${mensaje.Serie || 'Mensaje individual'}</span>
            </div>
            
            <div class="mensaje-actions">
                <button onclick="descargarAudio('${mensaje.Archivo_Audio[0].url}', '${mensaje.Titulo}')" 
                        class="btn-download">
                    📥 Descargar
                </button>
                <button onclick="compartirMensaje('${mensaje.Titulo}', '${mensaje.Predicador}')" 
                        class="btn-share">
                    📤 Compartir
                </button>
                <a href="./Recursos/audios.html" class="btn-more">
                    🎵 Más Predicaciones
                </a>
            </div>
        `;

        // Agregar evento para tracking de descargas
        this.trackDownload(mensaje.Titulo, 'view');
    }

    // 2. CARGAR VERSÍCULO DEL DÍA (automático según fecha)
    async loadDailyVerse() {
        try {
            console.log('🔄 Cargando versículo del día...');
            
            // Calcular día del año actual
            const today = new Date();
            const start = new Date(today.getFullYear(), 0, 0);
            const diff = today - start;
            const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            console.log(`📅 Buscando versículo para el día: ${dayOfYear}`);
            
            // Primero intentar con el nombre VERSICULO_DIARIO
            let response = await fetch(`${this.baseUrl}/VERSICULO_DIARIO?filterByFormula=AND({Activo}=TRUE(),{Dia_Del_Ano}=${dayOfYear})&maxRecords=1`, {
                headers: this.headers
            });
            
            // Si falla, intentar con VERSICULO-DIARIO (con guión)
            if (!response.ok) {
                console.log('⚠️ Intentando con nombre alternativo de tabla...');
                response = await fetch(`${this.baseUrl}/VERSICULO-DIARIO?filterByFormula=AND({Activo}=TRUE(),{Dia_Del_Ano}=${dayOfYear})&maxRecords=1`, {
                    headers: this.headers
                });
            }
            
            const data = await response.json();
            
            console.log(`🔍 Respuesta de Airtable:`, data);
            
            if (data.records && data.records.length > 0) {
                const versiculo = data.records[0].fields;
                this.updateDailyVerse(versiculo);
                console.log('✅ Versículo del día cargado:', versiculo.Referencia);
                console.log('📊 Datos del versículo:', versiculo);
            } else {
                // Si no hay versículo para hoy, usar uno aleatorio
                console.log(`⚠️ No hay versículo para el día ${dayOfYear}, cargando aleatorio...`);
                this.loadRandomVerse();
            }
        } catch (error) {
            console.error('❌ Error cargando versículo:', error);
            this.hideLoader('versiculo-loading');
        }
    }

    updateDailyVerse(versiculo) {
        const section = document.getElementById('versiculo-del-dia');
        if (!section) {
            console.error('❌ No se encontró la sección #versiculo-del-dia');
            return;
        }

        // Ocultar loader
        this.hideLoader('versiculo-loading');

        // Crear nuevo contenido con mejor estructura
        const nuevoContenido = `
            <h2>Versículo del día</h2>
            <div class="versiculo-container">
                <blockquote class="versiculo-texto">
                    ${versiculo.Versiculo || versiculo.Texto || 'Versículo no disponible'}
                </blockquote>
                <cite class="versiculo-referencia">${versiculo.Referencia || 'Referencia no disponible'}</cite>
                ${versiculo.Categoria ? `<span class="versiculo-categoria">${versiculo.Categoria}</span>` : ''}
            </div>
            <div class="versiculo-actions">
                <button onclick="compartirVersiculo()" class="btn-compartir">📤 Compartir</button>
                <button onclick="copiarVersiculo()" class="btn-copiar">📋 Copiar</button>
                <button onclick="verMasVersiculos()" class="btn-more">📖 Más versículos</button>
            </div>
        `;

        // Reemplazar contenido
        section.innerHTML = nuevoContenido;
        console.log('✅ Contenido del versículo actualizado correctamente');
    }

    // Método para ocultar loaders
    hideLoader(loaderId) {
        const loader = document.querySelector(`.${loaderId}`);
        if (loader) {
            loader.style.display = 'none';
            console.log(`🔄 Loader ${loaderId} ocultado`);
        }
    }

    async loadRandomVerse() {
        try {
            const response = await fetch(`${this.baseUrl}/VERSICULO_DIARIO?maxRecords=1&sort[0][field]=RAND()`, {
                headers: this.headers
            });
            
            const data = await response.json();
            if (data.records && data.records.length > 0) {
                this.updateDailyVerse(data.records[0].fields);
            }
        } catch (error) {
            console.error('❌ Error cargando versículo aleatorio:', error);
        }
    }

    // 3. CARGAR EVENTOS Y HORARIOS (reemplaza tu contenido estático)
    async loadUpcomingEvents() {
        try {
            console.log('🔄 Cargando horarios desde Airtable...');
            
            const response = await fetch(`${this.baseUrl}/EVENTOS_HORARIOS?filterByFormula=({Activo}=TRUE())&sort[0][field]=Dia_Semana`, {
                headers: this.headers
            });
            
            const data = await response.json();
            
            if (data.records && data.records.length > 0) {
                this.updateScheduleSection(data.records);
                console.log('✅ Horarios cargados:', data.records.length, 'eventos');
            }
        } catch (error) {
            console.error('❌ Error cargando horarios:', error);
            this.hideLoader('horarios-loading');
        }
    }

    updateScheduleSection(eventos) {
        const section = document.getElementById('horarios-eventos');
        if (!section) return;

        // Ocultar loader
        this.hideLoader('horarios-loading');

        // Agrupar eventos por día
        const eventosPorDia = this.groupEventsByDay(eventos);

        section.innerHTML = `
            <h2>Horarios</h2>
            <div class="horarios-grid">
                ${Object.entries(eventosPorDia).map(([dia, eventosDelDia]) => 
                    this.createDayCard(dia, eventosDelDia)
                ).join('')}
            </div>
            <div class="horarios-footer">
                <p><strong>Nota:</strong> Los horarios pueden cambiar. Confirma antes de asistir.</p>
                <a href="./page/contacto.html" class="btn-contact">📞 Contactar para más información</a>
            </div>
        `;
    }

    groupEventsByDay(eventos) {
        const diasOrden = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const grupo = {};
        
        // Inicializar días
        diasOrden.forEach(dia => {
            grupo[dia] = [];
        });
        
        // Agrupar eventos
        eventos.forEach(evento => {
            const dia = evento.fields.Dia_Semana;
            if (grupo[dia]) {
                grupo[dia].push(evento.fields);
            }
        });
        
        // Filtrar días sin eventos
        return Object.fromEntries(
            Object.entries(grupo).filter(([dia, eventos]) => eventos.length > 0)
        );
    }

    createDayCard(dia, eventos) {
        const diaClass = dia.toLowerCase();
        
        return `
            <div class="day-card ${diaClass}">
                <h3>${dia}</h3>
                <div class="eventos-del-dia">
                    ${eventos.map(evento => `
                        <div class="evento-item">
                            <h4>${evento.Nombre_Evento}</h4>
                            <div class="evento-detalles">
                                <span class="hora">🕐 ${evento.Hora_Inicio}${evento.Hora_Fin ? ` - ${evento.Hora_Fin}` : ''}</span>
                                <span class="ubicacion">📍 ${evento.Ubicacion || 'Sede principal'}</span>
                                ${evento.Responsable ? `<span class="responsable">👤 ${evento.Responsable}</span>` : ''}
                            </div>
                            <p class="evento-descripcion">${evento.Descripcion || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 4. SISTEMA DE TRACKING PARA ESTADÍSTICAS
    async trackDownload(titulo, tipo = 'download') {
        try {
            // Obtener información del usuario
            const userInfo = await this.getUserInfo();
            
            // Enviar estadística a Airtable
            const response = await fetch(`${this.baseUrl}/ESTADISTICAS_DESCARGAS`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    fields: {
                        Fecha: new Date().toISOString().split('T')[0],
                        Archivo_Descargado: titulo,
                        Tipo_Accion: tipo,
                        IP_Usuario: userInfo.ip,
                        Navegador: userInfo.browser,
                        Pais: userInfo.country || 'Desconocido'
                    }
                })
            });
            
            if (response.ok) {
                console.log('✅ Estadística registrada:', tipo, titulo);
            }
        } catch (error) {
            console.error('❌ Error registrando estadística:', error);
        }
    }

    async getUserInfo() {
        try {
            // Obtener IP del usuario
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            
            return {
                ip: ipData.ip,
                browser: this.getBrowserInfo(),
                country: 'Argentina' // Podrías usar un servicio de geolocalización
            };
        } catch (error) {
            return {
                ip: 'unknown',
                browser: this.getBrowserInfo(),
                country: 'unknown'
            };
        }
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Desconocido';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        return browser;
    }

    // UTILIDADES
    hideLoader(loaderId) {
        const loader = document.querySelector(`.${loaderId}`);
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// FUNCIONES GLOBALES PARA TU SITIO
function descargarAudio(url, titulo) {
    // Crear enlace de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titulo}.mp3`;
    a.click();
    
    // Registrar descarga
    if (window.airtableContent) {
        window.airtableContent.trackDownload(titulo, 'download');
    }
}

function compartirMensaje(titulo, predicador) {
    const texto = `🎵 Escucha "${titulo}" por ${predicador} en Sabiduría para el Corazón`;
    
    if (navigator.share) {
        navigator.share({
            title: titulo,
            text: texto,
            url: window.location.href
        });
    } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(`${texto}\n${window.location.href}`);
        alert('Enlace copiado al portapapeles');
    }
}

function trackAudioPlay(titulo) {
    if (window.airtableContent) {
        window.airtableContent.trackDownload(titulo, 'play');
    }
}

function verMasVersiculos() {
    // Aquí podrías abrir una página con más versículos o un modal
    alert('Función "Ver más versículos" en desarrollo');
}

// Guardar instancia global para uso en funciones
window.airtableContent = null;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAirtable);
} else {
    initializeAirtable();
}

function initializeAirtable() {
    window.airtableContent = new AirtableContent();
}
