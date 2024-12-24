var pageNum = 1;
var maxPageNum;

function loadPdf(element, pageNum) {
    // Clear any existing content
    $(element).empty();
    
    var spinner = `
        <div class="spinner-container">
            <div class="christmas-loader">
                <div class="christmas-tree">🎄</div>
                <div class="ornaments">
                    <span>🎅</span>
                    <span>🎁</span>
                    <span>⭐</span>
                </div>
            </div>
            <span class="loading-text">Loading Christmas Story...</span>
        </div>`;
    $(element).append(spinner);

    var container = document.createElement('div');
    container.className = 'pdf-container';
    // Add container to DOM immediately
    $(element).append(container);
    
    var data = $(element).data('pdf');
    
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';

    var loadingTask = pdfjsLib.getDocument(data);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');
        maxPageNum = pdf.numPages;
        updatePageDisplay();
        renderPage(pdf, container, function() {
            $('.spinner-container').remove();
        }, pageNum);
    }, function(reason) {
        console.error(reason);
        $(element).html('<div class="error-message">Error loading PDF: ' + reason.message + '</div>');
    });
}

function renderPage(pdf, container, renderCompleteCallback, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        // Get container dimensions (accounting for controls and padding)
        var containerWidth = $(container).width();
        var containerHeight = window.innerHeight - 150;
        
        // Get initial viewport
        var viewport = page.getViewport({ scale: 1.0 });
        
        // Calculate scales for width and height
        var scaleWidth = containerWidth / viewport.width;
        var scaleHeight = containerHeight / viewport.height;
        
        // Use the smaller scale to ensure page fits both width and height
        // Multiply by 2 to make it 200% bigger
        var scale = Math.min(scaleWidth, scaleHeight) * 2;
        
        // Get new viewport with calculated scale
        viewport = page.getViewport({ scale: scale });

        // Create canvas
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        
        // Set dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        // Clear container and add new canvas
        $(container).empty();
        $(container).append(canvas);
        
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function() {
            renderCompleteCallback();
        });
    });
}

function updatePageDisplay() {
    document.getElementById('page-num').textContent = 
        `Page ${pageNum} of ${maxPageNum}`;
}

function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    $("#pdf").pdf();
    updatePageDisplay();
}

function onNextPage() {
    if (pageNum >= maxPageNum) return;
    pageNum++;
    $("#pdf").pdf();
    updatePageDisplay();
}

(function($) {
    $.fn.pdf = function() {
        loadPdf(this, pageNum);
        return this;
    };
}(jQuery));

$(document).ready(function() {
    $("#pdf").pdf();
    document.getElementById('prev').addEventListener('click', onPrevPage);
    document.getElementById('next').addEventListener('click', onNextPage);
}); 