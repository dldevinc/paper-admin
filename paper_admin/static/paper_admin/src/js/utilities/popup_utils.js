let popupIndex = 0;
const relatedWindows = [];

function dismissChildPopups() {
    relatedWindows.forEach(win => {
        if (!win.closed) {
            win.dismissChildPopups();
            win.close();
        }
    });
}

function setPopupIndex() {
    if (document.getElementsByName("_popup").length > 0) {
        const index = window.name.lastIndexOf("__") + 2;
        popupIndex = parseInt(window.name.substring(index));
    } else {
        popupIndex = 0;
    }
}

/**
 * @param {String} name
 * @returns {String}
 */
function addPopupIndex(name) {
    name = name + "__" + (popupIndex + 1);
    return name;
}

/**
 * @param {String} name
 * @returns {String}
 */
function removePopupIndex(name) {
    name = name.replace(new RegExp("__" + (popupIndex + 1) + "$"), "");
    return name;
}

/**
 * @param {Window} win
 */
function removeRelatedWindow(win) {
    const index = relatedWindows.indexOf(win);
    if (index > -1) {
        relatedWindows.splice(index, 1);
    }
}

/**
 * @param {HTMLElement} triggeringLink
 * @param {RegExp} name_regexp
 * @param {boolean} add_popup
 */
function showAdminPopup(triggeringLink, name_regexp, add_popup) {
    const name = addPopupIndex(triggeringLink.id.replace(name_regexp, ""));
    const href = new URL(triggeringLink.href);
    if (add_popup) {
        href.searchParams.set("_popup", "1");
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
        href.toString(),
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

    relatedWindows.push(win);
    win.focus();
}

window.dismissChildPopups = dismissChildPopups;

window.addEventListener("unload", () => {
    window.dismissChildPopups();
});

setPopupIndex();

const popupUtils = {
    showAdminPopup,
    removeRelatedWindow,
    removePopupIndex
};

export default popupUtils;
