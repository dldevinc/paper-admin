// Autofocus for "add" or "change" popups
if (/(add|change)\/?$/.test(window.location.pathname)) {
    const form = document.querySelector(".paper-form");
    if (form) {
        const field = form.querySelector("input:not([type=hidden]), select, textarea");
        field && field.focus();
    }
}

// Close popup on Esc
document.addEventListener("keydown", function (event) {
    if (event.code === "Escape") {
        window.close();
    }
});
