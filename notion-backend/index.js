// Backend Express para servir eBooks desde Notion
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

app.get('/api/ebooks', async (req, res) => {
  try {
    const response = await fetch('https://api.notion.com/v1/databases/' + DATABASE_ID + '/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 100 })
    });
    const data = await response.json();
    // Ajusta el mapeo según tu estructura de Notion
    const ebooks = data.results.map(page => ({
      id: page.id,
      title: page.properties.Título?.title[0]?.plain_text || '',
      author: page.properties.Autor?.rich_text[0]?.plain_text || '',
      url: page.properties.URL?.url || '',
      cover: page.cover?.external?.url || '',
      description: page.properties.Descripción?.rich_text[0]?.plain_text || ''
    }));
    res.json(ebooks);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar Notion', details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Servidor backend Notion escuchando en puerto', port));
