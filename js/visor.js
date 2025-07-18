// visor.js - PDF.js embebido UX
const urlParams = new URLSearchParams(window.location.search);
const file = urlParams.get('file');
const pdfUrl = file ? decodeURIComponent(file) : null;

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const viewer = document.getElementById('pdf-viewer');
const loading = document.getElementById('visor-loading');
const errorDiv = document.getElementById('visor-error');
const downloadBtn = document.getElementById('download');

let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null, scale = 1.1;

function renderPage(num) {
  pageRendering = true;
  loading.style.display = 'block';
  errorDiv.style.display = 'none';
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    viewer.innerHTML = '';
    viewer.appendChild(canvas);
    const renderContext = { canvasContext: context, viewport: viewport };
    const renderTask = page.render(renderContext);
    renderTask.promise.then(function() {
      loading.style.display = 'none';
      pageRendering = false;
      document.getElementById('page_num').textContent = num;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}
function onZoomIn() {
  scale = Math.min(scale + 0.2, 2.5);
  queueRenderPage(pageNum);
}
function onZoomOut() {
  scale = Math.max(scale - 0.2, 0.5);
  queueRenderPage(pageNum);
}

if (pdfUrl) {
  downloadBtn.href = pdfUrl;
  loading.style.display = 'block';
  pdfjsLib.getDocument(pdfUrl).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
  }, function(error) {
    loading.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'No se pudo cargar el PDF. (' + error.message + ')';
  });
} else {
  loading.style.display = 'none';
  errorDiv.style.display = 'block';
  errorDiv.textContent = 'No se especificó ningún archivo PDF.';
}

document.getElementById('prev').addEventListener('click', onPrevPage);
document.getElementById('next').addEventListener('click', onNextPage);
document.getElementById('zoom_in').addEventListener('click', onZoomIn);
document.getElementById('zoom_out').addEventListener('click', onZoomOut);
