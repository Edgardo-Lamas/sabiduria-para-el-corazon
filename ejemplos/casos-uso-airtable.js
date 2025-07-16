/* EJEMPLOS REALES DE USO CON AIRTABLE */

// ESCENARIO 1: PASTOR QUIERE CAMBIAR EL SERMÓN DESTACADO
// ===================================================

/* ANTES (editando HTML): */
// 1. Abrir index.html en editor de código
// 2. Buscar la línea: <audio src="./img/Love Story Original Beethoven.mp3" controls></audio>
// 3. Cambiar manualmente el archivo
// 4. Subir archivo nuevo al servidor
// 5. Actualizar el texto del título manualmente

/* DESPUÉS (con Airtable): */
// 1. Abrir Airtable en el navegador
// 2. Ir a tabla "AUDIOS_SERMONES" 
// 3. Desmarcar checkbox "Destacado" del sermón anterior
// 4. Marcar checkbox "Destacado" en el nuevo sermón
// 5. ¡LISTO! El sitio se actualiza automáticamente

/* RESULTADO AUTOMÁTICO en tu sitio: */
function updateFeaturedMessage() {
    // Tu sección "segundo" se actualiza automáticamente a:
    /*
    <div class="segundo">
        <img src="nueva-imagen-automatica.jpg" alt="reproductor">
        <h2>MENSAJE DESTACADO</h2>
        <h3>El Arrepentimiento es Esencial</h3>
        <p>Por: Josias Grauman</p>
        <p>Un estudio profundo sobre la necesidad del arrepentimiento genuino...</p>
        <audio src="./audios/El arrepentimiento es esencial. Josias Grauman.mp3" controls></audio>
        <div class="audio-stats">
            <span>📊 67 descargas</span>
            <span>⏱️ 42:15 min</span>
        </div>
    </div>
    */
}

// ESCENARIO 2: CAMBIAR VERSÍCULO DEL DÍA AUTOMÁTICO
// ===============================================

/* ANTES: */
// Versículo NUNCA cambia, siempre Hechos 17:30

/* DESPUÉS: */
// 1. En Airtable, llenar tabla "VERSICULO_DIARIO" con 365 versículos
// 2. Cada versículo tiene un "Dia_Del_Ano" (1-365)
// 3. El sitio busca automáticamente el versículo del día actual

/* EJEMPLO de datos en Airtable: */
const versiculosEjemplo = [
    {
        "Dia_Del_Ano": 193, // 12 de julio
        "Texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito...",
        "Referencia": "Juan 3:16",
        "Categoria": "Amor"
    },
    {
        "Dia_Del_Ano": 194, // 13 de julio  
        "Texto": "El Señor es mi pastor; nada me faltará...",
        "Referencia": "Salmos 23:1",
        "Categoria": "Confianza"
    }
];

// ESCENARIO 3: VER ESTADÍSTICAS DE TU CONTENIDO
// ==========================================

/* ANTES: */
// No sabías NADA sobre el uso de tu contenido

/* DESPUÉS: */
// En Airtable verías tablas como esta:

const estadisticasReales = {
    "Sermones más descargados": [
        {
            "Titulo": "El Arrepentimiento es Esencial - Josias Grauman",
            "Descargas": 127,
            "Ultima_descarga": "2024-07-11"
        },
        {
            "Titulo": "Estudiando la Biblia - Marcelo De La Llave", 
            "Descargas": 89,
            "Ultima_descarga": "2024-07-12"
        },
        {
            "Titulo": "La Creación - John MacArthur",
            "Descargas": 76,
            "Ultima_descarga": "2024-07-10"
        }
    ],
    
    "Descargas por mes": {
        "Junio 2024": 234,
        "Julio 2024": 156,
        "Tendencia": "↗️ +12% vs mes anterior"
    },
    
    "Países de origen": {
        "Argentina": 45,
        "Chile": 23,
        "Colombia": 18,
        "México": 12,
        "España": 8
    }
};

// ESCENARIO 4: AGREGAR NUEVO SERMÓN SIN PROGRAMAR
// =============================================

/* ANTES: */
// 1. Editar HTML manualmente
// 2. Subir archivo al servidor
// 3. Modificar links en múltiples páginas
// 4. Riesgo de romper el código

/* DESPUÉS: */
// 1. Ir a Airtable
// 2. Hacer click en "+" en tabla AUDIOS_SERMONES
// 3. Llenar formulario simple:

const nuevoSermon = {
    "Titulo": "La Maldición Explicada - Luis Contreras",
    "Predicador": "Luis Contreras", 
    "Archivo_Audio": "[Subir archivo MP3]",
    "Duracion": "38:45",
    "Fecha_Grabacion": "2024-07-15",
    "Serie": "Entendiendo el Génesis",
    "Descripcion": "Segunda parte del estudio sobre las consecuencias del pecado...",
    "Destacado": false, // checkbox sin marcar
    "Categoria": "Estudio Bíblico",
    "Versiculo_Principal": "Génesis 3:17",
    "Estado": "Público"
};

// 4. ¡Aparece automáticamente en tu sitio!

// ESCENARIO 5: GESTIONAR HORARIOS Y EVENTOS DINÁMICOS
// =================================================

/* ANTES: */
// Horarios hardcodeados en HTML, nunca cambian

/* DESPUÉS: */
// Tabla "EVENTOS_HORARIOS" en Airtable actualiza automáticamente la sección "quinta"

const eventosAirtable = [
    {
        "Nombre_Evento": "Escuela Dominical",
        "Dia_Semana": "Domingo", 
        "Hora_Inicio": "10:30",
        "Descripcion": "Estudio bíblico para toda la familia",
        "Ubicacion": "Salón Principal",
        "Responsable": "Pastor Martín",
        "Activo": true
    },
    {
        "Nombre_Evento": "Reunión de Jóvenes", 
        "Dia_Semana": "Sábado",
        "Hora_Inicio": "16:30",
        "Descripcion": "Encuentro semanal para jóvenes y adolescentes",
        "Ubicacion": "Salón de Jóvenes", 
        "Responsable": "Hermano Carlos",
        "Activo": true
    }
];

// RESULTADO: Tu sección de horarios se actualiza automáticamente
