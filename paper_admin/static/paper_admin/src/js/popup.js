/* global gettext */

// Autofocus for "add" page
if (/add\/?$/.test(window.location.pathname)) {
    const form = document.querySelector(".paper-form");
    if (form) {
        const field = form.querySelector("input:not([type=hidden]), select, textarea");
        field && field.focus();
    }
}

// Close popup on Esc
document.addEventListener("keydown", function(event) {
    if (event.which === 27) {
        window.close();
    }
});

// "Close popup" button
document.addEventListener("click", function(event) {
    const link = event.target.closest(".cancel-link");
    if (link) {
        event.preventDefault();
        window.close();
    }
});
