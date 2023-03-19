/**
 * Добавление CSS-класса на элемент <html> при перемещении файла в окно браузера.
 */

import dragUtils from "js/utilities/drag_utils.js";

const CSS_CLASS = "on-drag-file";
let drag_event_counter = 0;

document.addEventListener(
    "dragenter",
    event => {
        drag_event_counter++;
        if (dragUtils.containsFiles(event)) {
            event.preventDefault();
            document.documentElement.classList.add(CSS_CLASS);
        }
    },
    true
);

document.addEventListener(
    "dragleave",
    () => {
        if (--drag_event_counter === 0) {
            document.documentElement.classList.remove(CSS_CLASS);
        }
    },
    true
);

document.addEventListener(
    "drop",
    () => {
        drag_event_counter = 0;
        document.documentElement.classList.remove(CSS_CLASS);
    },
    true
);
