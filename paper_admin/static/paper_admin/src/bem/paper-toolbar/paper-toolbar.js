/*
 * Задает смещение сверху у сайдбаров, имеющих класс sticky-top.
 */
const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

const updateTopOffset = function () {
    const header = document.querySelector(".paper-header");
    const stickyToolbars = document.querySelectorAll(".paper-toolbar.sticky-top");
    if (header && stickyToolbars.length) {
        stickyToolbars.forEach(function (toolbar) {
            toolbar.style.top = header.offsetHeight + rem + "px";
        });
    }
};

window.addEventListener("resize", updateTopOffset);
updateTopOffset();
