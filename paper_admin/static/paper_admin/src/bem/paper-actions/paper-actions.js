/*global gettext, interpolate, ngettext*/

import "./paper-actions.scss";

const TOGGLE_ALL_ID = "action-toggle";
const CHECKBOX_CLASS = "action-select";
const CHECKBOX_LABEL_SELECTOR = ".action-checkbox .custom-control";
const COUNTER_CLASS = "paper-actions__counter";
const QUESTION_CLASS= "paper-actions__question";
const ALL_CLASS = "paper-actions__all";
const ACROSS_CLASS = "paper-actions__select-across";
const CLEAR_CLASS = "paper-actions__clear";


function initActions(inputs) {
    let lastChecked = null;
    const table = document.getElementById("result_list");
    const allToggleInput = document.getElementById(TOGGLE_ALL_ID);

    // клик на чекбокс "выбрать все"
    allToggleInput.addEventListener("change", function() {
        const rows = inputs.map(input => input.closest("tr"));
        toggleRows(rows, this.checked);
        updateCounter(inputs);
    });

    // пользовательское событие выделения ряда таблицы
    table.addEventListener("select", function(event) {
        const target = event.target;
        if ((target.tagName !== "TR") || (target.closest("table") !== table)) {
            return
        }

        const state = Boolean(event.detail.state);
        const checkbox = target.querySelector(`.${CHECKBOX_CLASS}`);
        checkbox.checked = state;
        target.classList.toggle("selected", state);

        // все ли чекбоксы выделены
        allToggleInput.checked = inputs.find(input => !input.checked) == null;
    });

    table.addEventListener("click", function(event) {
        const target = event.target;

        // клик вне строк таблицы
        const row = target.closest("tr");
        if (!row) {
            return
        }

        const checkbox_clicked = target.closest(CHECKBOX_LABEL_SELECTOR);
        const checkbox = row.querySelector(`.${CHECKBOX_CLASS}`);

        if (event.shiftKey && lastChecked) {
            // массовое выделение (через Shift)
            const lastIndex = inputs.indexOf(lastChecked);
            const targetIndex = inputs.indexOf(checkbox);
            const startIndex = Math.min(lastIndex, targetIndex);
            const endIndex = Math.max(lastIndex, targetIndex);
            const input_slice = inputs.slice(startIndex, endIndex + 1);
            const rows = input_slice.map(input => input.closest("tr"));
            toggleRows(rows, lastChecked.checked);
        } else if (checkbox_clicked || (event.ctrlKey && !event.shiftKey)) {
            // клик на чекбокс или на строку через Ctrl
            lastChecked = checkbox;
            toggleRows([row], !checkbox.checked);
        }

        updateCounter(inputs);
    });

    // отмена выделения текста при клике с удержанным Shift
    table.addEventListener("mousedown", function(event) {
        const target = event.target;
        if (event.shiftKey && ((target.tagName === "TD") || (target.tagName === "TH"))) {
            event.preventDefault();
        }
    });

    // выбор всех записей таблицы
    document.addEventListener("click", function(event) {
        const target = event.target;
        if ((target.tagName === "A") && target.closest(`.${QUESTION_CLASS}`)) {
            event.preventDefault();
            selectAcross();
        }
    });

    // очистка выбора
    document.addEventListener("click", function(event) {
        const target = event.target;
        if ((target.tagName === "A") && target.closest(`.${CLEAR_CLASS}`)) {
            event.preventDefault();
            allToggleInput.checked = false;
            const rows = inputs.map(input => input.closest("tr"));
            toggleRows(rows, false);
            clearAcross(inputs);
            updateCounter(inputs);
        }
    });

    protectEditForm();
}

/**
 * Требование подтверждения выполнения действия, если в форме были изменения.
 */
