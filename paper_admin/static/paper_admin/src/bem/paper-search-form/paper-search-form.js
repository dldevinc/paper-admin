import "./paper-search-form.scss";

// Выделение текста в поле поиска при фокусе
const form = document.querySelector(".paper-search-form");
const input = form && form.querySelector(".form-control");
input &&
    input.addEventListener("focus", () => {
        input.select();
    });
