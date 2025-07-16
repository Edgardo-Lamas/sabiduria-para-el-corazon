# 🚀 GUÍA COMPLETA: IMPLEMENTAR AIRTABLE EN TU SITIO BÍBLICO

## ¿QUE TIENES AHORA LISTO?

Tu sitio ya está **100% preparado** para conectarse con Airtable. Todo el código está creado y funcionando. Solo necesitas:

1. ✅ **Código JavaScript completo** (`airtable-integration.js`)
2. ✅ **Estructura HTML modificada** (index.html con contenedores dinámicos)
3. ✅ **Sistema de estadísticas** (tracking de descargas y reproducciones)
4. ✅ **Funciones de compartir y copiar**

## PASO 1: CREAR TU CUENTA AIRTABLE

### 1.1 Registro (GRATIS)
- Ve a: https://airtable.com
- Haz clic en "Sign up for free"
- Usa tu email del ministerio
- Plan gratuito incluye: 1,200 registros por base (suficiente para empezar)

### 1.2 Crear tu primera "Base" (como una hoja de cálculo mejorada)
- Clic en "Create a base"
- Selecciona "Start from scratch"
- Nómbrala: **"Sabiduría para el Corazón - Contenido"**

## PASO 2: CREAR LAS TABLAS (EXACTAS)

Tu base necesita estas 4 tablas:

### TABLA 1: "AUDIOS_SERMONES"
```
Campos a crear:
├── Titulo (Single line text)
├── Predicador (Single line text)  
├── Descripcion (Long text)
├── Archivo_Audio (Attachment - permitir solo 1 archivo)
├── Imagen_Miniatura (Attachment - permitir solo 1 archivo)
├── Serie (Single line text)
├── Fecha_Predicacion (Date)
├── Duracion (Single line text) - ej: "25:30"
├── Destacado (Checkbox) - marca TRUE para el mensaje principal
├── Descargas (Number)
├── Categoria (Single select: Doctrina, Vida Cristiana, Evangelismo, Familia)
└── Estado (Single select: Activo, Borrador, Archivado)
```

### TABLA 2: "VERSICULO_DIARIO"
```
Campos a crear:
├── Texto (Long text)
├── Referencia (Single line text) - ej: "Juan 3:16"
├── Dia_Del_Ano (Number) - del 1 al 365
├── Categoria (Single select: Esperanza, Fe, Amor, Salvación, Oración)
├── Libro_Biblico (Single line text)
└── Activo (Checkbox)
```

### TABLA 3: "EVENTOS_HORARIOS"
```
Campos a crear:
├── Nombre_Evento (Single line text)
├── Dia_Semana (Single select: Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado)
├── Hora_Inicio (Single line text) - ej: "10:00"
├── Hora_Fin (Single line text) - ej: "12:00"
├── Ubicacion (Single line text)
├── Descripcion (Long text)
├── Responsable (Single line text)
├── Activo (Checkbox)
└── Categoria (Single select: Culto, Estudio, Ministerio, Actividad)
```

### TABLA 4: "ESTADISTICAS_DESCARGAS"
```
Campos a crear:
├── Fecha (Date)
├── Archivo_Descargado (Single line text)
├── Tipo_Accion (Single select: download, play, view)
├── IP_Usuario (Single line text)
├── Navegador (Single line text)
├── Pais (Single line text)
└── Hora (Created time)
```

## PASO 3: CARGAR CONTENIDO DE EJEMPLO

### En "AUDIOS_SERMONES":
```
Registro 1:
- Titulo: "El amor de Dios en Cristo"
- Predicador: "Pastor Juan"
- Descripcion: "Un mensaje sobre el amor incondicional de Dios"
- Destacado: ✓ (marcado)
- Serie: "Fundamentos de la Fe"
- Duracion: "35:20"
- Categoria: "Doctrina"
- Estado: "Activo"
- Sube tu archivo de audio actual
```

### En "VERSICULO_DIARIO":
```
Registro 1:
- Texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."
- Referencia: "Juan 3:16"
- Dia_Del_Ano: 1
- Categoria: "Salvación"
- Activo: ✓

Registro 2:
- Texto: "El Señor es mi pastor; nada me faltará."
- Referencia: "Salmo 23:1"
- Dia_Del_Ano: 2
- Categoria: "Fe"
- Activo: ✓
```

