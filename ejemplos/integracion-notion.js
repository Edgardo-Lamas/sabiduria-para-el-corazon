// INTEGRACIÓN CON NOTION
// Objetivo: Usar Notion como CMS para artículos y estudios bíblicos

class NotionCMS {
    constructor() {
        this.token = 'secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        this.baseUrl = 'https://api.notion.com/v1';
        this.databases = {
            articulos: '12345678-1234-1234-1234-123456789abc',
            estudios: '87654321-4321-4321-4321-cba987654321',
            series: 'abcdef12-3456-7890-abcd-ef1234567890'
        };
        this.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28'
        };
    }

    // EJEMPLO 1: Cargar artículos desde Notion
    async loadArticles(limit = 10) {
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databases.articulos}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'Estado',
                        select: {
                            equals: 'Publicado'
                        }
                    },
                    sorts: [
                        {
                            property: 'Fecha_Publicacion',
                            direction: 'descending'
                        }
                    ],
                    page_size: limit
                })
            });
            
            const data = await response.json();
            this.displayArticles(data.results);
            
        } catch (error) {
            console.error('Error cargando artículos de Notion:', error);
        }
    }

    displayArticles(articles) {
        // Crear sección de artículos si no existe
        let articlesSection = document.querySelector('.notion-articles');
        if (!articlesSection) {
            articlesSection = document.createElement('section');
            articlesSection.className = 'notion-articles';
            
            // Insertar después de la sección central
            const centralSection = document.querySelector('.central');
            centralSection.insertAdjacentElement('afterend', articlesSection);
        }
        
        articlesSection.innerHTML = `
            <div class="container">
                <h2>📖 Artículos Recientes</h2>
                <div class="articles-grid">
                    ${articles.map(article => this.createArticleCard(article)).join('')}
                </div>
                <div class="see-more">
                    <a href="./Recursos/articulos.html">Ver todos los artículos →</a>
                </div>
            </div>
        `;
    }

    createArticleCard(article) {
        const properties = article.properties;
        const title = properties.Titulo?.title[0]?.plain_text || 'Sin título';
        const author = properties.Autor?.rich_text[0]?.plain_text || 'Anónimo';
        const excerpt = properties.Resumen?.rich_text[0]?.plain_text || '';
        const category = properties.Categoria?.select?.name || 'General';
        const publishDate = properties.Fecha_Publicacion?.date?.start || '';
        const cover = properties.Portada?.files[0]?.file?.url || properties.Portada?.files[0]?.external?.url;
        
        return `
            <article class="article-card" data-category="${category}">
                ${cover ? `<div class="article-image">
                    <img src="${cover}" alt="${title}" loading="lazy">
                </div>` : ''}
                <div class="article-content">
                    <div class="article-meta">
                        <span class="category">${category}</span>
                        <span class="date">${this.formatDate(publishDate)}</span>
                    </div>
                    <h3>${title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-footer">
                        <span class="author">Por: ${author}</span>
                        <button onclick="notionCMS.readArticle('${article.id}')" class="btn-read">
                            Leer más →
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    // EJEMPLO 2: Leer artículo completo
    async readArticle(articleId) {
        try {
            // Obtener contenido completo del artículo
            const [pageResponse, blocksResponse] = await Promise.all([
                fetch(`${this.baseUrl}/pages/${articleId}`, { headers: this.headers }),
                fetch(`${this.baseUrl}/blocks/${articleId}/children`, { headers: this.headers })
            ]);
            
            const page = await pageResponse.json();
            const blocks = await blocksResponse.json();
            
            this.displayArticleModal(page, blocks.results);
            
        } catch (error) {
            console.error('Error cargando artículo completo:', error);
        }
    }

    displayArticleModal(page, blocks) {
        const properties = page.properties;
        const title = properties.Titulo?.title[0]?.plain_text || 'Sin título';
        const author = properties.Autor?.rich_text[0]?.plain_text || 'Anónimo';
        const publishDate = properties.Fecha_Publicacion?.date?.start || '';
        
        const modal = document.createElement('div');
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h1>${title}</h1>
                    <div class="article-meta">
                        <span>Por: ${author}</span>
                        <span>${this.formatDate(publishDate)}</span>
                    </div>
                    <button onclick="closeArticleModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="article-content">
                        ${this.renderBlocks(blocks)}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="article-actions">
                        <button onclick="shareArticle('${title}', window.location.href)" class="btn-share">
                            📤 Compartir
                        </button>
                        <button onclick="printArticle()" class="btn-print">
                            🖨️ Imprimir
                        </button>
                        <button onclick="downloadArticlePDF('${title}')" class="btn-download">
                            📄 Descargar PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // EJEMPLO 3: Sistema de estudios bíblicos seriados
    async loadBibleStudySeries() {
        try {
            const response = await fetch(`${this.baseUrl}/databases/${this.databases.series}/query`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    filter: {
                        property: 'Activa',
                        checkbox: {
                            equals: true
                        }
                    },
                    sorts: [
                        {
                            property: 'Orden',
                            direction: 'ascending'
                        }
                    ]
                })
            });
            
            const data = await response.json();
            this.displayStudySeries(data.results);
            
        } catch (error) {
            console.error('Error cargando series de estudio:', error);
        }
    }

    displayStudySeries(series) {
        const studySection = document.createElement('section');
        studySection.className = 'bible-study-series';
        studySection.innerHTML = `
            <div class="container">
                <h2>📚 Series de Estudio Bíblico</h2>
                <div class="series-grid">
                    ${series.map(serie => this.createSeriesCard(serie)).join('')}
                </div>
            </div>
        `;
        
        // Insertar en la página de recursos
        const resourcesSection = document.querySelector('.recursos-main');
        if (resourcesSection) {
            resourcesSection.appendChild(studySection);
        }
    }

    createSeriesCard(serie) {
        const properties = serie.properties;
        const title = properties.Titulo?.title[0]?.plain_text || 'Sin título';
        const description = properties.Descripcion?.rich_text[0]?.plain_text || '';
        const totalLessons = properties.Total_Lecciones?.number || 0;
        const progress = properties.Progreso?.number || 0;
        const cover = properties.Portada?.files[0]?.file?.url || properties.Portada?.files[0]?.external?.url;
        
        return `
            <div class="series-card" onclick="notionCMS.openSeries('${serie.id}')">
                ${cover ? `<div class="series-image">
                    <img src="${cover}" alt="${title}" loading="lazy">
                </div>` : ''}
                <div class="series-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="series-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(progress/totalLessons)*100}%"></div>
                        </div>
                        <span>${progress}/${totalLessons} lecciones</span>
                    </div>
                    <button class="btn-start">
                        ${progress > 0 ? 'Continuar' : 'Comenzar'} →
                    </button>
                </div>
            </div>
        `;
    }

    // UTILIDADES
    renderBlocks(blocks) {
        return blocks.map(block => {
            switch (block.type) {
                case 'paragraph':
                    return `<p>${this.renderRichText(block.paragraph.rich_text)}</p>`;
                case 'heading_1':
                    return `<h1>${this.renderRichText(block.heading_1.rich_text)}</h1>`;
                case 'heading_2':
                    return `<h2>${this.renderRichText(block.heading_2.rich_text)}</h2>`;
                case 'heading_3':
                    return `<h3>${this.renderRichText(block.heading_3.rich_text)}</h3>`;
                case 'bulleted_list_item':
                    return `<li>${this.renderRichText(block.bulleted_list_item.rich_text)}</li>`;
                case 'numbered_list_item':
                    return `<li>${this.renderRichText(block.numbered_list_item.rich_text)}</li>`;
                case 'quote':
                    return `<blockquote>${this.renderRichText(block.quote.rich_text)}</blockquote>`;
                case 'image':
                    const imageUrl = block.image.file?.url || block.image.external?.url;
                    return `<img src="${imageUrl}" alt="Imagen del artículo" style="max-width: 100%; height: auto;">`;
                default:
                    return '';
            }
        }).join('');
    }

    renderRichText(richText) {
        return richText.map(text => {
            let content = text.plain_text;
            
            if (text.annotations.bold) content = `<strong>${content}</strong>`;
            if (text.annotations.italic) content = `<em>${content}</em>`;
            if (text.annotations.strikethrough) content = `<del>${content}</del>`;
            if (text.annotations.underline) content = `<u>${content}</u>`;
            if (text.annotations.code) content = `<code>${content}</code>`;
            if (text.href) content = `<a href="${text.href}" target="_blank">${content}</a>`;
            
            return content;
        }).join('');
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
}

// FUNCIONES GLOBALES
function closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function shareArticle(title, url) {
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

function printArticle() {
    window.print();
}

function downloadArticlePDF(title) {
    // Implementar generación de PDF con bibliotecas como jsPDF
    alert('Función de descarga PDF en desarrollo');
}

// INICIALIZACIÓN
const notionCMS = new NotionCMS();

document.addEventListener('DOMContentLoaded', () => {
    notionCMS.loadArticles(6);
    notionCMS.loadBibleStudySeries();
});

export { NotionCMS };
