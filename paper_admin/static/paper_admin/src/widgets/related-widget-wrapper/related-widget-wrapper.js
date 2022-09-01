import popupUtils from "js/utilities/popup_utils";

import "./related-widget-wrapper.scss";

// -------------------------------------------
// Обновление ссылок на кнопках при изменении
// значения <select>.
// -------------------------------------------

function setRelatedObjectLinks(widget, objId) {
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

document.addEventListener("change", event => {
    const widget = event.target.closest(".related-widget-wrapper");
    const triggeringSelect = widget && widget.querySelector("select");
    if (triggeringSelect) {
        const jQueryEvent = $.Event("django:update-related");
        $(triggeringSelect).trigger(jQueryEvent);
        if (!jQueryEvent.isDefaultPrevented()) {
            setRelatedObjectLinks(widget, triggeringSelect.value);
        }
    }
});

document.querySelectorAll(".related-widget-wrapper").forEach(widget => {
    const triggeringSelect = widget.querySelector("select");
    if (triggeringSelect) {
        setRelatedObjectLinks(widget, triggeringSelect.value);
    }
});

// для обратной совместимости
window.updateRelatedObjectLinks = triggeringSelect => {
    const widget = triggeringSelect.closest(".related-widget-wrapper");
    setRelatedObjectLinks(widget, triggeringSelect.value);
};

// -------------------------------------------
// Всплывающие окна для добавлений, изменения
// и удаления значений из FK и M2M-виджетов.
// -------------------------------------------

function showRelatedObjectPopup(triggeringLink) {
    return popupUtils.showAdminPopup(triggeringLink, /^(change|add|delete)_/, false);
}

document.addEventListener("click", event => {
    const triggeringLink = event.target.closest(".related-widget-wrapper__link");
    if (triggeringLink) {
        event.preventDefault();
        if (triggeringLink.href) {
            const jQueryEvent = $.Event("django:show-related", {href: triggeringLink.href});
            $(triggeringLink).trigger(jQueryEvent);
            if (!jQueryEvent.isDefaultPrevented()) {
                showRelatedObjectPopup(triggeringLink);
            }
        }
    }
});

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
    return document.querySelectorAll(`[data-model-ref="${modelRef}"] select`);
}

function _addSelectOption(select, newId, newRepr, selected) {
    select.options[select.options.length] = new Option(newRepr, newId, !!selected, !!selected);

    // Trigger a change event to update related links if required.
    select.dispatchEvent(
        new Event("change", {
            bubbles: true,
            cancelable: true
        })
    );
}

function dismissAddRelatedObjectPopup(win, newId, newRepr) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        _addSelectOption(element, newId, newRepr, true);

        getRelatedSelects(win).forEach(select => {
            if (select === element) {
                return;
            }

            _addSelectOption(select, newId, newRepr);
        });
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

function _updateSelectOption(select, objId, newRepr, newId) {
    const isOptionSelected = Array.from(select.selectedOptions).some(
        option => option.value === objId
    );

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

function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        _updateSelectOption(element, objId, newRepr, newId);

        getRelatedSelects(win).forEach(select => {
            if (select === element) {
                return;
            }

            _updateSelectOption(select, objId, newRepr, newId);
        });
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

function _deleteSelectOption(select, objId) {
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

function dismissDeleteRelatedObjectPopup(win, objId) {
    const name = popupUtils.removePopupIndex(win.name);
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        _deleteSelectOption(element, objId);

        getRelatedSelects(win).forEach(select => {
            if (select === element) {
                return;
            }

            _deleteSelectOption(select, objId);
        });
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
