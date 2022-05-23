import bsCustomFileInput from "bs-custom-file-input";

import "./file-field.scss";

bsCustomFileInput.init('.file-field input[type="file"]');

// Вставка имени файла в название кнопки
document.addEventListener("change", function (event) {
    const widget = event.target.closest(".file-field");
    if (widget && event.target.type === "file") {
        const fileName = event.target.value.split("\\").pop();
        const field = widget.querySelector(".file-field__field");
        if (field) {
            if (fileName) {
                field.textContent = fileName;
                field.classList.remove("file-field__field--empty");
            } else {
                field.textContent = field.dataset.initialText;
                field.classList.add("file-field__field--empty");
            }
        }
    }
});
