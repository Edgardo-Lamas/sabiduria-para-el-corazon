# 🎬 Automatización del Video Destacado - YouTube Integration

## 📋 Guía de Implementación

Este sistema automatiza la actualización del "Video Destacado del Mes" en tu sitio web, obteniendo automáticamente el video más visto del mes anterior de tu canal de YouTube.

---

## 🚀 Pasos para Configuración

### **Paso 1: Obtener YouTube Data API Key**

1. **Ve a Google Cloud Console:**
   - Visita: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear/Seleccionar Proyecto:**
   - Crea un nuevo proyecto o selecciona uno existente
   - Nombre sugerido: "Sabiduria-YouTube-Integration"

3. **Habilitar YouTube Data API v3:**
   - Ve a "APIs & Services" > "Library"
   - Busca "YouTube Data API v3"
   - Haz clic en "Enable"

4. **Crear API Key:**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "API Key"
   - **¡GUARDA ESTA KEY!** La necesitarás después

5. **Restringir la API Key (Recomendado):**
   - Haz clic en tu API key para editarla
   - En "API restrictions", selecciona "YouTube Data API v3"
   - En "Website restrictions", añade tu dominio (ej: `tudominio.com/*`)

### **Paso 2: Configurar el Sistema**

1. **Editar el archivo de configuración:**
   ```javascript
   // En: js/youtube-auto-updater.js línea ~19
   apiKey: 'TU_API_KEY_AQUI', // Reemplazar con tu API key real
   ```

2. **Verificar Channel ID:**
   ```javascript
   channelId: 'UCQ4LzY6UyppxVddHx5f-ZnA', // Ya está configurado correctamente
   ```

### **Paso 3: Actualizar la Página de Videos**

Reemplaza la referencia al script en `Recursos/videos-youtube.html`:

```html
<!-- Cambiar esto: -->
<script src="../js/featured-video-manager.js"></script>

<!-- Por esto: -->
<script src="../js/youtube-auto-updater.js"></script>
```

---

## ⚙️ Configuración Avanzada

### **Personalizar Comportamiento:**

```javascript
window.youtubeUpdater = new YouTubeAutoUpdater({
    apiKey: 'TU_API_KEY_AQUI',
    
    // 🔄 Configuración de actualización
    autoUpdate: true,              // Actualización automática cada 24h
    updateOnPageLoad: true,        // Actualizar al cargar la página
    checkInterval: 24 * 60 * 60 * 1000, // 24 horas
    cacheExpiry: 6 * 60 * 60 * 1000,    // Cache válido por 6 horas
    
    // 🎯 Filtros de contenido
    minVideoLength: 300,           // Mínimo 5 minutos
    excludeShorts: true,           // Excluir YouTube Shorts
    excludeLiveStreams: true,      // Excluir transmisiones en vivo
    
    // 🛠️ Debug
    debug: true                    // Ver logs en consola del navegador
});
```

---

## 🎯 Cómo Funciona

1. **Automático:** Cada 24 horas busca el video más visto del mes anterior
2. **Cache inteligente:** Guarda los datos localmente para evitar llamadas excesivas a la API
3. **Fallback:** Si no puede conectar con la API, usa datos predeterminados
4. **Filtros:** Excluye automáticamente Shorts y videos muy cortos
5. **Actualización UI:** Cambia título, descripción, views, duración, etc.

---

## 🧪 Testing

### **Probar la Configuración:**

1. **Abrir Consola del Navegador:** (F12 > Console)
2. **Buscar mensajes:** Deberías ver logs como:
   ```
   [YouTube Auto-Updater] 🎬 Inicializando...
   [YouTube Auto-Updater] ✅ Sistema inicializado correctamente
   [YouTube Auto-Updater] 📊 Obteniendo video más visto...
   ```

3. **Probar manualmente:**
   ```javascript
   // En consola del navegador:
   youtubeUpdater.updateFeaturedVideo();
   ```

### **Verificar Datos:**
```javascript
// Ver datos del cache actual:
console.log(youtubeUpdater.cache);

// Ver configuración:
console.log(youtubeUpdater.config);
```

---

## 🚨 Solución de Problemas

### **Error: "API Error: 403"**
- ✅ Verifica que la API key esté correcta
- ✅ Confirma que YouTube Data API v3 esté habilitada
- ✅ Revisa las restricciones de la API key

### **Error: "No se encontraron videos del mes anterior"**
- ℹ️ Normal si es principio de mes o canal nuevo
- ✅ El sistema usará datos de fallback automáticamente

### **No se actualiza automáticamente:**
- ✅ Verifica que `autoUpdate: true`
- ✅ Espera 24 horas o ejecuta manualmente
- ✅ Revisa la consola por errores

### **Cache persistente:**
```javascript
// Limpiar cache manualmente:
localStorage.removeItem('featuredVideoCache');
location.reload();
```

---

## 💰 Costos de la API

- **YouTube Data API v3:** GRATUITA
- **Cuota diaria:** 10,000 unidades
- **Este script usa ~15 unidades por actualización**
- **Suficiente para ~650 actualizaciones diarias**

---

## 🔄 Opciones de Actualización

### **1. Completamente Automática** (Recomendada)
- Se actualiza sola cada 24 horas
- Funciona en el navegador del usuario
- Usa cache para optimizar

### **2. Semi-automática con GitHub Actions**
- Se ejecuta en el servidor de GitHub
- Actualiza el archivo HTML directamente
- Más confiable pero requiere más configuración

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica la configuración de la API key
3. Comprueba que el Channel ID sea correcto
4. Consulta los logs del sistema

---

## ✅ Checklist de Implementación

- [ ] Obtener YouTube Data API Key
- [ ] Configurar API key en el código
- [ ] Actualizar referencia del script en HTML
- [ ] Probar en navegador
- [ ] Verificar logs en consola
- [ ] Confirmar actualización automática

¡Una vez completado, tu video destacado se actualizará automáticamente! 🎉
