var numberOfPages = 0;

var $book = $('#book');
var $bookWrapper = $('#flipbook-display');
var url = $book.data('pdf');

var rendered = [];
var firstPagesRendered = false;
var displaySinglePageFirst = true;


var pdf = null,
  pageNum = 1,
  viewport = null,
  $pdfContainer = $("#pdfContainer, #book"),
  scale = 1.3;

function renderPage(num) {

  pdf.getPage(num).then(function (page) {
    var canvasID = 'canv' + num;
    var annotationId = '#annotationLayer' + num;
    var canvas = document.getElementById(canvasID);
    if (canvas == null) return;
    var context = canvas.getContext('2d');
    if (window.innerWidth < viewport.width * 2);
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    page.render(renderContext);

    setupAnnotations(page, viewport, canvas, $(annotationId));

    // Update page counters
    document.getElementById('page-number').textContent = pageNum;
    document.getElementById('number-pages').textContent = pdf.numPages;
  });
}

function isMobile() {
  return $(window).width() < 1200;
}

function setupAnnotations(page, viewport, canvas, $annotationLayerDiv) {
  // var canvasOffset = $(canvas).offset();

  return page.getAnnotations().then(function (annotationsData) {
    Object.assign(viewport, { dontFlip: true })

    for (var i = 0; i < annotationsData.length; i++) {
      var data = annotationsData[i];
      var annotation = PDFJS.Annotation.fromData(data);
      if (!annotation || !annotation.hasHtml()) {
        continue;
      }

      var element = annotation.getHtmlElement(page.commonObjs);
      data = annotation.getData();
      var rect = data.rect;
      var view = page.view;
      rect = PDFJS.Util.normalizeRect([
        rect[0],
        view[3] - rect[1] + view[1],
        rect[2],
        view[3] - rect[3] + view[1]]
      );

      element.style.left = (rect[0] * scale) + 'px';
      element.style.top = (rect[1] * scale) + 'px';
      element.style.position = 'absolute';
      element.setAttribute('target', '_blank');

      $(element).css({ "transform": "scale(" + scale + ")", "transform-origin": "left top" })

      if (data.subtype === 'Link' && !data.url) {
        // In this example,  I do not handle the `Link` annotations without url.
        // If you want to handle those links, see `web/page_view.js`.
        continue;
      }
      $annotationLayerDiv.append(element);
    }
  });
}


// Adds the pages that the book will need
function addPage(page, book) {
  // 	First check if the page is already in the book
  if (!book.turn('hasPage', page)) {

    // Create an element for this page
    var element = $('<div />', { 'class': 'page ' + ((page % 2 === 0) ? 'odd' : 'even'), 'id': 'page-' + page });
    element.html('<div class="data"><canvas id="canv' + page + '"></canvas><div id="annotationLayer' + page + '" class="annotationLayer"></div></div>');
    book.turn('addPage', element, page);
  }
}

function setScale() {
  var windowSize = $(window).width();

  if (windowSize < 768) {
    scale = scaleMobile || scale;
  } else if (windowSize < 1200) {
    scale = scaleTablet || scale;
  } else if (windowSize < 1480) {
    scale = .55;//scaleLaptop || scale;
  } else {
    scale = .7;//scaleDesktop || scale;
  }
}

$(window).ready(function () {
  $bookWrapper.addClass('loadingFlipbook');

  setScale();

  PDFJS.workerSrc = '/modules/symprehome/views/js/pdf.min.worker.js';
  // PDFJS.disableWorker = true;
  PDFJS.getDocument(url).then(function (pdfDoc) {

    numberOfPages = pdfDoc.numPages;
    pdf = pdfDoc;

    pdf.getPage(1).then(function (page) {
      viewport = page.getViewport(scale);
      return pdf;
    }).then(function (pdf) {
      $book.turn.pages = numberOfPages;

      $book.turn({
        acceleration: !isMobile(),
        pages: numberOfPages,
        elevation: 0,
        gradients: false,
        duration: 500,
        page: (isMobile() || displaySinglePageFirst) ? 1 : 2,
        display: (isMobile() || displaySinglePageFirst) ? 'single' : 'double',
        when: {
          turning: function (e, page, view) {
            if (firstPagesRendered && !isMobile() && displaySinglePageFirst && page > 1) {
              $(this).turn('display', 'double');
            }

            if (firstPagesRendered && page < 2 && displaySinglePageFirst) {
              $(this).turn('display', 'single');
            }

            $pdfContainer.css("height", viewport.height)
              .css("width", isMobile() || (displaySinglePageFirst && page < 2) ? viewport.width + "px" : viewport.width * 2 + "px");

            // Gets the range of pages that the book needs right now
            var range = $(this).turn('range', page);

            // Check if each page is within the book
            for (page = range[0]; page <= range[1]; page++) {
              addPage(page, $(this));
            }
          },

          turned: function (e, page, view) {

            $('#page-number').val(page);

            if (firstPagesRendered) {
              var range = $(this).turn('range', page);
              for (page = range[0]; page <= range[1]; page++) {
                if (!rendered[page]) {
                  renderPage(page);
                  rendered[page] = true;
                }
              }
            }

          }
        }
      });

      $('#number-pages').html(numberOfPages);

      $('#page-number').keydown(function (e) {

        var p = $('#page-number').val();
        if (e.keyCode == 13) {
          $book.turn('page', p);
          renderPage(p);
        }

      });

      var n = numberOfPages;

      if (displaySinglePageFirst && n > 5) {
        n = 5;
      } else if (n > 6) {
        n = 6
      }
      for (page = 1; page <= n; page++) {
        renderPage(page);
        rendered[page] = true;
      }
      firstPagesRendered = true;
      $bookWrapper.removeClass('loadingFlipbook');
    });
  });

  $('.js-flipbook-close').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#flipbook-display').removeClass('--show');
  })

  $('.js-flipbook-show').on('click', function (e) {
    if ($(window).width() >= 1200) {
      e.preventDefault();
      e.stopPropagation();
      $('#flipbook-display').addClass('--show');
    }
  })
});

$(window).bind('keydown', function (e) {

  if (e.target && e.target.tagName.toLowerCase() != 'input')
    if (e.keyCode == 37)
      $book.turn('previous');
    else if (e.keyCode == 39)
      $book.turn('next');

});

// Previous page of the PDF
$("#pdf-prev").on('click', function () {
  $book.turn('previous');
});

// Next page of the PDF
$("#pdf-next").on('click', function () {
  if ($book.turn('view')[0] === 1) {
    $book.turn('page', 3);
  } else {
    $book.turn('next');
  }

});