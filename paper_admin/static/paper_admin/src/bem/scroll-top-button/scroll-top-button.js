import {gsap} from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";

import "./scroll-top-button.scss";

gsap.registerPlugin(ScrollToPlugin);

document.addEventListener("click", function(event) {
    let button = event.target.closest(".scroll-top-button");
    if (button) {
        gsap.to(window, {
            duration: 0.3,
            scrollTo: {
                y: 0,
            }
        });
    }
});

window.addEventListener("scroll", function() {
    let button = document.querySelector(".scroll-top-button");
    if (button) {
        button.classList.toggle("show", window.pageYOffset >= (document.documentElement.clientHeight * .75));
    }
});
