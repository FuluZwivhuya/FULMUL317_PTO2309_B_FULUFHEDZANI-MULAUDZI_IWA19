/**I removed some codes because they were making my code break,
 * my default js file is on default.js.
 * It is basically how my code looked like after I tried removing errors, 
 * I did not link it to my html file */

import { books, authors, BOOKS_PER_PAGE, genres } from "./data.js";
let matches = books;
let page = 1;
let range = [0, 1];

if (!books && !Array.isArray(books)) throw new Error("Source required");
if (!range && range.length < 2)
  throw new Error("Range must be an array with two numbers");

const css = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },
  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
};

const fragment = document.createDocumentFragment();
const extract = books.slice(0, 36);

const createPreview = (props) => {
  const { author, image, title } = props;

  const previewElement = document.createElement("div");
  previewElement.innerHTML = `
        <div>${author}</div>
        <div>${title}</div>
        <img src="${image}" alt="${title}">
    `;

  return previewElement;
};

for (let i = 0; i < extract.length; i++) {
  const preview = createPreview({
    author: extract[i].author,
    id: extract[i].id,
    image: extract[i].image,
    title: extract[i].title,
  });

  fragment.appendChild(preview);
}

document.querySelector("[data-list-items]").appendChild(fragment);

const element = document.querySelector("[data-search-genres]");
const elementA = document.querySelector("[data-search-authors]");

element.innerHTML = `<option value="any">All Genres</option>`;
elementA.innerHTML = `<option value="any">All Authors</option>`;

for (const [_genre, name] of Object.entries(genres)) {
  const option = document.createElement("option");
  option.value = _genre;
  option.text = name;
  element.appendChild(option);
}

for (const [_author, name] of Object.entries(authors)) {
  const option = document.createElement("option");
  option.value = _author;
  option.text = name;
  elementA.appendChild(option);
}

let preferredTheme =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "night"
    : "day";
let v = preferredTheme ? "night" : "day";

const docElement = document.documentElement;
docElement.style.setProperty("--color-dark", css[v].dark);
docElement.style.setProperty("--color-light", css[v].light);

const showMoreButton = document.querySelector("[data-list-button]");
const remainingBooks = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);

showMoreButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remainingBooks})</span>
`;

showMoreButton.disabled = remainingBooks <= 0;

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = Object.fromEntries(formData);
    document.documentElement.style.setProperty(
      "--color-dark",
      css[result.v].dark
    );
    document.documentElement.style.setProperty(
      "--color-light",
      css[result.v].light
    );
    document.querySelector("[data-settings-overlay]").open = false;
  });

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (let i = 0; i < pathArray.length; i++) {
      const node = pathArray[i];
      const previewId = node?.dataset?.preview;

      if (previewId) {
        for (const singleBook of books) {
          if (singleBook.id === previewId) {
            active = singleBook;
            break;
          }
        }
      }
    }

    if (!active) {
      return;
    }

    document.querySelector("[data-list-active]").open = true;
    document.querySelector("[data-list-blur]").src = active.image;
    document.querySelector("[data-list-image]").src = active.image;
    document.querySelector("[data-list-title]").textContent = active.title;
    document.querySelector("[data-list-subtitle]").textContent = `${
      authors[active.author]
    } (${new Date(active.published).getFullYear()})`;
    document.querySelector("[data-list-description]").textContent =
      active.description;
  });

showMoreButton.addEventListener("click", () => {
  const startIndex = page * BOOKS_PER_PAGE;
  const endIndex = (page + 1) * BOOKS_PER_PAGE;
  const booksToShow = matches.slice(startIndex, endIndex);

  displayBooks(booksToShow);

  const remainingBooks = Math.max(matches.length - endIndex, 0);
  showMoreButton.disabled = remainingBooks <= 0;
  showMoreButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks})</span>
    `;

  page++;
});

document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    let filteredBooks = [...books];

    if (filters.genre !== "any") {
      filteredBooks = filteredBooks.filter((book) =>
        book.genres.includes(filters.genre)
      );
    }
    if (filters.author !== "any") {
      filteredBooks = filteredBooks.filter(
        (book) => book.author === filters.author
      );
    }
    if (filters.title.trim() !== "") {
      const searchTerm = filters.title.toLowerCase();
      filteredBooks = filteredBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTerm)
      );
    }

    displayBooks(filteredBooks);
  });

function displayBooks(booksToDisplay) {
  const fragment = document.createDocumentFragment();

  for (const book of booksToDisplay) {
    const preview = createPreview(book);
    fragment.appendChild(preview);
  }

  const listItems = document.querySelector("[data-list-items]");
  listItems.innerHTML = ""; // Clear previous content
  listItems.appendChild(fragment);
}
