const url = '../docs/Developing Cloud Apps with Node.js and React.pdf';

let pdfDoc = null,
    pageNum = 1, 
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 2,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
    pageIsRendering = true;

    //Get the Page
    pdfDoc.getPage(num).then((page) => {
        //Set the Scale
        const viewport = page.getViewport({scale});
        canvas.height =viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx, viewport
        }
        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false; 

            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

    // Output Current Page
    document.querySelector('#page-num').textContent = num;
    });
};

//Check for pages Rendering
const queueRenderPage = num => {
    if(pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

// Show Previous Page
const showPreviousPage =() => {
    if(pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Show next Page
const showNextPage =() => {
    if(pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

// Get the Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    
    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum)
})
    .catch(err => {
        //Display Error
        const div = document.createElement('div');
        div.className = "error";
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);
        //Remove top bar
        document.querySelector('.top-bar').style.display = 'none'
    });

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPreviousPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
