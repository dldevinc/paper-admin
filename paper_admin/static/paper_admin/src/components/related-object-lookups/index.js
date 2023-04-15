// -------------------------------------------
// Всплывающие окна выбора значений для
// raw_id_fields.
// -------------------------------------------

import popupUtils from "js/utilities/popup_utils.js";

function showRelatedObjectLookupPopup(triggeringLink) {
    return popupUtils.showAdminPopup(triggeringLink, /^lookup_/, true);
}

function dismissRelatedLookupPopup(win, chosenId) {
    const name = popupUtils.removePopupIndex(win.name);
    const elem = document.getElementById(name);

    if (elem.classList.contains("vManyToManyRawIdAdminField") && elem.value) {
        elem.value += "," + chosenId;
    } else {
        elem.value = chosenId;
    }

    popupUtils.removeRelatedWindow(win);
    win.close();
}

document.addEventListener("click", event => {
    // Клик на кнопку поиска объекта
    const triggeringLink = event.target.closest(".related-lookup");
    if (triggeringLink) {
        event.preventDefault();
        const jQueryEvent = $.Event("django:lookup-related");
        $(triggeringLink).trigger(jQueryEvent);
        if (!jQueryEvent.isDefaultPrevented()) {
            showRelatedObjectLookupPopup(triggeringLink);
        }
    }

    // Клик на объект из списка
    const dissmissLink = event.target.closest("a[data-popup-opener]");
    if (dissmissLink) {
        event.preventDefault();
        opener.dismissRelatedLookupPopup(window, dissmissLink.dataset.popupOpener);
    }
});

window.showRelatedObjectLookupPopup = showRelatedObjectLookupPopup;
window.dismissRelatedLookupPopup = dismissRelatedLookupPopup;