### En "EVENTOS_HORARIOS":
```
Registro 1:
- Nombre_Evento: "Culto de Adoración"
- Dia_Semana: "Domingo"
- Hora_Inicio: "10:00"
- Hora_Fin: "12:00"
- Ubicacion: "Templo Principal"
- Descripcion: "Tiempo de adoración y predicación"
- Activo: ✓
- Categoria: "Culto"

Registro 2:
- Nombre_Evento: "Estudio Bíblico"
- Dia_Semana: "Miércoles"
- Hora_Inicio: "19:30"
- Hora_Fin: "21:00"
- Ubicacion: "Sala de Reuniones"
- Descripcion: "Estudio profundo de la Palabra"
- Activo: ✓
- Categoria: "Estudio"
```

## PASO 4: OBTENER TUS CREDENCIALES

### 4.1 API Key (tu clave secreta)
1. Ve a: https://airtable.com/account
2. Sección "API" 
3. Clic en "Generate API key"
4. **Copia esta clave** (la necesitarás en el código)

### 4.2 Base ID (identificador de tu base)
1. Ve a: https://airtable.com/api
2. Selecciona tu base "Sabiduría para el Corazón - Contenido"
3. En la URL verás algo como: `https://airtable.com/appXXXXXXXXXXXXXX`
4. **Copia el "appXXXXXXXXXXXXXX"** (ese es tu Base ID)

## PASO 5: CONFIGURAR TU SITIO

### 5.1 Abrir tu archivo index.html
Busca estas líneas (cerca del final):
```javascript
const AIRTABLE_CONFIG = {
    baseId: 'TU_BASE_ID_AQUI',
    apiKey: 'TU_API_KEY_AQUI',
    baseUrl: 'https://api.airtable.com/v0/'
};
```

### 5.2 Reemplazar con tus datos reales:
```javascript
const AIRTABLE_CONFIG = {
    baseId: 'appTuBaseIdReal',  // ← Pega tu Base ID aquí
    apiKey: 'key123456789',     // ← Pega tu API Key aquí
    baseUrl: 'https://api.airtable.com/v0/'
};
```

## PASO 6: PROBAR TU SITIO

### 6.1 Abrir en navegador
- Abre tu `index.html` en Chrome/Firefox
- Abre las "Herramientas de Desarrollador" (F12)
- Ve a la pestaña "Console"

### 6.2 Verificar que funcione
Deberías ver estos mensajes:
```
✅ Sistema Airtable inicializado correctamente
✅ Mensaje destacado cargado: El amor de Dios en Cristo
✅ Versículo del día cargado: Juan 3:16
✅ Horarios cargados: 2 eventos
```

### 6.3 Si ves errores:
- `❌ 401 Unauthorized`: API Key incorrecta
- `❌ 404 Not Found`: Base ID incorrecta
- `❌ 422 Unprocessable`: Nombres de campos incorrectos

## BENEFICIOS INMEDIATOS

### ✅ ANTES (método actual):
- Cambiar mensaje destacado = editar HTML manualmente
- Agregar audio = subir archivo + modificar código
- Cambiar horarios = editar HTML en varias páginas
- Sin estadísticas de uso

### 🚀 DESPUÉS (con Airtable):
- Cambiar mensaje destacado = hacer clic en checkbox "Destacado"
- Agregar audio = arrastrar archivo a Airtable
- Cambiar horarios = editar en tabla visual
- Estadísticas automáticas de descargas y reproducciones

## ESCALABILIDAD FUTURA

### Con este sistema ya funcionando, podrás:

1. **Conectar YouTube** (usar la API para videos automáticos)
2. **Integrar Notion** (para artículos más largos)
3. **Sistema de búsqueda** (buscar predicaciones por tema)
4. **Newsletter automático** (versículo del día por email)
5. **App móvil** (mismos datos, diferentes interfaces)

---

## 🔥 ¿NECESITAS AYUDA?

Si tienes algún problema con:
- ❓ Crear las tablas en Airtable
- ❓ Obtener tus credenciales
- ❓ Configurar el código
- ❓ Solucionar errores

**Dime exactamente en qué paso necesitas ayuda y te guío específicamente.**

Tu sitio bíblico está a **5 minutos** de convertirse en una plataforma de contenido dinámica y profesional. 🎯
