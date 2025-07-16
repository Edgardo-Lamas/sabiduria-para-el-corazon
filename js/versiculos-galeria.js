// Variable global para el versículo pendiente de descarga
let versiculoPendienteDescarga = null;

class VersiculosGaleria {
    constructor() {
        this.versiculos = [];
        this.temaActual = 'todos';
        this.loader = document.querySelector('.versiculos-loading');
        this.galeria = document.getElementById('versiculos-galeria');
        this.totalCounter = document.getElementById('total-versiculos');
        this.filtradosCounter = document.getElementById('versiculos-filtrados');
        
        // Configuración de Airtable
        this.baseUrl = `${AIRTABLE_CONFIG.baseUrl}${AIRTABLE_CONFIG.baseId}/`;
        this.headers = {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async init() {
        console.log('🎨 Inicializando galería de versículos...');
        
        try {
            await this.cargarVersiculos();
            this.setupFiltros();
            this.renderizarVersiculos();
            this.actualizarContadores();
            
            console.log('✅ Galería de versículos cargada exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar galería:', error);
            this.mostrarError('Error al cargar los versículos. Por favor, intenta más tarde.');
        }
    }

    async cargarVersiculos() {
        console.log('📖 Cargando versículos desde Airtable...');
        
        try {
            // PRUEBA 1: Intentar listar todas las tablas primero
            let urlTablas = `${this.baseUrl}`;
            console.log('🔗 URL para listar tablas:', urlTablas);
            
            // PRUEBA 2: Intentar sin filtros primero
            let url = `${this.baseUrl}GALERIA_VERSICULOS`;
            console.log('🔗 URL de Airtable SIN FILTROS:', url);
            console.log('🔑 Headers:', this.headers);
            
            const response = await fetch(url, { headers: this.headers });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (!response.ok) {
                console.error('❌ Error en la respuesta:', response.status, response.statusText);
                
                // Si hay error 404, la tabla no existe o tiene otro nombre
                if (response.status === 404) {
                    console.error('🚫 TABLA NO ENCONTRADA - Verifica el nombre de la tabla');
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Datos recibidos de Airtable:', data);
            console.log('📊 Número de records:', data.records ? data.records.length : 0);
            
            if (data.records && data.records.length > 0) {
                console.log('📋 Primer record completo:', data.records[0]);
                console.log('📋 Campos del primer record:', data.records[0].fields);
                console.log('🖼️ Campo Imagen específico:', data.records[0].fields.Imagen);
                
                this.versiculos = data.records.map(record => ({
                    id: record.id,
                    texto: record.fields.Texto || '',
                    referencia: record.fields.Referencia || '',
                    tema: record.fields.Tema || 'General',
                    imagen: this.extraerUrlImagen(record.fields.Imagen) || this.getImagenPorTema(record.fields.Tema),
                    descripcion: record.fields.Descripcion || '',
                    orden: record.fields.Orden || 0,
                    activo: record.fields.Activo !== false // Por defecto true, false solo si explícitamente es false
                }));
                
                console.log(`📚 ${this.versiculos.length} versículos cargados desde Airtable`);
                console.log('🖼️ Primer versículo con imagen:', this.versiculos[0]);
            } else {
                // Si no hay versículos en Airtable, usar datos de ejemplo
                console.log('📝 No se encontraron records - Usando versículos de ejemplo');
                this.cargarVersiculosEjemplo();
            }
            
        } catch (error) {
            console.error('⚠️ Error conectando con Airtable:', error);
            console.log('📝 Cargando versículos de ejemplo como respaldo');
            this.cargarVersiculosEjemplo();
        }
    }

    cargarVersiculosEjemplo() {
        this.versiculos = [
            {
                id: 'ejemplo1',
                texto: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
                referencia: 'Juan 3:16',
                tema: 'Amor',
                imagen: '../img/fondoo.jpg',
                descripcion: 'El versículo más conocido que habla del amor incondicional de Dios.'
            },
            {
                id: 'ejemplo2',
                texto: 'Todo lo puedo en Cristo que me fortalece.',
                referencia: 'Filipenses 4:13',
                tema: 'Fortaleza',
                imagen: '../img/fondo nuevo 5.jpg',
                descripcion: 'Recordatorio de que con Cristo podemos enfrentar cualquier desafío.'
            },
            {
                id: 'ejemplo3',
                texto: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
                referencia: 'Juan 14:27',
                tema: 'Paz',
                imagen: '../img/nuevo fondo4.jpg',
                descripcion: 'La promesa de paz que solo Cristo puede dar.'
            },
            {
                id: 'ejemplo4',
                texto: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
                referencia: 'Romanos 8:28',
                tema: 'Esperanza',
                imagen: '../img/libros fondo.jpg',
                descripcion: 'Dios obra en todas las circunstancias para nuestro bien.'
            },
            {
                id: 'ejemplo5',
                texto: 'Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.',
                referencia: 'Hebreos 11:1',
                tema: 'Fe',
                imagen: '../img/libreria.jpg',
                descripcion: 'La definición bíblica de la fe verdadera.'
            },
            {
                id: 'ejemplo6',
                texto: 'Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.',
                referencia: '1 Tesalonicenses 5:18',
                tema: 'Gratitud',
                imagen: '../img/fondo nuevo 1.png',
                descripcion: 'La importancia de ser agradecidos en todas las circunstancias.'
            }
        ];
    }

    getImagenPorTema(tema) {
        const imagenesPorTema = {
            'Amor': '../img/fondoo.jpg',
            'Esperanza': '../img/libros fondo.jpg',
            'Fe': '../img/libreria.jpg',
            'Paz': '../img/nuevo fondo4.jpg',
            'Fortaleza': '../img/fondo nuevo 5.jpg',
            'Salvacion': '../img/fondo nuevo 1.png',
            'Sabiduria': '../img/nuevo fondo3.jpg',
            'Gratitud': '../img/fondo nuevo 1.png'
        };
        
        return imagenesPorTema[tema] || '../img/fondoo.jpg';
    }

    setupFiltros() {
        const filtros = document.querySelectorAll('.filtro-btn');
        
        filtros.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover clase active de todos los botones
                filtros.forEach(b => b.classList.remove('active'));
                
                // Agregar clase active al botón clickeado
                e.target.classList.add('active');
                
                // Actualizar tema actual
                this.temaActual = e.target.dataset.tema;
                
                // Filtrar versículos
                this.filtrarVersiculos();
                this.actualizarContadores();
                
                console.log(`🔍 Filtrando por tema: ${this.temaActual}`);
            });
        });
    }

