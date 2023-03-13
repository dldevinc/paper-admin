import popupUtils from "js/utilities/popup_utils";

import "./index.scss";

/**
 * Обновление состояния кнопок "view", "change" и "delete".
 * @param {HTMLElement} widget
 * @param {Number|String} objId
 */
function updateRelatedObjectButtons(widget, objId) {
    const links = widget && widget.querySelectorAll(".view-related, .change-related, .delete-related");
    if (!links || !links.length) {
        return;
    }

    if (objId) {
        links.forEach(link => {
            link.classList.remove("disabled");
            link.href = link.dataset.hrefTemplate.replace("__fk__", objId);
        });
    } else {
        links.forEach(link => {
            link.classList.add("disabled");
            link.href = "";
        });
    }
}

// Обновление состояния кнопок "view", "change" и "delete"
// при изменении значения выпадающего списка.
document.addEventListener("change", event => {
    const widget = event.target.closest(".related-widget-wrapper");
    const triggeringSelect = widget && widget.querySelector("select");
    if (triggeringSelect) {
        const jQueryEvent = $.Event("django:update-related");
        $(triggeringSelect).trigger(jQueryEvent);
        if (!jQueryEvent.isDefaultPrevented()) {
            updateRelatedObjectButtons(widget, triggeringSelect.value);
        }
    }
});

// Инициализация кнопок "view", "change" и "delete"
// для выпадающих списков.
document.querySelectorAll(".related-widget-wrapper").forEach(widget => {
    const triggeringSelect = widget.querySelector("select");
    if (triggeringSelect) {
        updateRelatedObjectButtons(widget, triggeringSelect.value);
    }
});

// Для обратной совместимости.
window.updateRelatedObjectLinks = triggeringSelect => {
    const widget = triggeringSelect.closest(".related-widget-wrapper");
    updateRelatedObjectButtons(widget, triggeringSelect.value);
};

// -------------------------------------------------------------------------------------

/**
 * @param {HTMLElement} triggeringLink
 */
function showRelatedObjectPopup(triggeringLink) {
    return popupUtils.showAdminPopup(triggeringLink, /^(change|add|delete)_/, true);
}

// Окрытие всплывающего окна при клике на кнопки "add", "change" и "delete".
document.addEventListener("click", event => {
    const triggeringLink = event.target.closest(".related-widget-wrapper__link");
    if (triggeringLink) {
        event.preventDefault();
        const jQueryEvent = $.Event("django:show-related", { href: triggeringLink.href });
        $(triggeringLink).trigger(jQueryEvent);
        if (!jQueryEvent.isDefaultPrevented()) {
            showRelatedObjectPopup(triggeringLink);
        }
    }
});

/**
 * Возвращает выпадающие списки, связанные с той же моделью,
 * для которой был открыто окно.
 * @param {Window} win
 * @returns {HTMLElement[]}
 */
function getRelatedSelects(win) {
    let app, model;
    const path = win.location.pathname;

    // Extract the model from the popup url '.../<model>/add/' or
    // '.../<model>/<id>/change/' depending the action (add or change).
    const addMatch = path.match(/\/([^\/]+)\/([^\/]+)\/add/);
    const changeDeleteMatch = path.match(/\/([^\/]+)\/([^\/]+)\/[^\/]+\/(?:change|delete)\//);
    if (addMatch) {
        [app, model] = [addMatch[1], addMatch[2]];
    } else if (changeDeleteMatch) {
        [app, model] = [changeDeleteMatch[1], changeDeleteMatch[2]];
    } else {
        return [];
    }

    const modelRef = `${app}.${model}`;
    return Array.from(document.querySelectorAll(`[data-model-ref="${modelRef}"] select`));
}

/**
 * Добавление нового элемента в выпадающий список.
 * @param {HTMLSelectElement} select
 * @param {String} newId
 * @param {String} newRepr
 * @param {boolean} selected
 * @private
 */
function _addOption(select, newId, newRepr, selected) {
    select.options[select.options.length] = new Option(newRepr, newId, !!selected, !!selected);

    // Trigger a change event to update related links if required.
    select.dispatchEvent(
        new Event("change", {
            bubbles: true,
            cancelable: true
        })
    );
}

/**
 * Функция, вызываемая после успешного добавления объекта.
 * @param {Window} win
 * @param {String} newId
 * @param {String} newRepr
 */
function dismissAddRelatedObjectPopup(win, newId, newRepr) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element) {
        if (element.tagName === "SELECT") {
            _addOption(element, newId, newRepr, true);

            getRelatedSelects(win).forEach(select => {
                if (select === element) {
                    return;
                }

                _addOption(select, newId, newRepr);
            });
        } else if (element.tagName === "INPUT") {
            element.value = newId;
        }
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

/**
 * Обновление элемента выпадающего списка.
 * @param {HTMLSelectElement} select
 * @param {String} objId
 * @param {String} newRepr
 * @param {String} newId
 * @private
 */
function _updateOption(select, objId, newRepr, newId) {
    const isOptionSelected = Array.from(select.selectedOptions).some(option => option.value === objId);

    Array.from(select.options).forEach(option => {
        if (option.value === objId) {
            option.textContent = newRepr;
            option.value = newId;
        }
    });

    // Trigger a change event to update related links if required.
    select.dispatchEvent(
        new Event("change", {
            bubbles: true,
            cancelable: true
        })
    );

    if (isOptionSelected) {
        // Update select2 widget text
        const select2Widget = select.nextElementSibling.querySelector(".select2-selection__rendered");
        if (select2Widget) {
            select2Widget.lastChild.textContent = newRepr;
            select2Widget.title = newRepr;
        }
    }
}

/**
 * Функция, вызываемая после успешного изменения объекта.
 * @param {Window} win
 * @param {String} objId
 * @param {String} newRepr
 * @param {String} newId
 */
function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        _updateOption(element, objId, newRepr, newId);

        getRelatedSelects(win).forEach(select => {
            if (select === element) {
                return;
            }

            _updateOption(select, objId, newRepr, newId);
        });
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

/**
 * Удаление элемента из выпадающего списка.
 * @param {HTMLSelectElement} select
 * @param {String} objId
 * @private
 */
function _deleteOption(select, objId) {
    Array.from(select.options).forEach(option => {
        if (option.value === objId) {
            option.remove();
        }
    });

    // Trigger a change event to update related links if required.
    select.dispatchEvent(
        new Event("change", {
            bubbles: true,
            cancelable: true
        })
    );
}

/**
 * Функция, вызываемая после успешного удаления объекта.
 * @param {Window} win
 * @param {String} objId
 */
function dismissDeleteRelatedObjectPopup(win, objId) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element) {
        if (element.tagName === "SELECT") {
            _deleteOption(element, objId);

            getRelatedSelects(win).forEach(select => {
                if (select === element) {
                    return;
                }

                _deleteOption(select, objId);
            });
        } else if (element.tagName === "INPUT") {
            element.value = "";
        }
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

window.showRelatedObjectPopup = showRelatedObjectPopup;
window.dismissAddRelatedObjectPopup = dismissAddRelatedObjectPopup;
window.dismissChangeRelatedObjectPopup = dismissChangeRelatedObjectPopup;
window.dismissDeleteRelatedObjectPopup = dismissDeleteRelatedObjectPopup;

// Kept for backward compatibility
window.showAddAnotherPopup = showRelatedObjectPopup;
window.dismissAddAnotherPopup = dismissAddRelatedObjectPopup;
