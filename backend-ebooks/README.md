# Backend eBooks para Sabiduría para el Corazón

Este backend expone los eBooks almacenados en una base de datos de Notion a través de un endpoint seguro para ser consumido por el frontend.

## ¿Cómo usar?

1. **Clona o copia esta carpeta a tu entorno local o de despliegue (Vercel, Netlify, etc).**
2. **Copia el archivo `.env.example` a `.env` y completa tus datos:**
   - `NOTION_TOKEN`: Tu token de integración de Notion (privado)
   - `NOTION_DATABASE_ID`: El ID de tu base de datos de eBooks en Notion
   - `PORT`: Puerto local (opcional, por defecto 3001)

3. **Instala las dependencias:**
   ```bash
   npm install
   ```

4. **Inicia el servidor localmente:**
   ```bash
   npm start
   ```

5. **Endpoint disponible:**
   - `GET /api/ebooks` → Devuelve los eBooks en formato JSON

6. **Despliega en Vercel, Netlify, Render, etc.**
   - Configura las variables de entorno en el panel del proveedor.

## Seguridad
- Nunca expongas tu token de Notion en el frontend.
- Este backend es el único que debe tener acceso a tu token.

## Ejemplo de respuesta
```json
{
  "results": [
    {
      "object": "page",
      "id": "...",
      "properties": {
        "Título": { ... },
        "Autor": { ... },
        "PDF": { ... },
        "Portada": { ... },
        ...
      }
    },
    ...
  ]
}
```
