import _ from "lodash";
import { scrollTo } from "js/utilities/scrollTo.js";
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
function showTab(name) {
    const tab = document.querySelector(`#${name}-tab`);
    if (tab) {
        $(tab).tab("show");
    }
}

$(document).on("shown.bs.tab", event => {
    const activeTab = event.target;
    const activeTabName = activeTab.id;
    const pageHash = activeTabName.replace(/-tab$/, "");

    // перенос линии под активной вкладкой
    window._paperTabs.setUnderline(activeTab);

    // установка якоря в URL
    history.replaceState(null, "", `#${pageHash}`);

    // обновление URL формы
    const form = activeTab.closest(".paper-form");
    if (form) {
        const action = new URL(form.action);
        action.hash = pageHash;
        form.action = action.toString();
    }
});

// Обновление положения линии под вкладкой при ресайзе.
window.addEventListener(
    "resize",
    _.throttle(() => {
        window._paperTabs.updateUnderlines();
    }, 50)
);

// Скролл к первой ошибке
const invalidElement = getFirstError();
if (invalidElement) {
    const tabPanel = invalidElement.closest("[role=tabpanel]");
    if (tabPanel) {
        const tabName = tabPanel.id.replace(/-panel$/, "");
        showTab(tabName);
    }

    scrollTo(invalidElement);
}
