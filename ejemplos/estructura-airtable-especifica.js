// ESTRUCTURA ESPECÍFICA PARA SABIDURÍA PARA EL CORAZÓN

// TABLA 1: AUDIOS_SERMONES
Campo: Titulo (Primary field)
Ejemplo: "Estudiando la Biblia - Marcelo De La Llave"

Campo: Predicador (Single line text)  
Ejemplo: "Marcelo De La Llave", "John MacArthur"

Campo: Archivo_Audio (Attachment)
Ejemplo: [Archivo MP3 subido directamente]

Campo: Duracion (Duration)
Ejemplo: 45:30

Campo: Fecha_Grabacion (Date)
Ejemplo: 2024-03-11

Campo: Serie (Single line text)
Ejemplo: "Estudiando la Biblia", "La Creación"

Campo: Descripcion (Long text)
Ejemplo: "En este mensaje exploramos la importancia de estudiar las Escrituras..."

Campo: Destacado (Checkbox)
Ejemplo: ✓ (Solo uno puede estar marcado como destacado)

Campo: Categoria (Single select)
Opciones: "Sermón Dominical", "Estudio Bíblico", "Devocional", "Conferencia"

Campo: Versiculo_Principal (Single line text)
Ejemplo: "Juan 3:16"

Campo: Descargas (Number)
Ejemplo: 45 (se actualiza automáticamente)

Campo: Estado (Single select)
Opciones: "Público", "Privado", "Programado"

// TABLA 2: VERSICULO_DIARIO
Campo: Texto (Long text, Primary field)
Ejemplo: "Pero Dios, habiendo pasado por alto los tiempos de esta ignorancia..."

Campo: Referencia (Single line text)
Ejemplo: "Hechos 17:30"

Campo: Dia_Del_Ano (Number)
Ejemplo: 193 (para 12 de julio)

Campo: Categoria (Single select)
Opciones: "Esperanza", "Fe", "Amor", "Perdón", "Oración"

Campo: Activo (Checkbox)
Ejemplo: ✓

// TABLA 3: EVENTOS_HORARIOS
Campo: Nombre_Evento (Single line text, Primary field)
Ejemplo: "Escuela Dominical"

Campo: Dia_Semana (Single select)
Opciones: "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"

Campo: Hora_Inicio (Single line text)
Ejemplo: "10:30"

Campo: Hora_Fin (Single line text)
Ejemplo: "12:00"

Campo: Descripcion (Long text)
Ejemplo: "Tiempo de estudio bíblico para toda la familia"

Campo: Ubicacion (Single line text)
Ejemplo: "Salón Principal", "Casa de Familia - San Alberto"

Campo: Responsable (Single line text)
Ejemplo: "Pastor Juan", "Marcelo De La Llave"

Campo: Activo (Checkbox)
Ejemplo: ✓

// TABLA 4: ESTADISTICAS_DESCARGAS
Campo: Fecha (Date, Primary field)
Ejemplo: 2024-07-12

Campo: Archivo_Descargado (Link to another record - Tabla AUDIOS_SERMONES)
Ejemplo: [Link al sermón específico]

Campo: IP_Usuario (Single line text)
Ejemplo: "192.168.1.1"

Campo: Navegador (Single line text)
Ejemplo: "Chrome 115.0"

Campo: Pais (Single line text)
Ejemplo: "Argentina"
