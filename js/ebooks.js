// Sistema híbrido: usar EbooksManager
let ebooksData = [];
let ebooksManager;

// Función para renderizar eBooks
function renderEbooks(ebooks = ebooksData) {
    const container = document.getElementById('ebooks-list');
    if (!ebooks.length) {
        container.innerHTML = '<p>No hay eBooks disponibles.</p>';
        return;
    }
    container.innerHTML = '';
    ebooks.forEach(ebook => {
        // Determinar si mostrar el estado
        const estadoHtml = ebook.estado && ebook.estado !== 'Disponible' 
            ? `<span class="estado-badge">${ebook.estado}</span>` 
            : '';
        
        // Determinar texto del botón
        const btnText = ebook.estado === 'Disponible próximamente' ? 'Próximamente' : 'Descargar PDF';
        const btnDisabled = ebook.estado === 'Disponible próximamente' ? 'disabled' : '';
        
        container.innerHTML += `
            <div class="ebook-card">
                <div class="ebook-img-wrap">
                    <img src="${ebook.portada}" alt="${ebook.titulo}" class="ebook-cover" loading="lazy">
                    ${ebook.destacado ? '<span class="badge-featured">Destacado</span>' : ''}
                    ${estadoHtml}
                </div>
                <div class="ebook-info">
                    <h3>${ebook.titulo}</h3>
                    <p class="ebook-author">${ebook.autor}</p>
                    <p class="ebook-desc">${ebook.descripcion}</p>
                    <div class="ebook-meta">
                        <span class="ebook-category">${ebook.categoria}</span>
                        <span class="ebook-year">${ebook.año}</span>
                    </div>
                    <a href="${ebook.archivo}" class="btn btn-primary ${btnDisabled}" 
                       ${ebook.estado === 'Disponible' ? 'target="_blank" rel="noopener"' : ''}>
                        ${btnText}
                    </a>
                </div>
            </div>
        `;
    });
    
    // Animación de fade-in para las cards
    animateCards();
}

// Animación de fade-in para las cards al renderizar
function animateCards() {
    const cards = document.querySelectorAll('.ebook-card');
    cards.forEach((card, i) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(40px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.7s cubic-bezier(.77,0,.18,1), transform 0.7s cubic-bezier(.77,0,.18,1)';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 100 + i * 80);
    });
}

function searchEbooks(term) {
    term = term.trim().toLowerCase();
    if (!term) {
        renderEbooks(ebooksData);
        return;
    }
    const filtered = ebooksData.filter(ebook => {
        const title = ebook.titulo?.toLowerCase() || '';
        const autor = ebook.autor?.toLowerCase() || '';
        const descripcion = ebook.descripcion?.toLowerCase() || '';
        return title.includes(term) || autor.includes(term) || descripcion.includes(term);
    });
    renderEbooks(filtered);
}

// Inicialización usando el sistema híbrido
document.addEventListener('DOMContentLoaded', async () => {
    // Crear instancia del manager híbrido
    ebooksManager = new EbooksManager();
    
    try {
        // Cargar eBooks (Notion + GitHub)
        ebooksData = await ebooksManager.loadEbooks();
        
        // Verificar disponibilidad de PDFs y actualizar estados
        ebooksData = await ebooksManager.updateEbookAvailability(ebooksData);
        
        // Renderizar
        renderEbooks(ebooksData);
        
        console.log('✅ Sistema híbrido eBooks inicializado');
    } catch (error) {
        console.error('Error inicializando eBooks:', error);
        // Mostrar mensaje de error
        const container = document.getElementById('ebooks-list');
        if (container) {
            container.innerHTML = '<p>Error al cargar los eBooks. Por favor, recarga la página.</p>';
        }
    }

    // Eventos de búsqueda
    const searchBtn = document.getElementById('ebooks-search-btn');
    const searchInput = document.getElementById('ebooks-search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const term = searchInput.value;
            searchEbooks(term);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                searchEbooks(e.target.value);
            }
        });
    }
});
