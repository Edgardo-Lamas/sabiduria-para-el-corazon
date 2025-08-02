// Sistema híbrido: Notion (metadatos) + GitHub (PDFs)
class EbooksManager {
    constructor() {
        this.notionConfig = {
            // Configuración se carga desde archivo privado
            baseUrl: 'https://api.notion.so/v1/',
            version: '2022-06-28'
        };
        this.githubBaseUrl = 'https://raw.githubusercontent.com/Edgardo-Lamas/sabiduria-para-el-corazon/main/ebooks/';
    }

    // Cargar configuración privada
    async loadPrivateConfig() {
        try {
            // Intentar cargar configuración privada local
            if (typeof PRIVATE_CONFIG !== 'undefined' && PRIVATE_CONFIG.notion) {
                this.notionConfig.token = PRIVATE_CONFIG.notion.token;
                this.notionConfig.databaseId = PRIVATE_CONFIG.notion.databaseId;
                return true;
            }
            return false;
        } catch (error) {
            console.log('Configuración privada no disponible, usando datos estáticos');
            return false;
        }
    }

    // Cargar eBooks desde Notion
    async loadFromNotion() {
        if (!await this.loadPrivateConfig()) {
            return null;
        }

        try {
            const response = await fetch(`${this.notionConfig.baseUrl}databases/${this.notionConfig.databaseId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.notionConfig.token}`,
                    'Notion-Version': this.notionConfig.version,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sorts: [
                        {
                            property: 'Destacado',
                            direction: 'descending'
                        }
                    ]
                })
            });

            if (!response.ok) throw new Error('Error al conectar con Notion');

            const data = await response.json();
            return this.processNotionData(data.results);
        } catch (error) {
            console.error('Error cargando desde Notion:', error);
            return null;
        }
    }

    // Procesar datos de Notion y combinar con URLs de GitHub
    processNotionData(results) {
        return results.map(page => {
            const props = page.properties;
            
            // Extraer metadatos de Notion
            const titulo = props.Titulo?.title?.[0]?.plain_text || '';
            const autor = props.Autor?.rich_text?.[0]?.plain_text || '';
            const descripcion = props.Descripción?.rich_text?.[0]?.plain_text || '';
            const categoria = props.Categoría?.select?.name || '';
            const año = props['Año de publicación']?.number || '';
            const destacado = props.Destacado?.checkbox || false;
            const estado = props.Estado?.select?.name || 'Disponible';
            
            // Generar nombre de archivo basado en el título
            const fileName = this.generateFileName(titulo);
            
            // Combinar con URL de GitHub
            const archivo = `${this.githubBaseUrl}${fileName}`;
            
            // URL de portada desde Notion o fallback
            const portada = props.Portada?.files?.[0]?.file?.url || 
                           props.Portada?.files?.[0]?.external?.url || 
                           '../img/bosquejos.jpg';

            return {
                titulo,
                autor,
                descripcion,
                categoria,
                año,
                destacado,
                estado,
                archivo,
                portada
            };
        });
    }

    // Generar nombre de archivo consistente
    generateFileName(titulo) {
        return titulo
            .replace(/[^\w\s]/g, '') // Remover caracteres especiales
            .replace(/\s+/g, '_') // Espacios a guiones bajos
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            + '.pdf';
    }

    // Datos de fallback (estáticos)
    getFallbackData() {
        return [
            {
                titulo: "Historia De la Iglesia. Era de la Reforma",
                autor: "Justo González",
                descripcion: "Un estudio detallado de la era de la Reforma en la historia de la iglesia cristiana.",
                categoria: "Historia",
                archivo: `${this.githubBaseUrl}Historia_de_la_Iglesia_Era_de_la_Reforma.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 2020,
                destacado: true,
                estado: "Disponible próximamente"
            },
            {
                titulo: "La Confesión de Westminster",
                autor: "Asamblea de Westminster",
                descripcion: "Documento fundamental de la fe reformada y presbiteriana.",
                categoria: "Teología",
                archivo: `${this.githubBaseUrl}Confesion_de_Westminster.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1646,
                destacado: true,
                estado: "Disponible próximamente"
            },
            {
                titulo: "Nacido para multiplicarse",
                autor: "Dawson Trotman",
                descripcion: "Principios fundamentales para el discipulado y la multiplicación espiritual.",
                categoria: "Discipulado",
                archivo: `${this.githubBaseUrl}Nacido_para_multiplicarse.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1975,
                destacado: false,
                estado: "Disponible próximamente"
            },
            {
                titulo: "El Arte de Aconsejar",
                autor: "Jay E. Adams",
                descripcion: "Guía práctica para el consejo bíblico y pastoral.",
                categoria: "Pastoral",
                archivo: `${this.githubBaseUrl}El_Arte_de_Aconsejar.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1986,
                destacado: false,
                estado: "Disponible próximamente"
            },
            {
                titulo: "La Osa Mayor",
                autor: "Robert C. Sproul",
                descripcion: "Estudio sobre la soberanía de Dios y su impacto en la vida cristiana.",
                categoria: "Teología",
                archivo: `${this.githubBaseUrl}La_Osa_Mayor.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1993,
                destacado: false,
                estado: "Disponible próximamente"
            },
            {
                titulo: "Como preparar y dirigir Estudios Bíblicos",
                autor: "James Braga",
                descripcion: "Manual práctico para la preparación y dirección de estudios bíblicos efectivos.",
                categoria: "Estudio Bíblico",
                archivo: `${this.githubBaseUrl}Como_preparar_y_dirigir_Estudios_Biblicos.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1967,
                destacado: true,
                estado: "Disponible próximamente"
            },
            {
                titulo: "La Necesidad del momento",
                autor: "A.W. Tozer",
                descripcion: "Reflexiones profundas sobre las necesidades espirituales de nuestro tiempo.",
                categoria: "Espiritualidad",
                archivo: `${this.githubBaseUrl}La_Necesidad_del_momento.pdf`,
                portada: "../img/bosquejos.jpg",
                año: 1960,
                destacado: false,
                estado: "Disponible próximamente"
            }
        ];
    }

    // Método principal para cargar eBooks
    async loadEbooks() {
        // Mostrar indicador de carga
        const loadingElement = document.getElementById('ebooks-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }

        // Intentar cargar desde Notion
        let ebooks = await this.loadFromNotion();
        
        // Si falla, usar datos estáticos
        if (!ebooks || ebooks.length === 0) {
            ebooks = this.getFallbackData();
            console.log('🔄 Usando datos de fallback');
        } else {
            console.log('✅ Datos cargados desde Notion');
        }

        // Ocultar indicador de carga
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        return ebooks;
    }

    // Verificar si un PDF existe en GitHub
    async checkPdfExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Actualizar estado de eBooks basado en disponibilidad de PDFs
    async updateEbookAvailability(ebooks) {
        const updatedEbooks = await Promise.all(
            ebooks.map(async (ebook) => {
                const pdfExists = await this.checkPdfExists(ebook.archivo);
                return {
                    ...ebook,
                    estado: pdfExists ? 'Disponible' : 'Disponible próximamente'
                };
            })
        );
        return updatedEbooks;
    }
}

// Exportar para uso global
window.EbooksManager = EbooksManager;