    renderizarVersiculos() {
        if (!this.galeria) return;

        this.galeria.innerHTML = '';
        
        this.versiculos.forEach((versiculo, index) => {
            const card = this.crearTarjetaVersiculo(versiculo, index);
            this.galeria.appendChild(card);
        });

        // Ocultar loader y mostrar galería
        if (this.loader) {
            this.loader.style.display = 'none';
        }
        
        this.galeria.classList.add('loaded');
    }

    crearTarjetaVersiculo(versiculo, index) {
        const card = document.createElement('div');
        card.className = 'versiculo-card';
        card.dataset.tema = versiculo.tema.toLowerCase();
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="versiculo-imagen" style="background-image: url('${versiculo.imagen}')">
                <div class="versiculo-texto-overlay">
                    "${versiculo.texto}"
                </div>
            </div>
            <div class="versiculo-contenido">
                <div class="versiculo-referencia">${versiculo.referencia}</div>
                <div class="versiculo-tema">${versiculo.tema}</div>
                ${versiculo.descripcion ? `<div class="versiculo-descripcion">${versiculo.descripcion}</div>` : ''}
                <div class="versiculo-acciones">
                    <button class="accion-btn btn-descargar" onclick="descargarVersiculo('${versiculo.id.toString()}')">
                        📥 Descargar
                    </button>
                    <button class="accion-btn btn-compartir" onclick="compartirVersiculo('${versiculo.id.toString()}')">
                        📤 Compartir
                    </button>
                    <button class="accion-btn btn-copiar" onclick="copiarVersiculo('${versiculo.id.toString()}')">
                        📋 Copiar
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    filtrarVersiculos() {
        const cards = document.querySelectorAll('.versiculo-card');
        
        cards.forEach(card => {
            const temaTarjeta = card.dataset.tema;
            
            if (this.temaActual === 'todos' || temaTarjeta === this.temaActual) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    actualizarContadores() {
        const total = this.versiculos.length;
        const filtrados = this.temaActual === 'todos' 
            ? total 
            : this.versiculos.filter(v => v.tema.toLowerCase() === this.temaActual).length;

        if (this.totalCounter) {
            this.totalCounter.textContent = `${total} versículos disponibles`;
        }
        
        if (this.filtradosCounter) {
            this.filtradosCounter.textContent = `${filtrados} mostrando`;
        }
    }

    mostrarError(mensaje) {
        if (this.loader) {
            this.loader.innerHTML = `
                <div class="error-mensaje">
                    ❌ ${mensaje}
                </div>
            `;
        }
    }

    // Método para buscar un versículo por ID (mejorado)
    obtenerVersiculo(id) {
        console.log('🔍 Buscando versículo con ID:', id, '(tipo:', typeof id, ')');
        
        // Normalizar ID a string para comparación consistente
        const idNormalizado = String(id);
        console.log('🔄 ID normalizado:', idNormalizado);
        
        // Búsqueda exacta con ID normalizado
        let versiculo = this.versiculos.find(v => String(v.id) === idNormalizado);
        
        if (!versiculo) {
            console.log('🔍 Búsqueda normalizada falló, intentando búsqueda flexible...');
            // Búsqueda más flexible
            versiculo = this.versiculos.find(v => {
                const vidStr = String(v.id);
                const idStr = String(id);
                return vidStr === idStr || 
                       vidStr === id || 
                       v.id === idStr ||
                       v.id === id;
            });
        }
        
        if (versiculo) {
            console.log('✅ Versículo encontrado:', versiculo.referencia);
            console.log('📊 ID del versículo encontrado:', versiculo.id, '(tipo:', typeof versiculo.id, ')');
        } else {
            console.log('❌ Versículo no encontrado. IDs disponibles:');
            this.versiculos.forEach((v, index) => {
                console.log(`  ${index}: "${v.id}" (${typeof v.id}) - ${v.referencia}`);
            });
        }
        
        return versiculo;
    }

    // Función para extraer URL de imagen desde Airtable Attachment
    extraerUrlImagen(campoImagen) {
        console.log('🖼️ Procesando campo Imagen:', campoImagen);
        
        if (!campoImagen) {
            console.log('📝 No hay campo Imagen');
            return null;
        }
        
        // Si es un array de attachments (formato Airtable)
        if (Array.isArray(campoImagen) && campoImagen.length > 0) {
            const primerArchivo = campoImagen[0];
            console.log('📎 Primer attachment:', primerArchivo);
            
            if (primerArchivo.url) {
                console.log('✅ URL encontrada:', primerArchivo.url);
                return primerArchivo.url;
            }
        }
        
        // Si es una URL directa (texto)
        if (typeof campoImagen === 'string' && campoImagen.startsWith('http')) {
            console.log('🔗 URL directa:', campoImagen);
            return campoImagen;
        }
        
        console.log('❌ No se pudo extraer URL de imagen');
        return null;
    }
}

// Funciones globales para las acciones de los versículos
window.descargarVersiculo = function(versiculoId) {
    console.log(`📥 Iniciando descarga de versículo: ${versiculoId}`);
    console.log('🔍 Tipo de versiculoId:', typeof versiculoId);
    console.log('🔍 Valor exacto:', JSON.stringify(versiculoId));
    
    // Verificar que la galería esté inicializada
    if (!window.versiculosGaleria) {
        console.error('❌ VersiculosGaleria no inicializada');
        mostrarError('Sistema no inicializado. Recarga la página.');
        return;
    }
    
    console.log('✅ VersiculosGaleria encontrada');
    console.log('📊 Total versículos:', window.versiculosGaleria.versiculos.length);
    console.log('📋 IDs disponibles:', window.versiculosGaleria.versiculos.map(v => `"${v.id}" (${typeof v.id})`));
    
    // Verificar que el versículo existe
    const versiculo = window.versiculosGaleria.obtenerVersiculo(versiculoId);
    if (!versiculo) {
        console.error('❌ Versículo no encontrado:', versiculoId);
        console.log('🔍 Buscando con comparación exacta...');
        
        // Buscar de forma más flexible
        const versiculoFlexible = window.versiculosGaleria.versiculos.find(v => 
            v.id === versiculoId || 
            v.id === String(versiculoId) || 
            String(v.id) === String(versiculoId)
        );
        
        if (versiculoFlexible) {
            console.log('✅ Versículo encontrado con búsqueda flexible:', versiculoFlexible);
            mostrarModalDescarga(versiculoFlexible.id);
            return;
        }
        
        mostrarError(`Versículo '${versiculoId}' no encontrado en ${window.versiculosGaleria.versiculos.length} disponibles`);
        return;
    }
    
    console.log('✅ Versículo encontrado:', versiculo.referencia);
    mostrarModalDescarga(versiculoId);
};

window.mostrarModalDescarga = function(versiculoId) {
    console.log('🎬 Mostrando modal para versículo:', versiculoId);
    console.log('🔍 Tipo de ID recibido:', typeof versiculoId);
    
    // Normalizar y guardar ID
    versiculoPendienteDescarga = String(versiculoId);
    console.log('💾 ID guardado como:', versiculoPendienteDescarga, '(tipo:', typeof versiculoPendienteDescarga, ')');
    
    const modal = document.getElementById('modal-descarga');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Modal mostrado correctamente');
};

window.cerrarModalDescarga = function() {
    const modal = document.getElementById('modal-descarga');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    versiculoPendienteDescarga = null;
};

window.confirmarDescarga = function() {
    if (versiculoPendienteDescarga) {
        console.log('🎯 Confirmando descarga para:', versiculoPendienteDescarga);
        console.log('🔍 Tipo de ID pendiente:', typeof versiculoPendienteDescarga);
        
        // IMPORTANTE: Verificar que el versículo existe ANTES de cerrar modal
        const galeria = window.versiculosGaleria;
        if (!galeria) {
            console.error('❌ VersiculosGaleria no disponible en confirmación');
            mostrarError('Sistema no disponible');
            return;
        }
        
        const versiculoVerificacion = galeria.obtenerVersiculo(versiculoPendienteDescarga);
        if (!versiculoVerificacion) {
            console.error('❌ Versículo no existe en confirmación:', versiculoPendienteDescarga);
            console.log('📋 IDs disponibles:', galeria.versiculos.map(v => `"${v.id}" (${typeof v.id})`));
            mostrarError('Versículo no encontrado durante confirmación');
            return;
        }
        
        console.log('✅ Versículo verificado en confirmación:', versiculoVerificacion.referencia);
        
        // Guardar ID de forma segura
        const idSeguro = versiculoPendienteDescarga;
        
        cerrarModalDescarga();
        
        // Mostrar mensaje de generación inmediatamente
        const notifGeneracion = mostrarMensajeGeneracion();
        
        // Agregar delay para asegurar que el mensaje sea visible
        setTimeout(() => {
            try {
                console.log('🚀 Iniciando generación real con ID:', idSeguro);
                generarYDescargarPostal(idSeguro);
            } catch (error) {
                console.error('❌ Error crítico en confirmación:', error);
                // Cerrar mensaje de generación si hay error
                if (notifGeneracion && notifGeneracion.parentNode) {
                    notifGeneracion.remove();
                }
                mostrarError('Error crítico al iniciar generación: ' + error.message);
            }
        }, 500); // Medio segundo para ver el mensaje
    } else {
        console.error('❌ No hay versículo pendiente de descarga');
        mostrarError('No hay versículo seleccionado');
    }
};

function mostrarMensajeGeneracion() {
    console.log('🎨 Mostrando mensaje de generación...');
    
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-generacion';
    notificacion.innerHTML = `
        <div class="notif-contenido">
            <span class="notif-icon">🎨</span>
            <span class="notif-texto">Generando postal con Canvas HTML5...</span>
            <div class="progreso-bar">
                <div class="progreso-fill"></div>
            </div>
            <button class="btn-cerrar" onclick="this.parentNode.parentNode.remove()" style="
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
            ">×</button>
        </div>
    `;
    
    // Estilos en línea para asegurar visibilidad
    notificacion.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar barra de progreso
    const progressBar = notificacion.querySelector('.progreso-fill');
    if (progressBar) {
        progressBar.style.cssText = `
            width: 0%;
            height: 4px;
            background: rgba(255,255,255,0.8);
            margin-top: 8px;
            border-radius: 2px;
            transition: width 3s ease;
        `;
        
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 100);
    }
    
    // Auto-eliminar después de 10 segundos (solo si no se eliminó manualmente)
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.remove();
        }
    }, 10000);
    
