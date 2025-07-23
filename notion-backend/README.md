# Backend Notion eBooks

Este backend expone `/api/ebooks` y consulta una base de datos de Notion para servir los eBooks a tu web.

## Despliegue rápido

1. Sube esta carpeta a un repositorio de GitHub.
2. Despliega en Vercel, Netlify, Render o Railway.
3. Configura las variables de entorno:
   - `NOTION_TOKEN` (token de integración de Notion)
   - `NOTION_DATABASE_ID` (ID de la base de datos de eBooks)
4. Obtén la URL pública de `/api/ebooks` y pégala en tu frontend.

## Variables de entorno

- `NOTION_TOKEN`: Token de integración de Notion (se obtiene en https://www.notion.so/my-integrations)
- `NOTION_DATABASE_ID`: ID de la base de datos de eBooks (copiar desde la URL de Notion)

## Ejemplo de respuesta

```json
[
  {
    "id": "...",
    "title": "Título del libro",
    "author": "Autor",
    "url": "https://...",
    "cover": "https://...",
    "description": "Descripción corta"
  }
]
```

## Soporte

Si necesitas ayuda, consulta el README o contacta a tu desarrollador.
