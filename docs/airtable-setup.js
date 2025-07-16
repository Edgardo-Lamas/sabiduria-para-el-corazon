// Ejemplos de configuración para integraciones con Airtable

// 1. ESTRUCTURA DE BASES DE DATOS RECOMENDADA

/*
BASE: Sabiduría para el Corazón - Contenido

TABLA: Articulos
- Título (Single line text, Primary field)
- Contenido (Long text)
- Autor (Single line text)
- Fecha_Publicacion (Date)
- Categoria (Single select: Teología, Vida Cristiana, Estudios Bíblicos, etc.)
- Imagen_Principal (Attachment)
- Estado (Single select: Borrador, Publicado, Archivado)
- Tags (Multiple select)
- URL_Slug (Formula: SUBSTITUTE(LOWER({Título}), " ", "-"))

TABLA: Audios
- Título (Single line text, Primary field)
- Archivo_Audio (Attachment)
- Predicador (Single line text)
- Duración (Duration)
- Fecha_Grabacion (Date)
- Serie (Link to another record - Tabla Series)
- Descripción (Long text)
- Imagen_Miniatura (Attachment)
- Versiculos_Referencias (Multiple line text)
- Descargas (Number)

TABLA: Videos
- Título (Single line text, Primary field)
- URL_YouTube (URL)
- Video_ID (Formula: extraer ID del URL de YouTube)
- Duración (Duration)
- Fecha_Publicacion (Date)
- Descripción (Long text)
- Miniatura (Attachment)
- Categoria (Single select)
- Vistas (Number)

TABLA: Libros
- Título (Single line text, Primary field)
- Autor (Single line text)
- Archivo_PDF (Attachment)
- Portada (Attachment)
- Descripción (Long text)
- Fecha_Publicacion (Date)
- Páginas (Number)
- Idioma (Single select: Español, Inglés, etc.)
- Editorial (Single line text)
- Descargas (Number)

TABLA: Series
- Nombre_Serie (Single line text, Primary field)
- Descripción (Long text)
- Imagen_Serie (Attachment)
- Predicador_Principal (Single line text)
- Fecha_Inicio (Date)
- Fecha_Fin (Date)
- Total_Mensajes (Rollup from Audios)

TABLA: Eventos
- Nombre_Evento (Single line text, Primary field)
- Fecha_Evento (Date)
- Hora_Inicio (Single line text)
- Hora_Fin (Single line text)
- Ubicación (Single line text)
- Descripción (Long text)
- Tipo_Evento (Single select: Culto, Estudio, Conferencia, etc.)
- Predicador (Single line text)
- Estado (Single select: Próximo, En Curso, Finalizado)
*/

// 2. EJEMPLO DE FUNCIONES PARA AIRTABLE

const AirtableAPI = {
    // Configuración
    baseId: 'tu_base_id_aqui',
    apiKey: 'tu_api_key_aqui',
    baseUrl: 'https://api.airtable.com/v0/',

    // Headers para requests
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    },

    // Obtener todos los artículos publicados
    async getPublishedArticles() {
        const url = `${this.baseUrl}${this.baseId}/Articulos?filterByFormula=({Estado}='Publicado')&sort[0][field]=Fecha_Publicacion&sort[0][direction]=desc`;
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error obteniendo artículos:', error);
            return [];
        }
    },

    // Obtener audios recientes
    async getRecentAudios(limit = 10) {
        const url = `${this.baseUrl}${this.baseId}/Audios?maxRecords=${limit}&sort[0][field]=Fecha_Grabacion&sort[0][direction]=desc`;
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error obteniendo audios:', error);
            return [];
        }
    },

    // Buscar contenido
    async searchContent(query, tables = ['Articulos', 'Audios', 'Videos']) {
        const searchPromises = tables.map(table => {
            const formula = `OR(SEARCH('${query}', {Título}), SEARCH('${query}', {Descripción}))`;
            const url = `${this.baseUrl}${this.baseId}/${table}?filterByFormula=${encodeURIComponent(formula)}`;
            
            return fetch(url, { headers: this.getHeaders() })
                .then(response => response.json())
                .catch(error => {
                    console.error(`Error buscando en ${table}:`, error);
                    return { records: [] };
                });
        });

        try {
            const results = await Promise.all(searchPromises);
            return results.reduce((acc, result, index) => {
                acc[tables[index]] = result.records;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error en búsqueda:', error);
            return {};
        }
    },

    // Incrementar contador de descargas
    async incrementDownloadCount(table, recordId) {
        const url = `${this.baseUrl}${this.baseId}/${table}/${recordId}`;
        
        try {
            // Primero obtener el registro actual
            const getResponse = await fetch(url, {
                headers: this.getHeaders()
            });
            const record = await getResponse.json();
            
            const currentDownloads = record.fields.Descargas || 0;
            
            // Actualizar el contador
            const updateResponse = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: {
                        Descargas: currentDownloads + 1
                    }
                })
            });
            
            return await updateResponse.json();
        } catch (error) {
            console.error('Error actualizando contador:', error);
            return null;
        }
    },

    // Obtener eventos próximos
    async getUpcomingEvents() {
        const today = new Date().toISOString().split('T')[0];
        const formula = `AND({Estado}='Próximo', IS_AFTER({Fecha_Evento}, '${today}'))`;
        const url = `${this.baseUrl}${this.baseId}/Eventos?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Fecha_Evento&sort[0][direction]=asc`;
        
        try {
            const response = await fetch(url, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.records;
        } catch (error) {
            console.error('Error obteniendo eventos:', error);
            return [];
        }
    }
};

// 3. EJEMPLO DE USO EN LA PÁGINA

/*
// En main.js, reemplazar las funciones placeholder:

async function getFeaturedContent() {
    const articles = await AirtableAPI.getPublishedArticles();
    if (articles.length > 0) {
        const featured = articles[0]; // El más reciente
        return {
            title: featured.fields.Título,
            description: featured.fields.Descripción,
            imageUrl: featured.fields.Imagen_Principal?.[0]?.url,
            url: `/articulos/${featured.fields.URL_Slug}`
        };
    }
    return null;
}

async function getRecentAudios() {
    const audios = await AirtableAPI.getRecentAudios(5);
    return audios.map(audio => ({
        title: audio.fields.Título,
        speaker: audio.fields.Predicador,
        url: audio.fields.Archivo_Audio[0]?.url,
        duration: audio.fields.Duración,
        thumbnail: audio.fields.Imagen_Miniatura?.[0]?.url
    }));
}
*/

// 4. WEBHOOKS PARA ACTUALIZACIONES EN TIEMPO REAL

/*
Para configurar webhooks en Airtable:
1. Ve a tu base en Airtable
2. Haz clic en "Extensions" → "Webhooks"
3. Crear un webhook que apunte a tu GitHub repository
4. Configurar para que se dispare en cambios de records
5. El webhook puede disparar un rebuild de GitHub Pages

Ejemplo de payload de webhook:
{
  "base": "appXXXXXX",
  "webhook": "achXXXXXX",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "changedTablesById": {
    "tblXXXXXX": {
      "changedRecordsById": {
        "recXXXXXX": {
          "current": { ... },
          "previous": { ... }
        }
      }
    }
  }
}
*/

export { AirtableAPI };
