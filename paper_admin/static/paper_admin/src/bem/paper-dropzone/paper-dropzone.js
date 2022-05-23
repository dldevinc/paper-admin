import "./paper-dropzone.scss";

document.addEventListener("dragenter", event => {
    const dropzone = event.target.closest(".paper-dropzone");
    if (dropzone) {
        const overlay = dropzone.querySelector(".paper-dropzone__overlay");
        overlay && overlay.classList.add("paper-dropzone__overlay--highlighted");
    }
}, true);

document.addEventListener("dragleave", event => {
    const dropzone = event.target.closest(".paper-dropzone");
    if (dropzone) {
        const overlay = dropzone.querySelector(".paper-dropzone__overlay");
        overlay && overlay.classList.remove("paper-dropzone__overlay--highlighted");
    }
}, true);
