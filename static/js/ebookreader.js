


function GetEbook(bookId) {


    const parentDiv = document.getElementById("ebook-body");
    const ebookText = tag('div', {id:'ebook-text'});
    const ebookContainer = tag('div', {id:'ebook-container'});
    // parentDiv.innerHTML = '';


    var book = ePub('/gutenbergpress/catalog/title/'+bookId+'.epub');
    var rendition = book.renderTo("ebook-text", {manager: "continuous", 
                                                 flow:"paginated", 
                                                 'width': '100%', 
                                                 'height':'80vh'});
    ebookContainer.append(ebookText, CreateBookNavButtons(book));
    parentDiv.append(ebookContainer);
    
    let show = async function () {
        await rendition.display();
        Spinner.destroy();        
    };
    show();

};

function CreateBookNavButtons(bookObj) {
    const fragObj = document.createDocumentFragment();
    
    const nextButtonDiv = tag('button', {onclick: () => bookObj.rendition.next(), class:'pagination-button', id:'next-button'});
    const prevButtonDiv = tag('button', {onclick: () => bookObj.rendition.prev(), class:'pagination-button', id:'prev-button'});

    fragObj.append(nextButtonDiv, prevButtonDiv);
    return fragObj;
};


const Spinner = {
    create(loc = "#spinner-container") {
      let container = document.querySelector(loc);
      container.append(tag("div", { id: "spinner" }));
    },
    destroy() {
      const spinner = document.querySelector("#spinner-container");
      if (spinner) {
        spinner.remove();
      }
    },
  };