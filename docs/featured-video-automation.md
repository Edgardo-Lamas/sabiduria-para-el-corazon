# Configuración del Sistema de Video Destacado Automático

## 📋 Resumen
Este sistema automatiza la selección y actualización del "Video Destacado del Mes" en la página de videos de YouTube.

## ⚙️ Funcionalidades Implementadas

### ✅ Características Actuales:
- **Eliminación de duplicación**: Se removió la información estadística duplicada del hero section
- **Contenido descriptivo**: Se reemplazó con información detallada del video destacado
- **Design responsivo**: Adaptado para móviles y desktop
- **Enlaces funcionales**: Botones que dirigen al video específico y al canal

### 🤖 Sistema de Automatización:

#### **1. Featured Video Manager (`featured-video-manager.js`)**
- Gestiona automáticamente la actualización del video destacado
- Utiliza YouTube Data API v3 para obtener estadísticas reales
- Sistema de fallback con datos locales cuando no hay conexión a la API

#### **2. Funcionalidades de Automatización:**
- **Actualización periódica**: Cada 24 horas revisa si hay un nuevo video más visto
- **Video del mes anterior**: Identifica automáticamente el video más popular del mes previo
- **Extracción de datos**: Obtiene título, descripción, fecha, duración, vistas, etc.
- **Actualización del HTML**: Modifica automáticamente todo el contenido visible

## 🔧 Configuración para Automatización Completa

### **Paso 1: Obtener API Key de YouTube**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "YouTube Data API v3"
4. Crea una API key
5. Reemplaza `YOUR_YOUTUBE_API_KEY` en el archivo `featured-video-manager.js`

### **Paso 2: Configurar el Script**
```javascript
this.apiConfig = {
    apiKey: 'TU_API_KEY_AQUI', // Reemplazar con tu API key real
    channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA', // ID de tu canal
    maxResults: 50
};
```

### **Paso 3: Personalización de Datos de Respaldo**
Modifica `featuredVideoData` en `featured-video-manager.js` con información predeterminada:

```javascript
this.featuredVideoData = {
    videoId: 'ID_DEL_VIDEO',
    title: 'Título del Video',
    description: 'Descripción del video...',
    publishDate: '2025-07-15',
    duration: '28:45',
    viewCount: 1247,
    topics: [
        'Tema 1',
        'Tema 2',
        'Tema 3',
        'Tema 4'
    ]
};
```

## 🚀 Uso del Sistema

### **Automático:**
- El sistema se ejecuta automáticamente al cargar la página
- Se actualiza cada 24 horas
- Guarda el estado en localStorage del navegador

### **Manual (Para Administradores):**
1. Agregar `?admin=true` a la URL: `videos-youtube.html?admin=true`
2. Aparecerá un botón "🔄 Actualizar Video Destacado" en la esquina superior derecha
3. Hacer clic para forzar una actualización inmediata

### **Programático:**
```javascript
// Acceso al manager desde la consola del navegador
await window.featuredVideoManager.forceUpdate();
```

## 📊 Datos que se Actualizan Automáticamente

1. **Badge del mes**: "Más Visto de [Mes] [Año]"
2. **Título del video**
3. **Fecha de publicación**
4. **Número de visualizaciones**
5. **Duración del video**
6. **Descripción del video**
7. **Temas principales extraídos**
8. **Enlaces al video**
9. **Iframe embebido**

## 🎯 Ventajas del Sistema

### **Para los Usuarios:**
- Contenido siempre relevante y actualizado
- Información detallada del video destacado
- Eliminación de información redundante
- Mejor experiencia de navegación

### **Para los Administradores:**
- Actualización automática sin intervención manual
- Sistema de respaldo robusto
- Configuración flexible
- Monitoreo y control desde la consola del navegador

## 🔍 Monitoreo y Mantenimiento

### **Logs en Consola:**
- `"Actualizando video destacado..."` - Cuando se ejecuta una actualización
- `"Video destacado actualizado recientemente"` - Cuando no necesita actualización
- Errores de conexión y fallbacks

### **Estado del Sistema:**
```javascript
// Verificar última actualización
console.log(localStorage.getItem('featuredVideoLastUpdate'));

// Forzar actualización
await window.featuredVideoManager.forceUpdate();

// Verificar configuración
console.log(window.featuredVideoManager.apiConfig);
```

## ⚠️ Consideraciones Importantes

1. **Cuota de API**: YouTube Data API tiene límites diarios (10,000 unidades/día por defecto)
2. **Fallback**: Sin API key, funciona con datos predeterminados
3. **Privacidad**: No recopila datos del usuario, solo consulta APIs públicas
4. **Rendimiento**: Las consultas se cachean por 24 horas para optimizar

## 🔮 Futuras Mejoras Posibles

1. **Integración con CMS**: Permitir edición desde panel de administración
2. **Múltiples videos destacados**: Rotar entre varios videos populares
3. **Análisis avanzado**: Métricas de engagement y tendencias
4. **Personalización por usuario**: Recomendaciones basadas en historial
5. **Integración con redes sociales**: Compartir automáticamente videos destacados

## 📞 Soporte Técnico

Para implementar la automatización completa, necesitarás:
- Configurar la API key de YouTube
- Verificar permisos de CORS si es necesario
- Probar el sistema en producción

El sistema está diseñado para funcionar de manera independiente una vez configurado correctamente.
