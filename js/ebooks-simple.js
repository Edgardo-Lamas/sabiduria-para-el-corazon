// Sistema local simplificado: GitHub PDFs + Portadas locales + Metadatos de Notion
class EbooksManagerSimple {
    constructor() {
        this.githubBaseUrl = 'https://raw.githubusercontent.com/Edgardo-Lamas/sabiduria-para-el-corazon/main/ebooks/';
        this.portadasBaseUrl = 'https://raw.githubusercontent.com/Edgardo-Lamas/sabiduria-para-el-corazon/main/ebooks/portadas/';
        this.notionConfig = {
            baseUrl: 'https://api.notion.so/v1/',
            version: '2022-06-28'
        };
    }

    // Cargar configuración privada para Notion
    async loadPrivateConfig() {
        try {
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

    // Método principal para cargar eBooks
    async loadEbooks() {
        console.log('🔄 Iniciando carga de eBooks...');
        
        // Intentar cargar desde Notion primero
        const notionEbooks = await this.loadFromNotion();
        if (notionEbooks && notionEbooks.length > 0) {
            console.log(`✅ ${notionEbooks.length} eBooks cargados desde Notion`);
            return notionEbooks;
        }
        
        // Fallback a datos estáticos
        console.log('📚 Usando datos estáticos de respaldo');
        return this.getFallbackData();
    }

    // Cargar desde Notion (simplificado)
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
                    sorts: [{ property: 'Destacado', direction: 'descending' }]
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

    // Procesar datos de Notion
    processNotionData(results) {
        return results.map(page => {
            const props = page.properties;
            
            const titulo = props.Titulo?.title?.[0]?.plain_text || '';
            const autor = props.Autor?.rich_text?.[0]?.plain_text || '';
            const descripcion = props.Descripción?.rich_text?.[0]?.plain_text || '';
            const categoria = props.Categoría?.select?.name || '';
            const año = props['Año de publicación']?.number || '';
            const destacado = props.Destacado?.checkbox || false;
            const estado = props.Estado?.select?.name || 'Disponible';
            
            // Generar URLs usando el sistema local
            const fileName = this.generateFileName(titulo);
            const archivo = `${this.githubBaseUrl}${fileName}`;
            const portada = this.generatePortadaUrl(fileName);

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

    // Generar nombre de archivo (mismo que antes)
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

    // Generar URL de portada local con detección automática de formato
    generatePortadaUrl(fileName) {
        // Quitar .pdf del nombre del archivo
        const baseName = fileName.replace('.pdf', '');
        
        // Lista de portadas existentes (se podría hacer dinámico en el futuro)
        const portadasDisponibles = {
            'Historia_de_la_Iglesia_Era_de_la_Reforma': 'png',
            'La_Necesidad_del_momento': 'jpg',
            'Confesion_de_Westminster': 'png',
            'Nacido_para_multiplicarse': 'jpg',
            'El_Arte_de_Aconsejar': 'png',
            'La_Osa_Mayor': 'jpg',
            'Como_preparar_y_dirigir_Estudios_Biblicos': 'png'
        };
        
        // Verificar si existe portada específica
        if (portadasDisponibles[baseName]) {
            return `${this.portadasBaseUrl}${baseName}.${portadasDisponibles[baseName]}`;
        }
        
        // Fallback a portada genérica
        return `${this.portadasBaseUrl}portada-generica.jpg`;
    }

    // Datos de fallback simplificados
    getFallbackData() {
        return [
            {
                titulo: "Historia de la Iglesia: Era de la Reforma",
                autor: "Justo L. González",
                descripcion: "Un recorrido por la historia de la Reforma Protestante y sus principales figuras.",
                categoria: "Historia",
                año: 1995,
                destacado: true,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}Historia_de_la_Iglesia_Era_de_la_Reforma.pdf`,
                portada: `${this.portadasBaseUrl}Historia_de_la_Iglesia_Era_de_la_Reforma.png`
            },
            {
                titulo: "La Necesidad del momento",
                autor: "Charles H. Spurgeon",
                descripcion: "Reflexiones espirituales sobre las necesidades del cristiano en tiempos difíciles.",
                categoria: "Devocional",
                año: 1887,
                destacado: true,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}La_Necesidad_del_momento.pdf`,
                portada: `${this.portadasBaseUrl}La_Necesidad_del_momento.jpg`
            },
            {
                titulo: "Confesión de Westminster",
                autor: "Asamblea de Westminster",
                descripcion: "Documento fundamental de la fe reformada y presbiteriana.",
                categoria: "Teología",
                año: 1646,
                destacado: true,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}Confesion_de_Westminster.pdf`,
                portada: `${this.portadasBaseUrl}Confesion_de_Westminster.png`
            },
            {
                titulo: "Nacido para multiplicarse",
                autor: "Dawson Trotman",
                descripcion: "Principios fundamentales del discipulado cristiano y la multiplicación espiritual.",
                categoria: "Discipulado",
                año: 1955,
                destacado: false,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}Nacido_para_multiplicarse.pdf`,
                portada: `${this.portadasBaseUrl}Nacido_para_multiplicarse.jpg`
            },
            {
                titulo: "El Arte de Aconsejar",
                autor: "Jay E. Adams",
                descripcion: "Guía práctica para el consejo bíblico y pastoral.",
                categoria: "Pastoral",
                año: 1986,
                destacado: false,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}El_Arte_de_Aconsejar.pdf`,
                portada: `${this.portadasBaseUrl}El_Arte_de_Aconsejar.png`
            },
            {
                titulo: "La Osa Mayor",
                autor: "Robert C. Sproul",
                descripcion: "Estudio sobre la soberanía de Dios y su impacto en la vida cristiana.",
                categoria: "Teología",
                año: 1993,
                destacado: false,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}La_Osa_Mayor.pdf`,
                portada: `${this.portadasBaseUrl}La_Osa_Mayor.jpg`
            },
            {
                titulo: "Como preparar y dirigir Estudios Bíblicos",
                autor: "James Braga",
                descripcion: "Manual práctico para la preparación y dirección de estudios bíblicos efectivos.",
                categoria: "Estudio Bíblico",
                año: 1967,
                destacado: false,
                estado: "Disponible",
                archivo: `${this.githubBaseUrl}Como_preparar_y_dirigir_Estudios_Biblicos.pdf`,
                portada: `${this.portadasBaseUrl}Como_preparar_y_dirigir_Estudios_Biblicos.png`
            }
        ];
    }

    // Renderizar eBooks en el DOM
    renderEbooks(ebooks, container) {
        if (!container) {
            container = document.getElementById('ebooks-list');
        }
        
        if (!container) {
            console.error('No se encontró el contenedor para eBooks');
            return;
        }

        container.innerHTML = '';
        
        if (!ebooks || ebooks.length === 0) {
            container.innerHTML = '<div class="no-ebooks">📚 No se encontraron eBooks disponibles</div>';
            return;
        }

        // Asegurar que el contenedor tenga la clase correcta
        container.className = 'ebooks-grid';

        ebooks.forEach(ebook => {
            const ebookCard = document.createElement('div');
            ebookCard.className = 'ebook-card animate-card';
            
            ebookCard.innerHTML = `
                <img src="${ebook.portada}" alt="Portada de ${ebook.titulo}" 
                     class="ebook-cover" 
                     onerror="this.src='${this.portadasBaseUrl}portada-generica.jpg'">
                     
                <div class="ebook-info">
                    <div class="ebook-category">${ebook.categoria || 'General'}</div>
                    <h3>${ebook.titulo}</h3>
                    <p class="ebook-author">${ebook.autor}</p>
                    <p class="ebook-desc">${ebook.descripcion || 'Descripción no disponible'}</p>
                    
                    <div class="ebook-meta">
                        ${ebook.año ? `<span class="ebook-year">📅 ${ebook.año}</span>` : ''}
                        <span class="ebook-status ${ebook.estado === 'Disponible' ? 'disponible' : 'no-disponible'}">
                            ${ebook.estado === 'Disponible' ? '✅ Disponible' : '⏳ Próximamente'}
                        </span>
                    </div>
                    
                    <div class="ebook-actions">
                        ${ebook.estado === 'Disponible' ? 
                            `<div class="action-buttons">
                                <a href="../page/ebook-viewer.html?pdf=${encodeURIComponent(ebook.archivo)}&title=${encodeURIComponent(ebook.titulo)}&author=${encodeURIComponent(ebook.autor)}" 
                                   class="btn-secondary ebook-preview-btn" 
                                   target="_blank" 
                                   rel="noopener noreferrer">
                                    <span class="preview-icon">👁️</span>
                                    Vista Previa
                                </a>
                                <a href="${ebook.archivo}" 
                                   target="_blank" 
                                   class="btn-primary ebook-download-btn" 
                                   rel="noopener noreferrer">
                                    <span class="download-icon">📥</span>
                                    Descargar PDF
                                </a>
                            </div>` : 
                            `<button class="btn-primary disabled" disabled>
                                <span class="download-icon">⏳</span>
                                Disponible próximamente
                            </button>`
                        }
                    </div>
                </div>
                
                ${ebook.destacado ? '<span class="ebook-badge destacado">⭐ Destacado</span>' : ''}
                ${ebook.estado !== 'Disponible' ? '<span class="ebook-badge proximamente">🔜 Próximamente</span>' : ''}
            `;
            
            container.appendChild(ebookCard);
        });

        // Agregar animaciones escalonadas
        const cards = container.querySelectorAll('.ebook-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// Exportar para uso global
window.EbooksManagerSimple = EbooksManagerSimple;
