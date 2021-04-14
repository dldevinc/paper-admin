function updateTopOffset() {
    let header = document.querySelector(".paper-header");
    let toolbar = document.querySelector(".paper-toolbar");
    if (toolbar && header) {
        let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        toolbar.style.top = header.offsetHeight + rem + "px";
    }
}

window.addEventListener("resize", updateTopOffset);
updateTopOffset();
