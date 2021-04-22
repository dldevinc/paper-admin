import {gsap} from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
import "./paper-tabs.scss";

gsap.registerPlugin(ScrollToPlugin);

// Ошибка должна находиться в центральной части экрана, чтобы считаться видимой.
const ERROR_VISIBILITY_CROP_PERCENT = 30;

// При скролле показываем ошибку в позиции 33% от верха экрана.
const ERROR_SCROLL_POSITION = 33;


/**
 * Плавный скролл к указанной Y-координате.
 * @param {Element} element
 */
function scrollTo(element) {
    const rect = element.getBoundingClientRect();
    const topOffset = rect.top;
    const minOffset = (ERROR_VISIBILITY_CROP_PERCENT / 100) * document.documentElement.clientHeight;
    const isVisible = (topOffset > minOffset) && (topOffset < document.documentElement.clientHeight - minOffset);
    if (!isVisible) {
        setTimeout(function() {
            gsap.to(window, {
                duration: 0.5,
                scrollTo: {
                    y: topOffset - Math.floor(document.documentElement.clientHeight * ERROR_SCROLL_POSITION / 100),
                }
            });
        });
    }
}


/**
 * Поиск первой ошибки на форме для последующего скролла к ней.
 * @returns {Element}
 */
function getFirstError() {
    const errorContainers = document.querySelectorAll(".invalid, .inline-invalid, .paper-message--error");
    return Array.from(errorContainers).find(function(errorContainer) {
        return errorContainer.innerHTML !== "";
    });
}


/**
 * Открытие вкладки по имени.
 * @param {String} name
 */
function activateTab(name) {
    const tab = document.querySelector(`#${name}`);
    if (tab) {
        $(tab).tab("show");
    }
}


const invalidElement = getFirstError();
if (invalidElement) {
    scrollTo(invalidElement);
} else {
    const tabName = location.hash.substr(1).replace(/-panel$/i, "-tab");
    if (tabName) {
        activateTab(tabName);
    }
}


// Установка якоря при смене вкладки
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


