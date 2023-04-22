import "./index.scss";

const inputTypes = ["text", "password"];
const iconClasses = ["bi-eye-slash", "bi-eye"];

document.addEventListener("click", event => {
    const button = event.target.closest(".password-field__button");
    if (button) {
        const widget = button.closest(".password-field");
        if (widget) {
            const input = widget.querySelector("input");
            if (input) {
                const index = (inputTypes.indexOf(input.type) + 1) % 2;
                input.type = inputTypes[index];

                button.classList.add(iconClasses[index]);
                button.classList.remove(iconClasses[(index + 1) % 2]);
            }
        }
    }
});
