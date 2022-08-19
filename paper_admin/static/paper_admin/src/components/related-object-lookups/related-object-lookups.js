// -------------------------------------------
// Всплывающие окна выбора значений для
// raw_id_fields.
// -------------------------------------------

function showAdminPopup(triggeringLink, name_regexp, add_popup) {
    const name = triggeringLink.id.replace(name_regexp, "");
    let href = triggeringLink.href;
    if (add_popup) {
        if (href.includes("?")) {
            href += "?_popup=1";
        } else {
            href += "&_popup=1";
        }
    }

    // Центрирование popup
    const browser_left = typeof window.screenX !== "undefined" ? window.screenX : window.screenLeft,
        browser_top = typeof window.screenY !== "undefined" ? window.screenY : window.screenTop,
        browser_width = typeof window.outerWidth !== "undefined" ? window.outerWidth : document.body.clientWidth,
        browser_height = typeof window.outerHeight !== "undefined" ? window.outerHeight : document.body.clientHeight,
        popup_width = Math.max(940, browser_width * 0.7),
        popup_height = Math.max(600, browser_height * 0.7),
        top_position = browser_top + Math.round((browser_height - popup_height) / 2),
        left_position = browser_left + Math.round((browser_width - popup_width) / 2);

    const win = window.open(
        href,
        name,
        "width=" +
            popup_width +
            ",height=" +
            popup_height +
            ",top=" +
            top_position +
            ",left=" +
            left_position +
            ",resizable=yes,scrollbars=yes"
    );

    win.focus();
    return false;
}

function showRelatedObjectLookupPopup(triggeringLink) {
    return showAdminPopup(triggeringLink, /^lookup_/, true);
}

function dismissRelatedLookupPopup(win, chosenId) {
    const name = win.name;
    const elem = document.getElementById(name);
    if (elem.classList.contains("vManyToManyRawIdAdminField") && elem.value) {
        elem.value += "," + chosenId;
    } else {
        document.getElementById(name).value = chosenId;
    }
    win.close();
}

document.addEventListener("click", function (event) {
    const triggeringLink = event.target.closest(".related-lookup");
    if (triggeringLink) {
        event.preventDefault();
        const jQueryEvent = $.Event("django:lookup-related");
        $(triggeringLink).trigger(jQueryEvent);
        if (!jQueryEvent.isDefaultPrevented()) {
            showRelatedObjectLookupPopup(triggeringLink);
        }
    }

    const dissmissLink = event.target.closest("a[data-popup-opener]");
    if (dissmissLink) {
        event.preventDefault();
        opener.dismissRelatedLookupPopup(window, dissmissLink.dataset.popupOpener);
    }
});

window.showRelatedObjectLookupPopup = showRelatedObjectLookupPopup;
window.dismissRelatedLookupPopup = dismissRelatedLookupPopup;

export { showAdminPopup };
