# Portadas de eBooks

Esta carpeta contiene las portadas de los eBooks disponibles en la biblioteca digital.

## Estructura de archivos:

- Cada portada debe tener **exactamente el mismo nombre** que el PDF correspondiente
- Solo cambiar la extensión: `.pdf` → `.jpg` (o `.png`)

## Ejemplos:

- PDF: `Historia_de_la_Iglesia_Era_de_la_Reforma.pdf`
- Portada: `Historia_de_la_Iglesia_Era_de_la_Reforma.jpg`

## Portadas requeridas:

- [ ] `Historia_de_la_Iglesia_Era_de_la_Reforma.jpg`
- [ ] `La_Necesidad_del_momento.jpg`
- [ ] `Confesion_de_Westminster.jpg`
- [ ] `Nacido_para_multiplicarse.jpg`
- [ ] `El_Arte_de_Aconsejar.jpg`
- [ ] `La_Osa_Mayor.jpg`
- [ ] `Como_preparar_y_dirigir_Estudios_Biblicos.jpg`
- [x] `portada-generica.jpg` ← Imagen de fallback

## Formato recomendado:

- **Tamaño**: 300x400px (proporción 3:4 de libro)
- **Formato**: JPG o PNG
- **Peso**: Máximo 200KB por portada

## Sistema automático:

El sistema busca automáticamente la portada correspondiente. Si no la encuentra, usa `portada-generica.jpg`.
