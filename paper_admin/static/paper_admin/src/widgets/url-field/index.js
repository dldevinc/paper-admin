function update(event) {
    const widget = event.target.closest(".url-field");
    if (widget) {
        const input = widget.querySelector("input");
        const link = widget.querySelector(".url-field__link");
        if (link) {
            const url = input.value.trim();
            if (url) {
                link.href = url;
            } else {
                link.removeAttribute("href");
            }
        }
    }
}

document.addEventListener("input", update);
document.addEventListener("change", update);