function protectEditForm() {
    let list_editable_changed = false;
    const form = document.getElementById("changelist-form");

    form.addEventListener("change", function(event) {
        const target = event.target;
        if (target.tagName === "INPUT") {
            if (target.closest(`.${CHECKBOX_CLASS}`) || (target.id === TOGGLE_ALL_ID)) {
                // nothing
            } else {
                list_editable_changed = true;
            }
        } else if (target.tagName === "SELECT") {
            if (target.closest(".action-action")) {
                // nothing
            } else {
                list_editable_changed = true;
            }
        } else {
            list_editable_changed = true;
        }
    });

    form.addEventListener("click", function(event) {
        const target = event.target;
        const action_button = target.closest("[name=\"index\"]");
        if (action_button && list_editable_changed) {
            const agree = confirm(gettext("You have unsaved changes on individual editable fields. If you run an action, your unsaved changes will be lost."));
            if (!agree) {
                event.preventDefault();
            }
        }
    });

    form.addEventListener("click", function(event) {
        const target = event.target;
        const save_button = target.closest("[name=\"_save\"]");

        const action_selects = document.querySelectorAll(".actions select[name=\"action\"]");
        const action_changed = !Array.prototype.every.call(action_selects, function(select) {
            return !select.value
        });

        if (save_button && action_changed) {
            let apply;
            if (list_editable_changed) {
                apply = confirm(gettext("You have selected an action, but you haven't saved your changes to individual fields yet. Please click OK to save. You'll need to re-run the action."));
            } else {
                apply = confirm(gettext("You have selected an action, and you haven't made any changes on individual fields. You're probably looking for the Go button rather than the Save button."));
            }
            if (!apply) {
                event.preventDefault();
            }
        }
    });
}

/**
 * Установка/сброс галочки в чекбоксах.
 * @param {HTMLTableRowElement[]} rows
 * @param {Boolean} checked
 */
function toggleRows(rows, checked) {
    rows.forEach(function(row) {
        if (row && row.tagName === "TR") {
            row.dispatchEvent(new CustomEvent("select", {
                bubbles: true,
                cancelable: true,
                detail: {
                    state: checked
                }
            }));
        }
    });
}

function updateCounter(inputs) {
    const selected = inputs.reduce((sum, input) => sum + (input.checked ? 1 : 0), 0);
    const counters = document.querySelectorAll(`.${COUNTER_CLASS}`);
    counters.forEach(function(counter) {
        counter.innerHTML = interpolate(
            ngettext("%(sel)s of %(cnt)s selected", "%(sel)s of %(cnt)s selected", selected),
            {
                sel: selected,
                cnt: counter.dataset.actionsIcnt
            },
            true
        );
    });

    if (selected === inputs.length) {
        showQuestion();
    } else {
        clearAcross(inputs);
    }
}

/**
 * Показ ссылки "выбрать всё"
 */
function showQuestion() {
    const questions = document.querySelectorAll(`.${QUESTION_CLASS}`);
    questions.forEach(function(question) {
        question.hidden = false
    });
}

/**
 * Установка значения input-элементу для выполнения действия над всеми элементами
 * @param {Boolean} value
 */
function setAcrossInput(value) {
    const acrossInput = document.querySelectorAll(`.${ACROSS_CLASS}`);
    acrossInput.forEach(function(input) {
        input.value = Number(value);
    });
}

function selectAcross() {
    setAcrossInput(true);

    const counters = document.querySelectorAll(`.${COUNTER_CLASS}`);
    counters.forEach(function(counter) {
        counter.hidden = true
    });

    const allContainers = document.querySelectorAll(`.${ALL_CLASS}`);
    allContainers.forEach(function(container) {
        container.hidden = false
    });

    const questions = document.querySelectorAll(`.${QUESTION_CLASS}`);
    questions.forEach(function(question) {
        question.hidden = true
    });

    const clear_buttons = document.querySelectorAll(`.${CLEAR_CLASS}`);
    clear_buttons.forEach(function(clear_button) {
        clear_button.hidden = false
    });
}

function clearAcross(inputs) {
    setAcrossInput(false);

    const counters = document.querySelectorAll(`.${COUNTER_CLASS}`);
    counters.forEach(function(counter) {
        counter.hidden = false
    });

    const allContainers = document.querySelectorAll(`.${ALL_CLASS}`);
    allContainers.forEach(function(container) {
        container.hidden = true
    });

    const selected = inputs.reduce((sum, input) => sum + (input.checked ? 1 : 0), 0);
    const questions = document.querySelectorAll(`.${QUESTION_CLASS}`);
    questions.forEach(function(question) {
        question.hidden = selected !== inputs.length
    });

    const clear_buttons = document.querySelectorAll(`.${CLEAR_CLASS}`);
    clear_buttons.forEach(function(clear_button) {
        clear_button.hidden = true
    });
}


const checkboxes = document.querySelectorAll(`.${CHECKBOX_CLASS}`);
if (checkboxes.length) {
    initActions(Array.from(checkboxes));
}
