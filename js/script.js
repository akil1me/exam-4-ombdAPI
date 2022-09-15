// ADD FORM, INPUT, SELECT 
const elForm = document.querySelector(".movies__form");
const elInputSerach = elForm.querySelector(".movies__input");
const elSelect = elForm.querySelector(".movies__sort");

// ADD RESULT LIST(ul)
const elResultList = document.querySelector(".movies__result-list");

// ADD TEMPLATE
const elTemplate = document.querySelector("#movies__template").content;

// SPINNER
const elSpinner = document.querySelector(".movies__spinner");

// MODAL
const modalContent = document.querySelector("movie__modal-content");

// BOOKMARK LIST
const bookmarkList = document.querySelector(".movies__bookmark-list");

// PAGINATION
let pageBtns = document.querySelectorAll(".movies__btns-page");
let pageResult = document.querySelector(".movies__page-res");
let page = 1;

let bookmarkInfo = JSON.parse(localStorage.getItem("movie"));
let bookmarkArr = bookmarkInfo || [];

// MODAL EVENT DELEGATION
const renderModal = data => {
  elResultList.addEventListener("click", (evt) => {
    if (evt.target.matches(".movies__button-info")) {
      let movieID = evt.target.closest(".movies__button-info").dataset.imdbID;
      let dataSearch = data.find(movie => {
        return movie.imdbID === movieID;
      })

      // MODAL IMG
      let elModalPoster = document.querySelector(".movie__modal-img");
      elModalPoster.src = dataSearch.Poster;
      elModalPoster.alt = dataSearch.Title;

      // MODAL TITLE
      let elModalTitle = document.querySelector(".modal-title");
      elModalTitle.innerHTML = `<span class="fw-bold">Title:</span> ${dataSearch.Title}`;

      // MODAL MOVIE YEAR
      let elModalCategory = document.querySelector(".modal__category");
      elModalCategory.innerHTML = `<span class="fw-bold">Category:</span> ${dataSearch.Type}`;

      // MODAL MOVIE YEAR
      let elModalYear = document.querySelector(".modal__year");
      elModalYear.innerHTML = `<span class="fw-bold">Year:</span> ${dataSearch.Year}`;

      // MODAL IMDB LINK
      let elModalLink = document.querySelector(".modal__imdb-link");
      elModalLink.href = `https://www.imdb.com/title/${dataSearch.imdbID}/?ref_=hm_fanfav_tt_i_2_pd_fp1`
    }
  })
}

// BOOKMARK ADD LIST
elResultList.addEventListener("click", (evt) => {
  if (evt.target.matches(".movies__bookmark-button")) {
    let bookmarkID = evt.target.closest(".movies__bookmark-button").dataset.imdbID;
    movieFetch(bookmarkID);
  }
})

function bookmarkAdd(obj) {
  bookmarkArr.push(obj);
  localStorage.setItem("movie", JSON.stringify(bookmarkArr));

  renderBooklist(bookmarkArr)
}
renderBooklist(bookmarkArr)

async function movieFetch(IMDbID) {
  const respone = await fetch(`http://www.omdbapi.com/?apikey=6d47d711&i=${IMDbID}`);

  const data = await respone.json();
  bookmarkAdd(data);
}

// BOOKLIST RENDER
function renderBooklist(bookArr) {
  bookmarkList.innerHTML = null;

  bookArr.forEach(book => {
    bookmarkList.innerHTML += `
    <li class="card mb-2 flex-row position-relative">
      <img class="rounded" src="${book.Poster}" width="70" height="100">

      <div class="ms-3 ">
      <h6 class="text-start pe-5">${book.Title}</h6>
      <p class="text-start">Year: ${book.Year}</p>
      </div>

      <button type="button" class="booklist__btn btn-close position-absolute top-0 end-0" id="${book.imdbID}"></button>
    </li>
    `
  })
}

// BOOKLIST RENDER DELITE
function bookmarkListDelite() {
  bookmarkList.addEventListener("click", evt => {
    if (evt.target.matches(".booklist__btn")) {
      let buttonId = evt.target.id;

      let buttonFindIndex = bookmarkArr.findIndex(movie => movie.imdbID === buttonId)

      bookmarkArr.splice(buttonFindIndex, 1);

      renderBooklist(bookmarkArr);
      localStorage.setItem("movie", JSON.stringify(bookmarkArr))
    }
  })
}
bookmarkListDelite()

// MOVIE RENDER TO TEMPLATE
const moviesRender = datas => {
  elResultList.innerHTML = null;

  const elFragment = document.createDocumentFragment();

  datas.forEach(data => {
    const copyFragment = elTemplate.cloneNode(true);

    copyFragment.querySelector(".movies__img-poster").src = data.Poster;
    copyFragment.querySelector(".movies__img-poster").alt = data.Title;

    copyFragment.querySelector(".movies__card-title").innerHTML = `${data.Title.split(" ").slice(0, 3).join(" ")}...`;

    copyFragment.querySelector(".movies__categoty").textContent = `Category: ${data.Type}`;

    copyFragment.querySelector(".movies__year").textContent = `Year: ${data.Year}`;

    copyFragment.querySelector(".movies__button-info").dataset.imdbID = data.imdbID;

    copyFragment.querySelector(".movies__bookmark-button").dataset.imdbID = data.imdbID;

    elFragment.append(copyFragment);
  })

  elResultList.appendChild(elFragment);

}
// ERROR 
const error = (err) => {
  elResultList.innerHTML = null;
  const errItem = document.createElement("li");
  errItem.className = "alert alert-danger";
  errItem.textContent = err;

  elResultList.appendChild(errItem);
}

// FETCH ASYNC
const moviesFetch = async (title = "", categoty = "", page = 1) => {
  try {
    const respone = await fetch(`https://www.omdbapi.com/?apikey=6d47d711&s=${title}&type=${categoty}&page=${page}`);

    const data = await respone.json();

    moviesRender(data.Search);

    renderModal(data.Search);

  } catch {
    error("Kechitasiz siz qidirgan kino y'oq");
  }
  finally {
    spinnerAdd()
  }
}

// REMOVE SPINNER
function spinnerRemove() {
  elSpinner.classList.remove("d-none");
}
// ADD SPINNER
function spinnerAdd() {
  elSpinner.classList.add("d-none");
}

// GET DEFAULT VALUE ON FETNCH
let serchValue = "spider man";
let selectValue = "movie";
moviesFetch(serchValue, selectValue, page);

spinnerRemove();

// FORM SUBMIT
elForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  elResultList.innerHTML = null;
  spinnerRemove();

  page = 1;
  pageResult.textContent = page;
  serchValue = elInputSerach.value.toLowerCase().trim();
  selectValue = elSelect.value;

  moviesFetch(serchValue, selectValue, page);
})

// ADD PEGINATION
pageBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.textContent == "preview") {
      if (page > 1) {
        --page;
        pageResult.textContent = page;
        moviesFetch(serchValue, selectValue, page);
      }
    } else {
      ++page;
      pageResult.textContent = page;
      moviesFetch(serchValue, selectValue, page);
    }
  })
})
