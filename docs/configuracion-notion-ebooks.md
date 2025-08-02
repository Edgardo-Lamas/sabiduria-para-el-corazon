# 📖 Configuración de Notion para eBooks

## 1. Crear Integration Token

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Haz clic en "**+ New integration**"
3. Completa los datos:
   - **Name**: Sabiduría para el Corazón - eBooks
   - **Logo**: (opcional)
   - **Associated workspace**: Tu workspace de Notion
4. En **Capabilities**, asegúrate de marcar:
   - ✅ **Read content**
   - ✅ **No user information**
5. Haz clic en "**Submit**"
6. **Copia el Internal Integration Token** (empieza con `secret_`)

## 2. Obtener Database ID

1. Abre tu base de datos de eBooks en Notion
2. En la URL verás algo como: `https://notion.so/workspace/DATABASE_ID?v=...`
3. **Copia el DATABASE_ID** (es el código después del último `/` y antes del `?`)

## 3. Compartir Database con Integration

1. En tu base de datos de eBooks, haz clic en **"Share"** (esquina superior derecha)
2. Haz clic en **"Invite"**
3. Busca y selecciona tu integration: **"Sabiduría para el Corazón - eBooks"**
4. Asegúrate de darle permisos de **"Can view"**

## 4. Estructura Requerida de la Database

Tu base de datos de Notion debe tener estos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Título** | Title | Nombre del eBook |
| **Autor** | Rich text | Autor del libro |
| **Descripción** | Rich text | Descripción del contenido |
| **Categoría** | Select | Tipo: Teología, Biografía, etc. |
| **Estado** | Select | Disponible, Próximamente, etc. |
| **PDF** | Files & media | Archivo PDF del eBook |
| **Portada** | Files & media | Imagen de portada |
| **Fecha de publicación** | Date | Para ordenar por fecha |
| **Activo** | Checkbox | ✅ = Se muestra en web |

## 5. Configurar en el código

Una vez que tengas los datos, reemplaza en `Recursos/ebooks.html`:

```javascript
window.NOTION_CONFIG = {
    token: 'secret_TU_TOKEN_AQUI',  // Tu Integration Token
    ebooksDatabase: 'TU_DATABASE_ID_AQUI', // Tu Database ID
    baseUrl: 'https://api.notion.com/v1/'
};
```

## ✅ Verificación

Si todo está configurado correctamente, deberías ver en la consola del navegador:
- ✅ eBooks cargados desde Notion: X libros
- Los eBooks aparecerán automáticamente en la página

## 🚨 Problemas Comunes

- **Error 401**: Token incorrecto o Integration no tiene permisos
- **Error 404**: Database ID incorrecto 
- **No aparecen eBooks**: Verificar que el campo "Activo" esté marcado
- **CORS Error**: Esto es normal, necesitarás un proxy o servidor backend para producción

## 🔒 Seguridad

**⚠️ IMPORTANTE**: El token de Notion quedará visible en el código del frontend. Para producción, considera:
1. Usar variables de entorno
2. Crear un backend que haga las llamadas a Notion
3. Implementar un proxy/serverless function
