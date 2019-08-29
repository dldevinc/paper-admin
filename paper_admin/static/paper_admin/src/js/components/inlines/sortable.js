import whenDomReady from "when-dom-ready";
import formUtils from "../form_utils";
import SortButtons from "./SortButtons";


whenDomReady(function() {
    const inlineGroups = document.querySelectorAll('.sortable-inline-group');
    inlineGroups.forEach(function(inlineGroup) {
        new SortButtons(inlineGroup, {
            speed: inlineGroup.dataset.inlineType === 'tabular' ? 0.25 : 0.5,
            items: '.sortable-item',
            moveUpBtn: '.sortable-move-up',
            moveDownBtn: '.sortable-move-down',
            ignore: '.empty-form'
        });
    });
});


/**
 * Установка значения сортировки инлайн-формам.
 * @param {Element} inlineGroup
 */
function fillInlineOrder(inlineGroup) {
    let currentOrder = 0;
    const inlineForms = inlineGroup.querySelectorAll('.sortable-item:not(.empty-form)');
    inlineForms.forEach(function(inlineForm) {
        if (inlineForm.classList.contains('has_original')
            || formUtils.containsChangedField(inlineForm)) {
            const input = inlineForm.querySelector('.sortable-input');
            if (input) {
                input.value = currentOrder++;
            }
        }
    });
}


document.addEventListener('submit', function(event) {
    const form = event.target;
    const inlineGroups = form.querySelectorAll('.sortable-inline-group');
    inlineGroups.forEach(function(inlineGroup) {
        fillInlineOrder(inlineGroup);
    });
});
