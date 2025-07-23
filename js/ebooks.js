
// URL pública del backend en la nube (Vercel/Netlify/Render)
// Cambia SOLO esta variable cuando tengas la URL de tu backend desplegado (ejemplo: https://notion-backend-tunombre.vercel.app/api/ebooks)
const ENDPOINT = 'https://tu-backend.vercel.app/api/ebooks';

// Fallback de eBooks estáticos: si el backend no responde, siempre se mostrará al menos este libro
const FALLBACK_EBOOKS = [
  {
    properties: {
      Título: { title: [{ plain_text: 'Comentario Expositivo' }] },
      Autor: { rich_text: [{ plain_text: 'Dr. John MacArthur' }] },
      Descripción: { rich_text: [{ plain_text: 'Estudio profundo de las Escrituras con aplicación práctica.' }] },
      PDF: { files: [{ file: { url: 'https://sabiduriaparaelcorazon.github.io/ebooks/comentario-expositivo.pdf' } }] },
      Portada: { files: [{ file: { url: '../img/bosquejos.jpg' } }] },
      "Fecha de publicación": { date: { start: '2025-01-01' } }
    }
  }
];

let ebooksData = [];

async function fetchEbooks() {
  document.getElementById('ebooks-loading').style.display = 'block';
  document.getElementById('ebooks-list').innerHTML = '';
  try {
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error('API no disponible');
    const data = await res.json();
    document.getElementById('ebooks-loading').style.display = 'none';
    return data.results && data.results.length ? data.results : FALLBACK_EBOOKS;
  } catch (e) {
    document.getElementById('ebooks-loading').style.display = 'none';
    // Fallback a datos estáticos
    return FALLBACK_EBOOKS;
  }
}

function renderEbooks(ebooks) {
  const container = document.getElementById('ebooks-list');
  if (!ebooks.length) {
    container.innerHTML = '<p>No hay eBooks disponibles.</p>';
    return;
  }
  container.innerHTML = '';
  ebooks.forEach(page => {
    const props = page.properties;
    const title = props.Título?.title?.[0]?.plain_text || 'Sin título';
    const autor = props.Autor?.rich_text?.[0]?.plain_text || 'Desconocido';
    const descripcion = props.Descripción?.rich_text?.[0]?.plain_text || '';
    const url = props.PDF?.files?.[0]?.file?.url || props.PDF?.files?.[0]?.external?.url || '#';
    const portada = props.Portada?.files?.[0]?.file?.url || props.Portada?.files?.[0]?.external?.url || '../img/bosquejos.jpg';
    // Badge si es reciente (ejemplo: si fue creado en los últimos 30 días)
    let badge = '';
    if (props["Fecha de publicación"] && props["Fecha de publicación"].date) {
      const pubDate = new Date(props["Fecha de publicación"].date.start);
      const now = new Date();
      const diff = (now - pubDate) / (1000 * 60 * 60 * 24);
      if (diff < 30) badge = '<span class="badge-new">Nuevo</span>';
    }
    container.innerHTML += `
      <div class="ebook-card">
        <div class="ebook-img-wrap">
          <img src="${portada}" alt="${title}" class="ebook-cover" loading="lazy">
          ${badge}
        </div>
        <div class="ebook-info">
          <h3>${title}</h3>
          <p class="ebook-author">${autor}</p>
          <p class="ebook-desc">${descripcion}</p>
          <a href="${url}" class="btn btn-primary" target="_blank" rel="noopener">Descargar PDF</a>
        </div>
      </div>
    `;
  });
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

// Llamar animación después de renderizar
const oldRenderEbooks = renderEbooks;
renderEbooks = function(ebooks) {
  oldRenderEbooks(ebooks);
  animateCards();
}
}

function searchEbooks(term) {
  term = term.trim().toLowerCase();
  if (!term) {
    renderEbooks(ebooksData);
    return;
  }
  const filtered = ebooksData.filter(page => {
    const props = page.properties;
    const title = props.Título?.title?.[0]?.plain_text?.toLowerCase() || '';
    const autor = props.Autor?.rich_text?.[0]?.plain_text?.toLowerCase() || '';
    const descripcion = props.Descripción?.rich_text?.[0]?.plain_text?.toLowerCase() || '';
    return title.includes(term) || autor.includes(term) || descripcion.includes(term);
  });
  renderEbooks(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchEbooks().then(data => {
    ebooksData = data;
    renderEbooks(ebooksData);
  }).catch(() => {
    document.getElementById('ebooks-loading').style.display = 'none';
    document.getElementById('ebooks-list').innerHTML = '<p>Error al cargar los eBooks.</p>';
  });

  document.getElementById('ebooks-search-btn').addEventListener('click', () => {
    const term = document.getElementById('ebooks-search-input').value;
    searchEbooks(term);
  });
  document.getElementById('ebooks-search-input').addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      searchEbooks(e.target.value);
    }
  });
});
