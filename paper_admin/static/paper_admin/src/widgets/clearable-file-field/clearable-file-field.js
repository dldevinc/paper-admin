import "./clearable-file-field.scss";

// Вставка имени файла в название кнопки
document.addEventListener("change", function(event) {
    const widget = event.target.closest(".clearable-file-field");
    if (widget && (event.target.type === "file")) {
        const fileName = event.target.value.split("\\").pop();
        const caption = widget.querySelector(".clearable-file-field__button span");
        if (caption) {
            if (fileName) {
                caption.textContent = fileName;
            } else {
                caption.textContent = caption.dataset.initialText;
            }
        }
    }
});
