/*global gettext, interpolate, ngettext*/

import whenDomReady from "when-dom-ready";

const TOGGLE_ALL_ID = 'action-toggle';
const CHECKBOX_CLASS = 'action-select';
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
    allToggleInput.addEventListener('click', function() {
        toggleInputs(inputs, this.checked);
        updateCounter(inputs);
    });

    // изменение состояния чекбокса
    table.addEventListener('change', function(event) {
        const target = event.target;
        if (target.classList.contains(CHECKBOX_CLASS)) {
            const row = target.closest('tr');
            row && row.classList.toggle('selected', target.checked);
        }

        // все ли чекбоксы выделены
        allToggleInput.checked = inputs.find(input => !input.checked) == null;
    });

    table.addEventListener('click', function(event) {
        // получаем чекбокс
        let target_state;
        let checkbox = event.target.closest(`.${CHECKBOX_CLASS}`);
        if (!checkbox) {
            // если клик на сам элемент, то выделение работает только в случае,
            // когда была зажата клавиша Ctrl (или Shift для массового выделения)
            if (!event.ctrlKey && !event.shiftKey) {
                return
            }

            checkbox = event.target.closest('tr').querySelector(`.${CHECKBOX_CLASS}`);
            if (!checkbox) {
                return
            }
            target_state = !checkbox.checked;
        } else {
            // при клике на чекбокс целевое состяние уже достигнуто
            target_state = checkbox.checked;
        }

        if (lastChecked && event.shiftKey && (lastChecked !== checkbox)) {
            // массовое выделение (через Shift)
            const lastIndex = inputs.indexOf(lastChecked);
            const targetIndex = inputs.indexOf(checkbox);
            const startIndex = Math.min(lastIndex, targetIndex);
            const endIndex = Math.max(lastIndex, targetIndex);
            const input_slice = inputs.slice(startIndex, endIndex + 1);
            toggleInputs(input_slice, target_state);
        } else if (event.target !== checkbox) {
            // если клик на ячейку - выделяем чекбокс вручную
            toggleInputs([checkbox], target_state);
        }

        lastChecked = checkbox;
        updateCounter(inputs);
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
            toggleInputs(inputs, false);
            clearAcross(inputs);
            updateCounter(inputs);
        }
    });

    protectEditForm();
}

/**
 * Требование подтверждения выполнения дествия, если в форме были изменения.
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
 * @param {HTMLInputElement[]} inputs
 * @param {Boolean} checked
 */
function toggleInputs(inputs, checked) {
    inputs.forEach(function(input) {
        input.checked = Boolean(checked);
        input.dispatchEvent(new Event('change', {
            bubbles: true,
            cancelable: true
        }));
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
