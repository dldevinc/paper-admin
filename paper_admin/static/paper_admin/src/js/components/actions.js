/*global gettext, interpolate, ngettext*/

import whenDomReady from "when-dom-ready";

const TOGGLE_ALL_ID = 'action-toggle';
const CHECKBOX_CLASS = 'action-select';
const CHECKBOX_LABEL_SELECTOR = '.action-checkbox .vCustomCheckbox';
const COUNTER_CLASS = 'action-counter';
const QUESTION_CLASS= 'action-question';
const ALL_CLASS = 'action-all';
const ACROSS_CLASS = 'select-across';
const CLEAR_CLASS = 'action-clear';


whenDomReady(function() {
    const checkboxes = document.querySelectorAll(`.${CHECKBOX_CLASS}`);
    if (checkboxes.length) {
        initActions(Array.from(checkboxes));
    }
});


function initActions(inputs) {
    let lastChecked = null;
    const table = document.getElementById('result_list');
    const allToggleInput = document.getElementById(TOGGLE_ALL_ID);

    // клик на чекбокс "выбрать все"
    allToggleInput.addEventListener('change', function() {
        const rows = inputs.map(input => input.closest('tr'));
        toggleRows(rows, this.checked);
        updateCounter(inputs);
    });

    // пользовательское событие выделения ряда таблицы
    table.addEventListener('select', function(event) {
        const target = event.target;
        if ((target.tagName !== 'TR') || (target.closest('table') !== table)) {
            return
        }

        const state = Boolean(event.detail.state);
        const checkbox = target.querySelector(`.${CHECKBOX_CLASS}`);
        checkbox.checked = state;
        target.classList.toggle('selected', state);

        // все ли чекбоксы выделены
        allToggleInput.checked = inputs.find(input => !input.checked) == null;
    });

    table.addEventListener('click', function(event) {
        const target = event.target;
        const row = target.closest('tr');
        const label_clicked = target.closest(CHECKBOX_LABEL_SELECTOR);
        const checkbox_label = row && row.querySelector(CHECKBOX_LABEL_SELECTOR);
        const checkbox = checkbox_label && checkbox_label.querySelector(`.${CHECKBOX_CLASS}`);

        // клик вне строк таблицы
        if (!row) {
            return
        }

        // отмена выделения чекбокса при клике на <label>
        if (label_clicked) {
            event.preventDefault();
        }

        if (event.shiftKey && lastChecked && (lastChecked !== checkbox)) {
            // массовое выделение (через Shift)
            const lastIndex = inputs.indexOf(lastChecked);
            const targetIndex = inputs.indexOf(checkbox);
            const startIndex = Math.min(lastIndex, targetIndex);
            const endIndex = Math.max(lastIndex, targetIndex);
            const input_slice = inputs.slice(startIndex, endIndex + 1);
            const rows = input_slice.map(input => input.closest('tr'));
            toggleRows(rows, lastChecked.checked);
        } else if (label_clicked || (event.ctrlKey && !event.shiftKey)) {
            // клик на чекбокс или на строку через Ctrl
            lastChecked = checkbox;
            toggleRows([row], !checkbox.checked);
        }
    });

    // отмена выделения текста при клике с удержанным Shift
    table.addEventListener('mousedown', function(event) {
        const target = event.target;
        if (event.shiftKey && ((target.tagName === 'TD') || (target.tagName === 'TH'))) {
            event.preventDefault();
        }
    });

    // выбор всех записей таблицы
    document.addEventListener('click', function(event) {
        const target = event.target;
        if ((target.tagName === 'A') && target.closest(`.${QUESTION_CLASS}`)) {
            event.preventDefault();
            selectAcross();
        }
    });

    // очистка выбора
    document.addEventListener('click', function(event) {
        const target = event.target;
        if ((target.tagName === 'A') && target.closest(`.${CLEAR_CLASS}`)) {
            event.preventDefault();
            allToggleInput.checked = false;
            const rows = inputs.map(input => input.closest('tr'));
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
    const form = document.getElementById('changelist_form');

    form.addEventListener('change', function(event) {
        const target = event.target;
        if ((target.tagName === 'INPUT') && !target.closest(`.${CHECKBOX_CLASS}`)) {
            list_editable_changed = true;
        }
    });

    form.addEventListener('click', function(event) {
        const target = event.target;
        const action_button = target.closest('[name="index"]');
        if (action_button && list_editable_changed) {
            const agree = confirm(gettext("You have unsaved changes on individual editable fields. If you run an action, your unsaved changes will be lost."));
            if (!agree) {
                event.preventDefault();
            }
        }
    });

    form.addEventListener('click', function(event) {
        const target = event.target;
        const save_button = target.closest('[name="_save"]');

        const action_selects = document.querySelectorAll('.actions select[name="action"]');
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
        if (row && row.tagName === 'TR') {
            row.dispatchEvent(new CustomEvent('select', {
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
            ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', selected),
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
    const question = document.querySelector(`.${QUESTION_CLASS}`);
    question && (question.hidden = false);
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

    const counter = document.querySelector(`.${COUNTER_CLASS}`);
    counter && (counter.hidden = true);

    const allContainer = document.querySelector(`.${ALL_CLASS}`);
    allContainer && (allContainer.hidden = false);

    const question = document.querySelector(`.${QUESTION_CLASS}`);
    question && (question.hidden = true);

    const clear = document.querySelector(`.${CLEAR_CLASS}`);
    clear && (clear.hidden = false);
}

function clearAcross(inputs) {
    setAcrossInput(false);

    const counter = document.querySelector(`.${COUNTER_CLASS}`);
    counter && (counter.hidden = false);

    const allContainer = document.querySelector(`.${ALL_CLASS}`);
    allContainer && (allContainer.hidden = true);

    const selected = inputs.reduce((sum, input) => sum + (input.checked ? 1 : 0), 0);
    const question = document.querySelector(`.${QUESTION_CLASS}`);
    question && (question.hidden = selected !== inputs.length);

    const clear = document.querySelector(`.${CLEAR_CLASS}`);
    clear && (clear.hidden = true);
}
