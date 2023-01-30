const apiRoot = "/gutenbergpress/catalog/";
const bookRoot = "/tile/";
const listSize = document.querySelector("#num-disp-slt");


var db = new Dexie("titles");
db.version(1).stores({
  titles: "_id,title,author,sortkey",
});
db.open();

function setPgCount() {
  let size = listSize.value;
  localStorage.setItem("pgCount", size);
}

const Spinner = {
  create(loc = "#spinner-container") {
    let container = document.querySelector(loc);
    container.append(tag("div", { id: "spinner" }));
  },
  destroy() {
    const spinner = document.querySelector("#spinner");
    if (spinner) {
      spinner.remove();
    }
  },
};

async function GetTitles(letter = "") {
  let respObject = await fetch(apiRoot + letter);
  return respObject.json();
}

const Paginate = {
  Prev() {
    let curPg = Number(sessionStorage.getItem('cur_pg'));
    sessionStorage.setItem('cur_pg', curPg - 1);
    BuildIndex(localStorage.getItem('active_key'));
  },
  Next() {
    let curPg = Number(sessionStorage.getItem('cur_pg'));
    sessionStorage.setItem('cur_pg', curPg + 1);
    BuildIndex(localStorage.getItem('active_key'));
  }
}

function CreatePagination(titleList) {

  let pageSize = +localStorage.getItem('pgCount') || 25;
  let pgKeys = [];

  let pg = Number(sessionStorage.getItem('cur_pg'));
  document.getElementById('pg-position').innerText = pg + 1;

  for (let i = 0; i < titleList.length; i += Number(pageSize)) {
    pgKeys.push([i, i + Number(pageSize)]);
  }

console.log(pgKeys.length);

  if (pgKeys.length <= pg + 1) {
    document.getElementById("pg-next").disabled = true;
  } else {
    document.getElementById("pg-next").disabled = false;
  }

if (pg > 0) {
  document.getElementById("pg-prev").disabled = false;
} else {
  document.getElementById("pg-prev").disabled = true;
}

  let pgActive = pgKeys[pg]
  const container = document.querySelector("#results");
  Spinner.destroy();
  container.replaceChildren(...titleList.slice(pgActive[0], pgActive[1]));
}

function displayCatalog(callkey) {
  function TitlesList(key = callkey) {
    return db.titles
      .where("sortkey")
      .equalsIgnoreCase(key)
      .sortBy("title")
      .then((bookObj) => {
        if (bookObj.length === 0) {
          TitlesList(key + "A");
        } else {
          var listContainer = [];
          bookObj.forEach((element) => {
            listContainer.push(buildAnchor(element));
          });
          CreatePagination(listContainer);
        }
      });
  }

  function buildAnchor(bookInfo) {
    const childDiv = tag("div", { class: "list-item" });
    let bookLink = tag("a", { href: `/title/${bookInfo._id}` });
    let authorLink = tag("a", { href: `/title/${bookInfo._id}` });
    bookLink.innerText = bookInfo.title;
    authorLink.innerText = ` by ${bookInfo.author}`;
    childDiv.append(bookLink, authorLink);
    return childDiv;
  }
  TitlesList();
}

async function BuildIndex(key = "A") {
  let letter = key.charAt(0);
  localStorage.setItem('active_key', key);
  if (!localStorage.getItem(`index_${letter}`)) {
    Spinner.create();
    GetTitles(letter).then((value) => {
      db.titles.bulkAdd(value).then(() => {
        localStorage.setItem(`index_${letter}`, true);
        BuildIndex(letter);
      });
    });
  } else {
    displayCatalog(key);
    db.titles.count().then((value) => {
      // console.log("items already loaded");
      // console.log(`with ${value} items`);
    });
  }
}

async function refresh(key = "A") {
  document.getElementById(`key-${key}`).focus();
  sessionStorage.setItem('cur_pg', 0);
  BuildIndex(key);
}

window.addEventListener("load", async (e) => {
  
  sessionStorage.setItem('cur_pg', 0);
  refresh();
  listSize.addEventListener("change", () => {
    setPgCount();
    BuildIndex(localStorage.getItem('active_key'));
  });
  listSize.value = localStorage.getItem("pgCount");
});
