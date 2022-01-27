import "./email-field.scss";

function update(event) {
    const widget = event.target.closest(".email-field");
    if (widget) {
        const input = widget.querySelector("input");
        const link = widget.querySelector(".email-field__link");
        if (link) {
            const email = input.value.trim();
            if (email) {
                link.href = "mailto:" + email;
            } else {
                link.removeAttribute("href");
            }
        }
    }
}

document.addEventListener("input", update);
document.addEventListener("change", update);
