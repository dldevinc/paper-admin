import {scrollTo} from "js/utilities/scrollTo.js";
import "./paper-tabs.scss";

/**
 * Поиск первой ошибки на форме для последующего скролла к ней.
 * @returns {Element}
 */
function getFirstError() {
    return document.querySelector(".paper-widget--invalid, .paper-message--error");
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
$(document).on("shown.bs.tab", event => {
    const tab_name = event.target.getAttribute("aria-controls");
    if (tab_name) {
        history.replaceState(null, "", `#${tab_name}`);

        const form = event.target.closest(".paper-form");
        if (form) {
            const action = new URL(form.action);
            action.hash = tab_name;
            form.action = action.toString();
        }
    }
});
