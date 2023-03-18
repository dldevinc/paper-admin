import anime from "animejs";

import "./scroll-top-button.scss";

document.addEventListener("click", event => {
    const button = event.target.closest(".scroll-top-button");
    if (button) {
        anime({
            targets: document.documentElement,
            scrollTop: 0,
            easing: "easeOutExpo",
            duration: 300
        })
    }
});

window.addEventListener("scroll", () => {
    const button = document.querySelector(".scroll-top-button");
    if (button) {
        button.classList.toggle("show", window.scrollY >= document.documentElement.clientHeight * 0.75);
    }
});