    return notificacion; // Devolver referencia para poder eliminarlo manualmente
}

window.compartirVersiculo = function(versiculoId) {
    console.log(`📤 Compartiendo versículo: ${versiculoId}`);
    
    const galeria = window.versiculosGaleria;
    if (galeria) {
        const versiculo = galeria.obtenerVersiculo(versiculoId);
        if (versiculo) {
            const texto = `"${versiculo.texto}" - ${versiculo.referencia}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Versículo Bíblico',
                    text: texto,
                    url: window.location.href
                });
            } else {
                // Fallback para navegadores que no soportan Web Share API
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Versículo copiado al portapapeles para compartir');
                });
            }
        }
    }
};

window.copiarVersiculo = function(versiculoId) {
    console.log(`📋 Copiando versículo: ${versiculoId}`);
    
    const galeria = window.versiculosGaleria;
    if (galeria) {
        const versiculo = galeria.obtenerVersiculo(versiculoId);
        if (versiculo) {
            const texto = `"${versiculo.texto}" - ${versiculo.referencia}`;
            
            navigator.clipboard.writeText(texto).then(() => {
                // Mostrar feedback visual
                const btn = event.target;
                const textoOriginal = btn.innerHTML;
                btn.innerHTML = '✅ Copiado';
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                btn.style.color = 'white';
                
                setTimeout(() => {
                    btn.innerHTML = textoOriginal;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            });
        }
    }
};

function generarPostalDescarga(versiculo) {
    // Esta función generará una imagen de postal y la descargará
    // Por ahora, como implementación básica, descargaremos un archivo de texto
    
    const contenido = `
VERSÍCULO BÍBLICO
================

"${versiculo.texto}"

${versiculo.referencia}

Tema: ${versiculo.tema}

---
Sabiduría para el Corazón
Verdades Eternas hasta lo último de la Tierra
    `.trim();

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `versiculo-${versiculo.referencia.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Versículo descargado: ${versiculo.referencia}`);
}

// Función para generar postal con Canvas HTML5
function generarYDescargarPostal(versiculoId) {
    console.log('🎨 Iniciando generación Canvas HTML5 para:', versiculoId);
    console.log('🔍 Verificando sistema...');
    
    const galeria = window.versiculosGaleria;
    if (!galeria) {
        const error = 'VersiculosGaleria no encontrada';
        console.error('❌', error);
        mostrarError('Error: Sistema no inicializado');
        return;
    }
    
    console.log('✅ VersiculosGaleria encontrada');
    
    const versiculo = galeria.obtenerVersiculo(versiculoId);
    if (!versiculo) {
        const error = `Versículo no encontrado: ${versiculoId}`;
        console.error('❌', error);
        mostrarError('Error: Versículo no encontrado');
        return;
    }
    
    console.log('✅ Versículo encontrado:', versiculo.referencia);
    console.log('📊 Datos del versículo:', {
        id: versiculo.id,
        texto: versiculo.texto?.substring(0, 50) + '...',
        referencia: versiculo.referencia,
        tema: versiculo.tema,
        imagen: versiculo.imagen
    });
    
    try {
        // Crear canvas 1200x800
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('No se pudo obtener contexto 2D del canvas');
        }
        
        console.log('✅ Canvas creado exitosamente (1200x800)');
        
        // Función para generar sin imagen de fondo (fallback)
        function generarSinImagen() {
            console.log('📝 Generando postal sin imagen de fondo');
            
            try {
                // Fondo con gradiente
                const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1200, 800);
                
                // Overlay semi-transparente para mejor legibilidad
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(0, 0, 1200, 800);
                
                console.log('✅ Fondo generado exitosamente');
                dibujarTexto();
            } catch (error) {
                console.error('❌ Error generando fondo:', error);
                mostrarError('Error al generar el fondo de la postal');
            }
        }
        
        // Función para dibujar el texto
        function dibujarTexto() {
            console.log('✍️ Dibujando texto en canvas');
            
            try {
                // Validar que el texto existe
                if (!versiculo.texto || !versiculo.referencia) {
                    throw new Error('Texto o referencia del versículo faltante');
                }
                
                // Configurar texto
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Texto del versículo - dividir en líneas
                ctx.font = 'bold 36px "Georgia", serif';
                const lineas = dividirTexto(versiculo.texto, 45);
                const startY = 300 - (lineas.length * 25); // Centrar verticalmente
                
                console.log('📝 Dibujando', lineas.length, 'líneas de texto');
                
                lineas.forEach((linea, i) => {
                    const texto = i === 0 && i === lineas.length - 1 ? `"${linea}"` : 
                                  i === 0 ? `"${linea}` : 
                                  i === lineas.length - 1 ? `${linea}"` : linea;
                    ctx.fillText(texto, 600, startY + (i * 50));
                });
                
                // Referencia bíblica
                ctx.font = 'italic 32px "Georgia", serif';
                ctx.fillText(`— ${versiculo.referencia}`, 600, startY + (lineas.length * 50) + 60);
                
                // Tema
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText(`Tema: ${versiculo.tema}`, 600, startY + (lineas.length * 50) + 120);
                
                // Marca de agua
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = 'normal 20px Arial';
                ctx.fillText('Sabiduría para el Corazón', 600, 740);
                ctx.font = 'normal 16px Arial';
                ctx.fillText('Verdades Eternas hasta lo último de la Tierra', 600, 765);
                
                console.log('✅ Texto dibujado exitosamente');
                finalizarDescarga();
            } catch (error) {
                console.error('❌ Error dibujando texto:', error);
                mostrarError('Error al dibujar el texto: ' + error.message);
            }
        }
        
        // Función para finalizar y descargar
        function finalizarDescarga() {
            console.log('💾 Finalizando descarga...');
            
            try {
                console.log('🔄 Generando datos de imagen...');
                
                // Generar imagen
                const imageData = canvas.toDataURL('image/png', 1.0);
                
                if (!imageData || imageData === 'data:,') {
                    throw new Error('Canvas vacío o datos de imagen inválidos');
                }
                
                console.log('✅ Imagen generada, tamaño:', imageData.length, 'caracteres');
                console.log('🔗 Datos válidos:', imageData.substring(0, 50) + '...');
                
                // Crear nombre de archivo seguro
                const nombreArchivo = `versiculo-${versiculo.referencia.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
                console.log('📁 Nombre archivo:', nombreArchivo);
                
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.download = nombreArchivo;
                link.href = imageData;
                
                console.log('🔗 Enlace creado, iniciando descarga...');
                
                // Trigger descarga
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('✅ Descarga completada exitosamente');
                
                // Eliminar mensaje de generación
                const notifGeneracion = document.querySelector('.notificacion-generacion');
                if (notifGeneracion) {
                    notifGeneracion.remove();
                }
                
                mostrarExito();
                
            } catch (error) {
                console.error('❌ Error detallado en la descarga:', error);
                console.error('📍 Stack completo:', error.stack);
                
                // Eliminar mensaje de generación
                const notifGeneracion = document.querySelector('.notificacion-generacion');
                if (notifGeneracion) {
                    notifGeneracion.remove();
                }
                
                mostrarError('Error específico al generar imagen: ' + error.message);
            }
        }
        
        // Intentar cargar imagen de fondo (si existe)
        if (versiculo.imagen) {
            console.log('🖼️ Intentando cargar imagen:', versiculo.imagen);
            console.log('🔍 Tipo de imagen:', typeof versiculo.imagen);
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Timeout para la carga de imagen - reducido para ser más rápido
            const timeoutId = setTimeout(() => {
                console.log('⏱️ Timeout de imagen (2s), generando sin fondo');
                generarSinImagen();
            }, 2000); // 2 segundos máximo
            
            img.onload = function() {
                console.log('🖼️ Imagen de fondo cargada exitosamente');
                console.log('📏 Dimensiones imagen:', img.width, 'x', img.height);
                clearTimeout(timeoutId);
                
                try {
                    // Dibujar imagen de fondo
                    ctx.drawImage(img, 0, 0, 1200, 800);
                    
                    // Overlay semi-transparente
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fillRect(0, 0, 1200, 800);
                    
                    console.log('✅ Imagen de fondo aplicada');
                    dibujarTexto();
                } catch (error) {
                    console.error('❌ Error aplicando imagen de fondo:', error);
                    clearTimeout(timeoutId);
                    generarSinImagen();
                }
            };
            
            img.onerror = function(error) {
                console.log('❌ Error cargando imagen:', error);
                console.log('🔗 URL que falló:', versiculo.imagen);
                console.log('🔄 Intentando con imagen local de respaldo...');
                clearTimeout(timeoutId);
                
                // Intentar cargar imagen local de respaldo basada en el tema
                const imagenLocal = `../img/${getImagenLocalPorTema(versiculo.tema)}`;
                console.log('🏠 Probando imagen local:', imagenLocal);
                
                const imgLocal = new Image();
                const timeoutLocal = setTimeout(() => {
                    console.log('⏱️ Timeout imagen local, generando sin fondo');
                    generarSinImagen();
                }, 1000);
                
                imgLocal.onload = function() {
                    console.log('✅ Imagen local cargada:', imagenLocal);
                    clearTimeout(timeoutLocal);
                    
                    try {
                        ctx.drawImage(imgLocal, 0, 0, 1200, 800);
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        ctx.fillRect(0, 0, 1200, 800);
                        console.log('✅ Imagen local aplicada');
                        dibujarTexto();
                    } catch (error) {
                        console.error('❌ Error con imagen local:', error);
                        generarSinImagen();
                    }
                };
                
                imgLocal.onerror = function() {
                    console.log('❌ Imagen local también falló');
                    clearTimeout(timeoutLocal);
                    generarSinImagen();
                };
                
                imgLocal.src = imagenLocal;
            };
            
            // Iniciar carga de imagen
            img.src = versiculo.imagen;
        } else {
            console.log('📝 No hay imagen especificada, usando imagen por tema');
            
            // Intentar cargar imagen basada en tema
            const imagenPorTema = `../img/${getImagenLocalPorTema(versiculo.tema)}`;
            console.log('🎨 Imagen por tema:', imagenPorTema);
            
            const img = new Image();
            const timeoutId = setTimeout(() => {
                console.log('⏱️ Timeout imagen por tema, generando sin fondo');
                generarSinImagen();
            }, 1500);
            
            img.onload = function() {
                console.log('✅ Imagen por tema cargada');
                clearTimeout(timeoutId);
                try {
                    ctx.drawImage(img, 0, 0, 1200, 800);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fillRect(0, 0, 1200, 800);
                    dibujarTexto();
                } catch (error) {
                    console.error('❌ Error con imagen por tema:', error);
                    generarSinImagen();
                }
            };
            
            img.onerror = function() {
                console.log('❌ Imagen por tema falló, generando sin fondo');
                clearTimeout(timeoutId);
                generarSinImagen();
            };
            
            img.src = imagenPorTema;
        }
        
    } catch (error) {
        console.error('❌ Error general en generación:', error);
        mostrarError('Error crítico: ' + error.message);
    }
}

function dividirTexto(texto, maxChars) {
    const palabras = texto.split(' ');
    const lineas = [];
    let actual = '';
    
    palabras.forEach(palabra => {
        if ((actual + palabra).length <= maxChars) {
            actual += (actual ? ' ' : '') + palabra;
        } else {
            lineas.push(actual);
            actual = palabra;
        }
    });
    
    if (actual) lineas.push(actual);
    return lineas;
}

function mostrarExito() {
    console.log('✅ Mostrando mensaje de éxito');
    const notif = document.createElement('div');
    notif.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">✅</span>
            <div>
                <div style="font-weight: bold;">¡Postal generada exitosamente!</div>
                <div style="font-size: 14px; opacity: 0.9;">Canvas HTML5 • Alta resolución • Lista para compartir</div>
            </div>
        </div>
    `;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(39, 174, 96, 0.3);
        z-index: 9999;
        font-family: Arial, sans-serif;
        min-width: 350px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.transform = 'translateX(400px)';
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }
    }, 4000);
}

