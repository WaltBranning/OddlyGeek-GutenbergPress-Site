// import tag from './tag.js';

function tag() {
    var node,
        args = arguments,

        compose = function (item, i) {
            if (i == 0) {
                node = document.createElement(item);
                if (item == 'a') node.setAttribute('href', '#');
            } else if (typeof item == 'string' || typeof item == 'number') {
                node.appendChild(document.createTextNode(item));
            } else if (item.tagName) {
                node.appendChild(item);
            } else if (Array.isArray(item)) {
                for (var i = 0, l = item.length; i < l; i++) {
                    compose(item[i]);
                }
            } else {
                for (var p in item) {
                    if (/^on/.test(p)) {
                        node.addEventListener(p.substr(2, p.length), item[p]);
                    } else if (typeof item[p] == 'boolean') {
                        if (item[p]) node.setAttribute(p, '');
                    } else {
                        node.setAttribute(p, item[p]);
                    }
                }
            }
        }

    for (var i = 0, l = args.length; i < l; i++) {
        compose(args[i], i);
    }

    return node;
}



const apiRoot = '/gutenbergpress/catalog/'

function SpaceReplace(strObj) {
    newObj = strObj.replace(/\s/g, '+');
    return newObj;
}


async function GetTitles(letter) {
    let respObject = await fetch(apiRoot+letter);
    let respJson = await respObject.json();
    CreateIndex(respJson);
}

async function GetTitlesByAuthor(author) {
    
    let respObject = await fetch(`${apiRoot}title/author/${author}`);
    let respJson = await respObject.json();
    CreateIndex(respJson);
};

async function GetAuthors(key) {
    let respObject = await fetch(`${apiRoot}/authors/${key}`);
    let respJson = await respObject.json();
    
    const parentDiv = document.getElementById("main-container");
    parentDiv.innerHTML = '';
    parentDiv.append(tag('div', {id:'author-list'}));
    authorList = document.getElementById('author-list');
    
    for (let i = 0; i < respJson.length; i++) {
        let author_name = ""
        const authorLink = tag('a', {onclick: () => GetTitlesByAuthor(respJson[i].id)});
        if (respJson[i].first_name) {
            author_name = `${respJson[i].last_name}, ${respJson[i].first_name}`;
        } else {
            author_name = respJson[i].last_name;
        };
        authorLink.innerText = author_name;
        authorList.append(authorLink);
    }

};

function CreateIndex(respJson) {
    // Takes a json response object containing title, book id , and author
    // and creates an index in the main content area in the dom
    const parentDiv = document.getElementById("main-container");
    parentDiv.innerHTML = '';
    parentDiv.append(tag('div', {id:'book-list'}));
    bookList = document.getElementById('book-list');

    for (var i = 0; i < respJson.length; i++) {
        
        const childDiv = tag('div', {class:'book-list-item'});
 
        let bookId = respJson[i]['id'];
        const bookLink = tag('a', {href: `/title/${bookId}`});
        bookLink.innerText = respJson[i]['title'];
        
        
        let author = respJson[i]['author']; 
        const authorLink = tag('a', {onclick: () => GetTitlesByAuthor(author)});
        authorLink.innerText = author;

        childDiv.append(bookLink, ' By ', authorLink);
        bookList.appendChild(childDiv);
    };
    
};

function CreateResponsiveNavigation() {

    function OpenIndexDiv() {
        const divToOpen = this.parentElement.getElementsByClassName('book-index-container')[this.id];
        
        if (divToOpen.style.display === "block"){
            divToOpen.style.display = 'none';    
        } else {
            divToOpen.style.display = 'block';
        };
        
    };

    const navCell = document.getElementsByClassName('nav-cell');
    for (let i=0; i < navCell.length; i++ ) {
        const navBtns = navCell[i].getElementsByClassName('nav-btn');    
        navBtns[0].addEventListener('click', OpenIndexDiv);
        navBtns[1].addEventListener('click', OpenIndexDiv);
        };   
};

document.onkeydown = (e) => {
    
    if (e.code == 'ArrowRight') {
        bookObj.rendition.next();
    } 
    else if (e.code == 'ArrowLeft') {
        bookObj.rendition.prev();

    };
};

document.addEventListener('click', (e) => {
    document.querySelector('.nav-cell .active')?.classList.remove('active');
  });

CreateResponsiveNavigation();