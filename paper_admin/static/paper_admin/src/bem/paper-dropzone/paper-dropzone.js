import "./paper-dropzone.scss";

const OVERLAY_CLASS = "paper-dropzone__overlay";
const OVERLAY_HIGHLIGHTED = "paper-dropzone__overlay--highlighted";


document.addEventListener(
    "dragenter",
    event => {
        const dropzone = event.target.closest(".paper-dropzone");
        if (dropzone) {
            const overlay = dropzone.querySelector(`.${OVERLAY_CLASS}`);
            overlay && overlay.classList.add(OVERLAY_HIGHLIGHTED);
        }
    },
    true
);

document.addEventListener(
    "dragleave",
    event => {
        const dropzone = event.target.closest(".paper-dropzone");
        if (dropzone) {
            const overlay = dropzone.querySelector(`.${OVERLAY_CLASS}`);
            overlay && overlay.classList.remove(OVERLAY_HIGHLIGHTED);
        }
    },
    true
);

document.addEventListener(
    "drop",
    event => {
        const dropzone = event.target.closest(".paper-dropzone");
        if (dropzone) {
            const overlay = dropzone.querySelector(`.${OVERLAY_CLASS}`);
            overlay && overlay.classList.remove(OVERLAY_HIGHLIGHTED);
        }
    },
    true
);