function mostrarError(mensaje) {
    console.error('❌ Mostrando error:', mensaje);
    
    // Crear stack trace para mejor debugging
    console.error('📍 Stack trace:', new Error().stack);
    
    const notif = document.createElement('div');
    notif.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">❌</span>
            <div>
                <div style="font-weight: bold;">Error en la generación</div>
                <div style="font-size: 14px; opacity: 0.9;">${mensaje}</div>
            </div>
        </div>
    `;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
        z-index: 9999;
        font-family: Arial, sans-serif;
        min-width: 350px;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;
    
    // Agregar click para cerrar manualmente
    notif.addEventListener('click', () => {
        notif.remove();
    });
    
    document.body.appendChild(notif);
    
    // Aumentar tiempo para poder leer el mensaje
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.transform = 'translateX(400px)';
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }
    }, 8000); // 8 segundos en lugar de 5
}

// Hacer la instancia disponible globalmente para las funciones de callback
window.versiculosGaleria = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando sistema de versículos...');
    
    try {
        window.versiculosGaleria = new VersiculosGaleria();
        await window.versiculosGaleria.init();
        console.log('✅ Sistema de versículos inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar versículos:', error);
        
        // Fallback: crear instancia básica con ejemplos
        window.versiculosGaleria = new VersiculosGaleria();
        window.versiculosGaleria.cargarVersiculosEjemplo();
        window.versiculosGaleria.renderizarVersiculos();
        console.log('✅ Sistema de versículos cargado con ejemplos');
    }
});

// Función de debug global para verificar estado
window.debugEstado = function() {
    console.log('🔍 === DEBUG ESTADO COMPLETO ===');
    console.log('📊 VersiculosGaleria:', window.versiculosGaleria ? '✅ Disponible' : '❌ No encontrada');
    console.log('🎯 Versículo pendiente:', versiculoPendienteDescarga, '(tipo:', typeof versiculoPendienteDescarga, ')');
    
    if (window.versiculosGaleria) {
        console.log('📋 Total versículos:', window.versiculosGaleria.versiculos.length);
        console.log('📝 Primeros 3 versículos:');
        window.versiculosGaleria.versiculos.slice(0, 3).forEach((v, i) => {
            console.log(`  ${i + 1}. ID: "${v.id}" (${typeof v.id}) - ${v.referencia}`);
        });
        
        if (versiculoPendienteDescarga) {
            const encontrado = window.versiculosGaleria.obtenerVersiculo(versiculoPendienteDescarga);
            console.log('🎯 Versículo pendiente encontrado:', encontrado ? '✅ Sí' : '❌ No');
        }
    }
    
    console.log('🎨 Canvas soportado:', document.createElement('canvas').getContext ? '✅ Sí' : '❌ No');
    console.log('=================================');
};

// Test rápido de descarga
window.testDescarga = function() {
    console.log('🧪 TEST: Iniciando descarga de prueba');
    if (window.versiculosGaleria && window.versiculosGaleria.versiculos.length > 0) {
        const primerVersiculo = window.versiculosGaleria.versiculos[0];
        generarYDescargarPostal(primerVersiculo.id);
    } else {
        console.error('❌ No hay versículos disponibles para probar');
    }
};

// Función de prueba simple para verificar funcionamiento
window.pruebaDescargaDirecta = function() {
    console.log('🧪 PRUEBA DIRECTA: Verificando sistema...');
    
    // Verificar galería
    if (!window.versiculosGaleria) {
        console.error('❌ VersiculosGaleria no encontrada');
        return false;
    }
    
    console.log('✅ VersiculosGaleria encontrada');
    console.log('📊 Versículos disponibles:', window.versiculosGaleria.versiculos.length);
    
    if (window.versiculosGaleria.versiculos.length === 0) {
        console.error('❌ No hay versículos cargados');
        return false;
    }
    
    // Tomar el primer versículo
    const versiculo = window.versiculosGaleria.versiculos[0];
    console.log('📖 Usando versículo:', versiculo.referencia);
    
    // Llamar directamente a la función de generación
    try {
        generarYDescargarPostal(versiculo.id);
        console.log('✅ Descarga iniciada exitosamente');
        return true;
    } catch (error) {
        console.error('❌ Error en descarga:', error);
        return false;
    }
};

// Función auxiliar para obtener nombres de archivo locales
function getImagenLocalPorTema(tema) {
    const imagenesLocales = {
        'Amor': 'fondoo.jpg',
        'Esperanza': 'libros fondo.jpg',
        'Fe': 'libreria.jpg',
        'Paz': 'nuevo fondo4.jpg',
        'Fortaleza': 'fondo nuevo 5.jpg',
        'Salvacion': 'fondo nuevo 1.png',
        'Sabiduria': 'nuevo fondo3.jpg',
        'Gratitud': 'fondo nuevo 1.png',
        'General': 'fondoo.jpg'
    };
    
    return imagenesLocales[tema] || 'fondoo.jpg';
}

// Función para probar carga de imágenes locales
window.probarImagenes = function() {
    console.log('🧪 PROBANDO IMÁGENES LOCALES...');
    
    const imagenesTest = [
        '../img/fondoo.jpg',
        '../img/libros fondo.jpg', 
        '../img/libreria.jpg',
        '../img/nuevo fondo4.jpg',
        '../img/fondo nuevo 5.jpg'
    ];
    
    imagenesTest.forEach((imagenPath, index) => {
        const img = new Image();
        img.onload = function() {
            console.log(`✅ ${index + 1}. Imagen cargada: ${imagenPath} (${img.width}x${img.height})`);
        };
        img.onerror = function() {
            console.log(`❌ ${index + 1}. Error cargando: ${imagenPath}`);
        };
        img.src = imagenPath;
    });
};
