import {gsap} from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);


// Ошибка должна находиться в центральной части экрана, чтобы считаться видимой.
const ERROR_VISIBILITY_CROP_PERCENT = 30;
const errorContainers = document.querySelectorAll(".invalid, .inline-invalid, .paper-message--error");
const firstErrorContainer = Array.from(errorContainers).find(function(errorContainer) {
    return errorContainer.innerHTML !== "";
});

if (firstErrorContainer) {
    // скролл к ошибке
    const errorRect = firstErrorContainer.getBoundingClientRect();
    const errorTop = errorRect.top;
    const errorMinOffset = (ERROR_VISIBILITY_CROP_PERCENT / 100) * document.documentElement.clientHeight;
    const isVisible = (errorTop > errorMinOffset) && (errorTop < document.documentElement.clientHeight - errorMinOffset);
    if (!isVisible) {
        setTimeout(function() {
            gsap.to(window, {
                duration: 0.5,
                scrollTo: {
                    y: errorTop - Math.floor(document.documentElement.clientHeight * 0.33),
                    offsetY: -25
                }
            });
        });
    }
} else {
    const hash = location.hash.substr(1).replace(/-panel$/i, "-tab");
    const current_tab = hash && document.querySelector(`#${hash}`);
    if (current_tab) {
        $(current_tab).tab("show");
    }
}

$(document).on("shown.bs.tab", function(event) {
    const tab_name = event.target.getAttribute("aria-controls");
    if (tab_name) {
        history.replaceState(null, "", `#${tab_name}`);

        const form = document.getElementById("changeform");
        if (form) {
            const action = new URL(form.action);
            action.hash = tab_name;
            form.action = action.toString();
        }
    }
});
