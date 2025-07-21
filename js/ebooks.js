// js/ebooks.js
// Cambia la URL por la de tu backend seguro (Vercel/Netlify)
const ENDPOINT = 'http://localhost:3001/api/ebooks'; // <-- Apunta al backend local de Notion


let ebooksData = [];

async function fetchEbooks() {
  document.getElementById('ebooks-loading').style.display = 'block';
  document.getElementById('ebooks-list').innerHTML = '';
  const res = await fetch(ENDPOINT);
  const data = await res.json();
  document.getElementById('ebooks-loading').style.display = 'none';
  return data.results || [];
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

    container.innerHTML += `
      <div class="ebook-card">
        <img src="${portada}" alt="${title}" class="ebook-cover">
        <div class="ebook-info">
          <h3>${title}</h3>
          <p class="ebook-author">${autor}</p>
          <p class="ebook-desc">${descripcion}</p>
          <a href="${url}" class="btn btn-primary" target="_blank" rel="noopener">Descargar PDF</a>
        </div>
      </div>
    `;
  });
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
