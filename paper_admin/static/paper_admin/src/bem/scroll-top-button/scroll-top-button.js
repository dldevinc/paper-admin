import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import "./scroll-top-button.scss";

gsap.registerPlugin(ScrollToPlugin);

document.addEventListener("click", event => {
    const button = event.target.closest(".scroll-top-button");
    if (button) {
        gsap.to(window, {
            duration: 0.3,
            scrollTo: {
                y: 0
            }
        });
    }
});

window.addEventListener("scroll", () => {
    const button = document.querySelector(".scroll-top-button");
    if (button) {
        button.classList.toggle("show", window.pageYOffset >= document.documentElement.clientHeight * 0.75);
    }
});
