// SISTEMA DE DESCARGAS DINÁMICO
// Objetivo: Gestionar descargas de audios, PDFs y recursos con tracking

class DownloadManager {
    constructor() {
        this.downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
        this.initializeDownloadButtons();
    }

    // EJEMPLO 1: Sistema de descarga con progreso
    async downloadFile(fileUrl, fileName, fileType = 'audio') {
        try {
            // Mostrar modal de descarga
            this.showDownloadModal(fileName);
            
            // Realizar la descarga
            const response = await fetch(fileUrl);
            const contentLength = response.headers.get('Content-Length');
            
            if (!response.ok) {
                throw new Error('Error en la descarga');
            }
            
            // Crear reader para mostrar progreso
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                receivedLength += value.length;
                
                // Actualizar progreso
                if (contentLength) {
                    const progress = (receivedLength / contentLength) * 100;
                    this.updateDownloadProgress(progress);
                }
            }
            
            // Concatenar chunks y crear blob
            const blob = new Blob(chunks);
            this.saveFile(blob, fileName);
            
            // Registrar descarga
            this.trackDownload(fileName, fileType);
            
            // Cerrar modal
            this.hideDownloadModal();
            
            // Mostrar notificación de éxito
            this.showSuccessNotification(`${fileName} descargado exitosamente`);
            
        } catch (error) {
            console.error('Error en descarga:', error);
            this.hideDownloadModal();
            this.showErrorNotification('Error al descargar el archivo');
        }
    }

    // EJEMPLO 2: Crear botones de descarga dinámicos
    initializeDownloadButtons() {
        // Buscar todos los elementos de audio y agregar botones de descarga
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            this.addDownloadButton(audio);
        });
        
        // Observar nuevos elementos de audio que se agreguen dinámicamente
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'AUDIO') {
                        this.addDownloadButton(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    addDownloadButton(audioElement) {
        const audioUrl = audioElement.src;
        const audioTitle = this.getAudioTitle(audioElement);
        const fileName = this.extractFileName(audioUrl) || `${audioTitle}.mp3`;
        
        // Crear botón de descarga
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Descargar
        `;
        
        downloadBtn.onclick = () => this.downloadFile(audioUrl, fileName, 'audio');
        
        // Insertar botón después del elemento de audio
        audioElement.insertAdjacentElement('afterend', downloadBtn);
    }

    // EJEMPLO 3: Biblioteca de descargas con Airtable
    async loadDownloadLibrary() {
        try {
            // Obtener recursos descargables de Airtable
            const response = await fetch(`${AIRTABLE_CONFIG.baseUrl}/Recursos?filterByFormula=({Descargable}=TRUE())&sort[0][field]=Fecha&sort[0][direction]=desc`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            this.createDownloadLibrary(data.records);
            
        } catch (error) {
            console.error('Error cargando biblioteca de descargas:', error);
        }
    }

    createDownloadLibrary(recursos) {
        const librarySection = document.createElement('section');
        librarySection.className = 'download-library';
        librarySection.innerHTML = `
            <div class="container">
                <h2>📁 Biblioteca de Recursos</h2>
                <div class="resource-filters">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="audio">Audios</button>
                    <button class="filter-btn" data-filter="pdf">PDFs</button>
                    <button class="filter-btn" data-filter="estudio">Estudios</button>
                </div>
                <div class="resource-grid">
                    ${recursos.map(recurso => this.createResourceCard(recurso)).join('')}
                </div>
            </div>
        `;
        
        // Insertar en la página de recursos
        const resourcesPage = document.querySelector('.recursos-main');
        if (resourcesPage) {
            resourcesPage.appendChild(librarySection);
        }
        
        // Agregar funcionalidad de filtros
        this.initializeFilters();
    }

    createResourceCard(recurso) {
        const fields = recurso.fields;
        const fileType = this.getFileType(fields.Archivo[0].filename);
        const fileSize = this.formatFileSize(fields.Archivo[0].size);
        
        return `
            <div class="resource-card" data-type="${fields.Tipo}">
                <div class="resource-icon">
                    ${this.getFileIcon(fileType)}
                </div>
                <div class="resource-info">
                    <h3>${fields.Titulo}</h3>
                    <p class="resource-author">${fields.Autor || 'Sabiduría para el Corazón'}</p>
                    <p class="resource-description">${fields.Descripcion}</p>
                    <div class="resource-meta">
                        <span class="file-type">${fileType.toUpperCase()}</span>
                        <span class="file-size">${fileSize}</span>
                        <span class="download-count">${fields.Descargas || 0} descargas</span>
                    </div>
                </div>
                <div class="resource-actions">
                    <button onclick="downloadManager.downloadFile('${fields.Archivo[0].url}', '${fields.Titulo}.${fileType}', '${fields.Tipo}')" 
                            class="btn-download">
                        📥 Descargar
                    </button>
                    <button onclick="shareResource('${fields.Titulo}', '${fields.Archivo[0].url}')" 
                            class="btn-share">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
    }

    // UTILIDADES
    showDownloadModal(fileName) {
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Descargando: ${fileName}</h3>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
                <button onclick="cancelDownload()" class="btn-cancel">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateDownloadProgress(progress) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }

    hideDownloadModal() {
        const modal = document.querySelector('.download-modal');
        if (modal) {
            modal.remove();
        }
    }

    saveFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    trackDownload(fileName, fileType) {
        // Guardar estadísticas localmente
        const date = new Date().toISOString().split('T')[0];
        if (!this.downloadStats[date]) {
            this.downloadStats[date] = {};
        }
        if (!this.downloadStats[date][fileType]) {
            this.downloadStats[date][fileType] = 0;
        }
        this.downloadStats[date][fileType]++;
        
        localStorage.setItem('downloadStats', JSON.stringify(this.downloadStats));
        
        // Enviar estadística a Airtable (opcional)
        this.sendDownloadStats(fileName, fileType);
    }

    async sendDownloadStats(fileName, fileType) {
        try {
            await fetch(`${AIRTABLE_CONFIG.baseUrl}/Estadisticas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fields: {
                        Archivo: fileName,
                        Tipo: fileType,
                        Fecha: new Date().toISOString(),
                        IP: await this.getUserIP()
                    }
                })
            });
        } catch (error) {
            console.error('Error enviando estadísticas:', error);
        }
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    getAudioTitle(audioElement) {
        // Buscar título en elementos cercanos
        const container = audioElement.closest('div');
        const titleElement = container?.querySelector('h2, h3, h4');
        return titleElement?.textContent || 'Audio';
    }

    extractFileName(url) {
        return url.split('/').pop().split('?')[0];
    }

    getFileType(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    getFileIcon(fileType) {
        const icons = {
            mp3: '🎵',
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            default: '📁'
        };
        return icons[fileType] || icons.default;
    }

    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// FUNCIONES GLOBALES
function shareResource(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    }
}

// INICIALIZACIÓN
const downloadManager = new DownloadManager();

document.addEventListener('DOMContentLoaded', () => {
    downloadManager.loadDownloadLibrary();
});

export { DownloadManager };
