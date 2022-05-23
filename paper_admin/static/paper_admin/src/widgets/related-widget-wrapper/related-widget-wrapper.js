import { showAdminPopup } from "components/related-object-lookups";

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
        links.forEach(function (link) {
            link.classList.remove("disabled");
            link.href = link.dataset.hrefTemplate.replace("__fk__", objId);
        });
    } else {
        links.forEach(function (link) {
            link.classList.add("disabled");
            link.href = "";
        });
    }
}

document.addEventListener("change", function (event) {
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

document.querySelectorAll(".related-widget-wrapper").forEach(function (widget) {
    const triggeringSelect = widget.querySelector("select");
    if (triggeringSelect) {
        setRelatedObjectLinks(widget, triggeringSelect.value);
    }
});

// для обратной совместимости
window.updateRelatedObjectLinks = function (triggeringSelect) {
    const widget = triggeringSelect.closest(".related-widget-wrapper");
    setRelatedObjectLinks(widget, triggeringSelect.value);
};

// -------------------------------------------
// Всплывающие окна для добавлений, изменения
// и удаления значений из FK и M2M-виджетов.
// -------------------------------------------

function showRelatedObjectPopup(triggeringLink) {
    return showAdminPopup(triggeringLink, /^(change|add|delete)_/, false);
}

document.addEventListener("click", function (event) {
    const triggeringLink = event.target.closest(".related-widget-wrapper__link");
    if (triggeringLink) {
        event.preventDefault();
        if (triggeringLink.href) {
            const jQueryEvent = $.Event("django:show-related", { href: triggeringLink.href });
            $(triggeringLink).trigger(jQueryEvent);
            if (!jQueryEvent.isDefaultPrevented()) {
                showRelatedObjectPopup(triggeringLink);
            }
        }
    }
});

function dismissAddRelatedObjectPopup(win, newId, newRepr) {
    const name = win.name;
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        element.options[element.options.length] = new Option(newRepr, newId, true, true);

        // Trigger a change event to update related links if required.
        element.dispatchEvent(
            new Event("change", {
                bubbles: true,
                cancelable: true
            })
        );
    }

    win.close();
}

function dismissChangeRelatedObjectPopup(win, objId, newRepr, newId) {
    const name = win.name;
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        Array.from(element.options).forEach(function (option) {
            if (option.value === objId) {
                option.textContent = newRepr;
                option.value = newId;
            }
        });
    }

    const select2Text = element.nextElementSibling.querySelector(".select2-selection__rendered");
    if (select2Text) {
        // The element can have a clear button as a child.
        // Use the lastChild to modify only the displayed value.
        select2Text.lastChild.textContent = newRepr;
        select2Text.title = newRepr;
    }

    win.close();
}

function dismissDeleteRelatedObjectPopup(win, objId) {
    const name = win.name;
    const element = document.getElementById(name);
    if (element && element.tagName === "SELECT") {
        Array.from(element.options).forEach(function (option) {
            if (option.value === objId) {
                option.remove();
            }
        });

        // Trigger a change event to update related links if required.
        element.dispatchEvent(
            new Event("change", {
                bubbles: true,
                cancelable: true
            })
        );
    }

    win.close();
}

window.showRelatedObjectPopup = showRelatedObjectPopup;
window.dismissAddRelatedObjectPopup = dismissAddRelatedObjectPopup;
window.dismissChangeRelatedObjectPopup = dismissChangeRelatedObjectPopup;
window.dismissDeleteRelatedObjectPopup = dismissDeleteRelatedObjectPopup;

// Kept for backward compatibility
window.showAddAnotherPopup = showRelatedObjectPopup;
window.dismissAddAnotherPopup = dismissAddRelatedObjectPopup;
