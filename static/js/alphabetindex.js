// Not used in application - kept here only for reference

const apiRoot = '/gutenbergpress/catalog/'
const bookRoot = '/tile/'
const db = new PouchDB('titles');

var globalKey = 'A'
var globalItems = 25

async function GetTitles(letter = "") {
    let respObject = await fetch(apiRoot+letter);
    return respObject.json();
}

const Spinner = {
    create (loc='#spinner-container') {
        let container = document.querySelector(loc);
        container.append(tag('div', {id:'spinner'}))
    },
    destroy () {
        const spinner = document.querySelector('#spinner')
        if (spinner) {
        spinner.remove()
        };
    }
}

async function BuildIndex (letter= 'A') {
    const dbExists = await db.info();
    console.log(localStorage.getItem(`index_${letter}`));
    if(!JSON.parse(localStorage.getItem(`index_${letter}`))) {
        Spinner.create();
        let indexResp = await GetTitles(letter);
        await db.bulkDocs(indexResp)
        await db.createIndex({index: {fields: ['title', 'sortkey']}});
        localStorage.setItem(`index_${letter}`, JSON.stringify({exists:true}));
        return true
        } else {
            console.log("items already loaded")
            console.log(`with ${dbExists.doc_count} items`)             
        };
    
   };

async function getIndex (key, numberOfItems=globalItems, pgKey=null) {
    let results = await db.find({
        selector: {
            sortkey: {$eq: key},
            title: {$gt: pgKey}
        },
        sort: ['title'],
        limit: numberOfItems
    });
    return results
}

function displayCatalog (jsonObj) {
    function buildAnchor (bookInfo) {
        const childDiv = tag('div', {class:'list-item'});
        let bookLink = tag('a', {href: `/title/${bookInfo._id}`});
        let authorLink = tag('a', {href: ''})
        bookLink.innerText = bookInfo.title;
        authorLink.innerText = ` by ${bookInfo.author}`
        childDiv.append(bookLink, authorLink)
        return childDiv
    }
    const container =  document.querySelector('#results');
    const listContainer = []
    jsonObj.then( (value) => {
        value.docs.forEach(item => {
            listContainer.push(buildAnchor(item));  
        });
        Spinner.destroy()
        container.replaceChildren(...listContainer);
    })
    
}

async function refresh (key='A') {
    await BuildIndex(key);
        console.log(key);
        displayCatalog(getIndex(key));
        
}

function expand (char) {
    
}


window.addEventListener("load", async (e) =>{
        refresh();
});
